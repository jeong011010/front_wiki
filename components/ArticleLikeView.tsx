'use client'

import { useEffect, useRef, useState } from 'react'
import { apiGet, apiPost, apiDelete } from '@/lib/http'
import { getCurrentUser } from '@/lib/auth-client'

interface ArticleLikeViewProps {
  slug: string
  initialViews?: number
  initialLikes?: number
}

export default function ArticleLikeView({ slug, initialViews = 0, initialLikes = 0 }: ArticleLikeViewProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [views, setViews] = useState(initialViews)
  const [isLiking, setIsLiking] = useState(false)

  // 좋아요 상태 조회
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const data = await apiGet<{ likes: number; isLiked: boolean }>(`/api/articles/slug/${slug}/like`)
        setLikes(data.likes)
        setIsLiked(data.isLiked)
      } catch {
        // 에러는 무시 (비회원도 조회 가능)
      }
    }
    fetchLikeStatus()
  }, [slug])

  // 조회수 증가 (페이지 로드 시 한 번만) - useRef로 중복 실행 방지
  const hasIncrementedView = useRef(false)
  useEffect(() => {
    if (hasIncrementedView.current) return
    hasIncrementedView.current = true
    
    const incrementView = async () => {
      try {
        const data = await apiPost<{ success: boolean; views: number }>(`/api/articles/slug/${slug}/view`, {})
        setViews(data.views)
      } catch {
        // 에러는 무시
      }
    }
    incrementView()
  }, [slug])

  // 좋아요 토글 핸들러
  const handleLikeClick = async () => {
    const user = await getCurrentUser()
    if (!user) {
      // 로그인 페이지로 리다이렉트
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`
      return
    }

    if (isLiking) return
    setIsLiking(true)

    try {
      if (isLiked) {
        // 좋아요 제거
        await apiDelete(`/api/articles/slug/${slug}/like`)
        setLikes(prev => Math.max(0, prev - 1))
        setIsLiked(false)
      } else {
        // 좋아요 추가
        const data = await apiPost<{ success: boolean; likes: number }>(`/api/articles/slug/${slug}/like`, {})
        setLikes(data.likes)
        setIsLiked(true)
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {/* 조회수 */}
      <div className="flex items-center gap-2 text-text-secondary">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="text-sm font-semibold">{views.toLocaleString()}</span>
      </div>
      {/* 좋아요 버튼 */}
      <button
        onClick={handleLikeClick}
        disabled={isLiking}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
          isLiked 
            ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
        title={isLiked ? '좋아요 취소' : '좋아요'}
      >
        <svg 
          className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} 
          fill={isLiked ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span className="text-sm font-semibold">{likes.toLocaleString()}</span>
      </button>
    </div>
  )
}

