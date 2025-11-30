'use client'

import { getCurrentUser } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReviewArticleList from '@/components/Admin/ReviewArticleList'
import ReviewContributionList from '@/components/Admin/ReviewContributionList'
import { useEffect, useState } from 'react'

export default function ReviewPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (user && user.role === 'admin') {
          setIsAuthorized(true)
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/')
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
            <nav className="flex gap-4">
              <Link
                href="/"
                className="px-4 py-2 bg-secondary-300 text-text-primary rounded-lg hover:bg-secondary-500 transition-all font-medium"
              >
                메인으로
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 글 검토 섹션 */}
          <div className="bg-surface rounded-2xl shadow-sm p-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-text-primary">글 검토</h1>
            <p className="text-text-secondary mb-8">
              회원이 작성한 글을 검토하고 승인 또는 거부할 수 있습니다.
            </p>
            <ReviewArticleList />
          </div>

          {/* 기여 검토 섹션 */}
          <div className="bg-surface rounded-2xl shadow-sm p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-text-primary">기여 검토</h2>
            <p className="text-text-secondary mb-8">
              회원이 제출한 글 기여를 검토하고 승인 또는 거부할 수 있습니다. 승인 시 기여자에게 카드가 부여됩니다.
            </p>
            <ReviewContributionList />
          </div>
        </div>
      </main>
    </div>
  )
}

