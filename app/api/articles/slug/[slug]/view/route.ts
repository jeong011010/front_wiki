import { NextRequest, NextResponse } from 'next/server'
import { prisma, withRetry } from '@/lib/prisma'
import type { ApiErrorResponse } from '@/types'

/**
 * POST: 조회수 증가
 * 비회원도 조회 가능하므로 인증 불필요
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // 글 존재 확인
    const article = await withRetry(() => prisma.article.findUnique({
      where: { slug },
      select: { id: true, status: true, views: true },
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
    
    // 조회수 증가
    const updated = await withRetry(() => prisma.article.update({
      where: { id: article.id },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        views: true,
      },
    }))
    
    return NextResponse.json({
      success: true,
      views: updated.views,
    })
  } catch (error) {
    console.error('Error incrementing view count:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json<ApiErrorResponse>(
      { error: process.env.NODE_ENV === 'development' ? `조회수 증가에 실패했습니다: ${errorMessage}` : '조회수 증가에 실패했습니다.' },
      { status: 500 }
    )
  }
}

