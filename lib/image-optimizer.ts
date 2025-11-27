/**
 * 마크다운 이미지 URL 최적화 유틸리티
 * 마크다운에서 렌더링된 이미지 URL을 최적화된 형태로 변환
 */

/**
 * HTML 콘텐츠에서 이미지 태그를 찾아 최적화
 * @param htmlContent HTML 콘텐츠
 * @returns 최적화된 HTML 콘텐츠
 */
export function optimizeImagesInHtml(htmlContent: string): string {
  // 이미지 태그를 찾아서 최적화
  // 예: <img src="..." alt="..."> → Next.js Image 컴포넌트로 변환하거나
  //     이미지 URL에 최적화 파라미터 추가
  
  // 현재는 마크다운 렌더링된 HTML을 그대로 사용
  // 향후 Next.js Image 컴포넌트로 변환 가능
  
  return htmlContent
}

/**
 * 이미지 URL이 최적화 가능한지 확인
 * @param url 이미지 URL
 * @returns 최적화 가능 여부
 */
export function isOptimizableImage(url: string): boolean {
  // S3 또는 CloudFront URL인지 확인
  return (
    url.includes('amazonaws.com') ||
    url.includes('cloudfront.net') ||
    url.startsWith('/uploads/') ||
    url.startsWith('/images/')
  )
}

/**
 * 이미지 URL에 최적화 파라미터 추가 (필요 시)
 * @param url 원본 이미지 URL
 * @param width 너비 (선택사항)
 * @param height 높이 (선택사항)
 * @returns 최적화된 이미지 URL
 */
export function optimizeImageUrl(
  url: string,
  width?: number,
  height?: number
): string {
  // CloudFront나 S3의 경우 이미지 변환 파라미터 추가 가능
  // 현재는 원본 URL 반환
  // 향후 Lambda@Edge나 CloudFront Functions로 이미지 리사이징 가능
  
  return url
}


