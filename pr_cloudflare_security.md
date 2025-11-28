# feat: Cloudflare 보안 기능 통합

## 관련 이슈
Closes #[이슈번호]

## 변경 사항

### 추가된 파일
- `middleware.ts`: Security Headers 미들웨어
- `lib/rate-limit.ts`: Redis 기반 Rate Limiting 로직
- `lib/cloudflare-ip.ts`: Cloudflare IP 검증 유틸리티
- `app/api/middleware/rate-limit.ts`: API Route용 Rate Limiting 헬퍼
- `app/api/test-rate-limit/route.ts`: Rate Limiting 테스트 API
- `app/test-security/page.tsx`: 보안 기능 테스트 페이지
- `docs/CLOUDFLARE_SECURITY_IMPLEMENTATION.md`: 상세 구현 가이드

### 수정된 파일
- `next.config.ts`: 보안 헤더 추가
- `app/api/auth/login/route.ts`: Rate Limiting 적용 (5분에 5회)

### 주요 기능

#### 1. Security Headers
모든 페이지 요청에 다음 보안 헤더가 자동으로 추가됩니다:
- `X-Content-Type-Options: nosniff` - MIME 스니핑 방지
- `X-Frame-Options: DENY` - 클릭재킹 방지
- `X-XSS-Protection: 1; mode=block` - XSS 공격 차단
- `Referrer-Policy: strict-origin-when-cross-origin` - 정보 유출 방지
- `Permissions-Policy: geolocation=(), microphone=(), camera=()` - 불필요한 권한 차단
- `Strict-Transport-Security: max-age=31536000` - HTTPS 강제
- `Content-Security-Policy` - 리소스 로드 제어

#### 2. Rate Limiting
- **로그인 API**: 5분에 5회 제한 (무차별 대입 공격 방지)
- **Redis 기반**: 분산 환경에서도 정확한 제한
- **응답 헤더**: Rate Limit 정보를 헤더로 제공

#### 3. Cloudflare IP 검증
- Cloudflare IP 범위 검증 유틸리티
- 실제 클라이언트 IP 추출 함수

## 적용 위치

### Security Headers
- **미들웨어**: 모든 페이지 요청 (`middleware.ts`)
- **Next.js 설정**: 모든 응답 (`next.config.ts`)

### Rate Limiting
- **로그인 API**: `/api/auth/login` (5분에 5회)
- **테스트 API**: `/api/test-rate-limit` (60초에 10회)

## 테스트
- [x] Security Headers 확인 (`/test-security`)
- [x] Rate Limiting 테스트 (12번 연속 요청하여 11번째부터 429 에러 확인)
- [x] 로그인 API Rate Limiting 동작 확인
- [x] 브라우저 개발자 도구에서 헤더 확인

## 보안 효과

### 적용 전
- ❌ XSS 공격 가능
- ❌ 클릭재킹 가능
- ❌ 무차별 대입 공격 가능
- ❌ MIME 스니핑 가능

### 적용 후
- ✅ XSS 공격 차단
- ✅ 클릭재킹 차단
- ✅ 무차별 대입 공격 차단 (Rate Limiting)
- ✅ MIME 스니핑 차단
- ✅ HTTPS 강제
- ✅ 불필요한 권한 요청 차단

## 사용 방법

### 다른 API에 Rate Limiting 적용
```typescript
import { withRateLimit, addRateLimitHeaders } from '@/app/api/middleware/rate-limit'

export async function POST(request: NextRequest) {
  const rateLimitResult = await withRateLimit(request, {
    interval: 60, // 60초
    limit: 100, // 100회
  })

  if (!rateLimitResult.success) {
    const response = NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
    return addRateLimitHeaders(response, rateLimitResult)
  }

  // 정상 처리
  const response = NextResponse.json({ success: true })
  return addRateLimitHeaders(response, rateLimitResult)
}
```

## 참고사항
- Security Headers는 미들웨어와 Next.js 설정에서 중복 적용 (이중 보안)
- Rate Limiting은 Redis를 사용하므로 Redis 연결이 필요합니다
- 로그인 API의 Rate Limiting은 무차별 대입 공격 방지를 위한 것입니다
- 상세 구현 가이드는 `docs/CLOUDFLARE_SECURITY_IMPLEMENTATION.md` 참고

