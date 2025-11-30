'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth-client'
import DeleteButton from './DeleteButton'
import type { User } from '@/lib/auth-client'

interface ArticleActionsProps {
  articleId: string
  articleSlug: string
  authorId: string | null
}

export default function ArticleActions({ articleId, articleSlug, authorId }: ArticleActionsProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  // 로딩 중이거나 사용자가 없으면 아무것도 표시하지 않음
  if (loading) {
    return null
  }

  // 작성자 또는 관리자가 아니면 버튼 표시하지 않음
  if (!user || (user.role !== 'admin' && authorId !== user.id)) {
    return null
  }

  return (
    <div className="flex gap-2 flex-shrink-0 flex-col sm:flex-row">
      <Link
        href={`/articles/${articleSlug}/edit`}
        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-all text-sm font-medium hover:shadow-md whitespace-nowrap text-center"
      >
        ✏️ 수정
      </Link>
      <DeleteButton articleId={articleId} articleSlug={articleSlug} />
    </div>
  )
}

