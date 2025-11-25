import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    
    if (!authResult.user) {
      return NextResponse.json({ user: null })
    }
    
    // 토큰 정보는 제외하고 사용자 정보만 반환
    const { token, ...user } = authResult.user
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json({ user: null })
  }
}

