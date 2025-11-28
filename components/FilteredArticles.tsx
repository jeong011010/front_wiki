'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import ArticleFilterBar from './ArticleFilterBar'
import ArticleCard from './ArticleCard'
import ArticleListModal from './ArticleListModal'
import { ArticleCardSkeleton } from '@/components/ui'

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
    
    const fetchArticles = async () => {
      // 비동기 함수 내에서 loading 상태 설정
      setLoading(true)
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
      <div className="mb-4">
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
        {/* 필터 결과 개수 표시 */}
        {!loading && articles.length > 0 && (
          <p className="text-xs md:text-sm text-text-secondary mt-2 px-2">
            총 <span className="font-semibold text-text-primary">{articles.length}</span>개의 글이 있습니다.
          </p>
        )}
      </div>

      {/* 반응형 그리드 - 모바일에서는 고정 높이 제거 */}
      <div 
        ref={gridRef}
        className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        style={{ 
          minHeight: 'auto',
          contain: 'layout style paint'
        }}
      >
        {/* 실제 카드 또는 빈 슬롯 - 항상 렌더링 */}
        {displayItems.map((item) => {
          if (item.type === 'article') {
            return (
              <div key={item.id}>
                <ArticleCard article={item.article} />
              </div>
            )
          }
          
          if (item.type === 'empty') {
            return (
              <div 
                key={item.id} 
                style={{ 
                  minHeight: '200px',
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
              className="col-span-full text-center bg-surface border border-border rounded-lg flex items-center justify-center py-12"
            >
              <p className="text-text-secondary">표시할 글이 없습니다.</p>
            </div>
          )
        })}
        
        {/* 스켈레톤 오버레이 - 로딩 중일 때만 표시 */}
        {loading && (
          <div 
            className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pointer-events-none"
            style={{ zIndex: 10 }}
          >
            {Array(6).fill(null).map((_, i) => (
              <ArticleCardSkeleton key={`skeleton-overlay-${i}`} />
            ))}
          </div>
        )}
      </div>
      
      {/* 더보기 버튼 - 동적 위치 */}
      {!loading && articles.length > 0 && (
        <div className="flex justify-end mt-4 md:mt-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 md:px-6 py-2 md:py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm md:text-base font-medium shadow-lg"
          >
            더보기 →
          </button>
        </div>
      )}

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
