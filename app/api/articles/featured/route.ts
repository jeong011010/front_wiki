import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateToken } from '@/lib/auth-middleware'
import { getCache, setCache, createVersionedCacheKey, isCacheAvailable } from '@/lib/cache'
import { insertLinksInTitle } from '@/lib/link-detector'
import { calculateTier } from '@/lib/tier-calculator'
import type { ArticlesListResponse, ApiErrorResponse } from '@/types'

/**
 * GET: 인기순 또는 최신순으로 글 목록 조회
 * Query params:
 * - sort: "popular" | "recent" (기본값: "recent")
 * - limit: 숫자 (기본값: 5)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'recent'
    const limit = parseInt(searchParams.get('limit') || '5', 10)
    
    // 선택적 인증 (비회원도 조회 가능)
    const authResult = await authenticateToken(request)
    const user = authResult.user
    
    // 캐시 키 생성 (사용자 역할 포함, 버전 포함)
    const cacheKey = await createVersionedCacheKey('articles:featured', sort, limit, user?.role || 'guest')
    
    // 캐시에서 조회 시도
    // 개발 환경에서는 캐시를 사용하지 않음 (최신 데이터 확인을 위해)
    if (isCacheAvailable() && process.env.NODE_ENV === 'production') {
      const cached = await getCache<ArticlesListResponse>(cacheKey)
      if (cached) {
        console.log('[추천글 API] 캐시에서 반환:', cached.length, '개')
        return NextResponse.json<ArticlesListResponse>(cached)
      }
    }
    
    // 비회원 또는 일반 회원은 공개된 글만, 관리자는 모든 글
    const where = user?.role === 'admin' 
      ? {} 
      : { status: 'published' }
    
    let articles
    
    if (sort === 'popular') {
      // 인기순: incomingLinks 개수가 많은 순
      // 모든 글을 가져와서 incomingLinks 개수로 정렬
      const allArticles = await prisma.article.findMany({
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
      })
      
      // incomingLinks 개수로 정렬하고 limit 적용
      articles = allArticles
        .sort((a, b) => {
          const countA = a._count.incomingLinks
          const countB = b._count.incomingLinks
          if (countA !== countB) {
            return countB - countA
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        .slice(0, limit)
        .map((article) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          category: article.category ? article.category.name : null,
          categorySlug: article.category ? article.category.slug : null,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
          content: article.content,
          _count: article._count, // 통계 정보 포함
          author: article.author ? {
            name: article.author.name,
            email: article.author.email,
          } : null,
        }))
    } else {
      // 최신순: createdAt 기준
      articles = await prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
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
        },
      })
      
      // 필요한 필드만 추출 (통계 정보 포함)
      articles = await Promise.all(articles.map(async (article) => {
        const counts = await prisma.article.findUnique({
          where: { id: article.id },
          select: {
            _count: {
              select: {
                incomingLinks: true,
                outgoingLinks: true,
                userCards: true,
              },
            },
          },
        })
        
        return {
          id: article.id,
          title: article.title,
          slug: article.slug,
          category: article.category ? article.category.name : null,
          categorySlug: article.category ? article.category.slug : null,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
          content: article.content,
          _count: counts?._count || { incomingLinks: 0, outgoingLinks: 0, userCards: 0 },
          author: article.author ? {
            name: article.author.name,
            email: article.author.email,
          } : null,
        }
      }))
    }
    
    // 미리보기 생성 및 제목에 링크 삽입 (150자)
    const articlesWithPreview = await Promise.all(articles.map(async (article) => {
      const preview = article.content
        .replace(/<[^>]*>/g, '') // HTML 태그 제거
        .replace(/\n/g, ' ') // 줄바꿈 제거
        .substring(0, 150) // 150자로 제한
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
        incomingLinksCount: article._count?.incomingLinks || 0,
        outgoingLinksCount: article._count?.outgoingLinks || 0,
        userCardsCount: article._count?.userCards || 0,
        createdAt: article.createdAt,
      })
      
      return {
        id: article.id,
        title: article.title,
        titleWithLinks, // 링크가 포함된 제목 HTML
        slug: article.slug,
        category: article.category,
        categorySlug: article.categorySlug,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        preview,
        tier, // 계산된 티어
        author: article.author,
      }
    }))
    
    // 디버깅: 조회된 글 목록 로그
    console.log('[추천글 API] 조회된 글 개수:', articlesWithPreview.length)
    console.log('[추천글 API] 조회된 글 ID 목록:', articlesWithPreview.map(a => ({ id: a.id, title: a.title })))
    
    // 캐시에 저장 (1시간, 프로덕션에서만)
    if (isCacheAvailable() && process.env.NODE_ENV === 'production') {
      await setCache(cacheKey, articlesWithPreview, 3600)
    }
    
    return NextResponse.json(articlesWithPreview)
  } catch (error) {
    console.error('Featured articles API error:', error)
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to fetch featured articles' },
      { status: 500 }
    )
  }
}

