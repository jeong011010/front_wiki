'use client'

import { useState, useEffect, useMemo } from 'react'
import ArticleCard from './ArticleCard'

interface Article {
  id: string
  title: string
  slug: string
  category: string | null
  categorySlug?: string | null
  createdAt: string
  updatedAt: string
  preview?: string
}

// 그리드 높이 계산: 카드 높이(240px) * 2행 + gap(1.5rem = 24px)
// 5개 카드가 3열 그리드에서 2행을 차지
const GRID_HEIGHT = 'calc(240px * 2 + 1.5rem)'

export default function FeaturedArticles() {
  const [sort, setSort] = useState<'popular' | 'recent'>('recent')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/articles/featured?sort=${sort}&limit=5`)
        if (response.ok) {
          const data = await response.json()
          setArticles(data)
        }
      } catch (error) {
        console.error('Failed to fetch featured articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [sort])

  // 항상 5개 슬롯을 유지 (빈 슬롯 포함) - 메모이제이션으로 불필요한 재계산 방지
  // 로딩 중이어도 카드 슬롯은 유지하고, 스켈레톤은 오버레이로 표시
  const displayItems = useMemo(() => {
    if (articles.length > 0) {
      return [
        ...articles.map(article => ({ 
          type: 'article' as const, 
          id: article.id, 
          article 
        })),
        ...Array(Math.max(0, 5 - articles.length)).fill(null).map((_, i) => ({ 
          type: 'empty' as const, 
          id: `empty-${i}` 
        }))
      ]
    }
    
    // articles가 없고 로딩 중이 아닐 때만 empty-state 표시
    if (!loading) {
      return [{ type: 'empty-state' as const, id: 'empty-state' }]
    }
    
    // 로딩 중일 때는 빈 슬롯 5개 (스켈레톤은 오버레이로 표시)
    return Array(5).fill(null).map((_, i) => ({ 
      type: 'empty' as const, 
      id: `loading-slot-${i}` 
    }))
  }, [loading, articles])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-text-primary">추천 글</h2>
        <div className="flex gap-2 bg-surface border border-border rounded-lg p-1">
          <button
            onClick={() => setSort('recent')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              sort === 'recent'
                ? 'bg-primary-500 text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => setSort('popular')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              sort === 'popular'
                ? 'bg-primary-500 text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            인기순
          </button>
        </div>
      </div>

      {/* 고정 높이 그리드 - DOM 구조는 항상 동일 */}
      <div 
        className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        style={{ 
          minHeight: GRID_HEIGHT, 
          height: GRID_HEIGHT,
          contain: 'layout style paint'
        }}
      >
        {/* 실제 카드 또는 빈 슬롯 - 항상 렌더링 */}
        {displayItems.map((item) => {
          if (item.type === 'article') {
            return (
              <div key={item.id} style={{ height: '240px' }}>
                <ArticleCard article={item.article} />
              </div>
            )
          }
          
          if (item.type === 'empty') {
            return (
              <div 
                key={item.id} 
                style={{ 
                  height: '240px',
                  contain: 'layout style'
                }} 
                aria-hidden="true" 
              />
            )
          }
          
          // empty-state
          return (
            <div 
              key={item.id}
              className="col-span-full text-center bg-surface border border-border rounded-lg flex items-center justify-center"
              style={{ height: GRID_HEIGHT }}
            >
              <p className="text-text-secondary">표시할 글이 없습니다.</p>
            </div>
          )
        })}
        
        {/* 스켈레톤 오버레이 - 로딩 중일 때만 표시 */}
        {loading && (
          <div 
            className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pointer-events-none"
            style={{ zIndex: 10 }}
          >
            {Array(5).fill(null).map((_, i) => (
              <div 
                key={`skeleton-overlay-${i}`}
                className="bg-surface border border-border rounded-lg p-6 animate-pulse" 
                style={{ 
                  height: '240px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  contain: 'layout style'
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
                  <div className="ml-3 h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex-1 mb-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
                <div className="flex items-center justify-between text-xs mt-auto">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

