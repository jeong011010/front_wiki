'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ArticleCard from './ArticleCard'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  slug: string
  category: string | null
  createdAt: string
  updatedAt: string
  preview?: string
}

interface ArticleListModalProps {
  category: string | null
  sortBy: 'recent' | 'popular' | 'title'
  onClose: () => void
}

export default function ArticleListModal({ category, sortBy, onClose }: ArticleListModalProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const limit = 12

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      try {
        let url = '/api/articles'
        const params = new URLSearchParams()
        
        if (category) {
          params.append('category', category)
        }
        params.append('sort', sortBy)
        params.append('limit', String(limit * page))
        
        url += `?${params.toString()}`
        
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          const fetchedArticles = Array.isArray(data) ? data : data.articles || []
          setArticles(fetchedArticles)
          setHasMore(fetchedArticles.length >= limit * page)
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [category, sortBy, page])

  const loadMore = () => {
    if (hasMore) {
      setPage((prev) => prev + 1)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 배경 오버레이 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* 모달 컨텐츠 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-background border border-border rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-text-primary">
              글 목록
              {category && <span className="ml-2 text-lg font-normal text-text-secondary">({category})</span>}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 컨텐츠 */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && articles.length === 0 ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                {hasMore && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? '불러오는 중...' : '더 불러오기'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-text-secondary">표시할 글이 없습니다.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

