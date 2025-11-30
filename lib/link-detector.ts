import 'server-only'
import { prisma } from './prisma'
import type { DetectedLink } from '@/types'
import { escapeRegex } from './regex-utils'

/**
 * 텍스트에서 기존 글의 제목과 매칭되는 키워드를 찾아 링크 정보를 반환
 */
export async function detectKeywords(text: string): Promise<DetectedLink[]> {
  // 모든 글의 제목을 가져옴
  const articles = await prisma.article.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
  })

  const matches: DetectedLink[] = []
  const processed = new Set<string>() // 중복 방지

  // 각 글 제목이 텍스트에 포함되어 있는지 확인
  for (const article of articles) {
    const title = article.title
    // 한글과 영문 모두 지원하는 단어 경계 매칭
    // 한글의 경우: 공백, 문장부호, 줄바꿈, 문자열 시작/끝을 경계로 인식
    // 영문의 경우: \b (word boundary) 사용
    const escapedTitle = escapeRegex(title)
    
    // 한글이 포함된 경우와 영문만 있는 경우를 구분
    const hasKorean = /[가-힣]/.test(title)
    
    let regex: RegExp
    if (hasKorean) {
      // 한글 포함: 앞에 경계가 있거나 문자열 시작이고, 제목이 포함되어 있으면 매칭
      // "페이지임"에서 "페이지"를 찾기 위해 뒤 경계는 선택적으로 처리
      // 뒤에 경계가 있거나 문자열 끝이거나 다른 한글이 오는 경우 모두 허용
      regex = new RegExp(`(^|[\\s\\n\\r.,!?;:()\\[\\]{}"'<>/\\\\-])${escapedTitle}`, 'gi')
    } else {
      // 영문만: \b 사용
      regex = new RegExp(`\\b${escapedTitle}\\b`, 'gi')
    }
    
    // 매칭된 모든 위치 찾기
    let match
    const foundMatches: string[] = []
    
    while ((match = regex.exec(text)) !== null) {
      // 매칭된 전체 문자열에서 제목 부분만 추출
      const fullMatch = match[0]
      const keywordMatch = fullMatch.match(new RegExp(escapedTitle, 'i'))
      if (keywordMatch) {
        foundMatches.push(keywordMatch[0])
      }
    }
    
    if (foundMatches.length > 0) {
      // 첫 번째 매칭만 사용 (중복 방지)
      const keyword = foundMatches[0]
      const key = `${keyword.toLowerCase()}-${article.id}`
      
      if (!processed.has(key)) {
        matches.push({
          keyword,
          articleId: article.id,
          title: article.title,
          slug: article.slug,
        })
        processed.add(key)
      }
    }
  }

  // 긴 제목부터 정렬 (더 구체적인 매칭 우선)
  return matches.sort((a, b) => b.keyword.length - a.keyword.length)
}


/**
 * 텍스트에 링크를 삽입한 HTML 반환
 */
export function insertLinks(
  text: string,
  links: Array<DetectedLink & { slug?: string }>
): string {
  // 먼저 줄바꿈을 <br>로 변환
  let result = text.replace(/\n/g, '<br>')
  
  // HTML 태그가 이미 있는 경우를 고려하여 처리
  // 이미 링크로 감싸진 부분은 건너뛰기
  const processedIndices = new Set<number>()
  
  // 긴 키워드부터 처리 (겹침 방지)
  const sortedLinks = [...links].sort((a, b) => b.keyword.length - a.keyword.length)
  
  for (const link of sortedLinks) {
    const keyword = link.keyword
    const slug = link.slug || link.articleId
    
    // 한글과 영문 모두 지원하는 단어 경계 매칭
    const hasKorean = /[가-힣]/.test(keyword)
    let regex: RegExp
    if (hasKorean) {
      // 한글 포함: 앞에 경계가 있거나 문자열 시작이고, 제목이 포함되어 있으면 매칭
      regex = new RegExp(`(^|[\\s\\n\\r.,!?;:()\\[\\]{}"'<>/\\\\-])${escapeRegex(keyword)}`, 'gi')
    } else {
      regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'gi')
    }
    
    // 모든 매칭 위치 찾기
    let match
    const matches: Array<{ index: number; length: number; text: string }> = []
    
    while ((match = regex.exec(result)) !== null) {
      // 매칭된 전체 문자열에서 키워드 부분만 추출
      // 한글의 경우 앞에 경계 문자가 포함될 수 있으므로, 그룹을 사용하여 키워드만 추출
      const fullMatch = match[0]
      const boundaryChar = match[1] || '' // 앞의 경계 문자 (그룹 1)
      const keywordStart = boundaryChar.length
      const keywordText = fullMatch.substring(keywordStart) // 경계 문자 제외한 키워드만
      
      const startIndex = match.index + keywordStart // 키워드 시작 위치
      const endIndex = startIndex + keywordText.length // 키워드 끝 위치
      
      // 이미 처리된 범위인지 확인
      let isProcessed = false
      for (let i = startIndex; i < endIndex; i++) {
        if (processedIndices.has(i)) {
          isProcessed = true
          break
        }
      }
      
      if (!isProcessed) {
        // 이미 링크 태그 안에 있는지 확인
        const beforeMatch = result.substring(0, startIndex)
        const afterMatch = result.substring(endIndex)
        const lastOpenTag = beforeMatch.lastIndexOf('<a')
        const lastCloseTag = beforeMatch.lastIndexOf('</a>')
        
        if (lastOpenTag > lastCloseTag) {
          // 이미 링크 태그 안에 있음
          continue
        }
        
        matches.push({
          index: startIndex,
          length: keywordText.length,
          text: keywordText, // 키워드만 저장
        })
      }
    }
    
    // 뒤에서부터 처리 (인덱스 변경 방지)
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i]
      const before = result.substring(0, match.index)
      const after = result.substring(match.index + match.length)
      const replacement = `<a href="/articles/${slug}" class="text-link hover:text-link-hover underline font-medium">${match.text}</a>`
      
      result = before + replacement + after
      
      // 처리된 인덱스 기록
      for (let j = match.index; j < match.index + replacement.length; j++) {
        processedIndices.add(j)
      }
    }
  }
  
  return result
}

/**
 * 제목에 링크를 삽입한 HTML 반환
 * 제목은 짧고 단순하므로 간단한 로직 사용
 */
export async function insertLinksInTitle(title: string, excludeArticleId?: string): Promise<string> {
  // 자기 자신은 제외하고 다른 글의 제목만 매칭
  const detectedLinks = await detectKeywords(title)
  const filteredLinks = excludeArticleId
    ? detectedLinks.filter(link => link.articleId !== excludeArticleId)
    : detectedLinks
  
  if (filteredLinks.length === 0) {
    return title // 링크가 없으면 원본 반환
  }
  
  // 제목에 링크 삽입 (줄바꿈 처리 없이)
  let result = title
  const processedIndices = new Set<number>()
  
  // 긴 키워드부터 처리 (겹침 방지)
  const sortedLinks = [...filteredLinks].sort((a, b) => b.keyword.length - a.keyword.length)
  
  for (const link of sortedLinks) {
    const keyword = link.keyword
    const slug = link.slug || link.articleId
    
    // 한글과 영문 모두 지원하는 단어 경계 매칭
    const hasKorean = /[가-힣]/.test(keyword)
    let regex: RegExp
    if (hasKorean) {
      regex = new RegExp(`(^|[\\s\\n\\r.,!?;:()\\[\\]{}"'<>/\\\\-])${escapeRegex(keyword)}`, 'gi')
    } else {
      regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'gi')
    }
    
    // 모든 매칭 위치 찾기
    let match
    const matches: Array<{ index: number; length: number; text: string }> = []
    
    while ((match = regex.exec(result)) !== null) {
      const fullMatch = match[0]
      const boundaryChar = match[1] || ''
      const keywordStart = boundaryChar.length
      const keywordText = fullMatch.substring(keywordStart)
      
      const startIndex = match.index + keywordStart
      const endIndex = startIndex + keywordText.length
      
      // 이미 처리된 범위인지 확인
      let isProcessed = false
      for (let i = startIndex; i < endIndex; i++) {
        if (processedIndices.has(i)) {
          isProcessed = true
          break
        }
      }
      
      if (!isProcessed) {
        // 이미 링크 태그 안에 있는지 확인
        const beforeMatch = result.substring(0, startIndex)
        const lastOpenTag = beforeMatch.lastIndexOf('<a')
        const lastCloseTag = beforeMatch.lastIndexOf('</a>')
        
        if (lastOpenTag > lastCloseTag) {
          continue
        }
        
        matches.push({
          index: startIndex,
          length: keywordText.length,
          text: keywordText,
        })
      }
    }
    
    // 뒤에서부터 처리 (인덱스 변경 방지)
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i]
      const before = result.substring(0, match.index)
      const after = result.substring(match.index + match.length)
      const replacement = `<a href="/articles/${slug}" class="text-link hover:text-link-hover underline font-medium">${match.text}</a>`
      
      result = before + replacement + after
      
      // 처리된 인덱스 기록
      for (let j = match.index; j < match.index + replacement.length; j++) {
        processedIndices.add(j)
      }
    }
  }
  
  return result
}

