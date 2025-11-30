'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { marked } from 'marked'
import { diffLines, diffWords, Change } from 'diff'
import 'github-markdown-css/github-markdown.css'
import { apiGet, apiPut } from '@/lib/http'

interface Contribution {
  id: string
  type: string
  content: string
  status: string
  reviewComment: string | null
  createdAt: string
  reviewedAt: string | null
  article: {
    id: string
    title: string
    slug: string
    content: string
  }
  contributor: {
    id: string
    name: string
    email: string
  }
  reviewer: {
    id: string
    name: string
  } | null
}

// Diff 뷰 컴포넌트
function DiffView({ original, modified, type, contributionData }: {
  original: string
  modified: string
  type: string
  contributionData: any
}) {
  if (type === 'update' || type === 'correction' || type === 'improvement' || type === 'other') {
    // 전체 내용 수정 - 라인별 diff
    const changes = diffLines(original, modified || original)
    let oldLineNumber = 0
    let newLineNumber = 0

    return (
      <div className="border border-border rounded-lg overflow-hidden bg-background">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-red-600 dark:text-red-400">원본</span>
            <span className="text-green-600 dark:text-green-400">수정본</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-sm">
            <tbody>
              {changes.map((change, index) => {
                const lines = change.value.split('\n')
                // 마지막 빈 줄 제거
                if (lines[lines.length - 1] === '') {
                  lines.pop()
                }

                return lines.map((line, lineIndex) => {
                  let oldNum = null
                  let newNum = null
                  let className = ''
                  let bgColor = ''

                  if (change.added) {
                    newLineNumber++
                    newNum = newLineNumber
                    className = 'bg-green-50 dark:bg-green-900/20'
                    bgColor = 'bg-green-100 dark:bg-green-900/30'
                  } else if (change.removed) {
                    oldLineNumber++
                    oldNum = oldLineNumber
                    className = 'bg-red-50 dark:bg-red-900/20'
                    bgColor = 'bg-red-100 dark:bg-red-900/30'
                  } else {
                    oldLineNumber++
                    newLineNumber++
                    oldNum = oldLineNumber
                    newNum = newLineNumber
                    className = 'bg-background'
                  }

                  return (
                    <tr key={`${index}-${lineIndex}`} className={className}>
                      <td className={`px-4 py-1 text-right border-r border-border text-text-tertiary select-none ${bgColor}`}>
                        {oldNum !== null ? oldNum : ''}
                      </td>
                      <td className={`px-4 py-1 text-right border-r border-border text-text-tertiary select-none ${bgColor}`}>
                        {newNum !== null ? newNum : ''}
                      </td>
                      <td className="px-4 py-1 text-text-primary whitespace-pre-wrap">
                        {change.added && <span className="text-green-700 dark:text-green-300">+ </span>}
                        {change.removed && <span className="text-red-700 dark:text-red-300">- </span>}
                        {!change.added && !change.removed && <span className="text-text-tertiary">  </span>}
                        <span className={change.added ? 'text-green-800 dark:text-green-200' : change.removed ? 'text-red-800 dark:text-red-200 line-through' : ''}>
                          {line || ' '}
                        </span>
                      </td>
                    </tr>
                  )
                })
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  } else if (type === 'addition') {
    // 내용 추가 - 전체 글을 보여주고 추가된 부분 강조
    const insertPosition = contributionData.position?.at ?? contributionData.position?.after ?? original.length
    const beforeText = original.substring(0, insertPosition)
    const afterText = original.substring(insertPosition)
    const addedText = contributionData.newText || ''

    // 전체 내용을 라인으로 분할
    const fullText = beforeText + addedText + afterText
    const originalLines = original.split('\n')
    const fullLines = fullText.split('\n')
    
    // 추가 시작 라인 찾기
    const beforeLines = beforeText.split('\n')
    const insertLineIndex = beforeLines.length - 1

    return (
      <div className="border border-border rounded-lg overflow-hidden bg-background">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-text-secondary">전체 글 (추가된 부분 강조)</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-sm">
            <tbody>
              {fullLines.map((line, index) => {
                const isAdded = index >= insertLineIndex && index < insertLineIndex + addedText.split('\n').length
                const lineNumber = index + 1

                return (
                  <tr key={index} className={isAdded ? 'bg-green-50 dark:bg-green-900/20' : 'bg-background'}>
                    <td className={`px-4 py-1 text-right border-r border-border text-text-tertiary select-none ${isAdded ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
                      {lineNumber}
                    </td>
                    <td className="px-4 py-1 text-text-primary whitespace-pre-wrap">
                      {isAdded && <span className="text-green-700 dark:text-green-300">+ </span>}
                      {!isAdded && <span className="text-text-tertiary">  </span>}
                      <span className={isAdded ? 'text-green-800 dark:text-green-200 font-semibold' : ''}>
                        {line || ' '}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  } else if (type === 'comment') {
    // 코멘트 - 원본 글을 보여주고 코멘트 위치 표시
    const position = contributionData.position
    if (!position) {
      return (
        <div className="border border-border rounded-lg p-4 bg-background">
          <div className="markdown-body">
            <div dangerouslySetInnerHTML={{ __html: marked(original) as string }} />
          </div>
        </div>
      )
    }

    const { start, end } = position
    const beforeText = original.substring(0, start)
    const targetText = original.substring(start, end)
    const afterText = original.substring(end)
    const commentText = contributionData.comment || ''

    // 라인별로 분할하여 표시
    const lines = original.split('\n')
    let currentPos = 0
    let targetStartLine = -1
    let targetEndLine = -1

    lines.forEach((line, index) => {
      const lineStart = currentPos
      const lineEnd = currentPos + line.length
      
      if (start >= lineStart && start < lineEnd) {
        targetStartLine = index
      }
      if (end > lineStart && end <= lineEnd) {
        targetEndLine = index
      }
      
      currentPos += line.length + 1 // +1 for newline
    })

    return (
      <div className="border border-border rounded-lg overflow-hidden bg-background">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-text-secondary">원본 글 (코멘트 대상 강조)</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-sm">
            <tbody>
              {lines.map((line, index) => {
                const isTarget = index >= targetStartLine && index <= targetEndLine
                const lineNumber = index + 1

                return (
                  <tr key={index} className={isTarget ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-background'}>
                    <td className={`px-4 py-1 text-right border-r border-border text-text-tertiary select-none ${isTarget ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>
                      {lineNumber}
                    </td>
                    <td className="px-4 py-1 text-text-primary whitespace-pre-wrap">
                      <span className={isTarget ? 'text-blue-800 dark:text-blue-200 font-semibold bg-blue-100 dark:bg-blue-900/30 px-1 rounded' : ''}>
                        {line || ' '}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border p-4 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-2">코멘트 내용:</div>
          <div className="markdown-body text-sm">
            <div dangerouslySetInnerHTML={{ __html: marked(commentText) as string }} className="text-text-primary" />
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function ReviewContributionList() {
  const router = useRouter()
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null)
  const [reviewComment, setReviewComment] = useState('')

  useEffect(() => {
    fetchContributions()
  }, [])

  const fetchContributions = async () => {
    try {
      const data = await apiGet<{ contributions: Contribution[] }>('/api/articles/contributions/pending')
      setContributions(data.contributions || [])
    } catch (error) {
      console.error('Error fetching contributions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (contributionId: string, status: 'APPROVED' | 'REJECTED') => {
    setReviewing(contributionId)
    try {
      await apiPut(`/api/articles/contributions/${contributionId}/review`, {
        status,
        reviewComment: reviewComment.trim() || undefined,
      })

      // 목록에서 제거
      setContributions(contributions.filter(c => c.id !== contributionId))
      setSelectedContribution(null)
      setReviewComment('')
      router.refresh()
    } catch (error) {
      console.error('Error reviewing contribution:', error)
      alert('기여 검토에 실패했습니다.')
    } finally {
      setReviewing(null)
    }
  }

  const getContributionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CONTENT_UPDATE: '내용 수정',
      CONTENT_ADDITION: '내용 추가',
      COMMENT: '첨언 (코멘트)',
      CORRECTION: '오류 수정',
      IMPROVEMENT: '개선',
      OTHER: '기타',
    }
    return labels[type] || type
  }

  const parseContributionContent = (content: string) => {
    try {
      return JSON.parse(content)
    } catch {
      return { type: 'unknown', description: content }
    }
  }

  if (loading) {
    return <div className="text-text-secondary">로딩 중...</div>
  }

  if (contributions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary text-lg">검토 대기 중인 기여가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {contributions.map((contribution) => {
        const contributionData = parseContributionContent(contribution.content)
        const isSelected = selectedContribution?.id === contribution.id

        // 원본과 수정본 준비
        const originalContent = contribution.article.content
        let modifiedContent = originalContent

        if (contributionData.type === 'update' || contributionData.type === 'correction' || contributionData.type === 'improvement' || contributionData.type === 'other') {
          modifiedContent = contributionData.newContent || originalContent
        } else if (contributionData.type === 'addition') {
          const insertPos = contributionData.position?.at ?? contributionData.position?.after ?? originalContent.length
          const before = originalContent.substring(0, insertPos)
          const after = originalContent.substring(insertPos)
          modifiedContent = before + '\n\n' + (contributionData.newText || '') + '\n\n' + after
        }

        return (
          <div
            key={contribution.id}
            className={`border border-border rounded-lg p-6 bg-surface-hover ${
              isSelected ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-text-primary">
                    <Link
                      href={`/articles/${contribution.article.slug}`}
                      className="hover:text-primary-500 transition-colors"
                    >
                      {contribution.article.title}
                    </Link>
                  </h3>
                  <span className="px-2 py-1 text-xs font-bold rounded bg-blue-500 text-white">
                    {getContributionTypeLabel(contribution.type)}
                  </span>
                </div>
                <div className="text-sm text-text-secondary">
                  <p>기여자: {contribution.contributor.name} ({contribution.contributor.email})</p>
                  <p>기여일: {new Date(contribution.createdAt).toLocaleString('ko-KR')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!isSelected ? (
                  <button
                    onClick={() => setSelectedContribution(contribution)}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all font-medium"
                  >
                    상세보기
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setSelectedContribution(null)
                        setReviewComment('')
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all font-medium"
                    >
                      닫기
                    </button>
                    <button
                      onClick={() => handleReview(contribution.id, 'APPROVED')}
                      disabled={reviewing === contribution.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 font-medium"
                    >
                      {reviewing === contribution.id ? '처리 중...' : '승인'}
                    </button>
                    <button
                      onClick={() => handleReview(contribution.id, 'REJECTED')}
                      disabled={reviewing === contribution.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 font-medium"
                    >
                      {reviewing === contribution.id ? '처리 중...' : '거부'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {isSelected && (
              <div className="border-t border-border pt-4 mt-4 space-y-4">
                {/* 변경 사유 */}
                {contributionData.description && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">변경 사유:</p>
                    <p className="text-sm text-blue-900 dark:text-blue-100">{contributionData.description}</p>
                  </div>
                )}

                {/* Diff 뷰 */}
                <div>
                  <h4 className="font-semibold text-text-primary mb-3">변경 내용 비교:</h4>
                  <DiffView
                    original={originalContent}
                    modified={modifiedContent}
                    type={contributionData.type}
                    contributionData={contributionData}
                  />
                </div>

                {/* 검토 코멘트 입력 */}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    검토 코멘트 (선택사항)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="검토 코멘트를 입력하세요..."
                    className="w-full h-24 px-4 py-3 bg-background border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
