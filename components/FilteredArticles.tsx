'use client'

import { useState, useLayoutEffect } from 'react'
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
    let isCancelled = false
    
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
          
          if (!isCancelled) {
            setArticles(newArticles)
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

  // 항상 6개 슬롯을 유지 (빈 슬롯 포함)
  const displayItems = loading 
    ? Array(6).fill(null).map((_, i) => ({ type: 'skeleton' as const, id: `skeleton-${i}` }))
    : articles.length > 0
    ? [
        ...articles.map(article => ({ type: 'article' as const, id: article.id, article })),
        ...Array(Math.max(0, 6 - articles.length)).fill(null).map((_, i) => ({ 
          type: 'empty' as const, 
          id: `empty-${i}` 
        }))
      ]
    : [{ type: 'empty-state' as const, id: 'empty-state' }]

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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        style={{ minHeight: GRID_HEIGHT, height: GRID_HEIGHT }}
      >
        {displayItems.map((item) => {
          if (item.type === 'skeleton') {
            return (
              <div 
                key={item.id}
                className="bg-surface border border-border rounded-lg p-6 animate-pulse" 
                style={{ height: '240px', display: 'flex', flexDirection: 'column' }}
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
            )
          }
          
          if (item.type === 'article') {
            return (
              <div key={item.id} style={{ height: '240px' }}>
                <ArticleCard article={item.article} />
              </div>
            )
          }
          
          if (item.type === 'empty') {
            return (
              <div key={item.id} style={{ height: '240px' }} aria-hidden="true" />
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
      </div>
      
      {/* 더보기 버튼 */}
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
