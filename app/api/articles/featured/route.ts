import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateToken } from '@/lib/auth-middleware'
import type { ApiErrorResponse } from '@/types'

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
          _count: {
            select: {
              incomingLinks: true,
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
        },
      })
      
      // 필요한 필드만 추출
      articles = articles.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        category: article.category ? article.category.name : null,
        categorySlug: article.category ? article.category.slug : null,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        content: article.content,
      }))
    }
    
    // 미리보기 생성 (150자)
    const articlesWithPreview = articles.map((article) => {
      const preview = article.content
        .replace(/<[^>]*>/g, '') // HTML 태그 제거
        .replace(/\n/g, ' ') // 줄바꿈 제거
        .substring(0, 150) // 150자로 제한
        .trim()
      
      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        category: article.category,
        categorySlug: article.categorySlug,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        preview,
      }
    })
    
    return NextResponse.json(articlesWithPreview)
  } catch (error) {
    console.error('Featured articles API error:', error)
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to fetch featured articles' },
      { status: 500 }
    )
  }
}

