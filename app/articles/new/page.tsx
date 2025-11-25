'use client'

import AutoLinkEditor from '@/components/Editor/AutoLinkEditor'
import { getCurrentUser } from '@/lib/auth-client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NewArticlePage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          setIsAuthorized(true)
        } else {
          router.push('/auth/login?redirect=/articles/new')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/login?redirect=/articles/new')
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-primary">로딩 중...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-500 hover:text-primary-700 transition-colors">
              프론트위키
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              ← 메인으로
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface rounded-2xl shadow-sm p-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-8 text-text-primary">새 글 작성</h1>
          <AutoLinkEditor />
        </div>
      </main>
    </div>
  )
}

