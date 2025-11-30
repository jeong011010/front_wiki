import { NextRequest, NextResponse } from 'next/server'
import { prisma, withRetry } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { z } from 'zod'
import type { ApiErrorResponse } from '@/types'

const updateCommentSchema = z.object({
  content: z.string().min(1, '댓글 내용을 입력해주세요.').max(1000, '댓글은 1000자 이하여야 합니다.'),
})

// PUT: 댓글 수정 (작성자만)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params
    
    // 로그인 체크
    const authResult = await requireAuth(request)
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json<ApiErrorResponse>(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    const user = authResult.user
    
    // 글 존재 확인
    const article = await withRetry(() => prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    }))
    
    if (!article) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Article not found' },
        { status: 404 }
      )
    }
    
    // 댓글 존재 확인
    const comment = await withRetry(() => prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
        articleId: true,
        deletedAt: true,
      },
    }))
    
    if (!comment || comment.deletedAt) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    // 글과 댓글 매칭 확인
    if (comment.articleId !== article.id) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    // 권한 체크 (작성자만 수정 가능)
    if (comment.authorId !== user.id) {
      return NextResponse.json<ApiErrorResponse>(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { content } = updateCommentSchema.parse(body)
    
    // 댓글 수정
    const updatedComment = await withRetry(() => prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }))
    
    return NextResponse.json({
      comment: {
        id: updatedComment.id,
        content: updatedComment.content,
        author: updatedComment.author,
        createdAt: updatedComment.createdAt,
        updatedAt: updatedComment.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error updating comment:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Validation error', message: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

// DELETE: 댓글 삭제 (작성자 또는 관리자)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params
    
    // 로그인 체크
    const authResult = await requireAuth(request)
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json<ApiErrorResponse>(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    const user = authResult.user
    
    // 글 존재 확인
    const article = await withRetry(() => prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    }))
    
    if (!article) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Article not found' },
        { status: 404 }
      )
    }
    
    // 댓글 존재 확인
    const comment = await withRetry(() => prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
        articleId: true,
        deletedAt: true,
      },
    }))
    
    if (!comment || comment.deletedAt) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    // 글과 댓글 매칭 확인
    if (comment.articleId !== article.id) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    // 권한 체크 (작성자 또는 관리자만 삭제 가능)
    if (comment.authorId !== user.id && user.role !== 'admin') {
      return NextResponse.json<ApiErrorResponse>(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      )
    }
    
    // 댓글 소프트 삭제 및 commentsCount 감소 (트랜잭션)
    await prisma.$transaction(async (tx) => {
      // 소프트 삭제 (deletedAt 설정)
      await tx.comment.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      })
      
      // commentsCount 감소
      await tx.article.update({
        where: { id: article.id },
        data: {
          commentsCount: {
            decrement: 1,
          },
        },
      })
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}

