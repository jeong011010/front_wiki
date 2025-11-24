'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import ArticleFilterBar from './ArticleFilterBar'
import ArticleCard from './ArticleCard'
import ArticleListModal from './ArticleListModal'

interface Article {
  id: string
  title: string
  slug: string
  category: string | null
  createdAt: string
  updatedAt: string
  preview?: string
}

// 그리드 높이 계산: 카드 높이(240px) * 2행 + gap(1.5rem = 24px)
const GRID_HEIGHT = 'calc(240px * 2 + 1.5rem)'

export default function FilteredArticles() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'title'>('recent')
  const [includeSubcategories, setIncludeSubcategories] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isCancelled = false
    
    // 즉시 loading 상태로 설정하여 레이아웃 시프트 방지
    setLoading(true)
    
    const fetchArticles = async () => {
      try {
        let url = '/api/articles'
        const params = new URLSearchParams()
        
        if (selectedCategory) {
          params.append('category', selectedCategory)
          if (includeSubcategories) {
            params.append('includeSubcategories', 'true')
          }
        }
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim())
        }
        params.append('sort', sortBy)
        params.append('limit', '6')
        
        url += `?${params.toString()}`
        
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          const newArticles = Array.isArray(data) ? data : data.articles || []
          
          if (!isCancelled) {
            // requestAnimationFrame을 사용하여 DOM 업데이트와 동기화
            requestAnimationFrame(() => {
              if (!isCancelled) {
                setArticles(newArticles)
                setLoading(false)
              }
            })
          }
        } else {
          if (!isCancelled) {
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error)
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchArticles()
    
    return () => {
      isCancelled = true
    }
  }, [selectedCategory, sortBy, includeSubcategories, searchQuery])

  // 항상 6개 슬롯을 유지 (빈 슬롯 포함) - 메모이제이션으로 불필요한 재계산 방지
  // 로딩 중이어도 카드 슬롯은 유지하고, 스켈레톤은 오버레이로 표시
  const displayItems = useMemo(() => {
    if (articles.length > 0) {
      return [
        ...articles.map(article => ({ 
          type: 'article' as const, 
          id: article.id, 
          article 
        })),
        ...Array(Math.max(0, 6 - articles.length)).fill(null).map((_, i) => ({ 
          type: 'empty' as const, 
          id: `empty-${i}` 
        }))
      ]
    }
    
    // articles가 없고 로딩 중이 아닐 때만 empty-state 표시
    if (!loading) {
      return [{ type: 'empty-state' as const, id: 'empty-state' }]
    }
    
    // 로딩 중일 때는 빈 슬롯 6개 (스켈레톤은 오버레이로 표시)
    return Array(6).fill(null).map((_, i) => ({ 
      type: 'empty' as const, 
      id: `loading-slot-${i}` 
    }))
  }, [loading, articles])

  return (
    <section>
      <ArticleFilterBar
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        includeSubcategories={includeSubcategories}
        searchQuery={searchQuery}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortBy}
        onIncludeSubcategoriesChange={setIncludeSubcategories}
        onSearchChange={setSearchQuery}
      />

      {/* 고정 높이 그리드 - DOM 구조는 항상 동일 */}
      <div 
        ref={gridRef}
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
            {Array(6).fill(null).map((_, i) => (
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
      
      {/* 더보기 버튼 - 항상 고정 위치에 표시하여 레이아웃 시프트 방지 */}
      <div 
        className="flex justify-end mt-6"
        style={{ 
          height: '3.5rem', // 버튼 높이 + margin-top 고정
          minHeight: '3.5rem'
        }}
      >
        {!loading && articles.length > 0 ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-lg"
          >
            더보기 →
          </button>
        ) : (
          // 로딩 중이거나 표시할 글이 없을 때는 투명한 플레이스홀더
          <div style={{ height: '3rem', width: '120px' }} aria-hidden="true" />
        )}
      </div>

      {isModalOpen && (
        <ArticleListModal
          category={selectedCategory}
          sortBy={sortBy}
          includeSubcategories={includeSubcategories}
          searchQuery={searchQuery}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  )
}
