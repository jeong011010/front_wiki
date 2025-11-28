import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimitByIP } from '@/lib/rate-limit'
import { getClientIP } from '@/lib/cloudflare-ip'

/**
 * API Route용 Rate Limiting 미들웨어
 * 
 * 사용 예시:
 * ```typescript
 * import { withRateLimit } from '@/app/api/middleware/rate-limit'
 * 
 * export async function GET(request: NextRequest) {
 *   const rateLimitResult = await withRateLimit(request, {
 *     interval: 60, // 60초
 *     limit: 100, // 100회
 *   })
 *   
 *   if (!rateLimitResult.success) {
 *     return NextResponse.json(
 *       { error: 'Too many requests' },
 *       { 
 *         status: 429,
 *         headers: {
 *           'X-RateLimit-Limit': rateLimitResult.limit.toString(),
 *           'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
 *           'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
 *         },
 *       }
 *     )
 *   }
 *   
 *   // 정상 처리
 * }
 * ```
 */
export async function withRateLimit(
  request: NextRequest,
  options: { interval: number; limit: number }
) {
  const ip = getClientIP(request)
  const result = await rateLimitByIP(ip, options)
  
  return result
}

/**
 * Rate Limit 헤더를 응답에 추가하는 헬퍼 함수
 */
export function addRateLimitHeaders(
  response: NextResponse,
  rateLimitResult: { limit: number; remaining: number; reset: number }
) {
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.reset).toISOString())
  
  return response
}

