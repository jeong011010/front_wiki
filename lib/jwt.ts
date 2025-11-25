import jwt from 'jsonwebtoken'
import type { SessionUser } from './auth'

export interface JWTPayload {
  userId: string
  email: string
  role: 'user' | 'admin'
  iat?: number
  exp?: number
}

/**
 * JWT 시크릿 키 가져오기
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return secret
}

/**
 * JWT 리프레시 시크릿 키 가져오기
 */
function getJwtRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not set')
  }
  return secret
}

/**
 * 액세스 토큰 만료 시간 가져오기 (기본값: 2시간)
 */
function getAccessTokenExpiresIn(): string {
  return process.env.JWT_ACCESS_EXPIRES_IN || '2h'
}

/**
 * 리프레시 토큰 만료 시간 가져오기 (기본값: 7일)
 */
function getRefreshTokenExpiresIn(): string {
  return process.env.JWT_REFRESH_EXPIRES_IN || '7d'
}

/**
 * 액세스 토큰 생성
 * @param userId 사용자 ID
 * @param email 사용자 이메일
 * @param role 사용자 역할
 * @returns JWT 액세스 토큰
 */
export function generateAccessToken(
  userId: string,
  email: string,
  role: 'user' | 'admin'
): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId,
    email,
    role,
  }

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getAccessTokenExpiresIn(),
    issuer: 'front-wiki',
    audience: 'front-wiki-users',
  })
}

/**
 * 리프레시 토큰 생성
 * @param userId 사용자 ID
 * @returns JWT 리프레시 토큰
 */
export function generateRefreshToken(userId: string): string {
  const payload = {
    userId,
    type: 'refresh',
  }

  return jwt.sign(payload, getJwtRefreshSecret(), {
    expiresIn: getRefreshTokenExpiresIn(),
    issuer: 'front-wiki',
    audience: 'front-wiki-users',
  })
}

/**
 * 액세스 토큰 검증
 * @param token JWT 액세스 토큰
 * @returns 검증된 토큰 페이로드 또는 null
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: 'front-wiki',
      audience: 'front-wiki-users',
    }) as JWTPayload

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Access token expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid access token:', error.message)
    } else {
      console.error('Token verification error:', error)
    }
    return null
  }
}

/**
 * 리프레시 토큰 검증
 * @param token JWT 리프레시 토큰
 * @returns 검증된 토큰 페이로드 또는 null
 */
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, getJwtRefreshSecret(), {
      issuer: 'front-wiki',
      audience: 'front-wiki-users',
    }) as { userId: string; type: string }

    if (decoded.type !== 'refresh') {
      console.error('Invalid token type')
      return null
    }

    return { userId: decoded.userId }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Refresh token expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid refresh token:', error.message)
    } else {
      console.error('Token verification error:', error)
    }
    return null
  }
}

/**
 * 토큰 디코딩 (검증 없이)
 * @param token JWT 토큰
 * @returns 디코딩된 토큰 페이로드 또는 null
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload | null
    return decoded
  } catch (error) {
    console.error('Token decode error:', error)
    return null
  }
}

/**
 * 토큰 만료 시간 확인
 * @param token JWT 토큰
 * @returns 만료까지 남은 시간(초) 또는 null
 */
export function getTokenExpirationTime(token: string): number | null {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) {
    return null
  }

  const now = Math.floor(Date.now() / 1000)
  const expiresIn = decoded.exp - now
  return expiresIn > 0 ? expiresIn : 0
}

/**
 * 토큰이 만료되었는지 확인
 * @param token JWT 토큰
 * @returns 만료 여부
 */
export function isTokenExpired(token: string): boolean {
  const expiresIn = getTokenExpirationTime(token)
  return expiresIn === null || expiresIn <= 0
}

