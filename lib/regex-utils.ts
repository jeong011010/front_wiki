/**
 * 정규식 유틸리티 함수
 * 클라이언트와 서버 모두에서 사용 가능
 */

/**
 * 정규식 특수문자 이스케이프
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

