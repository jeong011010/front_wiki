'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Article } from '@prisma/client'

interface ArticleCardProps {
  article: {
    id: string
    title: string
    slug: string
    category: string | null
    createdAt: Date | string
    updatedAt: Date | string
    preview?: string
  }
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  frontend: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300' },
  backend: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300' },
  cloud: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300' },
  devops: { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300' },
  general: { bg: 'bg-gray-100 dark:bg-gray-900/20', text: 'text-gray-700 dark:text-gray-300' },
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const categoryColor = article.category 
    ? categoryColors[article.category] || categoryColors.general
    : categoryColors.general

  const preview = article.preview || article.title

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={`/articles/${article.slug}`}
        className="block bg-surface border border-border rounded-lg p-6 hover:shadow-lg transition-all hover:border-primary-300 group"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-text-primary group-hover:text-primary-500 transition-colors line-clamp-2 flex-1">
            {article.title}
          </h3>
          {article.category && (
            <span className={`ml-3 px-2 py-1 text-xs font-medium rounded ${categoryColor.bg} ${categoryColor.text} whitespace-nowrap`}>
              {article.category}
            </span>
          )}
        </div>
        
        {preview && (
          <p className="text-text-secondary text-sm mb-4 line-clamp-3">
            {preview}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-text-tertiary">
          <span>
            {new Date(article.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {new Date(article.updatedAt).getTime() !== new Date(article.createdAt).getTime() && (
            <span className="text-text-tertiary">
              수정: {new Date(article.updatedAt).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

