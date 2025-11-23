'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { marked } from 'marked'
import 'github-markdown-css/github-markdown.css'

interface ReviewArticle {
  id: string
  title: string
  slug: string
  content: string
  status: string
  createdAt: string
  author: {
    id: string
    name: string
    email: string
  }
}

export default function ReviewArticleList() {
  const router = useRouter()
  const [articles, setArticles] = useState<ReviewArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)

  useEffect(() => {
    fetchReviewArticles()
  }, [])

  const fetchReviewArticles = async () => {
    try {
      const response = await fetch('/api/articles/review')
      if (!response.ok) {
        throw new Error('Failed to fetch review articles')
      }
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (error) {
      console.error('Error fetching review articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (articleId: string, status: 'published' | 'rejected') => {
    setReviewing(articleId)
    try {
      const response = await fetch('/api/articles/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId, status }),
      })

      if (!response.ok) {
        throw new Error('Failed to review article')
      }

      // 목록에서 제거
      setArticles(articles.filter(a => a.id !== articleId))
      router.refresh()
    } catch (error) {
      console.error('Error reviewing article:', error)
      alert('글 검토에 실패했습니다.')
    } finally {
      setReviewing(null)
    }
  }

  if (loading) {
    return <div className="text-text-secondary">로딩 중...</div>
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary text-lg">검토 대기 중인 글이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <div
          key={article.id}
          className="border border-border rounded-lg p-6 bg-surface-hover"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text-primary mb-2">{article.title}</h2>
              <div className="text-sm text-text-secondary">
                <p>작성자: {article.author.name} ({article.author.email})</p>
                <p>작성일: {new Date(article.createdAt).toLocaleString('ko-KR')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleReview(article.id, 'published')}
                disabled={reviewing === article.id}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 font-medium"
              >
                {reviewing === article.id ? '처리 중...' : '승인'}
              </button>
              <button
                onClick={() => handleReview(article.id, 'rejected')}
                disabled={reviewing === article.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 font-medium"
              >
                {reviewing === article.id ? '처리 중...' : '거부'}
              </button>
            </div>
          </div>
          
          <div className="border-t border-border pt-4 mt-4">
            <div className="markdown-body">
              <div
                dangerouslySetInnerHTML={{ __html: marked(article.content) as string }}
                className="text-text-primary"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

