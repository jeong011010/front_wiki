import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Supabase 연결 상태 확인 및 Keep-Alive
 * Vercel Cron Jobs에서 주기적으로 호출하여 프로젝트를 활성 상태로 유지
 * 
 * Schedule: 매일 새벽 1시 실행 (Hobby 플랜 제한: 하루에 한 번만 실행 가능)
 * - Hobby 플랜: `0 1 * * *` (매일 새벽 1시, 1:00-1:59 사이에 실행될 수 있음)
 * - Pro 플랜: 더 자주 실행 가능 (예: `0 */6 * * *` - 6시간마다)
 * 
 * 무료 플랜의 7일 자동 일시 중지 방지
 */
export async function GET() {
  try {
    // 간단한 쿼리로 연결 확인 및 Keep-Alive
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Supabase 연결 정상',
    })
  } catch (error) {
    console.error('Supabase 연결 실패:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

