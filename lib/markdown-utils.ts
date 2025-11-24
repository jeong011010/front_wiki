/**
 * 마크다운 헤딩 관련 유틸리티 함수
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
  const idMap = new Map<string, number>()
  
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      
      // ID 생성
      let baseId = text
        .toLowerCase()
        .replace(/[^\w\s-가-힣]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .trim()
      
      if (!baseId) {
        baseId = `heading-${headings.length + 1}`
      }
      
      // 중복 ID 처리
      const count = idMap.get(baseId) || 0
      idMap.set(baseId, count + 1)
      
      const id = count > 0 ? `${baseId}-${count}` : baseId
      
      headings.push({ id, text, level })
    }
  }
  
  return headings
}

/**
 * HTML 헤딩에 ID를 부여하는 함수
 */
export function addHeadingIds(html: string, content: string): string {
  const headings = extractHeadings(content)
  if (headings.length === 0) return html
  
  let result = html
  let headingIndex = 0
  
  // 모든 헤딩 태그를 순서대로 찾기
  const headingRegex = /<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/gi
  const matches: Array<{
    level: number
    fullMatch: string
    startIndex: number
    endIndex: number
    newHeading?: string // 매칭된 새 헤딩 저장
  }> = []
  
  let match
  while ((match = headingRegex.exec(html)) !== null) {
    matches.push({
      level: parseInt(match[1]),
      fullMatch: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    })
  }
  
  // 순서대로 매칭 (HTML 헤딩과 마크다운 헤딩을 순서대로 매칭)
  for (let i = 0; i < matches.length; i++) {
    const htmlMatch = matches[i]
    
    // 이미 ID가 있으면 건너뛰기
    if (htmlMatch.fullMatch.includes('id=')) {
      continue
    }
    
    // 현재 인덱스부터 순서대로 레벨이 일치하는 헤딩 찾기
    for (let j = headingIndex; j < headings.length; j++) {
      const heading = headings[j]
      
      if (htmlMatch.level === heading.level) {
        const id = heading.id
        
        // 헤딩 태그에 ID 추가
        const newHeading = htmlMatch.fullMatch.replace(
          /<h([1-6])([^>]*)>/i,
          (match, level, attrs) => {
            const classMatch = attrs.match(/class="([^"]*)"/)
            const existingClass = classMatch ? classMatch[1] : ''
            const newClass = existingClass 
              ? `class="${existingClass} scroll-mt-20"`
              : 'class="scroll-mt-20"'
            
            const cleanAttrs = attrs.replace(/class="[^"]*"/, '').trim()
            const finalAttrs = cleanAttrs 
              ? `${cleanAttrs} id="${id}" ${newClass}`.trim()
              : `id="${id}" ${newClass}`
            
            return `<h${level} ${finalAttrs}>`
          }
        )
        
        matches[i].newHeading = newHeading
        headingIndex = j + 1
        break
      }
    }
  }
  
  // 역순으로 교체하여 인덱스 변경 방지
  for (let i = matches.length - 1; i >= 0; i--) {
    const htmlMatch = matches[i]
    if (htmlMatch.newHeading) {
      result = result.substring(0, htmlMatch.startIndex) + htmlMatch.newHeading + result.substring(htmlMatch.endIndex)
    }
  }
  
  return result
}
