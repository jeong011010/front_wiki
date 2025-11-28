# Cloudflare 보안 통합 구현 가이드

## 📋 개요

프로젝트에 Cloudflare 보안 기능을 통합하여 XSS, 클릭재킹, MIME 스니핑 등의 공격을 방지하고, Rate Limiting을 통해 무차별 대입 공격을 차단합니다.

## 🛡️ Security Headers 적용 위치

### 1. 미들웨어 레벨 (`middleware.ts`)

**적용 범위**: 모든 페이지 요청 (API 제외)

**위치**: 프로젝트 루트의 `middleware.ts`

**적용되는 경로**:
- ✅ 모든 페이지 (`/`, `/articles/*`, `/diagram`, 등)
- ✅ 정적 파일 제외 (`_next/static`, `_next/image`, `favicon.ico`)
- ❌ API 라우트는 제외 (`/api/*`)

**설정된 헤더**:
```typescript
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: geolocation=(), microphone=(), camera=()
- Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
- Content-Security-Policy: (상세 정책)
```

### 2. Next.js 설정 레벨 (`next.config.ts`)

**적용 범위**: 모든 응답 (미들웨어와 중복되지만 추가 보안)

**위치**: 프로젝트 루트의 `next.config.ts`

**설정된 헤더**:
```typescript
- X-DNS-Prefetch-Control: on
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## 🔒 각 Security Header의 역할

### 1. X-Content-Type-Options: nosniff
**역할**: 브라우저가 MIME 타입을 추측하지 못하게 함
**방어**: MIME 스니핑 공격 방지
**예시**: `text/plain` 파일을 `text/html`로 해석하여 XSS 공격 시도 방지

### 2. X-Frame-Options: DENY
**역할**: 페이지를 iframe에 삽입하지 못하게 함
**방어**: 클릭재킹 공격 방지
**예시**: 악성 사이트에서 우리 페이지를 iframe으로 숨겨 사용자 클릭을 가로채는 것 방지

### 3. X-XSS-Protection: 1; mode=block
**역할**: 브라우저의 XSS 필터 활성화
**방어**: XSS 공격 차단
**예시**: 스크립트 태그가 포함된 URL 파라미터 차단

### 4. Referrer-Policy: strict-origin-when-cross-origin
**역할**: Referrer 정보 전송 정책
**방어**: 정보 유출 방지
**예시**: 
- 같은 도메인: 전체 URL 전송
- 다른 도메인: 도메인만 전송 (경로 정보 숨김)

### 5. Permissions-Policy: geolocation=(), microphone=(), camera=()
**역할**: 브라우저 기능 접근 차단
**방어**: 불필요한 권한 요청 방지
**예시**: 위치 정보, 마이크, 카메라 접근 차단

### 6. Strict-Transport-Security (HSTS)
**역할**: HTTPS 연결 강제
**방어**: 중간자 공격 방지
**효과**: 
- 1년간 HTTPS만 사용
- 하위 도메인 포함
- 브라우저 HSTS 프리로드 리스트 지원

### 7. Content-Security-Policy (CSP)
**역할**: 리소스 로드 정책 설정
**방어**: XSS, 데이터 주입 공격 방지

**현재 정책**:
```
default-src 'self'                    # 기본: 같은 도메인만
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-insights.com
style-src 'self' 'unsafe-inline'      # 스타일: 같은 도메인 + 인라인
img-src 'self' data: https://*.amazonaws.com https://*.cloudfront.net https://*.vercel.com
connect-src 'self' https://*.vercel.app https://*.upstash.io https://*.sentry.io
font-src 'self' data:                 # 폰트: 같은 도메인 + data URI
frame-ancestors 'none'                # iframe 삽입 차단
```

**허용된 외부 도메인**:
- ✅ Vercel (배포 플랫폼)
- ✅ AWS S3 (이미지 저장소)
- ✅ CloudFront (CDN)
- ✅ Upstash (Redis)
- ✅ Sentry (모니터링)

## 🚦 Rate Limiting 적용 위치

### 1. 로그인 API (`app/api/auth/login/route.ts`)

**제한**: 5분에 5회
**목적**: 무차별 대입 공격 방지
**동작**:
- 5번째 시도까지: 정상 처리
- 6번째 시도부터: 429 에러 반환
- 5분 후: 카운트 리셋

**응답 헤더**:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 2025-11-28T10:00:00.000Z
```

### 2. 테스트 API (`app/api/test-rate-limit/route.ts`)

**제한**: 60초에 10회
**목적**: Rate Limiting 기능 테스트

### 3. 다른 API에 적용하는 방법

```typescript
import { withRateLimit, addRateLimitHeaders } from '@/app/api/middleware/rate-limit'

export async function POST(request: NextRequest) {
  // Rate Limiting 적용
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

## 📊 적용 흐름도

```
사용자 요청
    ↓
[Cloudflare DNS/CDN]
    ↓
[Vercel Edge Network]
    ↓
[Next.js Middleware] ← Security Headers 추가
    ↓
[Next.js App Router]
    ↓
[API Route] ← Rate Limiting 적용 (로그인 등)
    ↓
응답 (Security Headers 포함)
```

## 🔍 확인 방법

### 1. 브라우저 개발자 도구

**Network 탭**:
1. 개발자 도구 열기 (F12)
2. Network 탭 선택
3. 페이지 새로고침
4. 첫 번째 요청 선택
5. Headers 탭에서 Response Headers 확인

**확인할 헤더**:
- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`
- `Referrer-Policy`
- `Permissions-Policy`
- `Strict-Transport-Security`
- `Content-Security-Policy`

### 2. 테스트 페이지

**Security Headers 확인**:
- `http://localhost:3000/test-security` 접속
- "Security Headers 확인" 버튼 클릭

**Rate Limiting 확인**:
- `http://localhost:3000/test-security` 접속
- "Rate Limiting 테스트 실행" 버튼 클릭
- 11번째 요청부터 429 에러 확인

### 3. 온라인 도구

**Security Headers 검사**:
- https://securityheaders.com/
- `front-wiki.com` 입력하여 검사

## 📝 주요 파일 위치

```
프로젝트 루트/
├── middleware.ts                    # Security Headers 미들웨어
├── next.config.ts                   # Next.js 보안 헤더 설정
├── lib/
│   ├── rate-limit.ts               # Rate Limiting 로직
│   └── cloudflare-ip.ts            # Cloudflare IP 검증
├── app/
│   ├── api/
│   │   ├── middleware/
│   │   │   └── rate-limit.ts       # Rate Limiting 헬퍼
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── route.ts        # 로그인 API (Rate Limiting 적용)
│   │   └── test-rate-limit/
│   │       └── route.ts            # Rate Limiting 테스트 API
│   └── test-security/
│       └── page.tsx                # 보안 기능 테스트 페이지
```

## ⚙️ 설정 커스터마이징

### Rate Limiting 제한 변경

**로그인 API** (`app/api/auth/login/route.ts`):
```typescript
const rateLimitResult = await withRateLimit(request, {
  interval: 300, // 5분 → 원하는 시간(초)으로 변경
  limit: 5,      // 5회 → 원하는 횟수로 변경
})
```

### Security Headers 수정

**미들웨어** (`middleware.ts`):
```typescript
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  // 다른 헤더 추가/수정
}
```

### CSP 정책 수정

**미들웨어** (`middleware.ts`):
```typescript
'Content-Security-Policy': [
  "default-src 'self'",
  "script-src 'self' https://example.com", // 허용할 도메인 추가
  // 다른 정책 추가
].join('; '),
```

## 🎯 보안 효과

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

## 📚 참고 자료

- [MDN: Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security)
- [OWASP: Security Headers](https://owasp.org/www-project-secure-headers/)
- [Next.js: Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Cloudflare: Security](https://developers.cloudflare.com/fundamentals/get-started/tasks/)

