import { authenticateToken, requireAuth } from '@/lib/auth-middleware'
import { detectKeywords } from '@/lib/link-detector'
import { prisma } from '@/lib/prisma'
import { isCacheAvailable } from '@/lib/cache'
import { incrementCacheVersion } from '@/lib/cache-version'
import type { ApiErrorResponse, ArticleDeleteResponse, ArticleDetailResponse, ArticleUpdateResponse } from '@/types'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  categoryId: z.string().optional().nullable(),
})

// GET: 특정 글 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // 선택적 인증 (비회원도 조회 가능)
    const authResult = await authenticateToken(request)
    const user = authResult.user
    
    const article = await prisma.article.findUnique({
      where: { id },
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
    
    // relationType으로 정렬
    type LinkWithRelation = {
      relationType: string
      [key: string]: unknown
    }
    
    const sortedOutgoingLinks = [...(article.outgoingLinks as unknown as LinkWithRelation[])].sort((a, b) => {
      const order: Record<string, number> = { 'parent-child': 0, 'related': 1, 'reference': 2, 'auto': 3 }
      return (order[a.relationType] ?? 99) - (order[b.relationType] ?? 99)
    })
    
    const sortedIncomingLinks = [...(article.incomingLinks as unknown as LinkWithRelation[])].sort((a, b) => {
      const order: Record<string, number> = { 'parent-child': 0, 'related': 1, 'reference': 2, 'auto': 3 }
      return (order[a.relationType] ?? 99) - (order[b.relationType] ?? 99)
    })
    
    const articleWithSortedLinks = {
      ...article,
      outgoingLinks: sortedOutgoingLinks,
      incomingLinks: sortedIncomingLinks,
    } as unknown as typeof article & { status: string; authorId: string | null }
    
    // 비공개 글 체크
    if (articleWithSortedLinks.status !== 'published') {
      if (!user) {
        return NextResponse.json<ApiErrorResponse>({ error: 'Article not found' }, { status: 404 })
      }
      if (user.role !== 'admin' && articleWithSortedLinks.authorId !== user.id) {
        return NextResponse.json<ApiErrorResponse>({ error: 'Article not found' }, { status: 404 })
      }
    }
    
    return NextResponse.json<ArticleDetailResponse>(articleWithSortedLinks as unknown as ArticleDetailResponse)
  } catch {
    return NextResponse.json<ApiErrorResponse>({ error: 'Failed to fetch article' }, { status: 500 })
  }
}

// PUT: 글 수정 (작성자 또는 관리자만)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await requireAuth(request)
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json<ApiErrorResponse>(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    const user = authResult.user
    
    // 글 조회
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    }) as { authorId: string | null } | null
    
    if (!existingArticle) {
      return NextResponse.json<ApiErrorResponse>({ error: 'Article not found' }, { status: 404 })
    }
    
    // 권한 체크 (작성자 또는 관리자만 수정 가능)
    if (user.role !== 'admin' && (existingArticle.authorId ?? null) !== user.id) {
      return NextResponse.json<ApiErrorResponse>(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const data = updateSchema.parse(body)
    
    // 카테고리 존재 확인
    if (data.categoryId !== undefined && data.categoryId !== null) {
      const categoryRecord = await prisma.category.findUnique({
        where: { id: data.categoryId },
      })
      
      if (!categoryRecord) {
        return NextResponse.json<ApiErrorResponse>(
          { error: '카테고리를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }
    }
    
    // 기존 링크 삭제
    await prisma.articleLink.deleteMany({
      where: { fromArticleId: id },
    })
    
    // 글 업데이트 (일반 회원이 수정하면 다시 pending 상태로)
    const updateData: { 
      title?: string
      content?: string
      status?: string
      categoryId?: string | null
    } = { ...data }
    if (user.role !== 'admin' && (existingArticle.authorId ?? null) === user.id) {
      updateData.status = 'pending' // 일반 회원이 수정하면 다시 검토 대기
    }
    
    const article = await prisma.article.update({
      where: { id },
      data: updateData,
    })
    
    // 새 링크 감지 및 생성 (자동 링크는 "auto" 타입)
    if (data.content) {
      const detectedLinks = await detectKeywords(data.content)
      const validLinks = detectedLinks.filter(link => link.articleId !== id)
      
      if (validLinks.length > 0) {
        const linkPromises = validLinks.map((link) =>
          prisma.articleLink.create({
            data: {
              keyword: link.keyword,
              fromArticleId: id,
              toArticleId: link.articleId,
              relationType: 'auto', // 자동 생성된 링크는 "auto" 타입
            } as { keyword: string; fromArticleId: string; toArticleId: string; relationType: string },
          }).catch((err) => {
            console.warn('Failed to create link:', err)
            return null
          })
        )
        
        await Promise.all(linkPromises)
      }
    }
    
    // 캐시 버전 증가 (모든 캐시 자동 무효화)
    if (isCacheAvailable()) {
      await incrementCacheVersion()
    }
    
    return NextResponse.json<ArticleUpdateResponse>(article)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>({ error: 'Validation error', message: error.issues }, { status: 400 })
    }
    return NextResponse.json<ApiErrorResponse>({ error: 'Failed to update article' }, { status: 500 })
  }
}

// DELETE: 글 삭제 (작성자 또는 관리자만)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await requireAuth(request)
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json<ApiErrorResponse>(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    const user = authResult.user
    
    // 글 조회
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    }) as { authorId: string | null } | null
    
    if (!existingArticle) {
      return NextResponse.json<ApiErrorResponse>({ error: 'Article not found' }, { status: 404 })
    }
    
    // 권한 체크 (작성자 또는 관리자만 삭제 가능)
    if (user.role !== 'admin' && (existingArticle.authorId ?? null) !== user.id) {
      return NextResponse.json<ApiErrorResponse>(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      )
    }
    
    await prisma.article.delete({
      where: { id },
    })
    
    // 캐시 버전 증가 (모든 캐시 자동 무효화)
    if (isCacheAvailable()) {
      await incrementCacheVersion()
    }
    
    return NextResponse.json<ArticleDeleteResponse>({ success: true })
  } catch {
    return NextResponse.json<ApiErrorResponse>({ error: 'Failed to delete article' }, { status: 500 })
  }
}

