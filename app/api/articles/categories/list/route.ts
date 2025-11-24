import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'
import type { ApiErrorResponse } from '@/types'

/**
 * GET: 사용 가능한 카테고리 목록 조회
 */
export async function GET() {
  try {
    const user = await getSessionUser()
    
    // 비회원 또는 일반 회원은 공개된 글만, 관리자는 모든 글
    const where = user?.role === 'admin' 
      ? {} 
      : { status: 'published' }
    
    // 카테고리별 글 개수 조회
    // groupBy는 where 절에서 일부 필터를 지원하지 않으므로 findMany로 변경
    const allArticles = await prisma.article.findMany({
      where: {
        ...where,
        category: { not: null },
      },
      select: {
        category: true,
      },
    })
    
    // 카테고리별 개수 계산
    const categoryCounts = new Map<string, number>()
    allArticles.forEach((article) => {
      if (article.category) {
        categoryCounts.set(article.category, (categoryCounts.get(article.category) || 0) + 1)
      }
    })
    
    // 카테고리 목록 반환
    const categoryList = Array.from(categoryCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
    
    return NextResponse.json(categoryList)
  } catch (error) {
    console.error('Category list API error:', error)
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

