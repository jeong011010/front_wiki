import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-middleware'
import { prisma, withRetry } from '@/lib/prisma'
import type { ApiErrorResponse } from '@/types'

/**
 * GET: 검토 대기 중인 기여 목록 (관리자만)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json<ApiErrorResponse>(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const contributions = await withRetry(() => prisma.articleContribution.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            content: true,
          },
        },
        contributor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }))

    return NextResponse.json({ contributions })
  } catch (error) {
    console.error('Error fetching pending contributions:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json<ApiErrorResponse>(
      { error: '기여 목록을 불러오는데 실패했습니다.', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    )
  }
}

