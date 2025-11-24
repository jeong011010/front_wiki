'use client'

import { useState, useEffect } from 'react'
import ArticleCard from './ArticleCard'
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ArticleCard article={article} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface border border-border rounded-lg">
          <p className="text-text-secondary">표시할 글이 없습니다.</p>
        </div>
      )}
    </div>
  )
}

