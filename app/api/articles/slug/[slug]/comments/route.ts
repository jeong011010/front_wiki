import { NextRequest, NextResponse } from 'next/server'
import { prisma, withRetry } from '@/lib/prisma'
import { authenticateToken, requireAuth } from '@/lib/auth-middleware'
import { z } from 'zod'
import type { ApiErrorResponse } from '@/types'

const commentSchema = z.object({
  content: z.string().min(1, '댓글 내용을 입력해주세요.').max(1000, '댓글은 1000자 이하여야 합니다.'),
})

// GET: 댓글 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // 글 존재 확인
    const article = await withRetry(() => prisma.article.findUnique({
      where: { slug },
      select: { id: true, status: true },
    }))
    
    if (!article) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Article not found' },
        { status: 404 }
      )
    }
    
    // 선택적 인증 (비회원도 조회 가능)
    const authResult = await authenticateToken(request)
    const user = authResult.user
    
    // 비공개 글 체크
    if (article.status !== 'published') {
      if (!user) {
        return NextResponse.json<ApiErrorResponse>(
          { error: 'Article not found' },
          { status: 404 }
        )
      }
      if (user.role !== 'admin') {
        return NextResponse.json<ApiErrorResponse>(
          { error: 'Article not found' },
          { status: 404 }
        )
      }
    }
    
    // 댓글 목록 조회 (삭제되지 않은 댓글만)
    const comments = await withRetry(() => prisma.comment.findMany({
      where: {
        articleId: article.id,
        deletedAt: null, // 소프트 삭제되지 않은 댓글만
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // 작성일 오름차순 (최신순은 'desc')
      },
    }))
    
    return NextResponse.json({
      comments: comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST: 댓글 작성 (로그인 필수)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
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
      select: { id: true, status: true },
    }))
    
    if (!article) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Article not found' },
        { status: 404 }
      )
    }
    
    // 공개된 글만 댓글 작성 가능
    if (article.status !== 'published') {
      return NextResponse.json<ApiErrorResponse>(
        { error: '댓글을 작성할 수 없는 글입니다.' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { content } = commentSchema.parse(body)
    
    // 댓글 생성 및 commentsCount 증가 (트랜잭션)
    const result = await prisma.$transaction(async (tx) => {
      // 댓글 생성
      const comment = await tx.comment.create({
        data: {
          content,
          articleId: article.id,
          authorId: user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
      
      // commentsCount 증가
      await tx.article.update({
        where: { id: article.id },
        data: {
          commentsCount: {
            increment: 1,
          },
        },
      })
      
      return comment
    })
    
    return NextResponse.json({
      comment: {
        id: result.id,
        content: result.content,
        author: result.author,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Validation error', message: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

