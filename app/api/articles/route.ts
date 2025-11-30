import { authenticateToken, requireAuth } from '@/lib/auth-middleware'
import { createVersionedCacheKey, getCache, isCacheAvailable, setCache } from '@/lib/cache'
import { incrementCacheVersion } from '@/lib/cache-version'
import { obtainCardByAuthor } from '@/lib/card-system'
import { detectKeywords, insertLinksInTitle } from '@/lib/link-detector'
import { prisma, withRetry } from '@/lib/prisma'
import { calculateTier } from '@/lib/tier-calculator'
import { slugify } from '@/lib/utils'
import type { ApiErrorResponse, ArticleCreateResponse, ArticlesListResponse } from '@/types'
import type { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const articleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  categoryId: z.string().optional().nullable(),
})

// GET: 모든 글 목록 (공개된 글만)
// Query params:
// - category: 카테고리 slug 또는 name (선택사항)
// - sort: "recent" | "popular" | "title" (기본값: "recent")
// - limit: 숫자 (기본값: 10)
// - offset: 숫자 (기본값: 0)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'recent'
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const includeSubcategories = searchParams.get('includeSubcategories') === 'true'
    const search = searchParams.get('search')
    
    // 선택적 인증 (비회원도 조회 가능)
    const authResult = await authenticateToken(request)
    const user = authResult.user
    
    // 캐시 키 생성 (검색어가 없을 때만 캐싱, 버전 포함)
    const cacheKey = search 
      ? null 
      : await createVersionedCacheKey('articles', category || 'all', sort, limit, offset, user?.role || 'guest')
    
    // 캐시에서 조회 시도 (검색어가 없을 때만)
    // 개발 환경에서는 캐시를 사용하지 않음 (최신 데이터 확인을 위해)
    if (cacheKey && isCacheAvailable() && process.env.NODE_ENV === 'production') {
      const cached = await getCache<ArticlesListResponse>(cacheKey)
      if (cached) {
        console.log('[전체글 API] 캐시에서 반환:', cached.length, '개')
        return NextResponse.json<ArticlesListResponse>(cached)
      }
    }
    
    // 비회원 또는 일반 회원은 공개된 글만, 관리자는 모든 글
    const baseWhere = user?.role === 'admin' 
      ? {} 
      : { status: 'published' }
    
    // 카테고리 필터 추가
    let categoryIds: string[] | undefined
    if (category) {
      const categoryRecord = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: category },
            { name: category },
          ],
        },
      })
      if (categoryRecord) {
        if (includeSubcategories) {
          // 선택한 카테고리와 모든 하위 카테고리 ID 수집
          const getAllDescendantIds = async (parentId: string): Promise<string[]> => {
            const children = await prisma.category.findMany({
              where: { parentId },
              select: { id: true },
            })
            const ids = [parentId]
            for (const child of children) {
              const descendantIds = await getAllDescendantIds(child.id)
              ids.push(...descendantIds)
            }
            return ids
          }
          categoryIds = await getAllDescendantIds(categoryRecord.id)
        } else {
          categoryIds = [categoryRecord.id]
        }
      }
    }
    
    let where: Prisma.ArticleWhereInput = categoryIds
      ? { ...baseWhere, categoryId: { in: categoryIds } }
      : baseWhere
    
    // 검색어 필터 추가
    if (search && search.trim()) {
      const searchTerm = search.trim()
      // SQLite는 case-insensitive 검색을 위해 toLowerCase 사용
      where = {
        ...where,
        OR: [
          { title: { contains: searchTerm } },
          { content: { contains: searchTerm } },
        ],
      }
    }
    
    // 정렬 옵션
    let orderBy: { createdAt?: 'asc' | 'desc'; title?: 'asc' | 'desc' } | { _count: { incomingLinks: 'asc' | 'desc' } }
    
    if (sort === 'popular') {
      // 인기순: incomingLinks 개수가 많은 순
      // 모든 글을 가져와서 incomingLinks 개수로 정렬
      const allArticles = await withRetry(() => prisma.article.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              incomingLinks: true,
              outgoingLinks: true,
              userCards: true,
            },
          },
        },
      }))
      
      // incomingLinks 개수로 정렬하고 limit/offset 적용
      const sortedArticles = allArticles
        .sort((a, b) => {
          const countA = a._count.incomingLinks
          const countB = b._count.incomingLinks
          if (countA !== countB) {
            return countB - countA
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        .slice(offset, offset + limit)
      
      // 미리보기 생성 및 제목에 링크 삽입
      const articlesWithPreview = await Promise.all(sortedArticles.map(async (article) => {
        const preview = article.content
          .replace(/<[^>]*>/g, '')
          .replace(/\n/g, ' ')
          .substring(0, 150)
          .trim()
        
        // 제목에 링크 삽입 (자기 자신 제외) - 에러 발생 시 원본 제목 사용
        let titleWithLinks = article.title
        try {
          titleWithLinks = await insertLinksInTitle(article.title, article.id)
        } catch (error) {
          console.error('Error inserting links in title:', error)
          // 에러 발생 시 원본 제목 사용
        }
        
        // 티어 계산
        const tier = calculateTier({
          incomingLinksCount: article._count.incomingLinks,
          outgoingLinksCount: article._count.outgoingLinks,
          userCardsCount: article._count.userCards,
          createdAt: article.createdAt,
        })
        
        return {
          id: article.id,
          title: article.title,
          titleWithLinks, // 링크가 포함된 제목 HTML
          slug: article.slug,
          category: article.category ? article.category.name : null,
          categorySlug: article.category ? article.category.slug : null,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
          preview,
          tier, // 계산된 티어
          author: article.author ? {
            name: article.author.name,
            email: article.author.email,
          } : null,
        }
      }))
      
      // 디버깅: 조회된 글 목록 로그 (인기순)
      console.log('[전체글 API - 인기순] 조회된 글 개수:', articlesWithPreview.length)
      console.log('[전체글 API - 인기순] 조회된 글 ID 목록:', articlesWithPreview.map(a => ({ id: a.id, title: a.title })))
      
      // 캐시에 저장 (30분, 검색어가 없을 때만, 프로덕션에서만)
      if (cacheKey && isCacheAvailable() && process.env.NODE_ENV === 'production') {
        await setCache(cacheKey, articlesWithPreview, 1800)
      }
      
      return NextResponse.json(articlesWithPreview)
    } else {
      // 최신순 또는 제목순
      if (sort === 'title') {
        orderBy = { title: 'asc' }
      } else {
        orderBy = { createdAt: 'desc' }
      }
      
      const articles = await withRetry(() => prisma.article.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              incomingLinks: true,
              outgoingLinks: true,
              userCards: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }))
      
      // 미리보기 생성 및 제목에 링크 삽입
      const articlesWithPreview = await Promise.all(articles.map(async (article) => {
        const preview = article.content
          .replace(/<[^>]*>/g, '')
          .replace(/\n/g, ' ')
          .substring(0, 150)
          .trim()
        
        // 제목에 링크 삽입 (자기 자신 제외) - 에러 발생 시 원본 제목 사용
        let titleWithLinks = article.title
        try {
          titleWithLinks = await insertLinksInTitle(article.title, article.id)
        } catch (error) {
          console.error('Error inserting links in title:', error)
          // 에러 발생 시 원본 제목 사용
        }
        
        // 티어 계산
        const tier = calculateTier({
          incomingLinksCount: article._count.incomingLinks,
          outgoingLinksCount: article._count.outgoingLinks,
          userCardsCount: article._count.userCards,
          createdAt: article.createdAt,
        })
        
        return {
          id: article.id,
          title: article.title,
          titleWithLinks, // 링크가 포함된 제목 HTML
          slug: article.slug,
          category: article.category ? article.category.name : null,
          categorySlug: article.category ? article.category.slug : null,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
          preview,
          tier, // 계산된 티어
          author: article.author ? {
            name: article.author.name,
            email: article.author.email,
          } : null,
        }
      }))
      
      // 디버깅: 조회된 글 목록 로그 (최신순/제목순)
      console.log('[전체글 API - 최신순/제목순] 조회된 글 개수:', articlesWithPreview.length)
      console.log('[전체글 API - 최신순/제목순] 조회된 글 ID 목록:', articlesWithPreview.map(a => ({ id: a.id, title: a.title })))
      
      // 캐시에 저장 (30분, 검색어가 없을 때만, 프로덕션에서만)
      if (cacheKey && isCacheAvailable() && process.env.NODE_ENV === 'production') {
        await setCache(cacheKey, articlesWithPreview, 1800)
      }
      
      return NextResponse.json(articlesWithPreview)
    }
  } catch (error) {
    console.error('Articles API error:', error)
    return NextResponse.json<ApiErrorResponse>({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

// POST: 새 글 작성 (회원만 가능)
export async function POST(request: NextRequest) {
  try {
    // 로그인 체크
    const authResult = await requireAuth(request)
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json<ApiErrorResponse>(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    const user = authResult.user
    
    const body = await request.json()
    const { title, content, categoryId } = articleSchema.parse(body)
    
    const slug = slugify(title)
    
    // 중복 체크
    const existing = await prisma.article.findUnique({
      where: { slug },
    })
    
    if (existing) {
      return NextResponse.json<ApiErrorResponse>({ 
        error: '이미 같은 제목의 글이 존재합니다.',
        message: `"${existing.title}" 제목의 글이 이미 있습니다. 다른 제목을 사용해주세요.`
      }, { status: 400 })
    }
    
    // 카테고리 존재 확인
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      })
      
      if (!category) {
        return NextResponse.json<ApiErrorResponse>(
          { error: '카테고리를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }
    }
    
    // 글 생성 (관리자는 바로 공개, 일반 회원은 검토 대기)
    const status = user.role === 'admin' ? 'published' : 'pending'
    
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        status,
        authorId: user.id,
        categoryId: categoryId || null,
      },
    })
    
    // 글 작성 시 자동으로 카드 획득 (공개된 글만)
    if (status === 'published') {
      try {
        await obtainCardByAuthor(user.id, article.id)
      } catch (error) {
        console.error('Error obtaining card:', error)
        // 카드 획득 실패해도 글 작성은 성공으로 처리
      }
    }
    
    // 자동 링크 감지 및 생성 (제목과 내용 모두에서, 자기 자신 제외)
    try {
      // 제목과 내용 모두에서 키워드 감지
      const [titleLinks, contentLinks] = await Promise.all([
        detectKeywords(title),
        detectKeywords(content),
      ])
      
      // 두 결과를 합치고 중복 제거 (같은 articleId와 keyword 조합은 하나만 유지)
      const allLinks = [...titleLinks, ...contentLinks]
      const uniqueLinks = new Map<string, typeof titleLinks[0]>()
      
      for (const link of allLinks) {
        const key = `${link.articleId}-${link.keyword.toLowerCase()}`
        if (!uniqueLinks.has(key)) {
          uniqueLinks.set(key, link)
        }
      }
      
      // 자기 자신을 참조하는 링크 제외
      const validLinks = Array.from(uniqueLinks.values()).filter(link => link.articleId !== article.id)
      
      // 링크 관계 생성 (자동 링크는 "auto" 타입으로)
      if (validLinks.length > 0) {
        const linkPromises = validLinks.map((link) =>
          prisma.articleLink.create({
            data: {
              keyword: link.keyword,
              fromArticleId: article.id,
              toArticleId: link.articleId,
              relationType: 'auto', // 자동 생성된 링크는 "auto" 타입
            },
          }).catch((err) => {
            // 중복 링크나 기타 오류는 무시
            console.warn('Failed to create link:', err)
            return null
          })
        )
        
        await Promise.all(linkPromises)
      }
    } catch (linkError) {
      // 링크 생성 실패해도 글은 저장됨
      console.error('Link detection error:', linkError)
    }
    
    // 캐시 버전 증가 (모든 캐시 자동 무효화)
    if (isCacheAvailable()) {
      await incrementCacheVersion()
    }
    
    return NextResponse.json<ArticleCreateResponse>(article)
  } catch (error) {
    console.error('Article creation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>({ error: 'Validation error', message: error.issues }, { status: 400 })
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json<ApiErrorResponse>(
      { 
        error: 'Failed to create article',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      }, 
      { status: 500 }
    )
  }
}

