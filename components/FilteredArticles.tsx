'use client'

import { ArticleCardSkeleton } from '@/components/ui'
import { useEffect, useRef, useState } from 'react'
import ArticleCard from './ArticleCard'
import ArticleFilterBar from './ArticleFilterBar'
import ArticleListModal from './ArticleListModal'

interface Article {
  id: string
  title: string
  titleWithLinks?: string // 링크가 포함된 제목 HTML (선택사항)
  slug: string
  category: string | null
  categorySlug?: string | null
  createdAt: string
  updatedAt: string
  preview?: string
  author?: {
    name: string
    email: string
  } | null
}


export default function FilteredArticles() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'title'>('recent')
  const [includeSubcategories, setIncludeSubcategories] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -256, behavior: 'smooth' }) // 카드 너비(240px) + 패딩(8px*2) + gap(4px) = 260px, 약간 여유있게 256px
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 256, behavior: 'smooth' }) // 카드 너비(240px) + 패딩(8px*2) + gap(4px) = 260px, 약간 여유있게 256px
    }
  }

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
          <p className="text-[10px] sm:text-xs md:text-sm text-text-secondary mt-1 sm:mt-2 px-1 sm:px-2">
            총 <span className="font-semibold text-text-primary">{articles.length}</span>개의 글이 있습니다.
          </p>
        )}
      </div>

      {/* 가로 스크롤 컨테이너 - FeaturedArticles와 동일한 스타일 */}
      <div className="relative">
        {/* 좌우 스크롤 버튼 (데스크톱, 3개 이상일 때) */}
        {articles.length > 3 && (
          <>
            <button
              onClick={scrollLeft}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 items-center justify-center bg-surface border border-border rounded-full shadow-lg hover:bg-surface-hover transition-colors"
              aria-label="왼쪽으로 스크롤"
            >
              <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={scrollRight}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 items-center justify-center bg-surface border border-border rounded-full shadow-lg hover:bg-surface-hover transition-colors"
              aria-label="오른쪽으로 스크롤"
            >
              <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* 가로 스크롤 가능한 카드 컨테이너 */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide -mx-4 px-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingTop: '60px', // 카드 회전 시 상단 잘림 방지
            paddingBottom: '60px', // 카드 회전 시 하단 잘림 방지
            marginTop: '-60px', // 상단 패딩으로 인한 레이아웃 시프트 보정
            marginBottom: '-60px', // 하단 패딩으로 인한 레이아웃 시프트 보정
          }}
        >
          <div className="flex gap-1 min-w-max">
            {loading ? (
              // 로딩 중 스켈레톤
              Array(6).fill(null).map((_, i) => (
                <div key={`skeleton-${i}`} className="flex-shrink-0" style={{ padding: '8px', boxSizing: 'border-box' }}>
                  <ArticleCardSkeleton />
                </div>
              ))
            ) : articles.length > 0 ? (
              // 실제 카드
              articles.map((article) => (
                <div key={article.id} className="flex-shrink-0" style={{ padding: '8px', boxSizing: 'border-box' }}>
                  <ArticleCard article={article} />
                </div>
              ))
            ) : (
              // 빈 상태
              <div className="w-full text-center bg-surface border border-border rounded-lg py-12">
                <p className="text-text-secondary">표시할 글이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
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
