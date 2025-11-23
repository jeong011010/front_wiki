import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { detectKeywords } from '@/lib/link-detector'
import { getSessionUser } from '@/lib/auth'
import { z } from 'zod'
import type { ArticlesListResponse, ArticleCreateResponse, ApiErrorResponse } from '@/types'

const articleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
})

// GET: 모든 글 목록 (공개된 글만)
export async function GET() {
  try {
    const user = await getSessionUser()
    
    // 비회원 또는 일반 회원은 공개된 글만, 관리자는 모든 글
    const where = user?.role === 'admin' 
      ? {} 
      : { status: 'published' }
    
    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return NextResponse.json<ArticlesListResponse>(articles)
  } catch (error) {
    return NextResponse.json<ApiErrorResponse>({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

// POST: 새 글 작성 (회원만 가능)
export async function POST(request: NextRequest) {
  try {
    // 로그인 체크
    const user = await getSessionUser()
    
    if (!user) {
      return NextResponse.json<ApiErrorResponse>(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { title, content } = articleSchema.parse(body)
    
    const slug = slugify(title)
    
    // 중복 체크
    const existing = await prisma.article.findUnique({
      where: { slug },
    })
    
    if (existing) {
      return NextResponse.json<ApiErrorResponse>({ 
        error: '이미 같은 제목의 글이 존재합니다.',
        message: `"${existing.title}" 제목의 글이 이미 있습니다. 다른 제목을 사용해주세요.`
      }, { status: 400 })
    }
    
    // 글 생성 (관리자는 바로 공개, 일반 회원은 검토 대기)
    const status = user.role === 'admin' ? 'published' : 'pending'
    
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        status,
        authorId: user.id,
      },
    })
    
    // 자동 링크 감지 및 생성 (자기 자신 제외)
    try {
      const detectedLinks = await detectKeywords(content)
      
      // 자기 자신을 참조하는 링크 제외
      const validLinks = detectedLinks.filter(link => link.articleId !== article.id)
      
      // 링크 관계 생성 (자동 링크는 "auto" 타입으로)
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
            // 중복 링크나 기타 오류는 무시
            console.warn('Failed to create link:', err)
            return null
          })
        )
        
        await Promise.all(linkPromises)
      }
    } catch (linkError) {
      // 링크 생성 실패해도 글은 저장됨
      console.error('Link detection error:', linkError)
    }
    
    return NextResponse.json<ArticleCreateResponse>(article)
  } catch (error) {
    console.error('Article creation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>({ error: 'Validation error', message: error.issues }, { status: 400 })
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json<ApiErrorResponse>(
      { 
        error: 'Failed to create article',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      }, 
      { status: 500 }
    )
  }
}

