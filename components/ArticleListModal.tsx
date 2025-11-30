'use client'

import { ArticleCardSkeleton, Button } from '@/components/ui'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import ArticleCard from './ArticleCard'

interface Article {
  id: string
  title: string
  titleWithLinks?: string // 링크가 포함된 제목 HTML (선택사항)
  slug: string
  category: string | null
  createdAt: string
  updatedAt: string
  preview?: string
  author?: {
    name: string
    email: string
  } | null
}

interface ArticleListModalProps {
  category: string | null
  sortBy: 'recent' | 'popular' | 'title'
  includeSubcategories: boolean
  searchQuery: string
  onClose: () => void
}

export default function ArticleListModal({ category, sortBy, includeSubcategories, searchQuery, onClose }: ArticleListModalProps) {
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
          if (includeSubcategories) {
            params.append('includeSubcategories', 'true')
          }
        }
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim())
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
  }, [category, sortBy, includeSubcategories, searchQuery, page])

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <ArticleCardSkeleton key={i} />
                ))}
              </div>
            ) : articles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 justify-items-center" style={{ padding: '8px' }}>
                  {articles.map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      style={{ padding: '20px' }}
                    >
                      <ArticleCard article={article} />
                    </motion.div>
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-6 text-center">
                    <Button
                      onClick={loadMore}
                      disabled={loading}
                      size="lg"
                    >
                      {loading ? '불러오는 중...' : '더 불러오기'}
                    </Button>
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

