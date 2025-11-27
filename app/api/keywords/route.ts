import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCache, setCache, createCacheKey, isCacheAvailable } from '@/lib/cache'
import type { KeywordsResponse, ApiErrorResponse } from '@/types'

// GET: 모든 키워드(글 제목) 목록
export async function GET() {
  try {
    const cacheKey = createCacheKey('keywords')
    
    // 캐시에서 조회 시도
    if (isCacheAvailable()) {
      const cached = await getCache<KeywordsResponse>(cacheKey)
      if (cached) {
        return NextResponse.json<KeywordsResponse>(cached)
      }
    }
    
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
    
    // 캐시에 저장 (1시간)
    if (isCacheAvailable()) {
      await setCache(cacheKey, articles, 3600)
    }
    
    return NextResponse.json<KeywordsResponse>(articles)
  } catch (error) {
    return NextResponse.json<ApiErrorResponse>({ error: 'Failed to fetch keywords' }, { status: 500 })
  }
}

