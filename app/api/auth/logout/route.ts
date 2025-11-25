import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // 액세스 토큰에서 사용자 ID 추출
    const authResult = await authenticateToken(request)

    if (authResult.user) {
      // 해당 사용자의 모든 리프레시 토큰 삭제
      await prisma.refreshToken.deleteMany({
        where: { userId: authResult.user.id },
      })
    }

    // 응답 생성
    const response = NextResponse.json({ success: true })

    // 쿠키에서 리프레시 토큰 삭제
    response.cookies.delete('refreshToken')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    
    // 에러가 발생해도 쿠키는 삭제
    const response = NextResponse.json({ success: true })
    response.cookies.delete('refreshToken')
    
    return response
  }
}

