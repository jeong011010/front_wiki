import { getCache, setCache } from './cache'

export interface RateLimitOptions {
  interval: number // 제한 시간 간격 (초)
  limit: number // 허용할 요청 수
  identifier: string // 사용자 식별자 (IP, 사용자 ID 등)
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number // Unix timestamp
}

/**
 * Rate Limiting 구현 (Redis 사용)
 * 
 * @param options Rate limiting 옵션
 * @returns Rate limit 결과
 */
export async function rateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { interval, limit, identifier } = options
  
  // 캐시 키 생성
  const cacheKey = `rate-limit:${identifier}:${interval}`
  
  // 현재 카운트 조회
  const current = await getCache<number>(cacheKey)
  const count = current || 0
  
  // 제한 초과 확인
  if (count >= limit) {
    const ttl = await getCache<number>(`${cacheKey}:ttl`)
    const reset = ttl || Date.now() + interval * 1000
    
    return {
      success: false,
      limit,
      remaining: 0,
      reset,
    }
  }
  
  // 카운트 증가
  const newCount = count + 1
  const reset = Date.now() + interval * 1000
  
  // Redis에 저장 (TTL 설정)
  await setCache(cacheKey, newCount, interval)
  await setCache(`${cacheKey}:ttl`, reset, interval)
  
  return {
    success: true,
    limit,
    remaining: limit - newCount,
    reset,
  }
}

/**
 * IP 주소 기반 Rate Limiting
 */
export async function rateLimitByIP(
  ip: string,
  options: { interval: number; limit: number }
): Promise<RateLimitResult> {
  return rateLimit({
    ...options,
    identifier: ip,
  })
}

