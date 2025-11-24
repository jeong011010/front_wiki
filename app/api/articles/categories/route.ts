import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'
import type { ApiErrorResponse } from '@/types'

/**
 * GET: 카테고리별 글 목록 조회
 * Query params:
 * - category: 카테고리 이름 (선택사항, 없으면 모든 카테고리)
 * - limit: 숫자 (기본값: 10)
 * - offset: 숫자 (기본값: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    
    const user = await getSessionUser()
    
    // 비회원 또는 일반 회원은 공개된 글만, 관리자는 모든 글
    const baseWhere = user?.role === 'admin' 
      ? {} 
      : { status: 'published' }
    
    // 카테고리 필터 추가
    const where = category
      ? { ...baseWhere, category }
      : baseWhere
    
    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        content: true,
      },
    })
    
    // 미리보기 생성 (150자)
    const articlesWithPreview = articles.map((article) => {
      const preview = article.content
        .replace(/<[^>]*>/g, '') // HTML 태그 제거
        .replace(/\n/g, ' ') // 줄바꿈 제거
        .substring(0, 150) // 150자로 제한
        .trim()
      
      return {
        ...article,
        preview,
        content: undefined, // content는 제외
      }
    })
    
    // 전체 개수 조회
    const total = await prisma.article.count({ where })
    
    return NextResponse.json({
      articles: articlesWithPreview,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to fetch articles by category' },
      { status: 500 }
    )
  }
}

