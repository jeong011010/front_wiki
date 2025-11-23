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
 * 세션에서 사용자 정보 가져오기
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    
    if (!sessionId) {
      return null
    }
    
    // 세션 ID를 사용자 ID로 사용 (실제로는 세션 테이블을 만들어야 하지만 간단하게 구현)
    // 여기서는 쿠키에 사용자 ID를 직접 저장하는 방식 사용
    const userId = cookieStore.get('userId')?.value
    
    if (!userId) {
      return null
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

