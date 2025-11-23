import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { detectKeywords } from '@/lib/link-detector'
import { getSessionUser } from '@/lib/auth'
import { z } from 'zod'
import type { ArticleDetailResponse, ArticleUpdateResponse, ArticleDeleteResponse, ApiErrorResponse } from '@/types'

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
})

// GET: slug로 특정 글 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const user = await getSessionUser()
    
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        outgoingLinks: {
          include: {
            toArticle: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
        incomingLinks: {
          include: {
            fromArticle: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    })
    
    if (!article) {
      return NextResponse.json<ApiErrorResponse>({ error: 'Article not found' }, { status: 404 })
    }
    
    // 비공개 글 체크
    if (article.status !== 'published') {
      if (!user) {
        return NextResponse.json<ApiErrorResponse>({ error: 'Article not found' }, { status: 404 })
      }
      if (user.role !== 'admin' && article.authorId !== user.id) {
        return NextResponse.json<ApiErrorResponse>({ error: 'Article not found' }, { status: 404 })
      }
    }
    
    return NextResponse.json<ArticleDetailResponse>(article as ArticleDetailResponse)
  } catch (error) {
    return NextResponse.json<ApiErrorResponse>({ error: 'Failed to fetch article' }, { status: 500 })
  }
}

// PUT: slug로 글 수정 (작성자 또는 관리자만)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const user = await getSessionUser()
    
    if (!user) {
      return NextResponse.json<ApiErrorResponse>(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    // 기존 링크 삭제
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, authorId: true },
    })
    
    if (!article) {
      return NextResponse.json<ApiErrorResponse>({ error: 'Article not found' }, { status: 404 })
    }
    
    // 권한 체크
    if (user.role !== 'admin' && article.authorId !== user.id) {
      return NextResponse.json<ApiErrorResponse>(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const data = updateSchema.parse(body)
    
    await prisma.articleLink.deleteMany({
      where: { fromArticleId: article.id },
    })
    
    // 글 업데이트 (일반 회원이 수정하면 다시 pending 상태로)
    const updateData: { title?: string; content?: string; status?: string } = { ...data }
    if (user.role !== 'admin' && article.authorId === user.id) {
      updateData.status = 'pending'
    }
    
    const updatedArticle = await prisma.article.update({
      where: { slug },
      data: updateData,
    })
    
    // 새 링크 감지 및 생성 (자동 링크는 "auto" 타입)
    if (data.content) {
      const detectedLinks = await detectKeywords(data.content)
      const validLinks = detectedLinks.filter(link => link.articleId !== article.id)
      
      if (validLinks.length > 0) {
        const linkPromises = validLinks.map((link) =>
          prisma.articleLink.create({
            data: {
              keyword: link.keyword,
              fromArticleId: article.id,
              toArticleId: link.articleId,
              relationType: 'auto', // 자동 생성된 링크는 "auto" 타입
            },
          }).catch((err) => {
            console.warn('Failed to create link:', err)
            return null
          })
        )
        
        await Promise.all(linkPromises)
      }
    }
    
    return NextResponse.json<ArticleUpdateResponse>(updatedArticle)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>({ error: 'Validation error', message: error.issues }, { status: 400 })
    }
    return NextResponse.json<ApiErrorResponse>({ error: 'Failed to update article' }, { status: 500 })
  }
}

// DELETE: slug로 글 삭제 (작성자 또는 관리자만)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const user = await getSessionUser()
    
    if (!user) {
      return NextResponse.json<ApiErrorResponse>(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { authorId: true },
    })
    
    if (!article) {
      return NextResponse.json<ApiErrorResponse>({ error: 'Article not found' }, { status: 404 })
    }
    
    // 권한 체크
    if (user.role !== 'admin' && article.authorId !== user.id) {
      return NextResponse.json<ApiErrorResponse>(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      )
    }
    
    await prisma.article.delete({
      where: { slug },
    })
    return NextResponse.json<ArticleDeleteResponse>({ success: true })
  } catch (error) {
    return NextResponse.json<ApiErrorResponse>({ error: 'Failed to delete article' }, { status: 500 })
  }
}

