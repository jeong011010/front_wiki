'use client'

import { getCurrentUser } from '@/lib/auth-client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import AutoLinkEditor from '@/components/Editor/AutoLinkEditor'
import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/http'

interface Article {
  id: string
  title: string
  content: string
  slug: string
  authorId: string
  categoryId: string | null
}

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [article, setArticle] = useState<Article | null>(null)

  useEffect(() => {
    const checkAuthAndLoadArticle = async () => {
      try {
        // 인증 확인
        const user = await getCurrentUser()
        if (!user) {
          router.push(`/auth/login?redirect=/articles/${slug}/edit`)
          return
        }

        // 글 데이터 로드
        const decodedSlug = slug.includes('%') ? decodeURIComponent(slug) : slug
        const articleData = await apiGet<Article>(`/api/articles/slug/${decodedSlug}`)

        // 권한 체크 (작성자 또는 관리자만 수정 가능)
        if (user.role !== 'admin' && articleData.authorId !== user.id) {
          router.push('/')
          return
        }

        setArticle(articleData)
        setIsAuthorized(true)
      } catch (error) {
        console.error('Error loading article:', error)
        router.push('/')
      } finally {
        setIsChecking(false)
      }
    }

    if (slug) {
      checkAuthAndLoadArticle()
    }
  }, [slug, router])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-primary">로딩 중...</div>
      </div>
    )
  }

  if (!isAuthorized || !article) {
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
                href={`/articles/${article.slug}`}
                className="px-4 py-2 bg-secondary-300 text-text-primary rounded-lg hover:bg-secondary-500 transition-all font-medium"
              >
                ← 취소
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface rounded-2xl shadow-sm p-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-6 text-text-primary">글 수정</h1>
          <AutoLinkEditor
            initialTitle={article.title}
            initialContent={article.content}
            initialCategoryId={article.categoryId}
            articleId={article.id}
          />
        </div>
      </main>
    </div>
  )
}

