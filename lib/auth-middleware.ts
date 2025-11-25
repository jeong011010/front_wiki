import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, type JWTPayload } from './jwt'
import { prisma } from './prisma'
import type { SessionUser } from './auth'

/**
 * 인증된 사용자 정보
 */
export interface AuthenticatedUser extends SessionUser {
  token: JWTPayload
}

/**
 * 인증 미들웨어 결과
 */
export interface AuthResult {
  user: AuthenticatedUser | null
  error: NextResponse | null
}

/**
 * 요청에서 액세스 토큰 추출
 * @param request Next.js 요청 객체
 * @returns 액세스 토큰 또는 null
 */
export function extractAccessToken(request: NextRequest): string | null {
  // 1. Authorization 헤더에서 추출 (Bearer token)
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // 2. 쿠키에서 추출 (fallback)
  const token = request.cookies.get('accessToken')?.value
  if (token) {
    return token
  }

  return null
}

/**
 * 액세스 토큰 검증 및 사용자 정보 추출
 * @param request Next.js 요청 객체
 * @returns 인증 결과 (사용자 정보 또는 에러)
 */
export async function authenticateToken(
  request: NextRequest
): Promise<AuthResult> {
  try {
    // 토큰 추출
    const token = extractAccessToken(request)

    if (!token) {
      return {
        user: null,
        error: NextResponse.json(
          { error: '인증 토큰이 필요합니다.' },
          { status: 401 }
        ),
      }
    }

    // 토큰 검증
    const payload = verifyAccessToken(token)

    if (!payload) {
      return {
        user: null,
        error: NextResponse.json(
          { error: '유효하지 않은 토큰입니다.' },
          { status: 401 }
        ),
      }
    }

    // 사용자 정보 조회 (DB에서 최신 정보 가져오기)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      return {
        user: null,
        error: NextResponse.json(
          { error: '사용자를 찾을 수 없습니다.' },
          { status: 401 }
        ),
      }
    }

    // 사용자 정보 반환
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'user' | 'admin',
        token: payload,
      },
      error: null,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      user: null,
      error: NextResponse.json(
        { error: '인증 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      ),
    }
  }
}

/**
 * Role 기반 인가 미들웨어
 * @param user 인증된 사용자
 * @param allowedRoles 허용된 역할 목록
 * @returns 인가 결과 (에러 또는 null)
 */
export function authorizeRole(
  user: AuthenticatedUser | null,
  allowedRoles: ('user' | 'admin')[]
): NextResponse | null {
  if (!user) {
    return NextResponse.json(
      { error: '인증이 필요합니다.' },
      { status: 401 }
    )
  }

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: '권한이 없습니다.' },
      { status: 403 }
    )
  }

  return null
}

/**
 * 인증 및 인가를 함께 처리하는 헬퍼 함수
 * @param request Next.js 요청 객체
 * @param allowedRoles 허용된 역할 목록 (선택사항)
 * @returns 인증 결과 또는 인가 에러
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles?: ('user' | 'admin')[]
): Promise<AuthResult> {
  // 인증 확인
  const authResult = await authenticateToken(request)

  if (authResult.error || !authResult.user) {
    return authResult
  }

  // 인가 확인 (역할이 지정된 경우)
  if (allowedRoles && allowedRoles.length > 0) {
    const authzError = authorizeRole(authResult.user, allowedRoles)
    if (authzError) {
      return {
        user: null,
        error: authzError,
      }
    }
  }

  return authResult
}

/**
 * 관리자 권한 확인 헬퍼
 * @param request Next.js 요청 객체
 * @returns 인증 결과 (관리자만 허용)
 */
export async function requireAdmin(
  request: NextRequest
): Promise<AuthResult> {
  return requireAuth(request, ['admin'])
}

