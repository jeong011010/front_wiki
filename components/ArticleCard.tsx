'use client'

import Link from 'next/link'
import type { Article } from '@prisma/client'

interface ArticleCardProps {
  article: {
    id: string
    title: string
    slug: string
    category: string | null
    categorySlug?: string | null
    createdAt: Date | string
    updatedAt: Date | string
    preview?: string
  }
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  // 대분류 카테고리 (영어 slug)
  // 라이트 모드: 밝은 배경 + 진한 텍스트
  // 다크 모드: 진한 배경 + 밝은 텍스트 (가독성 향상)
  frontend: { 
    bg: 'bg-blue-100 dark:bg-blue-800/80', 
    text: 'text-blue-900 dark:text-blue-50 font-semibold' 
  },
  backend: { 
    bg: 'bg-green-100 dark:bg-green-800/80', 
    text: 'text-green-900 dark:text-green-50 font-semibold' 
  },
  cloud: { 
    bg: 'bg-purple-100 dark:bg-purple-800/80', 
    text: 'text-purple-900 dark:text-purple-50 font-semibold' 
  },
  devops: { 
    bg: 'bg-orange-100 dark:bg-orange-800/80', 
    text: 'text-orange-900 dark:text-orange-50 font-semibold' 
  },
  general: { 
    bg: 'bg-gray-100 dark:bg-gray-700/80', 
    text: 'text-gray-900 dark:text-gray-50 font-semibold' 
  },
  // 프론트엔드 하위 카테고리
  react: { 
    bg: 'bg-blue-100 dark:bg-blue-800/80', 
    text: 'text-blue-900 dark:text-blue-50 font-semibold' 
  },
  nextjs: { 
    bg: 'bg-blue-100 dark:bg-blue-800/80', 
    text: 'text-blue-900 dark:text-blue-50 font-semibold' 
  },
  // 한글 slug (혹시 모를 경우 대비)
  '프론트엔드': { 
    bg: 'bg-blue-100 dark:bg-blue-800/80', 
    text: 'text-blue-900 dark:text-blue-50 font-semibold' 
  },
  '백엔드': { 
    bg: 'bg-green-100 dark:bg-green-800/80', 
    text: 'text-green-900 dark:text-green-50 font-semibold' 
  },
  '클라우드': { 
    bg: 'bg-purple-100 dark:bg-purple-800/80', 
    text: 'text-purple-900 dark:text-purple-50 font-semibold' 
  },
}

export default function ArticleCard({ article }: ArticleCardProps) {
  // categorySlug를 사용하여 색상 매칭, 없으면 category로 fallback
  let categoryKey = article.categorySlug || article.category || ''
  
  // categoryKey를 소문자로 변환하여 매칭 (대소문자 구분 없이)
  if (categoryKey) {
    categoryKey = categoryKey.toLowerCase()
  }
  
  // 카테고리 이름에서 slug 추출 시도 (한글 이름인 경우)
  if (!categoryKey && article.category) {
    const categoryName = article.category.toLowerCase()
    // 한글 카테고리 이름을 영어 slug로 매핑
    const nameToSlug: Record<string, string> = {
      '프론트엔드': 'frontend',
      '백엔드': 'backend',
      '클라우드': 'cloud',
      'devops': 'devops',
      '일반': 'general',
    }
    categoryKey = nameToSlug[categoryName] || categoryName
  }
  
  // 디버깅: 카테고리 정보 확인 (개발 환경에서만, 매칭 실패 시에만)
  if (process.env.NODE_ENV === 'development' && article.category && !categoryColors[categoryKey] && categoryKey !== 'general') {
    console.warn('카테고리 색상 매칭 실패:', {
      category: article.category,
      categorySlug: article.categorySlug,
      categoryKey,
      availableKeys: Object.keys(categoryColors)
    })
  }
  
  const categoryColor = categoryKey 
    ? categoryColors[categoryKey] || categoryColors.general
    : categoryColors.general

  const preview = article.preview || article.title

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="block bg-surface border border-border rounded-lg p-4 md:p-6 hover:shadow-lg transition-[box-shadow,border-color] hover:border-primary-300 group"
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        contain: 'layout style'
      }}
    >
      <div className="flex items-start justify-between mb-2 md:mb-3 gap-2">
        <h3 className="text-lg md:text-xl font-semibold text-text-primary group-hover:text-primary-500 transition-colors line-clamp-2 flex-1">
          {article.title}
        </h3>
        {article.category && (
          <span className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${categoryColor.bg} ${categoryColor.text} whitespace-nowrap`}>
            {article.category}
          </span>
        )}
      </div>
      
      {preview && (
        <p className="text-text-secondary text-sm mb-3 md:mb-4 line-clamp-2 md:line-clamp-3 flex-1">
          {preview}
        </p>
      )}
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 text-xs text-text-tertiary mt-auto">
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
  )
}

