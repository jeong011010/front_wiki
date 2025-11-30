import { NextResponse } from 'next/server'
import { prisma, withRetry } from '@/lib/prisma'
import type { ApiErrorResponse } from '@/types'

interface CategoryNode {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  order: number
  articleCount: number
  children: CategoryNode[]
}

/**
 * GET: 계층 구조로 카테고리 목록 조회
 */
export async function GET() {
  try {
    const categories = await withRetry(() => prisma.category.findMany({
      include: {
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
    }))
    
    // 계층 구조로 변환
    const categoryMap = new Map<string, CategoryNode>()
    const rootCategories: CategoryNode[] = []
    
    // 모든 카테고리를 맵에 추가
    categories.forEach((cat) => {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        parentId: cat.parentId,
        order: cat.order,
        articleCount: cat._count.articles,
        children: [],
      })
    })
    
    // 계층 구조 구성
    categories.forEach((cat) => {
      const node = categoryMap.get(cat.id)!
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId)
        if (parent) {
          parent.children.push(node)
        } else {
          // 부모가 없으면 루트로 추가
          rootCategories.push(node)
        }
      } else {
        rootCategories.push(node)
      }
    })
    
    // 정렬
    const sortCategories = (cats: CategoryNode[]) => {
      cats.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order
        return a.name.localeCompare(b.name)
      })
      cats.forEach((cat) => {
        if (cat.children.length > 0) {
          sortCategories(cat.children)
        }
      })
    }
    
    sortCategories(rootCategories)
    
    return NextResponse.json(rootCategories)
  } catch (error) {
    console.error('Category tree API error:', error)
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Failed to fetch category tree' },
      { status: 500 }
    )
  }
}

