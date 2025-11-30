'use client'

import { ArticleCardSkeleton } from '@/components/ui'
import { useEffect, useRef, useState } from 'react'
import ArticleCard from './ArticleCard'

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
  tier?: 'general' | 'frontend' | 'cloud' | 'backend' | 'devops' // 계산된 티어 (선택사항)
  author?: {
    name: string
    email: string
  } | null
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
      scrollContainerRef.current.scrollBy({ left: -256, behavior: 'smooth' }) // 카드 너비(240px) + 패딩(8px*2) + gap(4px) = 260px, 약간 여유있게 256px
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 256, behavior: 'smooth' }) // 카드 너비(240px) + 패딩(8px*2) + gap(4px) = 260px, 약간 여유있게 256px
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary">추천 글</h2>
        <div className="flex gap-2 bg-surface border border-border rounded-lg p-1 w-full sm:w-auto relative z-20">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setSort('recent')
            }}
            className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors relative z-30 ${
              sort === 'recent'
                ? 'bg-primary-500 text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            최신순
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setSort('popular')
            }}
            className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors relative z-30 ${
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
              Array(5).fill(null).map((_, i) => (
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
    </div>
  )
}

