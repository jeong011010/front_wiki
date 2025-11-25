import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-middleware'
import { z } from 'zod'
import type { ApiErrorResponse } from '@/types'
import { slugify } from '@/lib/utils'

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  order: z.number().int().optional(),
})

/**
 * GET: 특정 카테고리 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const category = await prisma.category.findUnique({
      where: { id },
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
    })
    
    if (!category) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Category API error:', error)
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

/**
 * PUT: 카테고리 수정 (관리자만)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await requireAdmin(request)
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json<ApiErrorResponse>(
        { error: '관리자만 카테고리를 수정할 수 있습니다.' },
        { status: 403 }
      )
    }
    const user = authResult.user
    
    const category = await prisma.category.findUnique({
      where: { id },
    })
    
    if (!category) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    const body = await request.json()
    const data = updateCategorySchema.parse(body)
    
    // 순환 참조 방지: 자신을 부모로 설정할 수 없음
    if (data.parentId === id) {
      return NextResponse.json<ApiErrorResponse>(
        { error: '자기 자신을 부모 카테고리로 설정할 수 없습니다.' },
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
    
    // slug 업데이트 (이름이 변경된 경우)
    const updateData: {
      name?: string
      slug?: string
      description?: string | null
      parentId?: string | null
      order?: number
    } = { ...data }
    
    if (data.name && data.name !== category.name) {
      const newSlug = slugify(data.name)
      // 중복 체크 (자기 자신 제외)
      const existing = await prisma.category.findUnique({
        where: { slug: newSlug },
      })
      
      if (existing && existing.id !== id) {
        return NextResponse.json<ApiErrorResponse>(
          { error: '이미 같은 이름의 카테고리가 존재합니다.' },
          { status: 400 }
        )
      }
      
      updateData.slug = newSlug
    }
    
    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        children: {
          orderBy: { order: 'asc' },
        },
      },
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Category update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Validation error', message: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

/**
 * DELETE: 카테고리 삭제 (관리자만)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getSessionUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json<ApiErrorResponse>(
        { error: '관리자만 카테고리를 삭제할 수 있습니다.' },
        { status: 403 }
      )
    }
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        _count: {
          select: {
            articles: true,
          },
        },
      },
    })
    
    if (!category) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    // 하위 카테고리가 있으면 삭제 불가
    if (category.children.length > 0) {
      return NextResponse.json<ApiErrorResponse>(
        { error: '하위 카테고리가 있는 경우 삭제할 수 없습니다. 먼저 하위 카테고리를 삭제하거나 이동하세요.' },
        { status: 400 }
      )
    }
    
    // 연결된 글이 있으면 삭제 불가 (또는 경고)
    if (category._count.articles > 0) {
      return NextResponse.json<ApiErrorResponse>(
        { error: `이 카테고리에 연결된 글이 ${category._count.articles}개 있습니다. 먼저 글의 카테고리를 변경하세요.` },
        { status: 400 }
      )
    }
    
    await prisma.category.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Category deletion error:', error)
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}

