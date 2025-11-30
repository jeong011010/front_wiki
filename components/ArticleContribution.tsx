'use client'

import { useState, useRef, useEffect } from 'react'
import { apiPost } from '@/lib/http'
import { getCurrentUser } from '@/lib/auth-client'
import { Button } from '@/components/ui'
import { marked } from 'marked'
import 'github-markdown-css/github-markdown.css'

interface ArticleContributionProps {
  articleId: string
  articleSlug: string
  articleContent: string
  onClose: () => void
  onSuccess: () => void
}

type ContributionType = 'CONTENT_UPDATE' | 'CONTENT_ADDITION' | 'COMMENT' | 'CORRECTION' | 'IMPROVEMENT' | 'OTHER'

export default function ArticleContribution({
  articleId,
  articleSlug,
  articleContent,
  onClose,
  onSuccess,
}: ArticleContributionProps) {
  const [selectedText, setSelectedText] = useState('')
  const [selectionStart, setSelectionStart] = useState<number | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null)
  const [insertPosition, setInsertPosition] = useState<number | null>(null) // 내용 추가 위치
  const [contributionType, setContributionType] = useState<ContributionType>('CONTENT_UPDATE')
  const [editedContent, setEditedContent] = useState(articleContent) // 편집된 마크다운
  const [newContent, setNewContent] = useState('') // 코멘트용
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'markdown' | 'preview' | 'split'>('split')
  const markdownRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // 마크다운 뷰에서 텍스트 선택 및 클릭 감지
  useEffect(() => {
    if (viewMode !== 'markdown' || !markdownRef.current) return

    const textarea = markdownRef.current
    
    // 텍스트 선택 감지
    const handleSelection = () => {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      
      if (start !== end && start < end) {
        const text = articleContent.substring(start, end).trim()
        if (text) {
          setSelectedText(text)
          setSelectionStart(start)
          setSelectionEnd(end)
          // 내용 추가 모드에서 범위 선택 시 끝 위치에 추가
          if (contributionType === 'CONTENT_ADDITION') {
            setInsertPosition(end)
          }
        } else {
          setSelectedText('')
          setSelectionStart(null)
          setSelectionEnd(null)
        }
      } else {
        setSelectedText('')
        setSelectionStart(null)
        setSelectionEnd(null)
      }
    }

    // 클릭 위치 감지 (내용 추가 모드)
    const handleClick = (e: MouseEvent) => {
      if (contributionType === 'CONTENT_ADDITION') {
        const target = e.target as HTMLTextAreaElement
        if (target === textarea) {
          // 클릭한 위치의 커서 위치를 가져옴
          const position = textarea.selectionStart
          setInsertPosition(position)
          // 선택된 텍스트가 없으면 클릭 위치만 저장하고 선택 해제
          if (textarea.selectionStart === textarea.selectionEnd) {
            setSelectedText('')
            setSelectionStart(null)
            setSelectionEnd(null)
          }
        }
      }
    }

    // 커서 이동 감지 (내용 추가 모드에서 커서 위치 변경 시)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (contributionType === 'CONTENT_ADDITION' && markdownRef.current) {
        // 화살표 키나 다른 키로 커서 이동 시 위치 업데이트
        setTimeout(() => {
          if (markdownRef.current) {
            const position = markdownRef.current.selectionStart
            if (markdownRef.current.selectionStart === markdownRef.current.selectionEnd) {
              setInsertPosition(position)
            }
          }
        }, 0)
      }
    }

    textarea.addEventListener('mouseup', handleSelection)
    textarea.addEventListener('click', handleClick)
    textarea.addEventListener('keyup', handleSelection)
    textarea.addEventListener('keydown', handleKeyDown)
    textarea.addEventListener('select', handleSelection)

    return () => {
      textarea.removeEventListener('mouseup', handleSelection)
      textarea.removeEventListener('click', handleClick)
      textarea.removeEventListener('keyup', handleSelection)
      textarea.removeEventListener('keydown', handleKeyDown)
      textarea.removeEventListener('select', handleSelection)
    }
  }, [viewMode, articleContent, contributionType])

  // 미리보기 뷰에서 텍스트 선택 및 클릭 감지 (HTML에서 마크다운 위치로 변환)
  useEffect(() => {
    if (viewMode !== 'preview' || !previewRef.current) return

    const handleSelection = () => {
      const selection = window.getSelection()
      if (selection && selection.toString().trim() && previewRef.current?.contains(selection.anchorNode)) {
        const text = selection.toString().trim()
        setSelectedText(text)
        
        // HTML에서 선택된 텍스트를 마크다운 원본의 위치로 변환
        const index = articleContent.indexOf(text)
        if (index !== -1) {
          setSelectionStart(index)
          setSelectionEnd(index + text.length)
          // 내용 추가 모드에서 범위 선택 시 끝 위치에 추가
          if (contributionType === 'CONTENT_ADDITION') {
            setInsertPosition(index + text.length)
          }
        } else {
          // 정확한 매칭 실패 시 부분 매칭 시도
          const words = text.split(/\s+/).filter(w => w.length > 2)
          if (words.length > 0) {
            const firstWord = words[0]
            const firstIndex = articleContent.indexOf(firstWord)
            if (firstIndex !== -1) {
              setSelectionStart(firstIndex)
              setSelectionEnd(firstIndex + text.length)
              if (contributionType === 'CONTENT_ADDITION') {
                setInsertPosition(firstIndex + text.length)
              }
            }
          }
        }
      } else {
        setSelectedText('')
        setSelectionStart(null)
        setSelectionEnd(null)
      }
    }

    // 미리보기에서 클릭 위치 감지 (내용 추가 모드)
    const handleClick = (e: MouseEvent) => {
      if (contributionType === 'CONTENT_ADDITION' && previewRef.current?.contains(e.target as Node)) {
        // 클릭 위치를 마크다운 위치로 변환하는 것은 복잡하므로
        // 사용자에게 마크다운 뷰에서 위치를 지정하도록 안내
        // 여기서는 선택된 텍스트가 없을 때만 처리
        const selection = window.getSelection()
        if (!selection || !selection.toString().trim()) {
          // 클릭만으로는 정확한 위치를 알기 어려우므로 마크다운 뷰 사용 권장
        }
      }
    }

    document.addEventListener('selectionchange', handleSelection)
    const previewElement = previewRef.current
    previewElement?.addEventListener('click', handleClick)
    
    return () => {
      document.removeEventListener('selectionchange', handleSelection)
      previewElement?.removeEventListener('click', handleClick)
    }
  }, [viewMode, articleContent, contributionType])

  const handleSubmit = async () => {
    // 유형별 검증
    if (contributionType === 'CONTENT_UPDATE') {
      // 편집된 내용이 원본과 다른지 확인
      if (editedContent === articleContent) {
        setError('내용이 변경되지 않았습니다. 수정할 내용을 입력해주세요.')
        return
      }
    } else if (contributionType === 'COMMENT') {
      if (!selectedText) {
        setError('코멘트를 남길 텍스트를 선택해주세요.')
        return
      }
      if (!newContent.trim()) {
        setError('코멘트 내용을 입력해주세요.')
        return
      }
    } else if (contributionType === 'CONTENT_ADDITION') {
      // 편집된 내용이 원본보다 긴지 확인
      if (editedContent.length <= articleContent.length) {
        setError('추가할 내용을 입력해주세요.')
        return
      }
    } else {
      // CORRECTION, IMPROVEMENT, OTHER
      if (editedContent === articleContent) {
        setError('내용이 변경되지 않았습니다. 수정할 내용을 입력해주세요.')
        return
      }
    }

    if (!description.trim()) {
      setError('변경 사유를 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const user = await getCurrentUser()
      if (!user) {
        window.location.href = `/auth/login?redirect=/articles/${articleSlug}`
        return
      }

      // 기여 내용 구성
      let content = ''
      if (contributionType === 'CONTENT_UPDATE') {
        // 전체 편집된 내용을 저장
        content = JSON.stringify({
          type: 'update',
          originalContent: articleContent,
          newContent: editedContent,
          description,
        })
      } else if (contributionType === 'COMMENT') {
        content = JSON.stringify({
          type: 'comment',
          targetText: selectedText,
          comment: newContent,
          position: { start: selectionStart, end: selectionEnd },
          description,
        })
      } else if (contributionType === 'CONTENT_ADDITION') {
        // 추가된 부분만 추출
        const addedContent = editedContent.substring(articleContent.length)
        const position = insertPosition !== null 
          ? { at: insertPosition }
          : selectionEnd !== null
          ? { after: selectionEnd }
          : { atEnd: true }
        content = JSON.stringify({
          type: 'addition',
          newText: addedContent,
          position,
          description,
        })
      } else {
        // CORRECTION, IMPROVEMENT, OTHER - 전체 편집된 내용 저장
        content = JSON.stringify({
          type: contributionType.toLowerCase(),
          originalContent: articleContent,
          newContent: editedContent,
          description,
        })
      }

      await apiPost(`/api/articles/${articleId}/contribute`, {
        type: contributionType,
        content,
      })

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '기여 제출에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contributionTypeLabels: Record<ContributionType, string> = {
    CONTENT_UPDATE: '내용 수정',
    CONTENT_ADDITION: '내용 추가',
    COMMENT: '첨언 (코멘트)',
    CORRECTION: '오류 수정',
    IMPROVEMENT: '개선',
    OTHER: '기타',
  }

  // 기여 유형 변경 시 상태 초기화
  const handleTypeChange = (type: ContributionType) => {
    setContributionType(type)
    if (type !== 'CONTENT_ADDITION') {
      setInsertPosition(null)
    }
    if (type === 'COMMENT') {
      setNewContent('')
      setEditedContent(articleContent) // 코멘트는 원본 유지
    } else {
      // 다른 유형은 편집된 내용 유지
    }
  }

  // 편집된 내용의 HTML 미리보기
  const editedHtmlContent = marked(editedContent) as string

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-text-primary">글 기여하기</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 본문 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* 안내 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>사용 방법:</strong> 아래 글 내용에서 수정하거나 추가하고 싶은 텍스트를 선택한 후, 기여 유형을 선택하고 변경 내용을 입력하세요.
              </p>
            </div>

            {/* 뷰 모드 전환 */}
            <div className="flex gap-2 border-b border-border">
              <button
                onClick={() => setViewMode('markdown')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  viewMode === 'markdown'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                마크다운 편집
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  viewMode === 'preview'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                미리보기
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  viewMode === 'split'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                분할 보기
              </button>
            </div>

            {/* 글 내용 표시 */}
            {viewMode === 'split' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border border-border rounded-lg overflow-hidden">
                {/* 마크다운 편집 */}
                <div className="border-r border-border">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-text-secondary">
                    마크다운 편집
                  </div>
                  <textarea
                    ref={markdownRef}
                    value={editedContent}
                    onChange={(e) => {
                      setEditedContent(e.target.value)
                      // 코멘트 모드가 아니면 자동으로 내용 업데이트
                      if (contributionType !== 'COMMENT') {
                        // 변경사항 추적
                      }
                    }}
                    className="w-full h-96 px-4 py-3 bg-background text-text-primary font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                    placeholder="마크다운을 직접 편집하세요..."
                  />
                </div>
                {/* 미리보기 */}
                <div className="overflow-y-auto">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-text-secondary">
                    미리보기
                  </div>
                  <div
                    ref={previewRef}
                    className="prose prose-lg max-w-none p-6 bg-background markdown-body"
                    dangerouslySetInnerHTML={{ __html: editedHtmlContent }}
                    style={{ userSelect: 'text', minHeight: '384px' }}
                  />
                </div>
              </div>
            ) : viewMode === 'markdown' ? (
              <div className="border border-border rounded-lg overflow-hidden relative">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-text-secondary">
                  마크다운 편집
                </div>
                <textarea
                  ref={markdownRef}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-96 px-4 py-3 bg-background text-text-primary font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  placeholder="마크다운을 직접 편집하세요..."
                />
                {contributionType === 'CONTENT_ADDITION' && insertPosition !== null && (
                  <div className="absolute top-12 right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                    위치: {insertPosition}번째 문자
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-text-secondary">
                  미리보기 (편집된 내용)
                </div>
                <div
                  ref={previewRef}
                  className="prose prose-lg max-w-none p-6 bg-background markdown-body"
                  dangerouslySetInnerHTML={{ __html: editedHtmlContent }}
                  style={{ userSelect: 'text', minHeight: '384px' }}
                />
              </div>
            )}

            {/* 변경사항 표시 */}
            {editedContent !== articleContent && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-xs text-green-800 dark:text-green-200 font-semibold mb-1">
                  ✓ 내용이 변경되었습니다
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  원본: {articleContent.length}자 → 편집본: {editedContent.length}자 
                  ({editedContent.length > articleContent.length ? '+' : ''}{editedContent.length - articleContent.length}자)
                </p>
              </div>
            )}

            {/* 선택된 텍스트/위치 표시 */}
            {(selectedText || (contributionType === 'CONTENT_ADDITION' && insertPosition !== null)) && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-2">
                {selectedText && (
                  <>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 font-semibold">
                      ✓ 선택된 텍스트 (위치: {selectionStart !== null ? `${selectionStart}~${selectionEnd}` : '알 수 없음'})
                    </p>
                    <p className="text-sm text-text-primary font-medium bg-white dark:bg-gray-800 p-3 rounded border border-yellow-300 dark:border-yellow-700">
                      &quot;{selectedText}&quot;
                    </p>
                  </>
                )}
                {contributionType === 'CONTENT_ADDITION' && insertPosition !== null && (
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    📍 내용 추가 위치: {insertPosition}번째 문자 {selectedText ? '뒤' : '위치'}
                  </p>
                )}
              </div>
            )}

            {/* 기여 유형 선택 */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                기여 유형
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(contributionTypeLabels) as ContributionType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      contributionType === type
                        ? 'bg-primary-500 text-white'
                        : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover'
                    }`}
                  >
                    {contributionTypeLabels[type]}
                  </button>
                ))}
              </div>
              {/* 기여 유형별 안내 */}
              <div className="mt-2 text-xs text-text-secondary">
                {contributionType === 'CONTENT_UPDATE' && '📝 텍스트를 선택하고 수정된 내용을 입력하세요.'}
                {contributionType === 'COMMENT' && '💬 텍스트를 선택하고 해당 부분에 대한 코멘트를 입력하세요.'}
                {contributionType === 'CONTENT_ADDITION' && '➕ 텍스트를 선택하거나 클릭하여 추가할 위치를 지정한 후 내용을 입력하세요.'}
                {contributionType === 'CORRECTION' && '🔧 오류가 있는 텍스트를 선택하고 정확한 내용으로 수정하세요.'}
                {contributionType === 'IMPROVEMENT' && '✨ 개선할 텍스트를 선택하고 개선된 내용을 입력하세요.'}
                {contributionType === 'OTHER' && '📌 기타 변경 사항을 입력하세요.'}
              </div>
            </div>

            {/* 코멘트 내용 입력 (COMMENT 모드만) */}
            {contributionType === 'COMMENT' && (
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  코멘트 내용
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={
                    selectedText
                      ? `"${selectedText}"에 대한 코멘트를 입력하세요...`
                      : '코멘트를 남길 텍스트를 먼저 선택하세요...'
                  }
                  className="w-full h-32 px-4 py-3 bg-background border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                />
              </div>
            )}

            {/* 변경 사유 */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                변경 사유 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="이 변경이 왜 필요한지, 어떤 개선을 하는지 설명해주세요..."
                className="w-full h-24 px-4 py-3 bg-background border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                required
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 - 버튼 */}
        <div className="flex gap-3 justify-end p-6 border-t border-border bg-surface">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '제출 중...' : '기여 제출'}
          </Button>
        </div>
      </div>
    </div>
  )
}

