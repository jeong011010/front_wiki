import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { drawRandomCard } from '@/lib/card-system'
import { z } from 'zod'

const drawSchema = z.object({
  drawType: z.enum(['normal', 'premium']).default('normal'),
})

/**
 * POST: 카드 뽑기
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const user = authResult.user
    const body = await request.json()
    const { drawType } = drawSchema.parse(body)

    const result = await drawRandomCard(user.id, drawType)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: '꽝입니다! 다음 기회에...',
        drawRecord: result.drawRecord,
      })
    }

    return NextResponse.json({
      success: true,
      message: '카드를 획득했습니다!',
      articleId: result.articleId,
      drawRecord: result.drawRecord,
    })
  } catch (error) {
    console.error('Error drawing card:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청입니다.' },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.message === '포인트가 부족합니다.') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: '카드 뽑기에 실패했습니다.' },
      { status: 500 }
    )
  }
}

