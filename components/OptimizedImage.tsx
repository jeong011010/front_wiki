'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

/**
 * 최적화된 이미지 컴포넌트
 * Next.js Image 컴포넌트를 사용하여 자동 최적화
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
}: OptimizedImageProps) {
  const [error, setError] = useState(false)

  // 외부 이미지 URL 처리
  const isExternal = src.startsWith('http://') || src.startsWith('https://')
  
  // 에러 발생 시 일반 img 태그로 폴백
  if (error) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
      />
    )
  }

  // Next.js Image 사용 (외부 이미지도 지원)
  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
      quality={85}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
    />
  )
}


