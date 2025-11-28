'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, toast } from '@/components/ui'
import type { DeleteButtonProps } from '@/types'

export default function DeleteButton({ articleId, articleSlug }: DeleteButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete article')
      }

      // 삭제 성공 토스트
      toast.success('글이 삭제되었습니다.')
      
      // 삭제 성공 시 메인 페이지로 이동
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error deleting article:', error)
      toast.error('글 삭제에 실패했습니다.')
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {showConfirm ? (
        <motion.div
          key="confirm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex gap-2"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="danger"
              size="sm"
            >
              {isDeleting ? '삭제 중...' : '확인'}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              variant="secondary"
              size="sm"
            >
              취소
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="delete"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleDelete}
            variant="danger"
            size="sm"
          >
            삭제
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

