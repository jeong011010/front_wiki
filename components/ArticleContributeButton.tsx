'use client'

import { useState } from 'react'
import { getCurrentUser } from '@/lib/auth-client'
import ArticleContribution from './ArticleContribution'

interface ArticleContributeButtonProps {
  articleId: string
  articleSlug: string
  articleContent: string
}

export default function ArticleContributeButton({
  articleId,
  articleSlug,
  articleContent,
}: ArticleContributeButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const handleClick = async () => {
    setIsChecking(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        window.location.href = `/auth/login?redirect=/articles/${articleSlug}`
        return
      }
      setIsOpen(true)
    } catch (error) {
      console.error('Error checking user:', error)
      window.location.href = `/auth/login?redirect=/articles/${articleSlug}`
    } finally {
      setIsChecking(false)
    }
  }

  const handleSuccess = () => {
    // 성공 메시지 표시 (선택사항)
    alert('기여가 성공적으로 제출되었습니다. 검토 후 적용됩니다.')
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isChecking}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-medium hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isChecking ? '확인 중...' : '🤝 기여하기'}
      </button>
      {isOpen && (
        <ArticleContribution
          articleId={articleId}
          articleSlug={articleSlug}
          articleContent={articleContent}
          onClose={() => setIsOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}

