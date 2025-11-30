'use client'

import { useState } from 'react'

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
  onCancel?: () => void
}

export default function CommentForm({ onSubmit, onCancel }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('댓글 내용을 입력해주세요.')
      return
    }
    
    if (content.length > 1000) {
      setError('댓글은 1000자 이하여야 합니다.')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      await onSubmit(content)
      setContent('')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글 작성에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            setError(null)
          }}
          placeholder="댓글을 입력하세요..."
          className="w-full p-3 border border-divider rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background text-text-primary"
          rows={4}
          maxLength={1000}
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-text-secondary">
            {content.length}/1000
          </span>
          {error && (
            <span className="text-xs text-danger">
              {error}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            disabled={isSubmitting}
          >
            취소
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? '작성 중...' : '댓글 작성'}
        </button>
      </div>
    </form>
  )
}

