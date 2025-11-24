'use client'

import { useState, useEffect } from 'react'
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

interface CategorySelectProps {
  value?: string | null
  onChange: (categoryId: string | null) => void
  placeholder?: string
  disabled?: boolean
}

export default function CategorySelect({
  value,
  onChange,
  placeholder = '카테고리 선택',
  disabled = false,
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories/tree')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
          
          // 선택된 카테고리 찾기
          if (value) {
            const findCategory = (cats: Category[]): Category | null => {
              for (const cat of cats) {
                if (cat.id === value) return cat
                const found = findCategory(cat.children)
                if (found) return found
              }
              return null
            }
            setSelectedCategory(findCategory(data))
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [value])

  const handleSelect = (category: Category) => {
    setSelectedCategory(category)
    onChange(category.id)
    setIsOpen(false)
  }

  const handleClear = () => {
    setSelectedCategory(null)
    onChange(null)
  }

  const renderCategory = (category: Category, level: number = 0) => {
    const isSelected = value === category.id
    const indent = level * 1.5 // rem 단위

    return (
      <div key={category.id}>
        <button
          type="button"
          onClick={() => handleSelect(category)}
          className={`w-full text-left px-4 py-2 hover:bg-surface-hover transition-colors ${
            isSelected ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-text-primary'
          }`}
          style={{ paddingLeft: `${0.5 + indent}rem` }}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{category.name}</span>
            {category.articleCount > 0 && (
              <span className="text-xs text-text-tertiary ml-2">
                ({category.articleCount})
              </span>
            )}
          </div>
          {category.description && (
            <p className="text-xs text-text-secondary mt-0.5">{category.description}</p>
          )}
        </button>
        {category.children.length > 0 && (
          <div className="ml-4 border-l border-border">
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-2 bg-surface border border-border rounded-lg text-left flex items-center justify-between transition-colors ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-primary-300 cursor-pointer'
        } ${isOpen ? 'border-primary-500' : ''}`}
      >
        <span className={selectedCategory ? 'text-text-primary' : 'text-text-tertiary'}>
          {selectedCategory ? selectedCategory.name : placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-20 w-full mt-2 bg-surface border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto"
            >
              {loading ? (
                <div className="p-4 text-center text-text-secondary">로딩 중...</div>
              ) : categories.length === 0 ? (
                <div className="p-4 text-center text-text-secondary">카테고리가 없습니다.</div>
              ) : (
                <>
                  <div className="p-2 border-b border-border">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="w-full text-left px-4 py-2 hover:bg-surface-hover transition-colors text-text-secondary"
                    >
                      카테고리 없음
                    </button>
                  </div>
                  <div className="py-2">
                    {categories.map((category) => renderCategory(category))}
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

