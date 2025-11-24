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

// 최대 3단계까지만 렌더링하는 헬퍼 함수
const limitCategoryDepth = (category: Category, maxDepth: number = 3, currentDepth: number = 1): Category => {
  if (currentDepth >= maxDepth) {
    return {
      ...category,
      children: [], // 최대 깊이에 도달하면 자식 제거
    }
  }
  
  return {
    ...category,
    children: category.children.map((child) => 
      limitCategoryDepth(child, maxDepth, currentDepth + 1)
    ),
  }
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
  const [selectedMainCategory, setSelectedMainCategory] = useState<Category | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // 대분류 카테고리들 (parentId가 null인 카테고리)
  const mainCategories = useMemo(() => {
    return categories.filter((cat) => cat.parentId === null)
  }, [categories])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories/tree')
        if (response.ok) {
          const data = await response.json()
          // 최대 3단계로 제한
          const limitedData = data.map((cat: Category) => limitCategoryDepth(cat, 3))
          setCategories(limitedData)
          
          // 선택된 카테고리가 있으면 해당 대분류 찾기
          if (selectedCategory) {
            const findMainCategory = (cats: Category[], targetSlug: string): Category | null => {
              for (const cat of cats) {
                if (cat.slug === targetSlug) {
                  // 선택된 카테고리가 대분류인 경우
                  return cat
                }
                // 하위 카테고리인 경우 대분류 찾기
                const findInChildren = (children: Category[]): Category | null => {
                  for (const child of children) {
                    if (child.slug === targetSlug) {
                      return cat // 부모 대분류 반환
                    }
                    if (child.children && child.children.length > 0) {
                      const found = findInChildren(child.children)
                      if (found) return found
                    }
                  }
                  return null
                }
                if (cat.children && cat.children.length > 0) {
                  const found = findInChildren(cat.children)
                  if (found) return found
                }
              }
              return null
            }
            const mainCat = findMainCategory(limitedData, selectedCategory)
            if (mainCat) {
              setSelectedMainCategory(mainCat)
              // 선택된 카테고리의 경로 자동 펼치기
              expandCategoryPath(mainCat, selectedCategory)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    fetchCategories()
  }, [selectedCategory])

  // 선택된 카테고리의 경로를 자동으로 펼치기
  const expandCategoryPath = (mainCat: Category, targetSlug: string, path: string[] = []): void => {
    const newPath = [...path, mainCat.id]
    if (mainCat.slug === targetSlug) {
      newPath.forEach((id) => {
        setExpandedCategories((prev) => new Set(prev).add(id))
      })
      return
    }
    if (mainCat.children && mainCat.children.length > 0) {
      mainCat.children.forEach((child) => {
        expandCategoryPath(child, targetSlug, newPath)
      })
    }
  }

  // 선택된 대분류의 하위 카테고리만 필터링
  const subCategories = useMemo(() => {
    if (!selectedMainCategory) return []
    
    // 검색어가 있으면 필터링
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase()
      const filterTree = (cats: Category[]): Category[] => {
        return cats
          .map((cat) => {
            const matchesSearch = cat.name.toLowerCase().includes(searchLower)
            const filteredChildren = cat.children && cat.children.length > 0 
              ? filterTree(cat.children) 
              : []

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
      return filterTree(selectedMainCategory.children || [])
    }
    
    return selectedMainCategory.children || []
  }, [selectedMainCategory, searchQuery])

  // 선택된 카테고리의 전체 경로 찾기
  const getCategoryPath = (cat: Category, targetSlug: string, path: Category[] = []): Category[] | null => {
    const newPath = [...path, cat]
    if (cat.slug === targetSlug) {
      return newPath
    }
    if (cat.children && cat.children.length > 0) {
      for (const child of cat.children) {
        const result = getCategoryPath(child, targetSlug, newPath)
        if (result) return result
      }
    }
    return null
  }

  const selectedCategoryPath = selectedCategory && selectedMainCategory
    ? getCategoryPath(selectedMainCategory, selectedCategory)
    : null

  const selectedCategoryName = selectedCategoryPath
    ? selectedCategoryPath.map((c) => c.name).join(' > ')
    : selectedMainCategory
    ? selectedMainCategory.name
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

  const handleMainCategoryClick = (mainCat: Category) => {
    setSelectedMainCategory(mainCat)
    setIsDropdownOpen(true)
    setSearchQuery('')
    setExpandedCategories(new Set())
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
              setIsDropdownOpen(false)
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
        {/* 대분류 버튼들 */}
        <div className="flex flex-wrap gap-2 flex-1">
          <button
            onClick={() => {
              setSelectedMainCategory(null)
              onCategoryChange(null)
              setIsDropdownOpen(false)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedMainCategory === null
                ? 'bg-primary-500 text-white'
                : 'bg-secondary-300 text-text-primary hover:bg-secondary-500'
            }`}
          >
            전체
          </button>
          {mainCategories.map((mainCat) => (
            <button
              key={mainCat.id}
              onClick={() => handleMainCategoryClick(mainCat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                selectedMainCategory?.id === mainCat.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-300 text-text-primary hover:bg-secondary-500'
              }`}
            >
              {mainCat.name}
              {mainCat.articleCount > 0 && (
                <span className={`ml-2 text-xs ${selectedMainCategory?.id === mainCat.id ? 'text-white/70' : 'text-text-tertiary'}`}>
                  ({mainCat.articleCount})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 선택된 대분류의 하위 카테고리 드롭다운 */}
        {selectedMainCategory && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary-300 text-text-primary rounded-lg hover:bg-secondary-500 transition-colors font-medium"
            >
              <span className="truncate max-w-[200px]">
                {selectedCategoryName}
              </span>
              <svg
                className={`w-4 h-4 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
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
                          if (e.target.value.trim() && selectedMainCategory) {
                            const expandMatching = (cats: Category[]) => {
                              cats.forEach((cat) => {
                                if (cat.name.toLowerCase().includes(e.target.value.toLowerCase())) {
                                  setExpandedCategories((prev) => new Set(prev).add(cat.id))
                                }
                                if (cat.children && cat.children.length > 0) {
                                  expandMatching(cat.children)
                                }
                              })
                            }
                            expandMatching(selectedMainCategory.children || [])
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    {/* 카테고리 트리 */}
                    <div className="overflow-y-auto flex-1">
                      {/* 대분류 자체도 선택 가능 */}
                      <button
                        onClick={() => {
                          onCategoryChange(selectedMainCategory.slug)
                          setIsDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-secondary-300 transition-colors ${
                          selectedCategory === selectedMainCategory.slug
                            ? 'bg-primary-500 text-white'
                            : 'text-text-primary font-medium'
                        }`}
                      >
                        {selectedMainCategory.name}
                        {selectedMainCategory.articleCount > 0 && (
                          <span className={`ml-2 text-xs ${selectedCategory === selectedMainCategory.slug ? 'text-white/70' : 'text-text-tertiary'}`}>
                            ({selectedMainCategory.articleCount})
                          </span>
                        )}
                      </button>
                      {subCategories.length > 0 ? (
                        renderCategoryTree(subCategories)
                      ) : (
                        <div className="px-4 py-8 text-center text-text-secondary">
                          {searchQuery ? '검색 결과가 없습니다.' : '하위 카테고리가 없습니다.'}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

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
