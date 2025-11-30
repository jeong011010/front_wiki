import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-middleware'
import { prisma, withRetry } from '@/lib/prisma'
import { z } from 'zod'
import type { ApiErrorResponse } from '@/types'

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewComment: z.string().optional(),
})

/**
 * PUT: 기여 검토 (승인/거부) - 관리자만
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json<ApiErrorResponse>(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const reviewer = authResult.user
    const { id } = await params

    // 요청 본문 검증
    const body = await request.json()
    const validatedData = reviewSchema.parse(body)

    // 기여 조회
    const contribution = await withRetry(() => prisma.articleContribution.findUnique({
      where: { id },
      include: {
        article: {
          select: {
            id: true,
            content: true,
            title: true,
          },
        },
        contributor: {
          select: {
            id: true,
          },
        },
      },
    }))

    if (!contribution) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Contribution not found' },
        { status: 404 }
      )
    }

    if (contribution.status !== 'PENDING') {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Contribution already reviewed' },
        { status: 400 }
      )
    }

    // 기여 업데이트
    const updatedContribution = await withRetry(() => prisma.articleContribution.update({
      where: { id },
      data: {
        status: validatedData.status,
        reviewerId: reviewer.id,
        reviewedAt: new Date(),
        reviewComment: validatedData.reviewComment || null,
      },
    }))

    // 승인된 경우 글 내용 적용 및 카드 부여
    if (validatedData.status === 'APPROVED') {
      try {
        // 기여 내용 파싱
        const contributionData = JSON.parse(contribution.content)
        let newContent = contribution.article.content

        if (contributionData.type === 'update') {
          // 전체 내용 수정 (편집된 마크다운 전체)
          if (contributionData.newContent) {
            newContent = contributionData.newContent
          } else if (contributionData.position) {
            // 기존 방식 (부분 수정) - 하위 호환성
            const { start, end } = contributionData.position
            const before = newContent.substring(0, start)
            const after = newContent.substring(end)
            newContent = before + contributionData.newText + after
          }
        } else if (contributionData.type === 'comment') {
          // 첨언(코멘트) - 선택된 텍스트 뒤에 코멘트 추가
          if (contributionData.position) {
            const { start, end } = contributionData.position
            const before = newContent.substring(0, end)
            const after = newContent.substring(end)
            // 코멘트를 주석 형태로 추가 (마크다운 주석 또는 인라인 코멘트)
            const comment = `\n\n<!-- 코멘트: ${contributionData.comment} -->\n\n`
            newContent = before + comment + after
          }
        } else if (contributionData.type === 'addition') {
          // 내용 추가
          if (contributionData.position?.at !== undefined) {
            // 정확한 위치에 추가
            const insertPos = contributionData.position.at
            const before = newContent.substring(0, insertPos)
            const after = newContent.substring(insertPos)
            newContent = before + '\n\n' + contributionData.newText + '\n\n' + after
          } else if (contributionData.position?.after !== undefined) {
            // 선택된 텍스트 뒤에 추가
            const insertPos = contributionData.position.after
            const before = newContent.substring(0, insertPos)
            const after = newContent.substring(insertPos)
            newContent = before + '\n\n' + contributionData.newText + '\n\n' + after
          } else {
            // 끝에 추가
            newContent = newContent + '\n\n' + contributionData.newText
          }
        } else if (contributionData.type === 'correction' || contributionData.type === 'improvement' || contributionData.type === 'other') {
          // 오류 수정, 개선, 기타 - 전체 내용 수정
          if (contributionData.newContent) {
            newContent = contributionData.newContent
          } else if (contributionData.position) {
            // 기존 방식 (부분 수정) - 하위 호환성
            const { start, end } = contributionData.position
            const before = newContent.substring(0, start)
            const after = newContent.substring(end)
            newContent = before + contributionData.newText + after
          }
        }

        // 글 내용 업데이트
        await withRetry(() => prisma.article.update({
          where: { id: contribution.articleId },
          data: {
            content: newContent,
            updatedAt: new Date(),
          },
        }))

        // 기여자에게 카드 부여 (이미 보유하지 않은 경우)
        const existingCard = await withRetry(() => prisma.userCard.findUnique({
          where: {
            userId_articleId: {
              userId: contribution.contributorId,
              articleId: contribution.articleId,
            },
          },
        }))

        if (!existingCard) {
          await withRetry(() => prisma.userCard.create({
            data: {
              userId: contribution.contributorId,
              articleId: contribution.articleId,
              obtainedBy: 'contribution',
              isContributor: true,
            },
          }))
        }
      } catch (error) {
        console.error('Error applying contribution:', error)
        // 기여 승인은 성공했지만 내용 적용 실패는 별도 처리
      }
    }

    return NextResponse.json({
      success: true,
      contribution: updatedContribution,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>(
        { error: error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      )
    }

    console.error('Error reviewing contribution:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json<ApiErrorResponse>(
      { error: process.env.NODE_ENV === 'development' ? `기여 검토에 실패했습니다: ${errorMessage}` : '기여 검토에 실패했습니다.' },
      { status: 500 }
    )
  }
}

