'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface ArticleCardProps {
  article: {
    id: string
    title: string
    titleWithLinks?: string // 링크가 포함된 제목 HTML (선택사항)
    slug: string
    category: string | null
    categorySlug?: string | null
    createdAt: Date | string
    updatedAt: Date | string
    preview?: string
    imageUrl?: string | null // 대표 이미지 URL (선택사항)
    tier?: 'general' | 'frontend' | 'cloud' | 'backend' | 'devops' // 계산된 티어 (선택사항)
    author?: {
      name: string
      email: string
      imageUrl?: string | null // 작성자 프로필 이미지 URL (선택사항)
    } | null
  }
}

// 티어별 카드 테두리 색상 및 효과 (포켓몬 카드 스타일)
const tierStyles: Record<string, {
  border: string
  borderGradient: string
  glow: string
  shimmer: string
  name: string
}> = {
  // 일반 티어 (회색)
  general: {
    border: 'border-gray-400',
    borderGradient: 'linear-gradient(135deg, #9ca3af, #6b7280, #9ca3af)',
    glow: 'rgba(156, 163, 175, 0.3)',
    shimmer: 'rgba(255, 255, 255, 0.3)',
    name: '일반'
  },
  // 희귀 티어 (파란색)
  frontend: {
    border: 'border-blue-500',
    borderGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8, #3b82f6)',
    glow: 'rgba(59, 130, 246, 0.4)',
    shimmer: 'rgba(147, 197, 253, 0.5)',
    name: '희귀'
  },
  // 에픽 티어 (보라색)
  cloud: {
    border: 'border-purple-500',
    borderGradient: 'linear-gradient(135deg, #a855f7, #7c3aed, #a855f7)',
    glow: 'rgba(168, 85, 247, 0.4)',
    shimmer: 'rgba(196, 181, 253, 0.5)',
    name: '에픽'
  },
  // 레전드 티어 (금색)
  backend: {
    border: 'border-yellow-500',
    borderGradient: 'linear-gradient(135deg, #eab308, #ca8a04, #eab308)',
    glow: 'rgba(234, 179, 8, 0.5)',
    shimmer: 'rgba(254, 240, 138, 0.6)',
    name: '레전드'
  },
  // 전설 티어 (오렌지/레드)
  devops: {
    border: 'border-orange-500',
    borderGradient: 'linear-gradient(135deg, #f97316, #ea580c, #f97316)',
    glow: 'rgba(249, 115, 22, 0.4)',
    shimmer: 'rgba(254, 215, 170, 0.5)',
    name: '전설'
  },
  // 기본값
  react: {
    border: 'border-blue-500',
    borderGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8, #3b82f6)',
    glow: 'rgba(59, 130, 246, 0.4)',
    shimmer: 'rgba(147, 197, 253, 0.5)',
    name: '희귀'
  },
  nextjs: {
    border: 'border-blue-500',
    borderGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8, #3b82f6)',
    glow: 'rgba(59, 130, 246, 0.4)',
    shimmer: 'rgba(147, 197, 253, 0.5)',
    name: '희귀'
  },
  '프론트엔드': {
    border: 'border-blue-500',
    borderGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8, #3b82f6)',
    glow: 'rgba(59, 130, 246, 0.4)',
    shimmer: 'rgba(147, 197, 253, 0.5)',
    name: '희귀'
  },
  '백엔드': {
    border: 'border-yellow-500',
    borderGradient: 'linear-gradient(135deg, #eab308, #ca8a04, #eab308)',
    glow: 'rgba(234, 179, 8, 0.5)',
    shimmer: 'rgba(254, 240, 138, 0.6)',
    name: '레전드'
  },
  '클라우드': {
    border: 'border-purple-500',
    borderGradient: 'linear-gradient(135deg, #a855f7, #7c3aed, #a855f7)',
    glow: 'rgba(168, 85, 247, 0.4)',
    shimmer: 'rgba(196, 181, 253, 0.5)',
    name: '에픽'
  },
}

export default function ArticleCard({ article }: ArticleCardProps) {
  // 티어 결정: API에서 계산된 tier가 있으면 사용, 없으면 카테고리 기반으로 결정
  const tier: 'general' | 'frontend' | 'cloud' | 'backend' | 'devops' = 
    article.tier || 
    (() => {
      let categoryKey = (article.categorySlug || article.category || '').toLowerCase()
      if (!categoryKey && article.category) {
        const nameToSlug: Record<string, string> = {
          '프론트엔드': 'frontend',
          '백엔드': 'backend',
          '클라우드': 'cloud',
          'devops': 'devops',
          '일반': 'general',
        }
        categoryKey = nameToSlug[article.category.toLowerCase()] || categoryKey
      }
      return (categoryKey && tierStyles[categoryKey]) ? categoryKey as typeof tier : 'general'
    })()
  
  const tierStyle = tierStyles[tier] || tierStyles.general

  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false) // 호버 상태 추가
  const [hasDragged, setHasDragged] = useState(false) // 실제로 드래그가 발생했는지 추적
  const [isMobile, setIsMobile] = useState(true)
  const [isScrolling, setIsScrolling] = useState(false) // 스크롤 모드인지 확인
  const cardRef = useRef<HTMLAnchorElement>(null)
  const dragStartPos = useRef<{ x: number; y: number } | null>(null)
  const dragStartMousePos = useRef<{ x: number; y: number } | null>(null) // 드래그 시작 시 마우스 위치

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // PC: 마우스 드래그 시작
  const handleMouseDown = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMobile) return
    setIsDragging(true)
    setHasDragged(false) // 드래그 시작 시 초기화
    setIsScrolling(false) // 스크롤 모드 초기화
    if (!cardRef.current) return
    
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    dragStartPos.current = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    }
    dragStartMousePos.current = {
      x: e.clientX,
      y: e.clientY,
    }
  }

  // PC: 마우스 드래그 중
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isDragging || !dragStartPos.current || !cardRef.current || !dragStartMousePos.current) return
    
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    // 드래그 거리 및 방향 계산
    const deltaX = e.clientX - dragStartMousePos.current.x
    const deltaY = e.clientY - dragStartMousePos.current.y
    const dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    // 수평 방향으로 큰 움직임이면 스크롤 모드로 전환 (20px 이상)
    if (Math.abs(deltaX) > 20 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      setIsScrolling(true)
      setRotateX(0)
      setRotateY(0)
      return // 스크롤 모드에서는 카드 회전 비활성화
    }
    
    // 작은 움직임이거나 수직 방향이면 카드 회전
    if (!isScrolling && dragDistance > 5) {
      // 회전 각도 계산 (최대 5도로 제한, 드래그 거리에 비례)
      const maxRotate = 5
      const maxDragDistance = Math.max(rect.width, rect.height)
      const normalizedDistance = Math.min(dragDistance / maxDragDistance, 1)
      const rotationIntensity = Math.min(normalizedDistance * 0.7, 1)
      
      const rotateXValue = Math.max(-maxRotate, Math.min(maxRotate, (mouseY / (rect.height / 2)) * maxRotate * -1 * rotationIntensity))
      const rotateYValue = Math.max(-maxRotate, Math.min(maxRotate, (mouseX / (rect.width / 2)) * maxRotate * rotationIntensity))
      
      setRotateX(rotateXValue)
      setRotateY(rotateYValue)
    }
  }

  // PC: 마우스 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false)
    setIsScrolling(false)
    setRotateX(0)
    setRotateY(0)
    dragStartPos.current = null
    dragStartMousePos.current = null
  }

  // PC: 마우스가 카드 밖으로 나갔을 때 - 드래그는 계속 유지 (전역 이벤트로 처리)
  const handleMouseLeave = () => {
    // 드래그 중이 아닐 때만 회전 초기화 (드래그 중이면 전역 이벤트가 처리)
    if (!isDragging) {
      setRotateX(0)
      setRotateY(0)
    }
    setIsHovered(false)
  }

  // 모바일: 터치 드래그 시작
  const handleTouchStart = (e: React.TouchEvent<HTMLAnchorElement>) => {
    if (!isMobile) return
    setIsDragging(true)
    setHasDragged(false) // 드래그 시작 시 초기화
    setIsScrolling(false) // 스크롤 모드 초기화
    if (!cardRef.current) return
    
    const touch = e.touches[0]
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    dragStartPos.current = {
      x: touch.clientX - rect.left - rect.width / 2,
      y: touch.clientY - rect.top - rect.height / 2,
    }
    dragStartMousePos.current = {
      x: touch.clientX,
      y: touch.clientY,
    }
  }

  // 모바일: 터치 드래그 중 (전역 이벤트에서 처리하므로 여기서는 스크롤만 체크)
  const handleTouchMove = (e: React.TouchEvent<HTMLAnchorElement>) => {
    if (!isDragging || !dragStartMousePos.current) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStartMousePos.current.x
    const deltaY = touch.clientY - dragStartMousePos.current.y
    
    // 수평 방향으로 큰 움직임이면 스크롤 모드로 전환 (20px 이상)
    if (Math.abs(deltaX) > 20 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      setIsScrolling(true)
      setRotateX(0)
      setRotateY(0)
    } else {
      setIsScrolling(false)
    }
  }

  // 모바일: 터치 드래그 종료
  const handleTouchEnd = (e: React.TouchEvent<HTMLAnchorElement>) => {
    setIsDragging(false)
    setRotateX(0)
    setRotateY(0)
    dragStartPos.current = null
    dragStartMousePos.current = null
    
    // 드래그가 발생했으면 클릭 이벤트 방지
    if (hasDragged) {
      e.preventDefault()
      e.stopPropagation()
      setHasDragged(false)
    }
  }

  // 모바일: 전역 터치 이벤트 처리
  useEffect(() => {
    if (!isDragging || !isMobile) return

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDragging || !cardRef.current || e.touches.length === 0 || !dragStartMousePos.current) return
      
      const touch = e.touches[0]
      
      // 드래그 거리 및 방향 계산
      const deltaX = touch.clientX - dragStartMousePos.current.x
      const deltaY = touch.clientY - dragStartMousePos.current.y
      const dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      
      // 수평 스크롤이 우세하고 일정 거리 이상 움직이면 스크롤 모드로 전환
      if (Math.abs(deltaX) > 20 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        setIsScrolling(true)
        setRotateX(0)
        setRotateY(0)
        return // 스크롤 중이면 카드 회전 방지
      } else {
        setIsScrolling(false)
      }
      
      // 작은 움직임이거나 수직 방향이면 카드 회전
      if (!isScrolling && dragDistance > 5) {
        setHasDragged(true) // 실제 드래그 발생
        e.preventDefault() // 스크롤 방지
        
        const card = cardRef.current
        const rect = card.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        const touchX = touch.clientX - centerX
        const touchY = touch.clientY - centerY
        
        // 회전 각도 계산 (최대 5도로 제한, 드래그 거리에 비례)
        const maxRotate = 5
        const maxDragDistance = Math.max(rect.width, rect.height)
        const normalizedDistance = Math.min(dragDistance / maxDragDistance, 1)
        const rotationIntensity = Math.min(normalizedDistance * 0.7, 1)
        
        const rotateXValue = Math.max(-maxRotate, Math.min(maxRotate, (touchY / (rect.height / 2)) * maxRotate * -1 * rotationIntensity))
        const rotateYValue = Math.max(-maxRotate, Math.min(maxRotate, (touchX / (rect.width / 2)) * maxRotate * rotationIntensity))
        
        setRotateX(rotateXValue)
        setRotateY(rotateYValue)
      }
    }

    const handleGlobalTouchEnd = () => {
      setIsDragging(false)
      setIsScrolling(false)
      setRotateX(0)
      setRotateY(0)
      dragStartPos.current = null
      dragStartMousePos.current = null
      // hasDragged는 handleClick에서 확인 후 초기화
    }

    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
    document.addEventListener('touchend', handleGlobalTouchEnd)
    document.addEventListener('touchcancel', handleGlobalTouchEnd)

      return () => {
        document.removeEventListener('touchmove', handleGlobalTouchMove)
        document.removeEventListener('touchend', handleGlobalTouchEnd)
        document.removeEventListener('touchcancel', handleGlobalTouchEnd)
      }
    }, [isDragging, isMobile, isScrolling])

  // 전역 마우스 이벤트 처리 (카드 밖에서도 드래그 유지 및 종료)
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      setIsScrolling(false)
      setRotateX(0)
      setRotateY(0)
      dragStartPos.current = null
      dragStartMousePos.current = null
      // hasDragged는 handleClick에서 확인 후 초기화
      // 호버 상태는 마우스 위치에 따라 자동으로 관리됨
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !cardRef.current || !dragStartMousePos.current) return
      
      // 드래그 거리 및 방향 계산
      const deltaX = e.clientX - dragStartMousePos.current.x
      const deltaY = e.clientY - dragStartMousePos.current.y
      const dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      
      // 수평 방향으로 큰 움직임이면 스크롤 모드로 전환 (20px 이상)
      if (Math.abs(deltaX) > 20 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        setIsScrolling(true)
        setRotateX(0)
        setRotateY(0)
        return // 스크롤 모드에서는 카드 회전 비활성화
      }
      
      // 작은 움직임이거나 수직 방향이면 카드 회전
      if (!isScrolling && dragDistance > 5) {
        setHasDragged(true) // 실제 드래그 발생
        
        const card = cardRef.current
        const rect = card.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        const mouseX = e.clientX - centerX
        const mouseY = e.clientY - centerY
        
        // 회전 각도 계산 (최대 5도로 제한, 드래그 거리에 비례)
        const maxRotate = 5 // 최대 회전 각도 감소
        const maxDragDistance = Math.max(rect.width, rect.height) // 카드 크기에 비례한 최대 드래그 거리
        const normalizedDistance = Math.min(dragDistance / maxDragDistance, 1) // 0~1 사이로 정규화
        
        // 드래그 거리에 비례하여 회전 강도 조절 (최대 0.7배까지만)
        const rotationIntensity = Math.min(normalizedDistance * 0.7, 1)
        
        const rotateXValue = Math.max(-maxRotate, Math.min(maxRotate, (mouseY / (rect.height / 2)) * maxRotate * -1 * rotationIntensity))
        const rotateYValue = Math.max(-maxRotate, Math.min(maxRotate, (mouseX / (rect.width / 2)) * maxRotate * rotationIntensity))
        
        setRotateX(rotateXValue)
        setRotateY(rotateYValue)
      }
    }

    if (!isMobile) {
      // 전역 이벤트로 카드 밖에서도 드래그 추적
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      if (!isMobile) {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging, isMobile, isScrolling])

  // 대표 이미지가 없을 때 사용할 이니셜 (제목의 첫 글자)
  const initial = article.title.charAt(0).toUpperCase()

  // 드래그가 발생했으면 링크 클릭 방지
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasDragged) {
      e.preventDefault()
      e.stopPropagation()
    }
    // 클릭 처리 후 드래그 상태 초기화
    setHasDragged(false)
  }

  // 그림자 계산 (드래그 > 호버 > 기본 순서로 강도 증가)
  const getBoxShadow = () => {
    if (isDragging) {
      // 드래그 중: 강한 그림자
      return '0 16px 32px -8px rgba(0, 0, 0, 0.2), 0 4px 8px -2px rgba(0, 0, 0, 0.15)'
    } else if (isHovered) {
      // 호버 중: 중간 강도의 그림자
      return '0 10px 20px -5px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
    } else {
      // 기본: 선명한 그림자
      return '0 4px 8px -2px rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.08)'
    }
  }

  // 스케일 계산 (드래그 시 약간만 확대)
  const getScale = () => {
    if (isDragging) {
      return 1.01 // 드래그 시 매우 미세한 확대
    } else if (isHovered) {
      return 1.005 // 호버 시 거의 느껴지지 않는 확대
    }
    return 1
  }

  return (
    <Link
      ref={cardRef}
      href={`/articles/${article.slug}`}
      onClick={handleClick}
      className="block relative bg-white rounded-2xl overflow-hidden group select-none"
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        contain: 'layout style paint',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${getScale()})`,
        transition: isDragging ? 'box-shadow 0.2s ease-out' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: getBoxShadow(),
            width: '200px',
            height: '300px',
            cursor: isDragging ? 'grabbing' : 'grab',
        willChange: 'transform',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        imageRendering: 'crisp-edges',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        handleMouseLeave()
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 티어별 반짝이는 테두리 - 포켓몬 카드 스타일 */}
      <div 
        className={`absolute inset-0 rounded-2xl z-40 pointer-events-none border-4 ${tierStyle.border}`}
        style={{
          background: tierStyle.borderGradient,
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'destination-out',
          maskComposite: 'exclude',
          boxShadow: `0 0 20px ${tierStyle.glow}, inset 0 0 20px ${tierStyle.glow}`,
          transform: 'translateZ(0)',
        }}
      />
      
      {/* 테두리 그라데이션 오버레이 */}
      <div 
        className="absolute inset-0 rounded-2xl z-39 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent 0%, transparent 2%, ${tierStyle.shimmer} 2%, ${tierStyle.shimmer} 4%, transparent 4%, transparent 96%, ${tierStyle.shimmer} 96%, ${tierStyle.shimmer} 98%, transparent 98%)`,
          transform: 'translateZ(0)',
        }}
      />
      
      {/* 티어별 테두리 그라데이션 오버레이 */}
      <div 
        className="absolute inset-0 rounded-2xl z-39 pointer-events-none"
        style={{
          padding: '4px',
          background: tierStyle.borderGradient,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          transform: 'translateZ(0)',
        }}
      />
      
      {/* 회전 시 빛 반사 효과 - 홀로그래픽 */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl z-30"
        style={{
          background: `linear-gradient(${135 + rotateY * 4}deg, 
            ${tierStyle.shimmer} 0%, 
            ${tierStyle.shimmer} 20%,
            transparent 40%, 
            transparent 60%,
            ${tierStyle.shimmer} 80%,
            ${tierStyle.shimmer} 100%)`,
          transform: `translateZ(50px)`,
          mixBlendMode: 'overlay',
          animation: 'shimmer 3s infinite',
        }}
      />
      
      {/* 티어별 글로우 효과 */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl z-20"
        style={{
          boxShadow: `0 0 30px ${tierStyle.glow}, inset 0 0 30px ${tierStyle.glow}`,
        }}
      />
      {/* 홀로그래픽 반사 효과 - 포켓몬 카드 스타일 */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl z-30"
        style={{
          background: `linear-gradient(${135 + rotateY * 3}deg, 
            rgba(255, 255, 255, 0.6) 0%, 
            rgba(255, 255, 255, 0.2) 25%,
            transparent 50%, 
            rgba(0, 0, 0, 0.1) 75%,
            transparent 100%)`,
          transform: `translateZ(40px)`,
          mixBlendMode: 'overlay',
        }}
      />
      
      {/* 카드 테두리 글로우 효과 */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl z-20"
        style={{
          boxShadow: `inset 0 0 20px rgba(79, 70, 229, 0.2), 0 0 30px rgba(79, 70, 229, 0.1)`,
        }}
      />
      
      {/* 상단: 제목 영역 */}
      <div 
        className="relative z-10 px-4 pt-4 pb-2 bg-gradient-to-b from-white to-gray-50"
        style={{
          transform: 'translateZ(0)',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        }}
      >
        {/* 티어 배지 */}
        {article.category && (
          <div className="mb-2 flex items-center gap-2">
            <div 
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border-2 ${tierStyle.border} bg-white/80 backdrop-blur-sm`}
              style={{
                color: tierStyle.borderGradient.includes('blue') ? '#1d4ed8' : 
                       tierStyle.borderGradient.includes('purple') ? '#7c3aed' :
                       tierStyle.borderGradient.includes('yellow') ? '#ca8a04' :
                       tierStyle.borderGradient.includes('orange') ? '#ea580c' : '#6b7280',
                transform: 'translateZ(0)',
                boxShadow: `0 0 10px ${tierStyle.glow}`,
              }}
            >
              {tierStyle.name}
            </div>
            <div 
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700"
              style={{ transform: 'translateZ(0)' }}
            >
              {article.category}
            </div>
          </div>
        )}
        
        {/* 제목 (링크 포함 가능) */}
        <h3 
          className="text-lg font-black text-text-primary line-clamp-1 leading-tight"
          style={{
            transform: 'translateZ(0)',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
          }}
          title={article.title}
          dangerouslySetInnerHTML={{
            __html: article.titleWithLinks || article.title
          }}
        />
      </div>
      
      {/* 중간: 이미지 영역 */}
      <div 
        className="relative w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
        style={{
          transform: 'translateZ(0)',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          height: '120px', // 고정 높이로 변경
        }}
      >
        {article.imageUrl ? (
          <>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: 'translateZ(0)',
                willChange: 'transform',
                imageRendering: 'crisp-edges',
                WebkitFontSmoothing: 'antialiased',
              }}
            >
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover z-10"
                sizes="200px"
                quality={75}
                priority={false}
                loading="lazy"
              />
            </div>
            {/* 이미지 오버레이 그라데이션 */}
            <div 
              className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent z-20"
              style={{ transform: 'translateZ(0)' }}
            />
          </>
        ) : (
          // 이미지가 없을 때: 티어 색상 기반 그라데이션 + 이니셜
          <div 
            className="w-full h-full flex items-center justify-center relative z-10"
            style={{
              background: tierStyle.borderGradient,
              transform: 'translateZ(0)',
            }}
          >
            <div 
              className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
              style={{ transform: 'translateZ(0)' }}
            />
            <span 
              className="text-8xl font-black text-white drop-shadow-2xl relative z-10"
              style={{
                transform: 'translateZ(0)',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
              }}
            >
              {initial}
            </span>
          </div>
        )}
      </div>
      
      {/* 하단: 작성자 및 날짜 영역 */}
      <div 
        className="relative z-10 px-4 pb-5 pt-3 bg-gradient-to-b from-gray-50 to-white"
        style={{
          transform: 'translateZ(0)',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
          minHeight: '80px', // 최소 높이 보장
        }}
      >
        {/* 작성자 정보 */}
        {article.author && (
          <div className="flex items-center gap-2 mb-2">
            {/* 작성자 아바타 */}
            {article.author.imageUrl ? (
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 relative">
                <Image
                  src={article.author.imageUrl}
                  alt={article.author.name}
                  fill
                  className="object-cover"
                  sizes="24px"
                  onError={() => {
                    // 이미지 로드 실패는 CSS로 처리 (fallback 배경색)
                  }}
                />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-gray-600">
                  {article.author.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-xs font-semibold text-text-primary truncate">
              {article.author.name}
            </span>
          </div>
        )}
        
        {/* 하단 정보 바 */}
        <div 
          className="flex items-center justify-between pt-2 border-t border-gray-200"
          style={{ transform: 'translateZ(0)' }}
        >
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-text-secondary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] font-bold text-text-secondary">
              {new Date(article.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="text-[10px] font-bold text-text-tertiary">
            #{article.id.slice(-4)}
          </div>
        </div>
      </div>
      
      {/* 하단 테두리 장식 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-50" />
    </Link>
  )
}
