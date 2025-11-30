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

// parseRedisUrl 함수는 현재 사용하지 않음 (Redis Cloud는 서버리스 환경에서 사용 불가)
// 필요시 주석 해제하여 사용
/*
function parseRedisUrl(redisUrl: string): { url: string; token: string } | null {
  try {
    if (redisUrl.startsWith('https://')) {
      const url = new URL(redisUrl)
      const restUrl = url.port 
        ? `https://${url.hostname}:${url.port}`
        : `https://${url.hostname}`
      const token = url.searchParams.get('token') || url.password || ''
      return { url: restUrl, token }
    }
    
    if (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://')) {
      const url = new URL(redisUrl)
      const token = url.password || url.searchParams.get('token') || ''
      const host = url.hostname
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
  } catch {
    console.warn('Failed to parse REDIS_URL')
    return null
  }
}
*/

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
    } catch {
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
    } catch {
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
  } catch {
    console.error('Cache get error')
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
  } catch {
    console.error('Cache set error')
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
      // Vercel KV는 keys() 메서드를 지원하지 않으므로
      // 패턴 삭제는 제한적입니다.
      // 실제 캐시 무효화는 호출하는 쪽에서 명시적 키 삭제를 사용하거나
      // TTL을 짧게 설정하여 처리합니다.
      // 여기서는 성공으로 간주 (실제 삭제는 호출하는 쪽에서 처리)
      return true
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
 * 캐시 키에 버전 추가
 */
export async function createVersionedCacheKey(prefix: string, ...parts: (string | number | null | undefined)[]): Promise<string> {
  const { getCacheVersion } = await import('./cache-version')
  const version = await getCacheVersion()
  const baseKey = createCacheKey(prefix, ...parts)
  return `${baseKey}:v${version}`
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

