'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ArticlePreview {
  id: string
  title: string
  slug: string
  preview: string
  createdAt: string
  updatedAt: string
}

interface LinkPreviewOverlayProps {
  containerRef: React.RefObject<HTMLDivElement>
}

export default function LinkPreviewOverlay({ containerRef }: LinkPreviewOverlayProps) {
  const [preview, setPreview] = useState<ArticlePreview | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentSlugRef = useRef<string | null>(null)
  const currentLinkRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 목차 영역 확인 함수
    const isTocElement = (element: HTMLElement | null): boolean => {
      if (!element) return false
      return !!element.closest('[data-table-of-contents]')
    }

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // 목차 영역은 완전히 제외 (목차는 별도 클릭 이벤트가 있음)
      if (isTocElement(target)) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        setShowPreview(false)
        e.stopPropagation()
        e.stopImmediatePropagation()
        return
      }
      
      // 메인 콘텐츠 영역 내의 링크만 처리
      // article-content 영역 내에서만 처리
      const articleContent = target.closest('[data-article-content]')
      if (!articleContent) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        setShowPreview(false)
        return
      }
      
      const link = target.closest('a[data-article-slug]') as HTMLAnchorElement | null
      
      if (!link) {
        // 링크가 아니면 미리보기 숨기기
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        setShowPreview(false)
        return
      }
      
      // 링크가 목차 영역 안에 있는지 다시 한번 확인
      if (isTocElement(link)) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        setShowPreview(false)
        e.stopPropagation()
        e.stopImmediatePropagation()
        return
      }

      const slug = link.getAttribute('data-article-slug')
      if (!slug) return

      // 이전 타임아웃 취소
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // 500ms 딜레이 후 미리보기 표시
      timeoutRef.current = setTimeout(async () => {
        currentSlugRef.current = slug
        
        // 링크 참조 저장
        currentLinkRef.current = link
        
        // 위치 계산 함수
        const updatePosition = () => {
          if (!currentLinkRef.current) return
          
          const rect = currentLinkRef.current.getBoundingClientRect()
          
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
            // 아래에 표시
            setPosition({
              x: rect.left + rect.width / 2 - previewWidth / 2,
              y: rect.bottom + 10,
            })
          }
        }
        
        // 초기 위치 설정
        updatePosition()

        // 미리보기 데이터 가져오기
        if (!preview || preview.slug !== slug) {
          try {
            const response = await fetch(`/api/articles/preview/${slug}`)
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

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // 목차 영역은 제외
      if (isTocElement(target)) {
        e.stopPropagation()
        e.stopImmediatePropagation()
        return
      }
      
      const link = target.closest('a[data-article-slug]')
      
      // 링크를 벗어났을 때만 미리보기 숨기기
      if (!link) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        setShowPreview(false)
        currentSlugRef.current = null
        currentLinkRef.current = null
      }
    }

    const container = containerRef.current
    if (!container) return
    
    // 스크롤 및 리사이즈 시 위치 업데이트
    const handleScroll = () => {
      if (showPreview && currentLinkRef.current) {
        const rect = currentLinkRef.current.getBoundingClientRect()
        const spaceOnRight = window.innerWidth - rect.right
        const spaceOnLeft = rect.left
        const previewWidth = 320

        if (spaceOnRight >= previewWidth + 20) {
          setPosition({
            x: rect.right + 20,
            y: rect.top,
          })
        } else if (spaceOnLeft >= previewWidth + 20) {
          setPosition({
            x: rect.left - previewWidth - 20,
            y: rect.top,
          })
        } else {
          setPosition({
            x: rect.left + rect.width / 2 - previewWidth / 2,
            y: rect.bottom + 10,
          })
        }
      }
    }

    const handleResize = () => {
      if (showPreview && currentLinkRef.current) {
        handleScroll()
      }
    }
    
    // 이벤트 위임 사용 (capture phase에서 처리)
    // 단, 목차 영역은 완전히 제외하기 위해 이벤트 타겟을 먼저 확인
    const handleMouseEnterWithCheck = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // 목차 영역이면 이벤트를 처리하지 않음 (가장 먼저 체크)
      if (isTocElement(target)) {
        e.stopPropagation()
        e.stopImmediatePropagation()
        return
      }
      
      // article-content 영역 내에서만 처리
      if (!target.closest('[data-article-content]')) {
        return
      }
      
      handleMouseEnter(e)
    }
    
    const handleMouseLeaveWithCheck = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // 목차 영역이면 이벤트를 처리하지 않음
      if (isTocElement(target)) {
        e.stopPropagation()
        e.stopImmediatePropagation()
        return
      }
      
      handleMouseLeave(e)
    }
    
    container.addEventListener('mouseover', handleMouseEnterWithCheck, true)
    container.addEventListener('mouseout', handleMouseLeaveWithCheck, true)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)

    return () => {
      container.removeEventListener('mouseover', handleMouseEnterWithCheck, { capture: true } as any)
      container.removeEventListener('mouseout', handleMouseLeaveWithCheck, { capture: true } as any)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [containerRef, preview])

  return (
    <AnimatePresence>
      {showPreview && preview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed z-50 w-80 bg-surface border border-border rounded-lg shadow-lg p-4 pointer-events-auto"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={() => {
            setShowPreview(false)
            currentSlugRef.current = null
            currentLinkRef.current = null
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
  )
}

