'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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

interface CategorySectionProps {
  category: string
}

export default function CategorySection({ category }: CategorySectionProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'diagram'>('list')

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/articles/categories?category=${encodeURIComponent(category)}&limit=6`)
        if (response.ok) {
          const data = await response.json()
          setArticles(data.articles || [])
        }
      } catch (error) {
        console.error('Failed to fetch category articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [category])

  const categoryDisplayName: Record<string, string> = {
    frontend: '프론트엔드',
    backend: '백엔드',
    cloud: '클라우드',
    devops: 'DevOps',
    general: '일반',
  }

  const displayName = categoryDisplayName[category] || category

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-text-primary">
          {displayName}
          <span className="ml-2 text-lg font-normal text-text-secondary">
            ({articles.length})
          </span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-500 text-white'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            목록
          </button>
          <button
            onClick={() => setViewMode('diagram')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'diagram'
                ? 'bg-primary-500 text-white'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            다이어그램
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : viewMode === 'list' ? (
        articles.length > 0 ? (
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
            {articles.length >= 6 && (
              <div className="mt-6 text-center">
                <Link
                  href={`/articles?category=${encodeURIComponent(category)}`}
                  className="inline-block px-6 py-3 bg-surface border border-border text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
                >
                  {displayName} 카테고리 전체 보기 →
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-surface border border-border rounded-lg">
            <p className="text-text-secondary">이 카테고리에 글이 없습니다.</p>
          </div>
        )
      ) : (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-text-secondary mb-4">다이어그램 보기는 준비 중입니다.</p>
          <Link
            href="/diagram"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            전체 지식 그래프 보기
          </Link>
        </div>
      )}
    </section>
  )
}

