'use client'

import { useState, useEffect } from 'react'
import ArticleFilterBar from './ArticleFilterBar'
import ArticleCard from './ArticleCard'
import ArticleListModal from './ArticleListModal'
import { motion } from 'framer-motion'

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
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
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
        params.append('sort', sortBy)
        params.append('limit', '6')
        
        url += `?${params.toString()}`
        
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setArticles(Array.isArray(data) ? data : data.articles || [])
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [selectedCategory, sortBy, includeSubcategories])

  return (
    <section>
      <ArticleFilterBar
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        includeSubcategories={includeSubcategories}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortBy}
        onIncludeSubcategoriesChange={setIncludeSubcategories}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ArticleCard article={article} />
              </motion.div>
            ))}
          </div>
          
          {/* 더보기 버튼 - 우측 하단 */}
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-lg"
            >
              더보기 →
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-surface border border-border rounded-lg">
          <p className="text-text-secondary">표시할 글이 없습니다.</p>
        </div>
      )}

      {isModalOpen && (
        <ArticleListModal
          category={selectedCategory}
          sortBy={sortBy}
          includeSubcategories={includeSubcategories}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  )
}

