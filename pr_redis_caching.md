# Redis 캐싱 기능 구현

## 📋 개요

API 응답 캐싱을 통해 데이터베이스 부하를 감소시키고 응답 속도를 향상시키기 위해 Upstash Redis 캐싱 기능을 구현했습니다.

## ✨ 주요 변경사항

### 1. Redis 캐싱 유틸리티 구현
- `lib/cache.ts`: Vercel KV / Upstash Redis 캐싱 유틸리티
  - `getCache`, `setCache`, `deleteCache` 함수
  - `deleteCachePattern` 패턴 삭제 지원
  - `createCacheKey` 키 생성 헬퍼
  - `isCacheAvailable` 캐시 사용 가능 여부 확인

### 2. API 라우트에 캐싱 적용
- `app/api/articles/route.ts`: 글 목록 API 캐싱
- `app/api/articles/featured/route.ts`: 추천 글 API 캐싱
- `app/api/diagram/route.ts`: 다이어그램 API 캐싱
- 캐시 무효화 로직 추가 (글 작성/수정/삭제 시)

### 3. 환경 변수 지원
- `KV_REST_API_URL`, `KV_REST_API_TOKEN` (Vercel KV)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (Upstash 직접)
- `REDIS_URL` (Redis Cloud - 서버리스 환경에서는 사용 불가)

### 4. 문서화
- `docs/VERCEL_KV_SETUP.md`: Vercel KV / Upstash Redis 설정 가이드
- `docs/REDIS_CLOUD_SETUP.md`: Redis Cloud 대시보드 활용 가이드
- `docs/UPSTASH_DASHBOARD_GUIDE.md`: Upstash 대시보드 상세 활용 가이드
- `docs/DATABASE_ARCHITECTURE.md`: Supabase와 Redis의 관계 및 아키텍처 설명

### 5. 패키지 추가
- `@vercel/kv`: Vercel KV 클라이언트
- `@upstash/redis`: Upstash Redis 클라이언트

## 🎯 성능 개선

- **첫 번째 요청**: Supabase에서 조회 (~500ms)
- **두 번째 요청**: Redis 캐시에서 조회 (~50ms)
- **약 10배 성능 향상** ⚡

## 🔧 기술 스택

- **Vercel KV**: Vercel Marketplace를 통한 Upstash Redis
- **Upstash Redis**: 서버리스 환경에 최적화된 Redis 서비스
- **REST API**: 서버리스 함수에서 사용 가능한 HTTP 기반 API

## 📝 설정 방법

1. Vercel Dashboard → Storage → Create Database
2. Upstash for Redis 선택 (Redis Cloud 아님!)
3. 환경 변수 자동 생성 확인
4. `.env.local`에 환경 변수 추가 (로컬 개발용)

자세한 내용은 `docs/VERCEL_KV_SETUP.md` 참고

## ✅ 테스트

- [x] Vercel KV 연결 테스트
- [x] 캐시 저장/조회 테스트
- [x] 캐시 무효화 테스트
- [x] Upstash 대시보드에서 데이터 확인

## 🔗 관련 이슈

Closes #[이슈번호]

