/**
 * 캐시 버전 관리
 * 글 작성/수정/삭제 시 버전을 증가시켜 모든 캐시를 자동으로 무효화
 */

import { getCache, isCacheAvailable, setCache } from './cache'

const CACHE_VERSION_KEY = 'cache:version:articles'
const DEFAULT_VERSION = 1

/**
 * 현재 캐시 버전 가져오기
 */
export async function getCacheVersion(): Promise<number> {
  if (!isCacheAvailable()) {
    return DEFAULT_VERSION
  }

  const version = await getCache<number>(CACHE_VERSION_KEY)
  return version || DEFAULT_VERSION
}

/**
 * 캐시 버전 증가 (글 작성/수정/삭제 시 호출)
 */
export async function incrementCacheVersion(): Promise<number> {
  if (!isCacheAvailable()) {
    return DEFAULT_VERSION
  }

  const currentVersion = await getCacheVersion()
  const newVersion = currentVersion + 1
  
  // 버전을 영구 저장 (TTL 없음)
  await setCache(CACHE_VERSION_KEY, newVersion, 0) // TTL 0 = 영구 저장
  
  return newVersion
}

