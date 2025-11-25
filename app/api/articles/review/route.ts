import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-middleware'
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
    const user = authResult.user
    
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
    const user = authResult.user
    
    const body = await request.json()
    const { articleId, status } = reviewSchema.parse(body)
    
    const article = await prisma.article.update({
      where: { id: articleId },
      data: { status },
    })
    
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

