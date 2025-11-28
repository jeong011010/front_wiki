import { addRateLimitHeaders, withRateLimit } from '@/app/api/middleware/rate-limit'
import { verifyPassword } from '@/lib/auth'
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting 적용 (5분에 5회 제한 - 무차별 대입 공격 방지)
    const rateLimitResult = await withRateLimit(request, {
      interval: 300, // 5분
      limit: 5, // 5회
    })

    if (!rateLimitResult.success) {
      const response = NextResponse.json(
        {
          error: 'Too many requests',
          message: '로그인 시도 횟수를 초과했습니다. 5분 후 다시 시도해주세요.',
          reset: new Date(rateLimitResult.reset).toISOString(),
        },
        { status: 429 }
      )
      return addRateLimitHeaders(response, rateLimitResult)
    }

    const body = await request.json()
    const { email, password } = loginSchema.parse(body)
    
    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }
    
    // 비밀번호 검증
    const isValid = await verifyPassword(password, user.password)
    
    if (!isValid) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }
    
    // JWT 토큰 생성
    const accessToken = generateAccessToken(user.id, user.email, user.role as 'user' | 'admin')
    const refreshToken = generateRefreshToken(user.id)
    
    // 리프레시 토큰 해시 생성 및 DB 저장
    const hashedRefreshToken = await hash(refreshToken, 10)
    
    // 기존 리프레시 토큰 삭제 (보안: 한 기기당 하나의 리프레시 토큰만 유지)
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    })
    
    // 리프레시 토큰 만료 시간 계산 (7일)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    // 리프레시 토큰 저장
    await prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        userId: user.id,
        expiresAt,
      },
    })
    
    // 응답 생성
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
    })
    
    // 리프레시 토큰을 httpOnly 쿠키에 저장
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    })
    
    // Rate Limit 헤더 추가
    addRateLimitHeaders(response, rateLimitResult)
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || '입력값이 올바르지 않습니다.' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: '로그인에 실패했습니다.' },
      { status: 500 }
    )
  }
}

