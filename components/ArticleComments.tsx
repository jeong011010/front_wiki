'use client'

import { useState, useEffect } from 'react'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/http'
import { getCurrentUser } from '@/lib/auth-client'

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface ArticleCommentsProps {
  articleSlug: string
  currentUserId?: string
  currentUserRole?: string
}

export default function ArticleComments({ 
  articleSlug, 
  currentUserId: serverUserId,
  currentUserRole: serverUserRole 
}: ArticleCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(serverUserId)
  const [currentUserRole, setCurrentUserRole] = useState<string | undefined>(serverUserRole)

  // 댓글 목록 조회
  const fetchComments = async () => {
    try {
      setIsLoading(true)
      const data = await apiGet<{ comments: Comment[] }>(`/api/articles/slug/${articleSlug}/comments`)
      setComments(data.comments || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 댓글 작성
  const handleSubmit = async (content: string) => {
    if (!currentUserId) {
      throw new Error('로그인이 필요합니다.')
    }

    setIsSubmitting(true)
    try {
      await apiPost(`/api/articles/slug/${articleSlug}/comments`, { content })

      // 댓글 목록 새로고침
      await fetchComments()
    } catch (err) {
      // 에러 메시지를 더 명확하게 표시
      const errorMessage = err instanceof Error ? err.message : '댓글 작성에 실패했습니다.'
      if (errorMessage.includes('로그인') || errorMessage.includes('401')) {
        throw new Error('로그인이 필요합니다. 페이지를 새로고침하거나 다시 로그인해주세요.')
      }
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  // 댓글 수정
  const handleEdit = async (id: string, content: string) => {
    try {
      await apiPut(`/api/articles/slug/${articleSlug}/comments/${id}`, { content })

      // 댓글 목록 새로고침
      await fetchComments()
    } catch (err) {
      throw err
    }
  }

  // 댓글 삭제
  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/api/articles/slug/${articleSlug}/comments/${id}`)

      // 댓글 목록 새로고침
      await fetchComments()
    } catch (err) {
      throw err
    }
  }

  // 클라이언트에서 사용자 정보 확인 (서버 사이드 정보와 동기화)
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          setCurrentUserId(user.id)
          setCurrentUserRole(user.role)
        } else {
          setCurrentUserId(undefined)
          setCurrentUserRole(undefined)
        }
      } catch (error) {
        console.error('Failed to get current user:', error)
        // 에러 발생 시 서버에서 받은 정보 사용
      }
    }
    
    checkUser()
    fetchComments()
  }, [articleSlug])

  if (isLoading) {
    return (
      <div className="mt-8 pt-6 border-t border-divider">
        <h2 className="text-xl font-bold text-text-primary mb-4">댓글</h2>
        <div className="text-center py-8">
          <p className="text-text-secondary">댓글을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 pt-6 border-t border-divider">
      <h2 className="text-xl font-bold text-text-primary mb-4">
        댓글 {comments.length > 0 && `(${comments.length})`}
      </h2>

      {/* 댓글 작성 폼 (로그인한 사용자만) */}
      {currentUserId ? (
        <div className="mb-6 p-4 bg-surface rounded-lg border border-divider">
          <CommentForm onSubmit={handleSubmit} />
        </div>
      ) : (
        <div className="mb-6 p-4 bg-surface rounded-lg border border-divider text-center">
          <p className="text-text-secondary mb-2">댓글을 작성하려면 로그인이 필요합니다.</p>
          <a
            href="/auth/login"
            className="text-primary-500 hover:text-primary-600 underline text-sm"
          >
            로그인하기
          </a>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-md">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

