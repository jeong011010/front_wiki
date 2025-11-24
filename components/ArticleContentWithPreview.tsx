'use client'

import { useEffect, useRef } from 'react'
import LinkPreviewOverlay from './LinkPreviewOverlay'

interface ArticleContentWithPreviewProps {
  htmlContent: string
}

/**
 * ArticleContentWithPreview 컴포넌트
 * HTML 콘텐츠를 렌더링하고, 내부의 링크에 미리보기 기능 추가
 */
export default function ArticleContentWithPreview({ htmlContent }: ArticleContentWithPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <div
        ref={contentRef}
        className="prose prose-lg max-w-none text-text-primary"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        data-article-content
      />
      <LinkPreviewOverlay containerRef={contentRef} />
    </>
  )
}
