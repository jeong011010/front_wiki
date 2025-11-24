import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { detectKeywords } from '@/lib/link-detector'
import { getSessionUser } from '@/lib/auth'
import { z } from 'zod'
import type { ArticlesListResponse, ArticleCreateResponse, ApiErrorResponse } from '@/types'

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
    
    const user = await getSessionUser()
    
    // 비회원 또는 일반 회원은 공개된 글만, 관리자는 모든 글
    const baseWhere = user?.role === 'admin' 
      ? {} 
      : { status: 'published' }
    
    // 카테고리 필터 추가
    let categoryId: string | undefined
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
        categoryId = categoryRecord.id
      }
    }
    
    const where = categoryId
      ? { ...baseWhere, categoryId }
      : baseWhere
    
    // 정렬 옵션
    let orderBy: { createdAt?: 'asc' | 'desc'; title?: 'asc' | 'desc' } | { _count: { incomingLinks: 'asc' | 'desc' } }
    
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
          _count: {
            select: {
              incomingLinks: true,
            },
          },
        },
      })
      
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
      
      // 미리보기 생성
      const articlesWithPreview = sortedArticles.map((article) => {
        const preview = article.content
          .replace(/<[^>]*>/g, '')
          .replace(/\n/g, ' ')
          .substring(0, 150)
          .trim()
        
        return {
          id: article.id,
          title: article.title,
          slug: article.slug,
          category: article.category ? article.category.name : null,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
          preview,
        }
      })
      
      return NextResponse.json(articlesWithPreview)
    } else {
      // 최신순 또는 제목순
      if (sort === 'title') {
        orderBy = { title: 'asc' }
      } else {
        orderBy = { createdAt: 'desc' }
      }
      
      const articles = await prisma.article.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      })
      
      // 미리보기 생성
      const articlesWithPreview = articles.map((article) => {
        const preview = article.content
          .replace(/<[^>]*>/g, '')
          .replace(/\n/g, ' ')
          .substring(0, 150)
          .trim()
        
        return {
          id: article.id,
          title: article.title,
          slug: article.slug,
          category: article.category ? article.category.name : null,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
          preview,
        }
      })
      
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
    const user = await getSessionUser()
    
    if (!user) {
      return NextResponse.json<ApiErrorResponse>(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
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
    
    // 자동 링크 감지 및 생성 (자기 자신 제외)
    try {
      const detectedLinks = await detectKeywords(content)
      
      // 자기 자신을 참조하는 링크 제외
      const validLinks = detectedLinks.filter(link => link.articleId !== article.id)
      
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

