'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Category {
  id: string
  name: string
  slug: string
  children?: Category[]
}

interface ArticleFilterBarProps {
  selectedCategory: string | null
  sortBy: 'recent' | 'popular' | 'title'
  onCategoryChange: (category: string | null) => void
  onSortChange: (sort: 'recent' | 'popular' | 'title') => void
}

export default function ArticleFilterBar({
  selectedCategory,
  sortBy,
  onCategoryChange,
  onSortChange,
}: ArticleFilterBarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories/tree')
        if (response.ok) {
          const data = await response.json()
          // 트리 구조를 평면화 (부모와 자식 모두 포함)
          const flattenCategories = (cats: Category[]): Category[] => {
            const result: Category[] = []
            cats.forEach((cat) => {
              // children 속성 제거하고 기본 속성만 저장
              const { children, ...categoryWithoutChildren } = cat
              result.push(categoryWithoutChildren)
              if (children && children.length > 0) {
                result.push(...flattenCategories(children))
              }
            })
            return result
          }
          setCategories(flattenCategories(data))
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    fetchCategories()
  }, [])

  const selectedCategoryName = selectedCategory
    ? categories.find((c) => c.slug === selectedCategory)?.name || '전체'
    : '전체'

  return (
    <div className="bg-surface border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* 카테고리 선택 */}
        <div className="relative">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary-300 text-text-primary rounded-lg hover:bg-secondary-500 transition-colors font-medium"
          >
            <span>카테고리: {selectedCategoryName}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isCategoryOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsCategoryOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 bg-surface border border-border rounded-lg shadow-lg z-20 min-w-[200px] max-h-[300px] overflow-y-auto"
              >
                <button
                  onClick={() => {
                    onCategoryChange(null)
                    setIsCategoryOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-secondary-300 transition-colors ${
                    selectedCategory === null ? 'bg-primary-500 text-white' : 'text-text-primary'
                  }`}
                >
                  전체
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      onCategoryChange(category.slug)
                      setIsCategoryOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-secondary-300 transition-colors ${
                      selectedCategory === category.slug
                        ? 'bg-primary-500 text-white'
                        : 'text-text-primary'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </div>

        {/* 정렬 선택 */}
        <div className="flex gap-2 bg-secondary-300 rounded-lg p-1">
          <button
            onClick={() => onSortChange('recent')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              sortBy === 'recent'
                ? 'bg-primary-500 text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => onSortChange('popular')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              sortBy === 'popular'
                ? 'bg-primary-500 text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            인기순
          </button>
          <button
            onClick={() => onSortChange('title')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              sortBy === 'title'
                ? 'bg-primary-500 text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            제목순
          </button>
        </div>
      </div>
    </div>
  )
}

