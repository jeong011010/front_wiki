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
      <div className="flex items-center gap-4">
        <Link
          href="/articles/new"
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-all hover:shadow-md font-medium"
        >
          새 글 작성
        </Link>
        <span className="text-sm text-text-secondary">
          {user.name}님 ({user.role === 'admin' ? '관리자' : '회원'})
        </span>
        {user.role === 'admin' && (
          <Link
            href="/admin/review"
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm font-medium"
          >
            검토
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-secondary-300 text-text-primary rounded-lg hover:bg-secondary-500 transition-all text-sm font-medium"
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Link
        href="/auth/login"
        className="px-4 py-2 bg-secondary-300 text-text-primary rounded-lg hover:bg-secondary-500 transition-all font-medium"
      >
        로그인
      </Link>
      <Link
        href="/auth/register"
        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-all font-medium"
      >
        회원가입
      </Link>
    </div>
  )
}

