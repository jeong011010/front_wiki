import { NextRequest, NextResponse } from 'next/server'
import { prisma, withRetry } from '@/lib/prisma'
import { authenticateToken, requireAuth } from '@/lib/auth-middleware'
import type { ApiErrorResponse } from '@/types'

/**
 * GET: 현재 사용자가 이 글에 좋아요를 눌렀는지 확인
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // 선택적 인증 (비회원도 조회 가능)
    const authResult = await authenticateToken(request)
    const user = authResult.user
    
    // 글 존재 확인
    const article = await withRetry(() => prisma.article.findUnique({
      where: { slug },
      select: { id: true, likes: true },
    }))
    
    if (!article) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Article not found' },
        { status: 404 }
      )
    }
    
    // 로그인한 경우 좋아요 여부 확인
    let isLiked = false
    if (user) {
      const like = await withRetry(() => prisma.like.findUnique({
        where: {
          articleId_userId: {
            articleId: article.id,
            userId: user.id,
          },
        },
      }))
      isLiked = !!like
    }
    
    return NextResponse.json({
      likes: article.likes,
      isLiked,
    })
  } catch (error) {
    console.error('Error fetching like status:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json<ApiErrorResponse>(
      { error: process.env.NODE_ENV === 'development' ? `좋아요 상태를 불러오는데 실패했습니다: ${errorMessage}` : '좋아요 상태를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * POST: 좋아요 추가
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
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
    const { slug } = await params
    
    // 글 존재 확인
    const article = await withRetry(() => prisma.article.findUnique({
      where: { slug },
      select: { id: true, status: true, likes: true },
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
    
    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await withRetry(() => prisma.like.findUnique({
      where: {
        articleId_userId: {
          articleId: article.id,
          userId: user.id,
        },
      },
    }))
    
    if (existingLike) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Already liked' },
        { status: 400 }
      )
    }
    
    // 좋아요 추가 및 카운트 증가 (트랜잭션)
    await prisma.$transaction(async (tx) => {
      await tx.like.create({
        data: {
          articleId: article.id,
          userId: user.id,
        },
      })
      
      await tx.article.update({
        where: { id: article.id },
        data: {
          likes: {
            increment: 1,
          },
        },
      })
    })
    
    return NextResponse.json({
      success: true,
      likes: article.likes + 1,
    })
  } catch (error) {
    console.error('Error adding like:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json<ApiErrorResponse>(
      { error: process.env.NODE_ENV === 'development' ? `좋아요 추가에 실패했습니다: ${errorMessage}` : '좋아요 추가에 실패했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE: 좋아요 제거
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
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
    const { slug } = await params
    
    // 글 존재 확인
    const article = await withRetry(() => prisma.article.findUnique({
      where: { slug },
      select: { id: true, likes: true },
    }))
    
    if (!article) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Article not found' },
        { status: 404 }
      )
    }
    
    // 좋아요 존재 확인
    const existingLike = await withRetry(() => prisma.like.findUnique({
      where: {
        articleId_userId: {
          articleId: article.id,
          userId: user.id,
        },
      },
    }))
    
    if (!existingLike) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Like not found' },
        { status: 404 }
      )
    }
    
    // 좋아요 제거 및 카운트 감소 (트랜잭션)
    await prisma.$transaction(async (tx) => {
      await tx.like.delete({
        where: {
          articleId_userId: {
            articleId: article.id,
            userId: user.id,
          },
        },
      })
      
      await tx.article.update({
        where: { id: article.id },
        data: {
          likes: {
            decrement: 1,
          },
        },
      })
    })
    
    return NextResponse.json({
      success: true,
      likes: Math.max(0, article.likes - 1),
    })
  } catch (error) {
    console.error('Error removing like:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json<ApiErrorResponse>(
      { error: process.env.NODE_ENV === 'development' ? `좋아요 제거에 실패했습니다: ${errorMessage}` : '좋아요 제거에 실패했습니다.' },
      { status: 500 }
    )
  }
}

