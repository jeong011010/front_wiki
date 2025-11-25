import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/jwt'
import { hash, compare } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // 리프레시 토큰 추출 (쿠키에서)
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: '리프레시 토큰이 없습니다.' },
        { status: 401 }
      )
    }

    // 리프레시 토큰 검증
    const payload = verifyRefreshToken(refreshToken)

    if (!payload) {
      return NextResponse.json(
        { error: '유효하지 않은 리프레시 토큰입니다.' },
        { status: 401 }
      )
    }

    // DB에서 리프레시 토큰 조회 (만료되지 않은 것만)
    const refreshTokens = await prisma.refreshToken.findMany({
      where: {
        userId: payload.userId,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })

    // 저장된 해시된 토큰과 비교
    let validToken = null
    for (const tokenRecord of refreshTokens) {
      try {
        // bcrypt.compare로 해시된 토큰 비교
        const isValid = await compare(refreshToken, tokenRecord.token)
        if (isValid) {
          validToken = tokenRecord
          break
        }
      } catch (error) {
        // 비교 실패 시 다음 토큰 확인
        continue
      }
    }

    if (!validToken) {
      // 유효하지 않은 토큰이면 모든 리프레시 토큰 삭제
      await prisma.refreshToken.deleteMany({
        where: { userId: payload.userId },
      })

      return NextResponse.json(
        { error: '유효하지 않은 리프레시 토큰입니다.' },
        { status: 401 }
      )
    }

    // 사용자 정보 확인
    if (!validToken.user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 401 }
      )
    }

    // 새로운 액세스 토큰 생성
    const newAccessToken = generateAccessToken(
      validToken.user.id,
      validToken.user.email,
      validToken.user.role as 'user' | 'admin'
    )

    // 새로운 리프레시 토큰 생성 (토큰 로테이션)
    const newRefreshToken = generateRefreshToken(validToken.user.id)
    const hashedNewRefreshToken = await hash(newRefreshToken, 10)

    // 기존 리프레시 토큰 삭제
    await prisma.refreshToken.delete({
      where: { id: validToken.id },
    })

    // 새로운 리프레시 토큰 저장
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.refreshToken.create({
      data: {
        token: hashedNewRefreshToken,
        userId: validToken.user.id,
        expiresAt,
      },
    })

    // 응답 생성
    const response = NextResponse.json({
      accessToken: newAccessToken,
    })

    // 새로운 리프레시 토큰을 쿠키에 저장
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { error: '토큰 갱신에 실패했습니다.' },
      { status: 500 }
    )
  }
}

