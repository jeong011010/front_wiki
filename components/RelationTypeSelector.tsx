'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RelationTypeSelectorProps, RelationType } from '@/types'

const relationTypes: Array<{
  value: RelationType
  label: string
  bgColor: string
  textColor: string
}> = [
  { value: 'auto', label: '자동', bgColor: 'var(--badge-auto-bg)', textColor: 'var(--badge-auto-text)' },
  { value: 'parent-child', label: '부모-자식', bgColor: 'var(--badge-primary-bg)', textColor: 'var(--badge-primary-text)' },
  { value: 'related', label: '관련', bgColor: 'var(--badge-secondary-bg)', textColor: 'var(--badge-secondary-text)' },
  { value: 'reference', label: '참조', bgColor: 'var(--badge-reference-bg)', textColor: 'var(--badge-reference-text)' },
]

export default function RelationTypeSelector({
  fromArticleId,
  toArticleId,
  keyword,
  currentType,
}: RelationTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const currentTypeInfo = relationTypes.find((t) => t.value === currentType) || relationTypes[0]
  
  // currentTypeInfo가 없을 경우를 대비
  if (!currentTypeInfo) {
    return null
  }

  const handleTypeChange = async (newType: RelationType) => {
    if (newType === currentType) {
      setIsOpen(false)
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/articles/${fromArticleId}/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toArticleId,
          keyword,
          relationType: newType,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update relation type')
      }

      // 페이지 새로고침하여 변경사항 반영
      router.refresh()
      setIsOpen(false)
    } catch (error) {
      console.error('Error updating relation type:', error)
      alert('관계 유형 변경에 실패했습니다.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        title="클릭하여 관계 유형 변경"
        className="px-2 py-0.5 text-xs rounded-full hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer border border-transparent"
        style={{ 
          backgroundColor: currentTypeInfo.bgColor, 
          color: currentTypeInfo.textColor 
        }}
      >
        {isUpdating ? '변경 중...' : currentTypeInfo.label}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-1 w-36 bg-surface border border-border rounded-lg shadow-lg z-20">
            {relationTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeChange(type.value)}
                className={`w-full text-left px-3 py-2 text-sm first:rounded-t-lg last:rounded-b-lg transition-colors ${
                  type.value === currentType ? 'bg-primary-300 bg-opacity-20' : 'hover:bg-surface-hover'
                }`}
              >
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: type.bgColor, color: type.textColor }}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

