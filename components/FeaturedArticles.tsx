'use client'

import { useState, useEffect, useRef } from 'react'
import ArticleCard from './ArticleCard'
import { ArticleCardSkeleton, Button } from '@/components/ui'

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

export default function FeaturedArticles() {
  const [sort, setSort] = useState<'popular' | 'recent'>('recent')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/articles/featured?sort=${sort}&limit=10`)
        if (response.ok) {
          const data = await response.json()
          console.log('[추천글 API]', JSON.stringify(data, null, 2))
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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary">추천 글</h2>
        <div className="flex gap-2 bg-surface border border-border rounded-lg p-1 w-full sm:w-auto">
          <button
            onClick={() => setSort('recent')}
            className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              sort === 'recent'
                ? 'bg-primary-500 text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => setSort('popular')}
            className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              sort === 'popular'
                ? 'bg-primary-500 text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            인기순
          </button>
        </div>
      </div>

      {/* 가로 스크롤 컨테이너 */}
      <div className="relative">
        {/* 좌우 스크롤 버튼 (데스크톱) */}
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
          className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div className="flex gap-4 min-w-max">
            {loading ? (
              // 로딩 중 스켈레톤
              Array(5).fill(null).map((_, i) => (
                <div key={`skeleton-${i}`} className="flex-shrink-0 w-[280px] md:w-[300px]">
                  <ArticleCardSkeleton />
                </div>
              ))
            ) : articles.length > 0 ? (
              // 실제 카드
              articles.map((article) => (
                <div key={article.id} className="flex-shrink-0 w-[280px] md:w-[300px]">
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
    </div>
  )
}

