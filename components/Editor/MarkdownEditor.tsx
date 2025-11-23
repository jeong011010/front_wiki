'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { AutoLinkEditorProps, DetectedLink, ArticleBasic } from '@/types'
import { escapeRegex } from '@/lib/link-detector'
import { marked } from 'marked'
import 'github-markdown-css/github-markdown.css'

interface MarkdownEditorProps {
  initialTitle?: string
  initialContent?: string
  articleId?: string
}

interface LinkSuggestion {
  keyword: string
  articles: ArticleBasic[]
  position: { top: number; left: number }
}

export default function MarkdownEditor({
  initialTitle = '',
  initialContent = '',
  articleId,
}: MarkdownEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detectedLinks, setDetectedLinks] = useState<DetectedLink[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [suggestions, setSuggestions] = useState<LinkSuggestion | null>(null)
  const [keywords, setKeywords] = useState<ArticleBasic[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 키워드 목록 로드
  useEffect(() => {
    fetch('/api/keywords')
      .then((res) => res.json())
      .then((data: ArticleBasic[]) => {
        setKeywords(data)
      })
      .catch((error) => {
        console.error('Failed to load keywords:', error)
      })
  }, [])

  // 링크 감지
  useEffect(() => {
    if (!content.trim()) {
      setDetectedLinks([])
      return
    }

    const detectLinks = async () => {
      try {
        const response = await fetch('/api/keywords/detect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: content,
            excludeArticleId: articleId,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to detect links')
        }

        const validLinks: DetectedLink[] = await response.json()
        setDetectedLinks(validLinks)
      } catch (error) {
        console.error('Error detecting links:', error)
      }
    }

    const timeoutId = setTimeout(detectLinks, 500)
    return () => clearTimeout(timeoutId)
  }, [content, articleId])

  // 텍스트 포맷팅 함수들
  const insertText = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)
    
    setContent(newText)
    
    // 커서 위치 복원
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [content])

  const wrapText = useCallback((before: string, after?: string) => {
    insertText(before, after || before)
  }, [insertText])

  const insertLine = useCallback((prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lines = content.split('\n')
    let currentLine = 0
    let charCount = 0
    
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        currentLine = i
        break
      }
      charCount += lines[i].length + 1
    }

    lines[currentLine] = prefix + lines[currentLine]
    const newContent = lines.join('\n')
    setContent(newContent)
    
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + prefix.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [content])

  // textarea에서 특정 위치의 좌표 계산 (단어 끝 위치)
  const getTextPosition = useCallback((textarea: HTMLTextAreaElement, position: number) => {
    const textareaRect = textarea.getBoundingClientRect()
    const textBefore = textarea.value.substring(0, position)
    const lines = textBefore.split('\n')
    const currentLine = lines.length - 1
    const currentLineText = lines[currentLine] || ''
    
    // 현재 라인의 시작 위치 계산
    const lineStart = textBefore.length - currentLineText.length
    const charPosition = position - lineStart
    
    // textarea의 스타일 가져오기
    const computedStyle = window.getComputedStyle(textarea)
    const lineHeight = parseFloat(computedStyle.lineHeight) || 20
    const paddingTop = parseFloat(computedStyle.paddingTop) || 10
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 16
    
    // 임시 div를 만들어서 정확한 위치 계산
    const mirror = document.createElement('div')
    const mirrorStyle = mirror.style
    mirrorStyle.position = 'absolute'
    mirrorStyle.visibility = 'hidden'
    mirrorStyle.whiteSpace = 'pre-wrap'
    mirrorStyle.font = computedStyle.font
    mirrorStyle.width = `${textarea.offsetWidth}px`
    mirrorStyle.padding = computedStyle.padding
    mirrorStyle.border = computedStyle.border
    mirrorStyle.boxSizing = 'border-box'
    mirrorStyle.wordWrap = 'break-word'
    mirrorStyle.overflow = 'hidden'
    mirrorStyle.fontFamily = computedStyle.fontFamily
    mirrorStyle.fontSize = computedStyle.fontSize
    mirrorStyle.fontWeight = computedStyle.fontWeight
    mirrorStyle.letterSpacing = computedStyle.letterSpacing
    
    // 현재 라인까지의 텍스트 설정
    const textUpToLine = lines.slice(0, currentLine + 1).join('\n')
    mirror.textContent = textUpToLine
    
    document.body.appendChild(mirror)
    
    // 현재 라인의 시작 위치 찾기
    const lineStartText = lines.slice(0, currentLine).join('\n') + (currentLine > 0 ? '\n' : '')
    const lineStartSpan = document.createElement('span')
    lineStartSpan.textContent = lineStartText
    mirror.innerHTML = ''
    mirror.appendChild(lineStartSpan)
    
    const lineStartRect = lineStartSpan.getBoundingClientRect()
    
    // 단어 끝까지의 텍스트
    const wordEndSpan = document.createElement('span')
    wordEndSpan.textContent = currentLineText.substring(0, charPosition)
    mirror.appendChild(wordEndSpan)
    
    const wordEndRect = wordEndSpan.getBoundingClientRect()
    
    // 정리
    document.body.removeChild(mirror)
    
    // 최종 위치 계산 (단어 끝 위치)
    const top = textareaRect.top + paddingTop + (currentLine * lineHeight) - textarea.scrollTop + lineHeight
    const left = textareaRect.left + paddingLeft + (wordEndRect.left - lineStartRect.left) - textarea.scrollLeft
    
    return { top, left }
  }, [])

  // 실시간 링크 제안 처리
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    
    const textarea = e.target
    const cursorPosition = textarea.selectionStart
    
    // 커서 위치 주변의 단어 추출
    const textBeforeCursor = newContent.substring(0, cursorPosition)
    
    // 한글, 영문, 숫자로 이루어진 단어 매칭 (앞에서부터)
    const wordMatch = textBeforeCursor.match(/([a-zA-Z0-9가-힣]+)$/)
    
    if (wordMatch && wordMatch[1].length > 0) {
      const currentWord = wordMatch[1]
      
      // 현재 단어와 매칭되는 키워드 찾기
      const matchingKeywords = keywords.filter((kw) => {
        const kwTitle = kw.title.toLowerCase()
        const word = currentWord.toLowerCase()
        return kwTitle.includes(word) || word.includes(kwTitle) || kwTitle === word
      })
      
      if (matchingKeywords.length > 0) {
        // 단어의 끝 위치 계산
        const wordEndPosition = cursorPosition
        const position = getTextPosition(textarea, wordEndPosition)
        
        setSuggestions({
          keyword: currentWord,
          articles: matchingKeywords,
          position,
        })
      } else {
        setSuggestions(null)
      }
    } else {
      setSuggestions(null)
    }
  }, [keywords, getTextPosition])

  // 제안에서 링크 선택
  const handleSuggestionClick = useCallback((article: ArticleBasic, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const textarea = textareaRef.current
    if (!textarea || !suggestions) return

    const cursorPosition = textarea.selectionStart
    const textBeforeCursor = content.substring(0, cursorPosition)
    
    // 현재 단어 찾기
    const wordMatch = textBeforeCursor.match(/([a-zA-Z0-9가-힣]+)$/)
    if (!wordMatch) return

    const currentWord = wordMatch[1]
    const wordStart = cursorPosition - currentWord.length
    
    // 링크 형식으로 교체
    const before = content.substring(0, wordStart)
    const after = content.substring(cursorPosition)
    const newContent = before + `[${article.title}](/articles/${article.slug})` + after
    
    setContent(newContent)
    setSuggestions(null)
    
    // 커서 위치 복원
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = wordStart + `[${article.title}](/articles/${article.slug})`.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [content, suggestions])

  // 이미지 파일 처리 (서버 업로드)
  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.')
      return
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.')
      return
    }

    setIsUploading(true)
    try {
      // 서버에 이미지 업로드
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '이미지 업로드에 실패했습니다.')
      }

      const { url, fileName } = await response.json()
      const imageMarkdown = `![${file.name}](${url})`
      
      // 커서 위치에 이미지 삽입
      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const before = content.substring(0, start)
        const after = content.substring(end)
        const newContent = before + imageMarkdown + after
        
        setContent(newContent)
        
        // 커서 위치 조정
        setTimeout(() => {
          textarea.focus()
          const newCursorPos = start + imageMarkdown.length
          textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
      }
    } catch (error) {
      console.error('Image upload error:', error)
      const errorMessage = error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.'
      alert(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [content])

  // 드래그 앤 드롭 처리
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length > 0) {
      handleImageUpload(imageFiles[0]) // 첫 번째 이미지만 처리
    }
  }, [handleImageUpload])

  // 파일 선택 처리
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleImageUpload(files[0])
    }
    // 같은 파일을 다시 선택할 수 있도록 리셋
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleImageUpload])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = articleId ? `/api/articles/${articleId}` : '/api/articles'
      const method = articleId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.message || 'Failed to save article'
        throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
      }

      const article = await response.json()
      router.push(`/articles/${article.slug}`)
    } catch (error) {
      console.error('Error saving article:', error)
      const errorMessage = error instanceof Error ? error.message : '글 저장에 실패했습니다.'
      alert(`글 저장에 실패했습니다.\n\n${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 마크다운을 HTML로 변환 (marked 사용)
  const markdownToHtml = useCallback((md: string): string => {
    // 먼저 marked로 마크다운을 HTML로 변환
    let html = marked(md, {
      breaks: true, // 줄바꿈을 <br>로 변환
      gfm: true, // GitHub Flavored Markdown 사용
    }) as string
    
    // marked가 이미 마크다운을 HTML로 변환했으므로, 자동 링크만 추가
    // HTML 태그 안이 아닌 텍스트 노드에만 자동 링크 적용
    const sortedLinks = [...detectedLinks].sort((a, b) => b.keyword.length - a.keyword.length)
    const processedIndices = new Set<number>()
    
    for (const link of sortedLinks) {
      const keyword = link.keyword
      const slug = link.slug || link.articleId
      const escapedKeyword = escapeRegex(keyword)
      const hasKorean = /[가-힣]/.test(keyword)
      
      const regex = hasKorean
        ? new RegExp(`(^|[\\s\\n\\r.,!?;:()\\[\\]{}"'<>/\\\\-])${escapedKeyword}(?=[\\s\\n\\r.,!?;:()\\[\\]{}"'<>/\\\\-]|$)`, 'gi')
        : new RegExp(`\\b${escapedKeyword}\\b`, 'gi')
      
      let match
      const matches: Array<{ index: number; length: number; text: string }> = []
      
      while ((match = regex.exec(html)) !== null) {
        const boundaryChar = match[1] || ''
        const keywordStart = match.index + boundaryChar.length
        const keywordEnd = keywordStart + keyword.length
        
        // 이미 처리된 범위인지 확인
        let isProcessed = false
        for (let i = keywordStart; i < keywordEnd; i++) {
          if (processedIndices.has(i)) {
            isProcessed = true
            break
          }
        }
        
        if (isProcessed) continue
        
        // 이미 링크 태그 안에 있는지 확인
        const beforeMatch = html.substring(0, keywordStart)
        const lastOpenTag = beforeMatch.lastIndexOf('<a')
        const lastCloseTag = beforeMatch.lastIndexOf('</a>')
        
        if (lastOpenTag > lastCloseTag) {
          // 이미 링크 태그 안에 있음
          continue
        }
        
        // 마크다운 링크 형식인지 확인
        const beforeKeyword = html.substring(Math.max(0, keywordStart - 2), keywordStart)
        const afterKeyword = html.substring(keywordEnd, Math.min(html.length, keywordEnd + 1))
        
        if (beforeKeyword.includes('[') && afterKeyword.includes('](')) {
          // 마크다운 링크 형식 안에 있음
          continue
        }
        
        matches.push({
          index: keywordStart,
          length: keyword.length,
          text: keyword,
        })
      }
      
      // 뒤에서부터 처리 (인덱스 변경 방지)
      for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i]
        const before = html.substring(0, match.index)
        const after = html.substring(match.index + match.length)
        const replacement = `<a href="/articles/${slug}" class="text-link hover:text-link-hover underline font-medium">${match.text}</a>`
        
        html = before + replacement + after
        
        // 처리된 인덱스 기록
        for (let j = match.index; j < match.index + replacement.length; j++) {
          processedIndices.add(j)
        }
      }
    }
    
    // marked가 이미 모든 마크다운을 HTML로 변환했으므로, 자동 링크만 추가
    
    return html
  }, [detectedLinks])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2 text-text-primary">
          제목
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-text-primary placeholder:text-text-tertiary transition-all"
          placeholder="글 제목을 입력하세요"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="content" className="block text-sm font-medium text-text-primary">
            내용
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-1 text-xs bg-secondary-300 text-text-primary rounded hover:bg-secondary-500 transition-all"
          >
            {showPreview ? '편집' : '미리보기'}
          </button>
        </div>

        {/* 툴바 */}
        <div className="flex flex-wrap gap-2 p-2 bg-surface-hover border border-border rounded-t-lg">
          <button
            type="button"
            onClick={() => wrapText('**', '**')}
            className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-hover transition-all font-bold"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => wrapText('*', '*')}
            className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-hover transition-all italic"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertText('[', '](url)')}
            className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-hover transition-all"
            title="Link"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-hover transition-all"
            title="이미지 업로드"
            disabled={isUploading}
          >
            {isUploading ? '업로드 중...' : '🖼️'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => insertLine('# ')}
            className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-hover transition-all"
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => insertLine('## ')}
            className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-hover transition-all"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertLine('### ')}
            className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-hover transition-all"
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => insertText('- ')}
            className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-hover transition-all"
            title="List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => insertText('1. ')}
            className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-hover transition-all"
            title="Numbered List"
          >
            1. List
          </button>
          <button
            type="button"
            onClick={() => insertText('> ')}
            className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-hover transition-all"
            title="Quote"
          >
            " Quote
          </button>
          <button
            type="button"
            onClick={() => insertText('```\n', '\n```')}
            className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-hover transition-all"
            title="Code Block"
          >
            {'</>'}
          </button>
          <button
            type="button"
            onClick={() => insertText('`', '`')}
            className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-hover transition-all font-mono"
            title="Inline Code"
          >
            {'</>'}
          </button>
          <button
            type="button"
            onClick={() => insertText('\n---\n')}
            className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-hover transition-all"
            title="Horizontal Rule"
          >
            ───
          </button>
        </div>

        {showPreview ? (
          <div className="w-full px-4 py-2.5 bg-surface border-x border-b border-border rounded-b-lg min-h-[400px] markdown-body">
            <div
              dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
            />
          </div>
        ) : (
          <div 
            className="relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 bg-primary-500/10 border-2 border-dashed border-primary-500 rounded-b-lg z-20 flex items-center justify-center">
                <p className="text-primary-500 font-medium">이미지를 여기에 놓으세요</p>
              </div>
            )}
            <textarea
              ref={textareaRef}
              id="content"
              value={content}
              onChange={handleContentChange}
              onKeyDown={(e) => {
                // 백스페이스나 다른 키 입력 시 제안 닫기
                if (e.key === 'Backspace' || e.key === 'Escape') {
                  setSuggestions(null)
                }
              }}
              onBlur={() => {
                // 포커스를 잃을 때 약간의 지연 후 제안 닫기 (클릭 이벤트 처리 후)
                setTimeout(() => {
                  setSuggestions(null)
                }, 200)
              }}
              className="w-full px-4 py-2.5 bg-surface border-x border-b border-border rounded-b-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[400px] text-sm text-text-primary placeholder:text-text-tertiary transition-all resize-y font-mono"
              placeholder="글 내용을 입력하세요. 기존 글의 제목을 입력하면 자동으로 링크가 생성됩니다. 이미지를 드래그 앤 드롭하거나 이미지 버튼을 클릭하여 업로드할 수 있습니다."
              required
            />
            
            {/* 실시간 링크 제안 드롭다운 */}
            {suggestions && suggestions.articles.length > 0 && (
              <div
                ref={suggestionRef}
                className="fixed z-50 bg-surface border border-border rounded-lg shadow-xl p-3 max-w-sm"
                style={{
                  top: `${suggestions.position.top}px`,
                  left: `${suggestions.position.left}px`,
                }}
                onMouseDown={(e) => e.preventDefault()} // textarea blur 방지
              >
                <div className="text-xs font-medium text-text-secondary mb-2">
                  &quot;{suggestions.keyword}&quot;에 대한 링크:
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {suggestions.articles.map((article) => (
                    <button
                      key={article.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSuggestionClick(article, e)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-surface-hover rounded cursor-pointer text-sm text-text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="text-link">→</span>
                      <span className="font-medium">{article.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 감지된 링크 정보 표시 */}
        {detectedLinks.length > 0 && (
          <div className="mt-3 p-4 bg-surface-hover border border-border rounded-lg">
            <div className="text-sm font-medium text-text-primary mb-3">
              자동 감지된 링크 ({detectedLinks.length}개):
            </div>
            <div className="flex flex-wrap gap-2">
              {detectedLinks.map((link, idx) => (
                <span
                  key={`${link.keyword}-${link.articleId}-${idx}`}
                  className="px-2 py-1 bg-link text-white text-xs rounded font-medium"
                >
                  {link.keyword} → {link.title}
                </span>
              ))}
            </div>
            <p className="text-xs text-text-secondary mt-3">
              💡 위 키워드들이 자동으로 하이퍼링크로 변환됩니다.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all hover:shadow-md"
        >
          {isSubmitting ? '저장 중...' : articleId ? '수정' : '작성'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-secondary-300 text-text-primary rounded-lg hover:bg-secondary-500 font-medium transition-all"
        >
          취소
        </button>
      </div>
    </form>
  )
}

