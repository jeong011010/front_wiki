import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  name: z.string().min(1, '이름을 입력해주세요'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = registerSchema.parse(body)
    
    // 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      )
    }
    
    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password)
    
    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'user',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })
    
    // JWT 토큰 생성
    const accessToken = generateAccessToken(user.id, user.email, user.role as 'user' | 'admin')
    const refreshToken = generateRefreshToken(user.id)
    
    // 리프레시 토큰 해시 생성 및 DB 저장
    const hashedRefreshToken = await hash(refreshToken, 10)
    
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
    // 상세한 오류 로깅 (Vercel 로그에서 확인 가능)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : 'Unknown'
    
    console.error('=== Register Error Start ===')
    console.error('Error Name:', errorName)
    console.error('Error Message:', errorMessage)
    console.error('Error Stack:', errorStack)
    console.error('Full Error:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    console.error('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.error('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 30) + '...')
    console.error('=== Register Error End ===')
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || '입력값이 올바르지 않습니다.' },
        { status: 400 }
      )
    }
    
    // 프로덕션에서도 오류 메시지 반환 (디버깅용)
    return NextResponse.json(
      { 
        error: '회원가입에 실패했습니다.',
        message: errorMessage, // 프로덕션에서도 표시
        name: errorName,
      },
      { status: 500 }
    )
  }
}

