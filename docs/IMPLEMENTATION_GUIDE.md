# 클라우드 컴퓨팅 기술 구현 가이드

## 📋 구현된 기술

1. ✅ **Redis 캐싱** - Vercel KV / Upstash Redis
2. ✅ **Sentry 모니터링** - 에러 추적 및 성능 모니터링
3. ✅ **이미지 최적화** - Next.js Image 컴포넌트
4. 📝 **Cloudflare** - 설정 가이드 제공

## 1. Redis 캐싱 구현

### 설치된 패키지
- `@vercel/kv` - Vercel KV 클라이언트
- `@upstash/redis` - Upstash Redis 클라이언트

### 구현 파일
- `lib/cache.ts` - 캐싱 유틸리티 함수
- `app/api/articles/featured/route.ts` - 인기 글 캐싱
- `app/api/diagram/route.ts` - 다이어그램 데이터 캐싱
- `app/api/keywords/route.ts` - 키워드 목록 캐싱
- `app/api/articles/route.ts` - 글 목록 캐싱

### 캐시 전략

| API | 캐시 키 | TTL | 비고 |
|-----|--------|-----|------|
| `/api/articles/featured` | `articles:featured:{sort}:{limit}:{role}` | 1시간 | 인기/최신 글 |
| `/api/diagram` | `diagram:{role}` | 30분 | 다이어그램 데이터 |
| `/api/keywords` | `keywords` | 1시간 | 키워드 목록 |
| `/api/articles` | `articles:{category}:{sort}:{limit}:{offset}:{role}` | 30분 | 글 목록 (검색 제외) |

### 환경 변수 설정

**Vercel KV 사용 시:**
```env
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

**Upstash Redis 사용 시:**
```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### 캐시 무효화

글 생성/수정/삭제 시 자동으로 관련 캐시 삭제:
- `articles:*` - 모든 글 목록 캐시
- `diagram:*` - 다이어그램 캐시
- `keywords` - 키워드 목록 캐시

## 2. Sentry 모니터링 구현

### 설치된 패키지
- `@sentry/nextjs` - Sentry Next.js 통합

### 구현 파일
- `sentry.client.config.ts` - 클라이언트 사이드 설정
- `sentry.server.config.ts` - 서버 사이드 설정
- `sentry.edge.config.ts` - Edge 함수 설정
- `next.config.ts` - Sentry 통합 설정

### 환경 변수 설정

```env
# Sentry 설정
SENTRY_DSN=https://...@...
NEXT_PUBLIC_SENTRY_DSN=https://...@...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

### 기능
- ✅ 클라이언트 에러 추적
- ✅ 서버 에러 추적
- ✅ 성능 모니터링
- ✅ Session Replay (에러 발생 시)

### 설정 확인

Sentry가 설정되지 않은 경우 기본 Next.js 설정 사용:
- `SENTRY_DSN` 환경 변수가 없으면 Sentry 비활성화
- 에러 없이 정상 작동

## 3. 이미지 최적화 구현

### Next.js Image 설정

**`next.config.ts`:**
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.amazonaws.com',  // S3
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: '**.cloudfront.net',  // CloudFront
      pathname: '/**',
    },
  ],
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### 구현 파일
- `components/OptimizedImage.tsx` - 최적화된 이미지 컴포넌트
- `lib/image-optimizer.ts` - 이미지 최적화 유틸리티

### 기능
- ✅ 자동 WebP/AVIF 변환
- ✅ 반응형 이미지
- ✅ Lazy loading
- ✅ 이미지 크기 최적화

### 사용 방법

```tsx
import OptimizedImage from '@/components/OptimizedImage'

<OptimizedImage
  src="/images/example.jpg"
  alt="Example"
  width={800}
  height={600}
/>
```

## 4. Cloudflare 설정

### 설정 방법

자세한 내용은 `docs/CLOUDFLARE_SETUP.md` 참고

### 주요 기능
- DDoS 방어
- WAF (Web Application Firewall)
- Rate Limiting
- Bot Protection
- SSL 인증서

### 비용
- Free 플랜: $0/월 (기본 보안 기능)
- Pro 플랜: $20/월 (고급 기능)

## 📊 구현 상태

| 기술 | 상태 | 파일 | 환경 변수 |
|------|------|------|----------|
| Redis 캐싱 | ✅ 완료 | `lib/cache.ts` | `KV_REST_API_URL` 또는 `UPSTASH_REDIS_REST_URL` |
| Sentry | ✅ 완료 | `sentry.*.config.ts` | `SENTRY_DSN` |
| 이미지 최적화 | ✅ 완료 | `next.config.ts`, `components/OptimizedImage.tsx` | 없음 |
| Cloudflare | 📝 가이드 | `docs/CLOUDFLARE_SETUP.md` | 없음 |

## 🚀 다음 단계

### 1. Vercel KV 또는 Upstash Redis 설정

**Vercel KV (권장):**
1. Vercel Dashboard → Storage → Create Database
2. KV 선택
3. 데이터베이스 이름 입력 (예: `front-wiki-kv`)
4. 프로젝트에 연결
5. 환경 변수 자동 설정 확인 (`KV_REST_API_URL`, `KV_REST_API_TOKEN`)
6. 로컬 개발용: `.env.local` 파일에 환경 변수 복사

자세한 내용은 `docs/VERCEL_KV_SETUP.md` 참고

**Upstash Redis (대안):**
1. https://upstash.com 접속
2. Redis Database 생성
3. REST API URL과 Token 복사
4. Vercel 환경 변수에 추가:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 2. Sentry 프로젝트 생성

1. https://sentry.io 접속
2. 프로젝트 생성 (Next.js 선택)
3. DSN 복사
4. Vercel 환경 변수에 추가:
   - `SENTRY_DSN`
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`

### 3. Cloudflare 설정

1. `docs/CLOUDFLARE_SETUP.md` 참고
2. Cloudflare 계정 생성
3. 도메인 추가 및 DNS 설정

## ✅ 테스트

### Redis 캐싱 테스트
```bash
# API 호출 후 캐시 확인
curl http://localhost:3000/api/articles/featured
# 두 번째 호출은 캐시에서 응답 (빠름)
```

### Sentry 테스트
```typescript
// 테스트 에러 발생
throw new Error('Sentry test error')
// Sentry Dashboard에서 확인
```

### 이미지 최적화 테스트
- 브라우저 개발자 도구 → Network 탭
- 이미지 요청 확인
- WebP/AVIF 포맷 확인

## 🔗 참고 링크

- [Vercel KV 문서](https://vercel.com/docs/storage/vercel-kv)
- [Upstash Redis 문서](https://docs.upstash.com/redis)
- [Sentry Next.js 문서](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Next.js Image 문서](https://nextjs.org/docs/app/api-reference/components/image)
- [Cloudflare 문서](https://developers.cloudflare.com/)

