import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { LinkCreateResponse, LinkDeleteResponse, ApiErrorResponse } from '@/types'

const linkSchema = z.object({
  toArticleId: z.string(),
  keyword: z.string(),
  relationType: z.enum(['auto', 'parent-child', 'related', 'reference']),
})

// POST: 특정 글에 관계 링크 추가/수정
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { toArticleId, keyword, relationType } = linkSchema.parse(body)
    
    // 기존 링크 확인
    const existing = await prisma.articleLink.findUnique({
      where: {
        fromArticleId_toArticleId_keyword: {
          fromArticleId: id,
          toArticleId,
          keyword,
        },
      },
    })
    
    if (existing) {
      // 기존 링크의 관계 유형 업데이트
      const updated = await prisma.articleLink.update({
        where: { id: existing.id },
        data: { relationType },
      })
      return NextResponse.json<LinkCreateResponse>(updated)
    } else {
      // 새 링크 생성
      const created = await prisma.articleLink.create({
        data: {
          fromArticleId: id,
          toArticleId,
          keyword,
          relationType,
        },
      })
      return NextResponse.json<LinkCreateResponse>(created)
    }
  } catch (error) {
    console.error('Link creation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>({ error: 'Validation error', message: error.issues }, { status: 400 })
    }
    return NextResponse.json<ApiErrorResponse>({ error: 'Failed to create/update link' }, { status: 500 })
  }
}

// DELETE: 특정 링크 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')
    
    if (!linkId) {
      return NextResponse.json<ApiErrorResponse>({ error: 'linkId is required' }, { status: 400 })
    }
    
    await prisma.articleLink.delete({
      where: { id: linkId },
    })
    
    return NextResponse.json<LinkDeleteResponse>({ success: true })
  } catch (error) {
    console.error('Link deletion error:', error)
    return NextResponse.json<ApiErrorResponse>({ error: 'Failed to delete link' }, { status: 500 })
  }
}

