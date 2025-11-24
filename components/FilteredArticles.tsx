'use client'

import { useState, useEffect, useRef } from 'react'
import ArticleFilterBar from './ArticleFilterBar'
import ArticleCard from './ArticleCard'
import ArticleListModal from './ArticleListModal'
import { motion, AnimatePresence } from 'framer-motion'

interface Article {
  id: string
  title: string
  slug: string
  category: string | null
  createdAt: string
  updatedAt: string
  preview?: string
}

export default function FilteredArticles() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'title'>('recent')
  const [includeSubcategories, setIncludeSubcategories] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const prevFiltersRef = useRef({ selectedCategory, sortBy, includeSubcategories, searchQuery })

  useEffect(() => {
    const fetchArticles = async () => {
      // 필터 변경 시 스켈레톤 표시
      const filtersChanged = 
        prevFiltersRef.current.selectedCategory !== selectedCategory ||
        prevFiltersRef.current.sortBy !== sortBy ||
        prevFiltersRef.current.includeSubcategories !== includeSubcategories ||
        prevFiltersRef.current.searchQuery !== searchQuery
      
      if (filtersChanged) {
        setIsFiltering(true)
        // 기존 카드를 유지하기 위해 loading은 false로 유지
        // setLoading(true)를 호출하지 않음
      }
      
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
          // 새 데이터를 받은 후에만 업데이트
          setArticles(Array.isArray(data) ? data : data.articles || [])
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error)
      } finally {
        setLoading(false)
        setIsFiltering(false)
        // 현재 필터 상태 저장
        prevFiltersRef.current = {
          selectedCategory,
          sortBy,
          includeSubcategories,
          searchQuery,
        }
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
      ) : (
        <div className="relative">
          {/* 필터링 중일 때 스켈레톤 오버레이 */}
          {isFiltering && (
            <div className="absolute inset-0 z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div key={`skeleton-${i}`} className="bg-surface/90 backdrop-blur-sm border border-border rounded-lg p-6 animate-pulse" style={{ height: '240px' }}>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              ))}
            </div>
          )}
          
          {/* 기존 카드들 - 필터링 중에도 완전히 유지 (높이 고정) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={false}
                animate={{ opacity: isFiltering ? 0.3 : 1 }}
                transition={{ duration: 0.15 }}
                style={{ height: '240px' }}
              >
                <ArticleCard article={article} />
              </motion.div>
            ))}
          </div>
          
          {/* 더보기 버튼 - 우측 하단 */}
          {articles.length > 0 && !isFiltering && (
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-lg"
              >
                더보기 →
              </button>
            </div>
          )}
          
          {articles.length === 0 && !isFiltering && (
            <div 
              className="text-center bg-surface border border-border rounded-lg flex items-center justify-center"
              style={{ height: 'calc(240px * 2 + 1.5rem)', minHeight: 'calc(240px * 2 + 1.5rem)' }}
            >
              <p className="text-text-secondary">표시할 글이 없습니다.</p>
            </div>
          )}
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

