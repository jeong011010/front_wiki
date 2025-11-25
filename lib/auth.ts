import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
}

/**
 * 비밀번호 해싱
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * 비밀번호 검증
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * 세션 생성
 */
export async function createSession(userId: string): Promise<string> {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const cookieStore = await cookies()
    cookieStore.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    })
    return sessionId
  } catch (error) {
    console.error('createSession error:', error)
    throw error
  }
}

/**
 * 세션에서 사용자 정보 가져오기 (JWT 기반)
 * 서버 컴포넌트에서 사용할 수 있는 인증 함수
 * 
 * 주의: 클라이언트의 localStorage에 저장된 토큰은 서버에서 읽을 수 없으므로,
 * 이 함수는 쿠키나 요청 헤더에서 토큰을 찾습니다.
 * 클라이언트 컴포넌트에서는 `/api/auth/me` API를 사용하는 것을 권장합니다.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const { headers } = await import('next/headers')
    const headersList = await headers()
    
    // Authorization 헤더에서 토큰 추출
    const authHeader = headersList.get('authorization')
    let token: string | null = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      // 쿠키에서 토큰 추출 (fallback)
      const cookieStore = await cookies()
      token = cookieStore.get('accessToken')?.value || null
    }
    
    if (!token) {
      return null
    }
    
    // JWT 토큰 검증
    const { verifyAccessToken } = await import('./jwt')
    const payload = verifyAccessToken(token)
    
    if (!payload) {
      return null
    }
    
    // 사용자 정보 조회
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
      return null
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'user' | 'admin',
    }
  } catch (error) {
    console.error('Get session user error:', error)
    return null
  }
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  cookieStore.delete('userId')
}

/**
 * 사용자 ID를 쿠키에 저장 (세션과 함께)
 */
export async function setUserIdCookie(userId: string): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set('userId', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    })
  } catch (error) {
    console.error('setUserIdCookie error:', error)
    throw error
  }
}

