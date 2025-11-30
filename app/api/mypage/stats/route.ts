import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { prisma, withRetry } from '@/lib/prisma'

/**
 * GET: 사용자 통계 조회 (보유 카드 수, 포인트 등)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const user = authResult.user

    // 통계 조회 - 각 쿼리를 개별적으로 처리하여 일부 실패해도 나머지는 성공하도록
    // 연결 재시도 로직 포함
    let cardCount = 0
    let userPoint = null
    let articleCount = 0

    try {
      cardCount = await withRetry(() =>
        prisma.userCard.count({
          where: { userId: user.id },
        })
      )
    } catch (error) {
      console.error('Error fetching card count:', error)
      // 기본값 유지 (0)
    }

    try {
      userPoint = await withRetry(() =>
        prisma.userPoint.findUnique({
          where: { userId: user.id },
        })
      )
    } catch (error) {
      console.error('Error fetching user points:', error)
      // 기본값 유지 (null)
    }

    try {
      articleCount = await withRetry(() =>
        prisma.article.count({
          where: { authorId: user.id },
        })
      )
    } catch (error) {
      console.error('Error fetching article count:', error)
      // 기본값 유지 (0)
    }

    return NextResponse.json({
      cardCount,
      points: userPoint?.points || 0,
      totalPoints: userPoint?.totalPoints || 0,
      articleCount,
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', { errorMessage, errorStack })
    return NextResponse.json(
      { error: '통계를 불러오는데 실패했습니다.', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    )
  }
}

