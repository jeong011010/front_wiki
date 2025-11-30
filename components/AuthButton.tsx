'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, logout } from '@/lib/auth-client'
import type { User } from '@/lib/auth-client'

export default function AuthButton() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setUser(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading) {
    return null
  }

  if (user) {
    return (
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1.5 md:gap-4">
        {/* 모바일: 버튼들을 가로로 배치 */}
        <div className="flex flex-wrap gap-1.5 md:contents">
          <Link
            href="/articles/new"
            className="flex-1 md:flex-none px-2.5 py-1.5 md:px-4 md:py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-all hover:shadow-md text-sm md:text-base font-medium text-center whitespace-nowrap"
          >
            새 글 작성
          </Link>
          {user.role === 'admin' && (
            <Link
              href="/admin/review"
              className="flex-1 md:flex-none px-2.5 py-1.5 md:px-3 md:py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm font-medium text-center whitespace-nowrap"
            >
              검토
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex-1 md:flex-none px-2.5 py-1.5 md:px-4 md:py-2 bg-secondary-300 text-text-primary rounded-lg hover:bg-secondary-500 transition-all text-sm font-medium whitespace-nowrap"
          >
            로그아웃
          </button>
        </div>
        <span className="text-xs md:text-sm text-text-secondary text-center md:text-left px-1.5 py-0.5 md:px-2 md:py-1">
          {user.name}님 ({user.role === 'admin' ? '관리자' : '회원'})
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap md:flex-row gap-1.5 md:gap-2">
      <Link
        href="/auth/login"
        className="flex-1 md:flex-none px-2.5 py-1.5 md:px-4 md:py-2 bg-secondary-300 text-text-primary rounded-lg hover:bg-secondary-500 transition-all text-sm md:text-base font-medium text-center whitespace-nowrap"
      >
        로그인
      </Link>
      <Link
        href="/auth/register"
        className="flex-1 md:flex-none px-2.5 py-1.5 md:px-4 md:py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-all text-sm md:text-base font-medium text-center whitespace-nowrap"
      >
        회원가입
      </Link>
    </div>
  )
}

