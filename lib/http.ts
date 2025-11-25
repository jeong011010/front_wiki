/**
 * 통합 API 관리 유틸리티
 * Next.js 네이티브 fetch를 사용하여 API 호출을 관리합니다.
 * - 액세스 토큰 자동 추가
 * - 401 에러 시 자동 토큰 갱신
 * - 토큰 만료 전 자동 갱신
 */

const ACCESS_TOKEN_KEY = 'accessToken'
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000 // 10분 전에 갱신

/**
 * localStorage에서 액세스 토큰 가져오기
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * localStorage에 액세스 토큰 저장
 */
function setAccessToken(token: string): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

/**
 * localStorage에서 액세스 토큰 제거
 */
function removeAccessToken(): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

/**
 * 토큰 만료 시간 확인 (초 단위)
 */
function getTokenExpirationTime(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload.exp) {
      return null
    }
    const now = Math.floor(Date.now() / 1000)
    return payload.exp - now
  } catch (error) {
    console.error('Token decode error:', error)
    return null
  }
}

/**
 * 토큰이 곧 만료될지 확인 (10분 이내)
 */
function isTokenExpiringSoon(token: string): boolean {
  const expiresIn = getTokenExpirationTime(token)
  if (expiresIn === null) {
    return true // 만료 시간을 알 수 없으면 갱신
  }
  return expiresIn * 1000 < TOKEN_REFRESH_THRESHOLD
}

/**
 * 리프레시 토큰으로 액세스 토큰 갱신
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // 쿠키 포함
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    const newAccessToken = data.accessToken

    if (newAccessToken) {
      setAccessToken(newAccessToken)
      return newAccessToken
    }

    return null
  } catch (error) {
    console.error('Refresh token error:', error)
    // 리프레시 실패 시 로그아웃 처리
    removeAccessToken()
    // 로그인 페이지로 리다이렉트 (옵션)
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
    return null
  }
}

/**
 * API 요청 전 토큰 확인 및 갱신
 */
async function ensureValidToken(): Promise<string | null> {
  let token = getAccessToken()

  if (!token) {
    return null
  }

  // 토큰이 곧 만료되면 미리 갱신
  if (isTokenExpiringSoon(token)) {
    const newToken = await refreshAccessToken()
    return newToken || token // 갱신 실패 시 기존 토큰 사용 (서버에서 검증)
  }

  return token
}

/**
 * API 요청 옵션 타입
 */
export interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean // 인증 스킵 여부
  skipAutoRefresh?: boolean // 자동 갱신 스킵 여부
}

/**
 * 통합 API 요청 함수
 * @param url API 엔드포인트
 * @param options 요청 옵션
 * @returns Response 객체
 */
export async function apiRequest(
  url: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const { skipAuth = false, skipAutoRefresh = false, ...fetchOptions } = options

  // 기본 헤더 설정
  const headers = new Headers(fetchOptions.headers)

  // 인증 토큰 추가 (스킵하지 않은 경우)
  if (!skipAuth) {
    const token = skipAutoRefresh
      ? getAccessToken()
      : await ensureValidToken()

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  // Content-Type 설정 (body가 있고 명시되지 않은 경우)
  if (fetchOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  // 요청 실행
  let response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include', // 쿠키 포함 (리프레시 토큰용)
  })

  // 401 에러 처리 (인증 실패)
  if (response.status === 401 && !skipAuth && !skipAutoRefresh) {
    // 토큰 갱신 시도
    const newToken = await refreshAccessToken()

    if (newToken) {
      // 갱신된 토큰으로 재요청
      headers.set('Authorization', `Bearer ${newToken}`)
      response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: 'include',
      })
    } else {
      // 갱신 실패 시 원본 응답 반환 (이미 로그아웃 처리됨)
      return response
    }
  }

  return response
}

/**
 * JSON 응답을 파싱하는 헬퍼 함수
 */
export async function apiRequestJson<T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const response = await apiRequest(url, options)

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }))
    throw new Error(error.error || error.message || 'API request failed')
  }

  return response.json()
}

/**
 * GET 요청 헬퍼
 */
export async function apiGet<T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRequestJson<T>(url, {
    ...options,
    method: 'GET',
  })
}

/**
 * POST 요청 헬퍼
 */
export async function apiPost<T>(
  url: string,
  data?: unknown,
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRequestJson<T>(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT 요청 헬퍼
 */
export async function apiPut<T>(
  url: string,
  data?: unknown,
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRequestJson<T>(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE 요청 헬퍼
 */
export async function apiDelete<T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRequestJson<T>(url, {
    ...options,
    method: 'DELETE',
  })
}

