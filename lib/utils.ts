import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 제목을 slug로 변환
 */
export function slugify(text: string): string {
  if (!text || !text.trim()) {
    return 'untitled'
  }
  
  // 한글을 포함한 slug 생성
  // 영문은 소문자로, 한글은 그대로 유지
  const slug = text
    .trim()
    // 영문 대문자를 소문자로 변환 (한글은 영향 없음)
    .replace(/[A-Z]/g, (char) => char.toLowerCase())
    // 특수문자 제거 (한글, 영문, 숫자, 하이픈, 공백만 유지)
    .replace(/[^\w\s-가-힣]/g, '')
    // 공백과 언더스코어를 하이픈으로
    .replace(/[\s_]+/g, '-')
    // 연속된 하이픈을 하나로
    .replace(/-+/g, '-')
    // 앞뒤 하이픈 제거
    .replace(/^-+|-+$/g, '')
  
  // 빈 문자열인 경우 (한글만 있어도 slug는 생성되어야 함)
  if (!slug) {
    // 한글이 포함되어 있으면 공백만 하이픈으로 변환
    const koreanSlug = text.trim().replace(/\s+/g, '-')
    return koreanSlug || 'untitled'
  }
  
  return slug
}

