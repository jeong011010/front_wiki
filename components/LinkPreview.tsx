'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface ArticlePreview {
  id: string
  title: string
  slug: string
  preview: string
  createdAt: string
  updatedAt: string
}

interface LinkPreviewProps {
  href: string
  children: React.ReactNode
}

export default function LinkPreview({ href, children }: LinkPreviewProps) {
  const [preview, setPreview] = useState<ArticlePreview | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // slug 추출 (href가 /articles/[slug] 형식)
  const slug = href.replace('/articles/', '')

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = () => {
    // 500ms 딜레이 후 미리보기 표시
    timeoutRef.current = setTimeout(async () => {
      if (!preview) {
        try {
          const response = await fetch(`/api/articles/${slug}/preview`)
          if (response.ok) {
            const data = await response.json()
            setPreview(data)
          }
        } catch (error) {
          console.error('Failed to fetch preview:', error)
        }
      }
      setShowPreview(true)
    }, 500)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setShowPreview(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (linkRef.current) {
      const rect = linkRef.current.getBoundingClientRect()
      // 링크 오른쪽에 미리보기 표시 (공간이 부족하면 왼쪽)
      const spaceOnRight = window.innerWidth - rect.right
      const spaceOnLeft = rect.left
      const previewWidth = 320 // 미리보기 카드 너비

      if (spaceOnRight >= previewWidth + 20) {
        // 오른쪽에 표시
        setPosition({
          x: rect.right + 20,
          y: rect.top,
        })
      } else if (spaceOnLeft >= previewWidth + 20) {
        // 왼쪽에 표시
        setPosition({
          x: rect.left - previewWidth - 20,
          y: rect.top,
        })
      } else {
        // 중앙에 표시
        setPosition({
          x: rect.left + rect.width / 2 - previewWidth / 2,
          y: rect.bottom + 10,
        })
      }
    }
  }

  return (
    <span className="relative inline-block">
      <Link
        ref={linkRef}
        href={href}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className="text-link hover:text-link-hover underline font-medium transition-colors"
      >
        {children}
      </Link>
      <AnimatePresence>
        {showPreview && preview && (
          <motion.div
            ref={previewRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 w-80 bg-surface border border-border rounded-lg shadow-lg p-4 pointer-events-none"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          >
            <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
              {preview.title}
            </h3>
            <p className="text-sm text-text-secondary mb-3 line-clamp-3">
              {preview.preview}
              {preview.preview.length >= 150 && '...'}
            </p>
            <div className="text-xs text-text-tertiary">
              작성일: {new Date(preview.createdAt).toLocaleDateString('ko-KR')}
            </div>
            <div className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

