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
  searchQuery: string
  onCategoryChange: (category: string | null) => void
  onSortChange: (sort: 'recent' | 'popular' | 'title') => void
  onIncludeSubcategoriesChange: (include: boolean) => void
  onSearchChange: (query: string) => void
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
  searchQuery,
  onCategoryChange,
  onSortChange,
  onIncludeSubcategoriesChange,
  onSearchChange,
}: ArticleFilterBarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedMainCategory, setSelectedMainCategory] = useState<Category | null>(null)
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [categorySearchQuery, setCategorySearchQuery] = useState('')

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
                  return cat
                }
                if (cat.children && cat.children.length > 0) {
                  const findInChildren = (children: Category[]): Category | null => {
                    for (const child of children) {
                      if (child.slug === targetSlug) {
                        return cat
                      }
                      if (child.children && child.children.length > 0) {
                        const found = findInChildren(child.children)
                        if (found) return found
                      }
                    }
                    return null
                  }
                  const found = findInChildren(cat.children)
                  if (found) return found
                }
              }
              return null
            }
            const mainCat = findMainCategory(limitedData, selectedCategory)
            if (mainCat) {
              setSelectedMainCategory(mainCat)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    fetchCategories()
  }, [selectedCategory])

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

  const handleMainCategoryClick = (mainCat: Category) => {
    setSelectedMainCategory(mainCat)
    setOpenDropdowns(new Set([mainCat.id]))
    setCategorySearchQuery('')
  }

  const handleCategoryHover = (categoryId: string, hasChildren: boolean) => {
    if (hasChildren) {
      setHoveredCategory(categoryId)
      setOpenDropdowns((prev) => new Set(prev).add(categoryId))
    }
  }

  const handleCategoryLeave = () => {
    // 약간의 지연을 두어 드롭다운 간 이동 가능하게
    setTimeout(() => {
      setHoveredCategory(null)
    }, 200)
  }

  // 검색어로 필터링된 카테고리 트리 생성
  const getFilteredCategories = (cats: Category[]): Category[] => {
    if (!categorySearchQuery.trim()) {
      return cats
    }

    const searchLower = categorySearchQuery.toLowerCase()
    const filterTree = (categoryList: Category[]): Category[] => {
      return categoryList
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
    return filterTree(cats)
  }

  // 드롭다운 렌더링 (재귀적)
  const renderDropdown = (category: Category, level: number = 0, parentPosition?: { top: number; left: number }): React.ReactElement => {
    const isOpen = openDropdowns.has(category.id) || hoveredCategory === category.id
    const hasChildren = category.children && category.children.length > 0
    const filteredChildren = hasChildren ? getFilteredCategories(category.children) : []
    const isSelected = selectedCategory === category.slug

    return (
      <div key={category.id} className="relative">
        <AnimatePresence>
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => {
                  setOpenDropdowns(new Set())
                  setHoveredCategory(null)
                }}
                style={{ zIndex: 10 + level }}
              />
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute bg-surface border border-border rounded-lg shadow-xl z-20 min-w-[280px] max-w-[400px] max-h-[600px] flex flex-col"
                style={{
                  top: level === 0 ? '100%' : 0,
                  left: level === 0 ? 0 : '100%',
                  marginTop: level === 0 ? '0.5rem' : 0,
                  marginLeft: level > 0 ? '0.5rem' : 0,
                  zIndex: 20 + level,
                }}
                onMouseEnter={() => handleCategoryHover(category.id, hasChildren)}
                onMouseLeave={handleCategoryLeave}
              >
                {/* 검색 바 (첫 번째 레벨만) */}
                {level === 0 && (
                  <div className="p-3 border-b border-border">
                    <input
                      type="text"
                      placeholder="카테고리 검색..."
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}

                {/* 카테고리 목록 */}
                <div className="overflow-y-auto flex-1 p-2">
                  {/* 대분류 자체도 선택 가능 (첫 번째 레벨만) */}
                  {level === 0 && (
                    <button
                      onClick={() => {
                        onCategoryChange(category.slug)
                        setOpenDropdowns(new Set())
                        setHoveredCategory(null)
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-primary-500 text-white'
                          : 'hover:bg-secondary-300 text-text-primary'
                      }`}
                    >
                      <span className="font-medium">{category.name}</span>
                      {category.articleCount > 0 && (
                        <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-text-tertiary'}`}>
                          ({category.articleCount})
                        </span>
                      )}
                    </button>
                  )}

                  {/* 하위 카테고리들 */}
                  {filteredChildren.length > 0 ? (
                    filteredChildren.map((child) => {
                      const childIsSelected = selectedCategory === child.slug
                      const childHasChildren = child.children && child.children.length > 0

                      return (
                        <div
                          key={child.id}
                          className="relative"
                          onMouseEnter={() => handleCategoryHover(child.id, childHasChildren)}
                          onMouseLeave={handleCategoryLeave}
                        >
                          <button
                            onClick={() => {
                              onCategoryChange(child.slug)
                              setOpenDropdowns(new Set())
                              setHoveredCategory(null)
                            }}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between group ${
                              childIsSelected
                                ? 'bg-primary-500 text-white'
                                : 'hover:bg-secondary-300 text-text-primary'
                            }`}
                          >
                            <span>{child.name}</span>
                            <div className="flex items-center gap-2">
                              {child.articleCount > 0 && (
                                <span className={`text-xs ${childIsSelected ? 'text-white/70' : 'text-text-tertiary'}`}>
                                  ({child.articleCount})
                                </span>
                              )}
                              {childHasChildren && (
                                <svg
                                  className="w-4 h-4 text-text-tertiary group-hover:text-text-primary"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </div>
                          </button>
                          {childHasChildren && hoveredCategory === child.id && (
                            <div className="absolute top-0 left-full ml-2">
                              {renderDropdown(child, level + 1)}
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="px-4 py-8 text-center text-text-secondary">
                      {categorySearchQuery ? '검색 결과가 없습니다.' : '하위 카테고리가 없습니다.'}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 mb-6">
      {/* 첫 번째 줄: 검색 바 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="카테고리 전체에서 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
        />
      </div>

      {/* 두 번째 줄: 필터 및 정렬 옵션 - 항상 고정 높이 */}
      <div 
        className="flex flex-wrap items-center gap-2"
        style={{ 
          minHeight: '2.75rem', // 버튼 높이 + gap 고정
          height: 'auto'
        }}
      >
        {/* 대분류 버튼들 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedMainCategory(null)
              onCategoryChange(null)
              setOpenDropdowns(new Set())
              setHoveredCategory(null)
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
            <div key={mainCat.id} className="relative">
              <button
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
              {selectedMainCategory?.id === mainCat.id && (
                renderDropdown(mainCat, 0)
              )}
            </div>
          ))}
        </div>

        {/* 선택된 카테고리 표시 */}
        {selectedCategory && selectedMainCategory && (
          <div className="px-4 py-2 bg-secondary-300 text-text-primary rounded-lg text-sm font-medium">
            {selectedCategoryName}
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
        <div className="flex gap-2 bg-secondary-300 rounded-lg p-1 ml-auto">
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
