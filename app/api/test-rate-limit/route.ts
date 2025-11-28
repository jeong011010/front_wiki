import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, addRateLimitHeaders } from '@/app/api/middleware/rate-limit'

/**
 * Rate Limiting 테스트 API
 * 
 * 사용 예시:
 * - GET /api/test-rate-limit
 * - 60초에 10회 제한
 */
export async function GET(request: NextRequest) {
  // Rate Limiting 적용 (60초에 10회)
  const rateLimitResult = await withRateLimit(request, {
    interval: 60, // 60초
    limit: 10, // 10회
  })

  // Rate Limit 초과 시
  if (!rateLimitResult.success) {
    const response = NextResponse.json(
      {
        error: 'Too many requests',
        message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
        reset: new Date(rateLimitResult.reset).toISOString(),
      },
      { status: 429 }
    )

    return addRateLimitHeaders(response, rateLimitResult)
  }

  // 정상 응답
  const response = NextResponse.json({
    success: true,
    message: 'Rate limit 테스트 성공',
    timestamp: new Date().toISOString(),
    rateLimit: {
      limit: rateLimitResult.limit,
      remaining: rateLimitResult.remaining,
      reset: new Date(rateLimitResult.reset).toISOString(),
    },
  })

  return addRateLimitHeaders(response, rateLimitResult)
}

