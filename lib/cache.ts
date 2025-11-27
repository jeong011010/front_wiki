/**
 * Redis 캐싱 유틸리티
 * Vercel KV 또는 Upstash Redis를 사용하여 API 응답 캐싱
 */

// Vercel KV 사용 (권장)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let kv: any = null

// Upstash Redis 사용 (대안)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let redis: any = null

/**
 * REDIS_URL에서 REST API URL과 Token 추출
 * Vercel Marketplace Redis는 REDIS_URL 형식으로 제공됨
 * 
 * 지원 형식:
 * 1. redis://default:token@host:port (Upstash Redis URL)
 * 2. rediss://default:token@host:port (Upstash Redis SSL URL)
 * 3. https://host:port (Redis Cloud REST API URL)
 * 4. https://host (REST API URL 직접)
 * 
 * 참고:
 * - Upstash REST API는 포트 없이 호스트만 사용
 * - Redis Cloud REST API는 포트를 포함할 수 있음 (예: :9443)
 */
function parseRedisUrl(redisUrl: string): { url: string; token: string } | null {
  try {
    // 이미 HTTPS URL인 경우 (REST API URL)
    if (redisUrl.startsWith('https://')) {
      const url = new URL(redisUrl)
      // Redis Cloud는 포트를 포함할 수 있음 (예: :9443)
      // Upstash는 포트 없음
      const restUrl = url.port 
        ? `https://${url.hostname}:${url.port}`
        : `https://${url.hostname}`
      const token = url.searchParams.get('token') || url.password || ''
      return { url: restUrl, token }
    }
    
    // redis:// 또는 rediss:// 형식
    if (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://')) {
      const url = new URL(redisUrl)
      const token = url.password || url.searchParams.get('token') || ''
      const host = url.hostname
      const port = url.port
      
      // Redis Cloud는 REST API 포트가 다를 수 있음 (일반적으로 9443)
      // Upstash는 포트 없이 호스트만 사용
      // 일단 호스트만 사용 (포트는 Redis Cloud 대시보드에서 확인 필요)
      const hostWithoutPort = host.split(':')[0]
      const restUrl = `https://${hostWithoutPort}`
      
      if (!token) {
        console.warn('REDIS_URL에서 token을 찾을 수 없습니다.')
        return null
      }
      
      return { url: restUrl, token }
    }
    
    console.warn('지원하지 않는 REDIS_URL 형식:', redisUrl)
    return null
  } catch (error) {
    console.warn('Failed to parse REDIS_URL:', error)
    return null
  }
}

/**
 * 캐시 클라이언트 초기화
 */
async function initCache() {
  // Vercel KV 우선 시도
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const { kv: vercelKv } = await import('@vercel/kv')
      kv = vercelKv
      return
    } catch (error) {
      console.warn('Vercel KV not available, trying Upstash Redis')
    }
  }

  // Vercel Marketplace Redis (REDIS_URL 형식)
  // 주의: Redis Cloud는 일반 Redis 프로토콜을 사용하므로 @upstash/redis와 호환되지 않음
  // Redis Cloud는 REST API를 제공하지 않을 수 있으므로, Vercel KV 사용 권장
  if (process.env.REDIS_URL) {
    // Redis Cloud는 일반 Redis 프로토콜만 제공하므로 서버리스 환경에서 사용 불가
    // Vercel KV 또는 Upstash Redis 사용 권장
    console.warn(
      'REDIS_URL이 설정되어 있지만, Redis Cloud는 서버리스 환경에서 사용할 수 없습니다. ' +
      'Vercel KV 또는 Upstash Redis를 사용하세요.'
    )
    // Redis Cloud는 REST API를 제공하지 않으므로 초기화하지 않음
  }

  // Upstash Redis 직접 설정 (REST API URL/Token)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis')
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
      return
    } catch (error) {
      console.warn('Upstash Redis not available')
    }
  }
}

/**
 * 캐시에서 값 가져오기
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    await initCache()

    if (kv) {
      const value = await kv.get(key)
      return value as T | null
    }

    if (redis) {
      const value = await redis.get(key)
      return value as T | null
    }

    return null
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

/**
 * 캐시에 값 저장
 * @param key 캐시 키
 * @param value 저장할 값
 * @param ttl TTL (초 단위, 기본값: 3600 = 1시간)
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = 3600
): Promise<boolean> {
  try {
    await initCache()

    if (kv) {
      await kv.set(key, value, { ex: ttl })
      return true
    }

    if (redis) {
      await redis.set(key, value, { ex: ttl })
      return true
    }

    return false
  } catch (error) {
    console.error('Cache set error:', error)
    return false
  }
}

/**
 * 캐시에서 값 삭제
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    await initCache()

    if (kv) {
      await kv.del(key)
      return true
    }

    if (redis) {
      await redis.del(key)
      return true
    }

    return false
  } catch (error) {
    console.error('Cache delete error:', error)
    return false
  }
}

/**
 * 패턴으로 캐시 키 삭제 (예: "articles:*")
 */
export async function deleteCachePattern(pattern: string): Promise<boolean> {
  try {
    await initCache()

    if (kv) {
      // Vercel KV는 패턴 삭제를 직접 지원하지 않음
      // 개별 키 삭제 필요 (구현 생략)
      return false
    }

    if (redis) {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      return true
    }

    return false
  } catch (error) {
    console.error('Cache pattern delete error:', error)
    return false
  }
}

/**
 * 캐시 키 생성 헬퍼
 */
export function createCacheKey(prefix: string, ...parts: (string | number | null | undefined)[]): string {
  const filteredParts = parts.filter((part) => part !== null && part !== undefined)
  return `${prefix}:${filteredParts.join(':')}`
}

/**
 * 캐시 사용 가능 여부 확인
 * 
 * 참고: Redis Cloud(REDIS_URL)는 서버리스 환경에서 사용할 수 없으므로 제외
 */
export function isCacheAvailable(): boolean {
  return !!(
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  )
}

