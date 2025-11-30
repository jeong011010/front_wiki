'use client'

import { useState } from 'react'
import Image from 'next/image'

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

interface CommentItemProps {
  comment: Comment
  currentUserId?: string
  currentUserRole?: string
  onEdit?: (id: string, content: string) => void
  onDelete?: (id: string) => void
}

export default function CommentItem({ 
  comment, 
  currentUserId, 
  currentUserRole,
  onEdit,
  onDelete 
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const canEdit = currentUserId === comment.author.id
  const canDelete = currentUserId === comment.author.id || currentUserRole === 'admin'
  const isEdited = comment.updatedAt !== comment.createdAt

  const handleEdit = async () => {
    if (!onEdit || !editContent.trim()) return
    
    setIsSubmitting(true)
    try {
      await onEdit(comment.id, editContent)
      setIsEditing(false)
    } catch (error) {
      console.error('Error editing comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    
    setIsDeleting(true)
    try {
      await onDelete(comment.id)
    } catch (error) {
      console.error('Error deleting comment:', error)
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isEditing) {
    return (
      <div className="p-4 bg-surface rounded-lg border border-divider">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full p-2 border border-divider rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-background text-text-primary"
          rows={3}
          maxLength={1000}
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-text-secondary">
            {editContent.length}/1000
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false)
                setEditContent(comment.content)
              }}
              className="px-3 py-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              onClick={handleEdit}
              className="px-3 py-1 text-sm bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
              disabled={isSubmitting || !editContent.trim()}
            >
              {isSubmitting ? '수정 중...' : '수정'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-surface rounded-lg border border-divider">
      <div className="flex items-start gap-3">
        {/* 작성자 아바타 */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-white">
            {comment.author.name.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* 작성자 정보 및 날짜 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-text-primary">
              {comment.author.name}
            </span>
            <span className="text-xs text-text-secondary">
              {formatDate(comment.createdAt)}
            </span>
            {isEdited && (
              <span className="text-xs text-text-tertiary">
                (수정됨)
              </span>
            )}
          </div>
          
          {/* 댓글 내용 */}
          <p className="text-text-primary whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          
          {/* 수정/삭제 버튼 */}
          {(canEdit || canDelete) && (
            <div className="flex gap-2 mt-2">
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  수정
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="text-xs text-text-secondary hover:text-danger transition-colors"
                  disabled={isDeleting}
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

