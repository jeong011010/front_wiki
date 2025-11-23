'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { extractHeadings } from '@/lib/markdown-utils'

interface TableOfContentsProps {
  content: string // 마크다운 원본 텍스트
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => extractHeadings(content), [content])
  // 첫 번째 헤딩을 초기값으로 설정
  const [activeId, setActiveId] = useState<string>(headings.length > 0 ? headings[0].id : '')
  const [isVisible, setIsVisible] = useState(false)

  // Intersection Observer로 현재 섹션 감지
  useEffect(() => {
    // 헤딩이 없으면 아무것도 하지 않음
    if (headings.length === 0) {
      return
    }
    const observerOptions = {
      rootMargin: '-20% 0% -35% 0%',
      threshold: 0,
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // 모든 헤딩 요소 관찰
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [headings])

  // 스크롤 위치에 따라 목차 표시/숨김
  useEffect(() => {
    // 헤딩이 없으면 아무것도 하지 않음
    if (headings.length === 0) {
      return
    }
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsVisible(scrollY > 200) // 200px 이상 스크롤 시 표시
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // 초기 상태 확인

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [headings.length])

  // 헤딩이 없으면 렌더링하지 않음
  if (headings.length === 0) {
    return null
  }

  // 헤딩 클릭 시 해당 섹션으로 스크롤
  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80 // 헤더 높이 고려
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
      
      // 클릭한 헤딩을 활성화
      setActiveId(id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
      transition={{ duration: 0.2 }}
      className={`hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 z-10 ${
        isVisible ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div className="bg-surface border border-border rounded-lg shadow-lg p-4 max-h-[80vh] overflow-y-auto w-64 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <h2 className="text-sm font-semibold text-text-primary mb-3 sticky top-0 bg-surface pb-2 border-b border-border z-10">
          목차
        </h2>
        <nav className="space-y-1">
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id
            const indent = heading.level - 1

            return (
              <button
                key={`${heading.id}-${index}`}
                onClick={() => handleClick(heading.id)}
                className={`block w-full text-left px-2 py-1.5 rounded text-sm transition-all truncate ${
                  isActive
                    ? 'text-primary-500 font-medium bg-primary-50 dark:bg-primary-900/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
                style={{
                  paddingLeft: `${0.5 + indent * 0.75}rem`,
                }}
                title={heading.text}
              >
                {heading.text}
              </button>
            )
          })}
        </nav>
      </div>
    </motion.div>
  )
}

