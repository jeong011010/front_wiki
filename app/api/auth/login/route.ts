import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

export async function POST(request: NextRequest) {
  try {
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

