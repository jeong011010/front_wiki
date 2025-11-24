'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  order: number
  articleCount: number
  children: Category[]
}

interface ArticleFilterBarProps {
  selectedCategory: string | null
  sortBy: 'recent' | 'popular' | 'title'
  includeSubcategories: boolean
  onCategoryChange: (category: string | null) => void
  onSortChange: (sort: 'recent' | 'popular' | 'title') => void
  onIncludeSubcategoriesChange: (include: boolean) => void
}

export default function ArticleFilterBar({
  selectedCategory,
  sortBy,
  includeSubcategories,
  onCategoryChange,
  onSortChange,
  onIncludeSubcategoriesChange,
}: ArticleFilterBarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories/tree')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
          // 선택된 카테고리의 경로를 자동으로 펼치기
          if (selectedCategory) {
            expandCategoryPath(data, selectedCategory)
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    fetchCategories()
  }, [selectedCategory])

  // 선택된 카테고리의 경로를 자동으로 펼치기
  const expandCategoryPath = (cats: Category[], targetSlug: string, path: string[] = []): void => {
    for (const cat of cats) {
      const newPath = [...path, cat.id]
      if (cat.slug === targetSlug) {
        // 경로의 모든 부모 카테고리를 펼치기
        newPath.forEach((id) => {
          setExpandedCategories((prev) => new Set(prev).add(id))
        })
        return
      }
      if (cat.children && cat.children.length > 0) {
        expandCategoryPath(cat.children, targetSlug, newPath)
      }
    }
  }

  // 검색어로 필터링된 카테고리 트리 생성
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories
    }

    const searchLower = searchQuery.toLowerCase()
    const filterTree = (cats: Category[]): Category[] => {
      return cats
        .map((cat) => {
          const matchesSearch = cat.name.toLowerCase().includes(searchLower)
          const filteredChildren = cat.children && cat.children.length > 0 
            ? filterTree(cat.children) 
            : []

          // 자기 자신이 매칭되거나 자식 중 매칭되는 것이 있으면 포함
          if (matchesSearch || filteredChildren.length > 0) {
            return {
              ...cat,
              children: filteredChildren,
            }
          }
          return null
        })
        .filter((cat): cat is Category => cat !== null)
    }

    return filterTree(categories)
  }, [categories, searchQuery])

  // 선택된 카테고리의 전체 경로 찾기
  const getCategoryPath = (cats: Category[], targetSlug: string, path: Category[] = []): Category[] | null => {
    for (const cat of cats) {
      const newPath = [...path, cat]
      if (cat.slug === targetSlug) {
        return newPath
      }
      if (cat.children && cat.children.length > 0) {
        const result = getCategoryPath(cat.children, targetSlug, newPath)
        if (result) return result
      }
    }
    return null
  }

  const selectedCategoryPath = selectedCategory
    ? getCategoryPath(categories, selectedCategory)
    : null

  const selectedCategoryName = selectedCategoryPath
    ? selectedCategoryPath.map((c) => c.name).join(' > ')
    : '전체'

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const renderCategoryTree = (cats: Category[], level: number = 0): React.ReactElement[] => {
    return cats.map((category) => {
      const hasChildren = category.children && category.children.length > 0
      const isExpanded = expandedCategories.has(category.id)
      const isSelected = selectedCategory === category.slug

      return (
        <div key={category.id}>
          <button
            onClick={() => {
              onCategoryChange(category.slug)
              setIsCategoryOpen(false)
            }}
            className={`w-full text-left px-4 py-2 hover:bg-secondary-300 transition-colors flex items-center gap-2 ${
              isSelected
                ? 'bg-primary-500 text-white'
                : 'text-text-primary'
            }`}
            style={{ paddingLeft: `${1 + level * 1.5}rem` }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleCategory(category.id)
                }}
                className="flex-shrink-0 w-4 h-4 flex items-center justify-center"
              >
                <svg
                  className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {!hasChildren && <span className="w-4" />}
            <span className="flex-1">{category.name}</span>
            {category.articleCount > 0 && (
              <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-text-tertiary'}`}>
                ({category.articleCount})
              </span>
            )}
          </button>
          <AnimatePresence>
            {hasChildren && isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {renderCategoryTree(category.children, level + 1)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )
    })
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* 카테고리 선택 */}
        <div className="relative flex-1 min-w-[200px]">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary-300 text-text-primary rounded-lg hover:bg-secondary-500 transition-colors font-medium w-full"
          >
            <span className="flex-1 text-left truncate">
              카테고리: {selectedCategoryName}
            </span>
            <svg
              className={`w-4 h-4 transition-transform flex-shrink-0 ${isCategoryOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
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
                  className="absolute top-full left-0 mt-2 bg-surface border border-border rounded-lg shadow-lg z-20 w-full max-w-md max-h-[500px] flex flex-col"
                >
                  {/* 검색 바 */}
                  <div className="p-3 border-b border-border">
                    <input
                      type="text"
                      placeholder="카테고리 검색..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        // 검색 시 관련 카테고리 자동 펼치기
                        if (e.target.value.trim()) {
                          const expandMatching = (cats: Category[]) => {
                            cats.forEach((cat) => {
                              if (cat.name.toLowerCase().includes(e.target.value.toLowerCase())) {
                                setExpandedCategories((prev) => new Set(prev).add(cat.id))
                                // 부모도 펼치기
                                let current = cat
                                while (current.parentId) {
                                  // parentId로 부모 찾기 (간단한 구현)
                                  setExpandedCategories((prev) => new Set(prev).add(current.parentId!))
                                  break // 실제로는 재귀적으로 부모를 찾아야 함
                                }
                              }
                              if (cat.children && cat.children.length > 0) {
                                expandMatching(cat.children)
                              }
                            })
                          }
                          expandMatching(categories)
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* 카테고리 트리 */}
                  <div className="overflow-y-auto flex-1">
                    <button
                      onClick={() => {
                        onCategoryChange(null)
                        setIsCategoryOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-secondary-300 transition-colors ${
                        selectedCategory === null
                          ? 'bg-primary-500 text-white'
                          : 'text-text-primary'
                      }`}
                    >
                      전체
                    </button>
                    {filteredCategories.length > 0 ? (
                      renderCategoryTree(filteredCategories)
                    ) : (
                      <div className="px-4 py-8 text-center text-text-secondary">
                        검색 결과가 없습니다.
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* 하위 카테고리 포함 옵션 */}
        {selectedCategory && (
          <label className="flex items-center gap-2 px-4 py-2 bg-secondary-300 text-text-primary rounded-lg cursor-pointer hover:bg-secondary-500 transition-colors">
            <input
              type="checkbox"
              checked={includeSubcategories}
              onChange={(e) => onIncludeSubcategoriesChange(e.target.checked)}
              className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium">하위 카테고리 포함</span>
          </label>
        )}

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
