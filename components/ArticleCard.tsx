'use client'

import { useState, useRef, useEffect } from 'react'
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
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isMobile, setIsMobile] = useState(true)
  const cardRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 모바일에서는 3D 효과 비활성화
    if (isMobile) return
    
    if (!cardRef.current) return
    
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    // 회전 각도 계산 (최대 8도, 더 부드럽게)
    const maxRotate = 8
    const rotateXValue = (mouseY / (rect.height / 2)) * maxRotate * -1
    const rotateYValue = (mouseX / (rect.width / 2)) * maxRotate
    
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <Link
      ref={cardRef}
      href={`/articles/${article.slug}`}
      className="block relative bg-gradient-to-br from-surface via-surface to-surface-hover border border-border rounded-xl p-3 sm:p-4 md:p-5 group overflow-hidden"
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        contain: 'layout style',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        transform: !isMobile
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${rotateX !== 0 || rotateY !== 0 ? 1.02 : 1})`
          : 'none',
        transition: 'transform 0.15s ease-out, box-shadow 0.3s ease-out',
        boxShadow: rotateX !== 0 || rotateY !== 0 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.15) inset'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05) inset',
        maxWidth: '100%',
        minHeight: '160px',
        height: '100%',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 빛 반사 효과 (그라데이션 오버레이) - 포켓몬 카드 스타일 */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
        style={{
          background: `linear-gradient(${135 + rotateY * 3}deg, 
            rgba(255, 255, 255, 0.4) 0%, 
            rgba(255, 255, 255, 0.1) 30%,
            transparent 60%, 
            rgba(0, 0, 0, 0.1) 100%)`,
          transform: `translateZ(30px)`,
          mixBlendMode: 'overlay',
        }}
      />
      
      {/* 카드 테두리 하이라이트 */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
        style={{
          background: `linear-gradient(${45 + rotateY * 2}deg, 
            transparent 0%,
            rgba(79, 70, 229, 0.1) 50%,
            transparent 100%)`,
          border: '1px solid rgba(79, 70, 229, 0.2)',
        }}
      />
      
      {/* 카드 내용 */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-1.5 sm:mb-2 gap-1.5 sm:gap-2">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-text-primary group-hover:text-primary-500 transition-colors line-clamp-2 flex-1">
          {article.title}
        </h3>
        {article.category && (
          <span className={`px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-xs font-medium rounded flex-shrink-0 ${categoryColor.bg} ${categoryColor.text} whitespace-nowrap`}>
            {article.category}
          </span>
        )}
      </div>
      
      {preview && (
        <p className="text-text-secondary text-[11px] sm:text-xs md:text-sm mb-1.5 sm:mb-2 line-clamp-2 flex-1">
          {preview}
        </p>
      )}
      
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-text-tertiary mt-auto">
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
      </div>
    </Link>
  )
}

