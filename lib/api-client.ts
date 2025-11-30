/**
 * API 요청 시 인증 토큰을 자동으로 포함하는 fetch 래퍼
 */
import { getAccessToken } from './auth-client'

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // localStorage에서 accessToken 가져오기 (auth-client의 함수 사용)
  const accessToken = getAccessToken()

  // Authorization 헤더 추가
  const headers = new Headers(options.headers)
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  // credentials 포함 (쿠키 전송 - refreshToken 포함)
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })
}

