import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateToken } from '@/lib/auth-middleware'
import type { ApiErrorResponse } from '@/types'

/**
 * GET: 글 미리보기 데이터 조회
 * 하이퍼링크 호버 시 표시할 간단한 정보만 반환
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const decodedSlug = slug.includes('%') ? decodeURIComponent(slug) : slug
    // 선택적 인증 (비회원도 조회 가능)
    const authResult = await authenticateToken(request)
    const user = authResult.user

    const article = await prisma.article.findUnique({
      where: { slug: decodedSlug },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        status: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!article) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // 비공개 글 체크
    if (article.status !== 'published') {
      if (!user) {
        return NextResponse.json<ApiErrorResponse>(
          { error: 'Article not found' },
          { status: 404 }
        )
      }
      if (user.role !== 'admin' && article.authorId !== user.id) {
        return NextResponse.json<ApiErrorResponse>(
          { error: 'Article not found' },
          { status: 404 }
        )
      }
    }

    // 내용에서 HTML 태그 제거하고 미리보기 생성
    const contentPreview = article.content
      .replace(/<[^>]*>/g, '') // HTML 태그 제거
      .replace(/\n/g, ' ') // 줄바꿈 제거
      .substring(0, 150) // 150자로 제한
      .trim()

    return NextResponse.json({
      id: article.id,
      title: article.title,
      slug: article.slug,
      preview: contentPreview,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    })
  } catch (error) {
    console.error('Preview API error:', error)
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to fetch article preview' },
      { status: 500 }
    )
  }
}

