/**
 * 프론트엔드 인증 클라이언트 함수
 * 로그인, 로그아웃, 토큰 관리 등의 인증 관련 기능을 제공합니다.
 */

import { apiPost, apiGet, apiRequest } from './http'

const ACCESS_TOKEN_KEY = 'accessToken'

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
}

export interface LoginResponse {
  user: User
  accessToken: string
}

export interface RegisterResponse {
  user: User
  accessToken: string
}

/**
 * localStorage에서 액세스 토큰 가져오기
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * localStorage에 액세스 토큰 저장
 */
export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

/**
 * localStorage에서 액세스 토큰 제거
 */
export function removeAccessToken(): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

/**
 * 토큰이 만료되었는지 확인
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload.exp) {
      return true
    }
    const now = Math.floor(Date.now() / 1000)
    return payload.exp <= now
  } catch (error) {
    console.error('Token decode error:', error)
    return true
  }
}

/**
 * 현재 저장된 토큰이 유효한지 확인
 */
export function hasValidToken(): boolean {
  const token = getAccessToken()
  if (!token) {
    return false
  }
  return !isTokenExpired(token)
}

/**
 * 로그인
 * @param email 사용자 이메일
 * @param password 사용자 비밀번호
 * @returns 사용자 정보 및 액세스 토큰
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await apiPost<LoginResponse>(
    '/api/auth/login',
    { email, password },
    { skipAuth: true } // 로그인 요청은 인증 불필요
  )

  // 액세스 토큰 저장
  if (response.accessToken) {
    setAccessToken(response.accessToken)
  }

  return response
}

/**
 * 회원가입
 * @param email 사용자 이메일
 * @param password 사용자 비밀번호
 * @param name 사용자 이름
 * @returns 사용자 정보 및 액세스 토큰
 */
export async function register(
  email: string,
  password: string,
  name: string
): Promise<RegisterResponse> {
  const response = await apiPost<RegisterResponse>(
    '/api/auth/register',
    { email, password, name },
    { skipAuth: true } // 회원가입 요청은 인증 불필요
  )

  // 액세스 토큰 저장
  if (response.accessToken) {
    setAccessToken(response.accessToken)
  }

  return response
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  try {
    // 서버에 로그아웃 요청 (리프레시 토큰 삭제)
    await apiPost('/api/auth/logout', {})
  } catch (error) {
    console.error('Logout error:', error)
    // 에러가 발생해도 클라이언트 토큰은 삭제
  } finally {
    // 클라이언트에서 액세스 토큰 제거
    removeAccessToken()
  }
}

/**
 * 현재 사용자 정보 조회
 * @returns 현재 사용자 정보 또는 null
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiGet<{ user: User | null }>('/api/auth/me')
    return response.user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * 액세스 토큰 갱신
 * @returns 새로운 액세스 토큰 또는 null
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await apiRequest('/api/auth/refresh', {
      method: 'POST',
      skipAuth: true, // 리프레시 요청은 액세스 토큰 불필요
      credentials: 'include', // 쿠키 포함 (리프레시 토큰)
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
    removeAccessToken()
    return null
  }
}

