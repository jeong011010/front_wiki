import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateToken } from '@/lib/auth-middleware'
import { getCache, setCache, createCacheKey, isCacheAvailable } from '@/lib/cache'
import type { DiagramResponse, ApiErrorResponse } from '@/types'

// GET: 다이어그램용 노드와 엣지 데이터
export async function GET(request: NextRequest) {
  try {
    // 선택적 인증 (비회원도 조회 가능)
    const authResult = await authenticateToken(request)
    const user = authResult.user
    
    // 캐시 키 생성 (사용자 역할 포함)
    const cacheKey = createCacheKey('diagram', user?.role || 'guest')
    
    // 캐시에서 조회 시도
    if (isCacheAvailable()) {
      const cached = await getCache<DiagramResponse>(cacheKey)
      if (cached) {
        return NextResponse.json<DiagramResponse>(cached)
      }
    }
    
    // 비회원 또는 일반 회원은 공개된 글만, 관리자는 모든 글
    const statusFilter = user?.role === 'admin' ? {} : { status: 'published' }
    
    const articles = await prisma.article.findMany({
      where: statusFilter,
      select: {
        id: true,
        title: true,
        slug: true,
      },
    })
    
    // 다이어그램에는 "parent-child" 관계만 표시 (의미 있는 연결만)
    const links = await prisma.articleLink.findMany({
      where: {
        relationType: 'parent-child', // 부모-자식 관계만 표시
      },
      select: {
        fromArticleId: true,
        toArticleId: true,
        keyword: true,
        relationType: true,
      },
    })
    
    // 노드 데이터
    const nodes = articles.map((article) => ({
      id: article.id,
      label: article.title,
      slug: article.slug,
    }))
    
    // 엣지 데이터 (부모-자식 관계만)
    const edges = links.map((link) => ({
      id: `${link.fromArticleId}-${link.toArticleId}-${link.keyword}`,
      source: link.fromArticleId,
      target: link.toArticleId,
      label: link.keyword,
      type: 'smoothstep', // 계층적 관계를 나타내는 엣지 타입
    }))
    
    const response: DiagramResponse = { nodes, edges }
    
    // 캐시에 저장 (30분)
    if (isCacheAvailable()) {
      await setCache(cacheKey, response, 1800)
    }
    
    return NextResponse.json<DiagramResponse>(response)
  } catch (error) {
    console.error('Diagram API error:', error)
    // 오류 상세 정보를 반환 (개발 환경에서만)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json<DiagramResponse>(
      { 
        error: 'Failed to fetch diagram data',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        nodes: [],
        edges: []
      }, 
      { status: 500 }
    )
  } finally {
    // 연결 해제하지 않음 (싱글톤 인스턴스이므로)
    // await prisma.$disconnect()
  }
}

