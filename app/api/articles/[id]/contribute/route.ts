import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { prisma, withRetry } from '@/lib/prisma'
import { z } from 'zod'
import type { ApiErrorResponse } from '@/types'

const contributeSchema = z.object({
  type: z.enum(['CONTENT_UPDATE', 'CONTENT_ADDITION', 'COMMENT', 'CORRECTION', 'IMPROVEMENT', 'OTHER']),
  content: z.string().min(1, '기여 내용을 입력해주세요.'),
})

/**
 * POST: 글에 기여하기
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json<ApiErrorResponse>(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const user = authResult.user
    const { id } = await params

    // 요청 본문 검증
    const body = await request.json()
    const validatedData = contributeSchema.parse(body)

    // 글 존재 확인
    const article = await withRetry(() => prisma.article.findUnique({
      where: { id },
      select: { id: true, status: true },
    }))

    if (!article) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    if (article.status !== 'published') {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Published articles only' },
        { status: 403 }
      )
    }

    // 기여 생성
    const contribution = await withRetry(() => prisma.articleContribution.create({
      data: {
        articleId: id,
        contributorId: user.id,
        type: validatedData.type,
        content: validatedData.content,
        status: 'PENDING',
      },
      include: {
        article: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    }))

    return NextResponse.json({
      success: true,
      contribution: {
        id: contribution.id,
        message: '기여가 성공적으로 제출되었습니다. 검토 후 적용됩니다.',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating contribution:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json<ApiErrorResponse>(
      { error: '기여 제출에 실패했습니다.', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    )
  }
}

