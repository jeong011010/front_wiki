/**
 * 마크다운 헤딩 관련 유틸리티 함수 (서버 사이드)
 */

export interface Heading {
  id: string
  text: string
  level: number
}

/**
 * 마크다운 텍스트에서 헤딩을 추출하는 함수
 */
export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = []
  const lines = content.split('\n')
  
  for (const line of lines) {
    // 마크다운 헤딩 패턴: #, ##, ### 등
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      
      // ID 생성: 텍스트를 URL-friendly한 형태로 변환
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // 특수문자 제거
        .replace(/\s+/g, '-') // 공백을 하이픈으로
        .replace(/-+/g, '-') // 연속된 하이픈을 하나로
        .trim()
      
      headings.push({ id, text, level })
    }
  }
  
  return headings
}

/**
 * HTML 헤딩에 ID를 부여하는 함수 (서버 사이드)
 */
export function addHeadingIds(html: string, content: string): string {
  const headings = extractHeadings(content)
  let result = html
  let headingIndex = 0
  
  // 모든 헤딩 태그를 찾아서 ID 추가
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi
  let match
  
  while ((match = headingRegex.exec(html)) !== null && headingIndex < headings.length) {
    const heading = headings[headingIndex]
    const level = parseInt(match[1])
    const fullMatch = match[0]
    
    // 레벨이 일치하는 경우에만 ID 추가
    if (level === heading.level) {
      const id = heading.id
      
      // 이미 id가 있는지 확인
      if (!fullMatch.includes(`id="${id}"`)) {
        // 헤딩 태그에 ID 추가
        const newHeading = fullMatch.replace(
          /<h([1-6])[^>]*>/i,
          `<h${level} id="${id}" class="scroll-mt-20">`
        )
        result = result.replace(fullMatch, newHeading)
      }
      headingIndex++
    }
  }
  
  return result
}

