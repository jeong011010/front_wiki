import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    SENTRY_DSN: process.env.SENTRY_DSN ? '✅ 있음' : '❌ 없음',
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN ? '✅ 있음' : '❌ 없음',
    SENTRY_ORG: process.env.SENTRY_ORG ? '✅ 있음' : '❌ 없음',
    SENTRY_PROJECT: process.env.SENTRY_PROJECT ? '✅ 있음' : '❌ 없음',
    NODE_ENV: process.env.NODE_ENV || '❌ 없음',
    // 실제 값은 보안상 노출하지 않음
  })
}
