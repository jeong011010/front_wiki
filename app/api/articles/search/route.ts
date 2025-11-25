import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateToken } from '@/lib/auth-middleware'
import type { SearchResponse, ApiErrorResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json<SearchResponse>({ articles: [] })
    }

    const searchTerm = query.trim()
    // 선택적 인증 (비회원도 조회 가능)
    const authResult = await authenticateToken(request)
    const user = authResult.user
    
    // 비회원 또는 일반 회원은 공개된 글만, 관리자는 모든 글
    const statusFilter = user?.role === 'admin' ? {} : { status: 'published' }

    // 제목과 내용에서 검색
    const articles = await prisma.article.findMany({
      where: {
        ...statusFilter,
        OR: [
          {
            title: {
              contains: searchTerm,
            },
          },
          {
            content: {
              contains: searchTerm,
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json<SearchResponse>({ articles })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json<ApiErrorResponse>({ error: 'Failed to search articles' }, { status: 500 })
  }
}

