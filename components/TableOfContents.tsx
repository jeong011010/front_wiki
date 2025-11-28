'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { extractHeadings } from '@/lib/markdown-utils'

interface TableOfContentsProps {
  content: string
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => extractHeadings(content), [content])
  const [activeId, setActiveId] = useState<string>('')
  const [isVisible, setIsVisible] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // 스크롤 위치에 따라 목차 표시/숨김
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Intersection Observer로 현재 섹션 감지
  useEffect(() => {
    if (headings.length === 0) return

    // 기존 observer 정리
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // DOM 준비 대기
    const timeoutId = setTimeout(() => {
      const observerOptions = {
        root: null,
        rootMargin: '-120px 0% -60% 0%',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }

      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        // 교차하는 엔트리 중에서 가장 위에 있는 것 찾기
        const visibleEntries = entries.filter(entry => entry.isIntersecting)
        
        if (visibleEntries.length > 0) {
          // 뷰포트 상단(120px offset)에 가장 가까운 엔트리
          visibleEntries.sort((a, b) => {
            const aTop = a.boundingClientRect.top
            const bTop = b.boundingClientRect.top
            return Math.abs(aTop - 120) - Math.abs(bTop - 120)
          })
          
          const topEntry = visibleEntries[0]
          if (topEntry.target.id) {
            setActiveId(topEntry.target.id)
          }
        }
      }

      const observer = new IntersectionObserver(observerCallback, observerOptions)
      observerRef.current = observer

      // 모든 헤딩 요소 관찰
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id)
        if (element) {
          observer.observe(element)
        }
      })

      // 초기 활성 헤딩 설정
      const updateActiveHeading = () => {
        const scrollY = window.scrollY + 120
        let activeHeading = headings[0]
        
        for (const heading of headings) {
          const element = document.getElementById(heading.id)
          if (element) {
            if (element.offsetTop <= scrollY) {
              activeHeading = heading
            } else {
              break
            }
          }
        }
        
        setActiveId(activeHeading.id)
      }
      
      updateActiveHeading()
    }, 800)

    return () => {
      clearTimeout(timeoutId)
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [headings])

  // 헤딩 클릭 핸들러
  const handleHeadingClick = (id: string) => {
    const element = document.getElementById(id)
    if (!element) return

    const offset = 120
    const elementTop = element.getBoundingClientRect().top + window.pageYOffset
    const targetPosition = elementTop - offset

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    })

    setActiveId(id)
  }

  if (headings.length === 0) {
    return null
  }

  const tocContent = (
    <div className="bg-surface border border-border rounded-lg shadow-lg p-4 max-h-[80vh] overflow-y-auto w-full lg:w-64">
      <h2 className="text-sm font-semibold text-text-primary mb-3 sticky top-0 bg-surface pb-2 border-b border-border">
        목차
      </h2>
      <nav className="space-y-1">
        {headings.map((heading, index) => {
          const isActive = activeId === heading.id
          const indent = heading.level - 1

          return (
            <button
              key={`${heading.id}-${index}`}
              onClick={() => {
                handleHeadingClick(heading.id)
                setIsMobileOpen(false) // 모바일에서 클릭 시 닫기
              }}
              className={`block w-full text-left px-2 py-1.5 rounded text-sm transition-all truncate cursor-pointer ${
                isActive
                  ? 'text-primary-500 font-medium bg-primary-50 dark:bg-primary-900/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
              style={{
                paddingLeft: `${0.5 + indent * 0.75}rem`,
              }}
              title={heading.text}
              type="button"
            >
              {heading.text}
            </button>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      {/* 데스크톱: 고정 사이드바 */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
        transition={{ duration: 0.2 }}
        className={`hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 z-[100] ${
          isVisible ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        data-table-of-contents
      >
        {tocContent}
      </motion.div>

      {/* 모바일/태블릿: 접기/펼치기 버튼 */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors"
          aria-expanded={isMobileOpen}
          aria-label="목차"
        >
          <span className="text-sm font-semibold text-text-primary">목차</span>
          <svg
            className={`w-5 h-5 text-text-secondary transition-transform ${isMobileOpen ? 'rotate-180' : ''}`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2">
                {tocContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
