'use client'

import { useState, useLayoutEffect, useRef } from 'react'
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

  useLayoutEffect(() => {
    const fetchArticles = async () => {
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
          
          // 상태를 동기적으로 업데이트
          setArticles(newArticles)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error)
        setLoading(false)
      }
    }

    fetchArticles()
  }, [selectedCategory, sortBy, includeSubcategories, searchQuery])

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

      {/* 고정 높이 컨테이너로 레이아웃 시프트 완전 방지 */}
      <div style={{ minHeight: GRID_HEIGHT, height: loading || articles.length > 0 ? GRID_HEIGHT : 'auto' }}>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-lg p-6 animate-pulse" style={{ height: '240px' }}>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div key={article.id} style={{ height: '240px' }}>
                <ArticleCard article={article} />
              </div>
            ))}
            {/* 빈 슬롯 채우기 (6개 미만일 때) */}
            {articles.length < 6 && [...Array(6 - articles.length)].map((_, i) => (
              <div key={`empty-${i}`} style={{ height: '240px' }} aria-hidden="true" />
            ))}
          </div>
        ) : (
          <div 
            className="text-center bg-surface border border-border rounded-lg flex items-center justify-center"
            style={{ height: GRID_HEIGHT }}
          >
            <p className="text-text-secondary">표시할 글이 없습니다.</p>
          </div>
        )}
      </div>
      
      {/* 더보기 버튼은 그리드 외부에 배치 */}
      {!loading && articles.length > 0 && (
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-lg"
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
