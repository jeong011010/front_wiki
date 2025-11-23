import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { KeywordsResponse, ApiErrorResponse } from '@/types'

// GET: 모든 키워드(글 제목) 목록
export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: {
        title: 'asc',
      },
    })
    return NextResponse.json<KeywordsResponse>(articles)
  } catch (error) {
    return NextResponse.json<ApiErrorResponse>({ error: 'Failed to fetch keywords' }, { status: 500 })
  }
}

