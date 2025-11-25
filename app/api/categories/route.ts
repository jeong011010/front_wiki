import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-middleware'
import { z } from 'zod'
import type { ApiErrorResponse } from '@/types'
import { slugify } from '@/lib/utils'

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  order: z.number().int().default(0),
})

/**
 * GET: 모든 카테고리 목록 조회 (계층 구조)
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        children: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: [
        { parentId: 'asc' },
        { order: 'asc' },
        { name: 'asc' },
      ],
    })
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

/**
 * POST: 새 카테고리 생성 (관리자만)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json<ApiErrorResponse>(
        { error: '관리자만 카테고리를 생성할 수 있습니다.' },
        { status: 403 }
      )
    }
    const user = authResult.user
    
    const body = await request.json()
    const data = categorySchema.parse(body)
    
    // slug 생성
    const slug = slugify(data.name)
    
    // 중복 체크
    const existing = await prisma.category.findUnique({
      where: { slug },
    })
    
    if (existing) {
      return NextResponse.json<ApiErrorResponse>(
        { error: '이미 같은 이름의 카테고리가 존재합니다.' },
        { status: 400 }
      )
    }
    
    // 부모 카테고리 존재 확인
    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      })
      
      if (!parent) {
        return NextResponse.json<ApiErrorResponse>(
          { error: '부모 카테고리를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }
    }
    
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        parentId: data.parentId,
        order: data.order,
      },
      include: {
        parent: true,
        children: true,
      },
    })
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Category creation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Validation error', message: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

