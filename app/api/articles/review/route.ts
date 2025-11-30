import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-middleware'
import { obtainCardByAuthor } from '@/lib/card-system'
import { z } from 'zod'
import type { ApiErrorResponse } from '@/types'

const reviewSchema = z.object({
  articleId: z.string(),
  status: z.enum(['published', 'rejected']),
})

// GET: 검토 대기 중인 글 목록 (관리자만)
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json<ApiErrorResponse>(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }
    
    const articles = await prisma.article.findMany({
      where: {
        status: 'pending',
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
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Review list error:', error)
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to fetch review articles' },
      { status: 500 }
    )
  }
}

// POST: 글 검토 (승인/거부) - 관리자만
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json<ApiErrorResponse>(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { articleId, status } = reviewSchema.parse(body)
    
    // 기존 글 정보 조회 (작성자 확인용)
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
      select: {
        authorId: true,
        status: true,
      },
    })
    
    if (!existingArticle) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Article not found' },
        { status: 404 }
      )
    }
    
    const article = await prisma.article.update({
      where: { id: articleId },
      data: { status },
    })
    
    // 글 승인 시 (pending -> published) 카드 부여
    if (status === 'published' && existingArticle.status === 'pending' && existingArticle.authorId) {
      try {
        await obtainCardByAuthor(existingArticle.authorId, articleId)
      } catch (error) {
        console.error('Error obtaining card on article approval:', error)
        // 카드 부여 실패해도 글 승인은 성공으로 처리
      }
    }
    
    return NextResponse.json({ article })
  } catch (error) {
    console.error('Review error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Validation error', message: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to review article' },
      { status: 500 }
    )
  }
}

