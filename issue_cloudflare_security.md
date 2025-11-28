# Cloudflare 보안 기능 통합

## 개요
프로덕션 환경의 보안을 강화하기 위해 Cloudflare 보안 기능을 통합했습니다. Security Headers를 통해 XSS, 클릭재킹, MIME 스니핑 등의 공격을 방지하고, Rate Limiting을 통해 무차별 대입 공격을 차단합니다.

## 목표
- Security Headers를 통한 웹 보안 강화
- Rate Limiting을 통한 API 보호
- Cloudflare IP 검증 기능 추가
- 무차별 대입 공격 방지

## 작업 내용

### 1. Security Headers 미들웨어 생성
- `middleware.ts`: 모든 페이지 요청에 보안 헤더 자동 추가
- 적용되는 헤더:
  - X-Content-Type-Options: MIME 스니핑 방지
  - X-Frame-Options: 클릭재킹 방지
  - X-XSS-Protection: XSS 공격 차단
  - Referrer-Policy: 정보 유출 방지
  - Permissions-Policy: 불필요한 권한 차단
  - Strict-Transport-Security: HTTPS 강제
  - Content-Security-Policy: 리소스 로드 제어

### 2. Next.js 설정 업데이트
- `next.config.ts`에 보안 헤더 추가
- 미들웨어와 중복 적용으로 이중 보안

### 3. Rate Limiting 시스템 구현
- `lib/rate-limit.ts`: Redis 기반 Rate Limiting 로직
- `app/api/middleware/rate-limit.ts`: API Route용 헬퍼 함수
- 로그인 API에 적용 (5분에 5회 제한)
- 테스트 API 생성 (`/api/test-rate-limit`)

### 4. Cloudflare IP 검증
- `lib/cloudflare-ip.ts`: Cloudflare IP 범위 검증
- 실제 클라이언트 IP 추출 함수 (`getClientIP`)

### 5. 테스트 도구 생성
- `/test-security`: 보안 기능 테스트 페이지
- Security Headers 확인 기능
- Rate Limiting 테스트 기능

## 주요 기능

### Security Headers
- **XSS 방지**: X-XSS-Protection, Content-Security-Policy
- **클릭재킹 방지**: X-Frame-Options: DENY
- **MIME 스니핑 방지**: X-Content-Type-Options: nosniff
- **HTTPS 강제**: Strict-Transport-Security (1년)
- **정보 유출 방지**: Referrer-Policy

### Rate Limiting
- **로그인 API**: 5분에 5회 제한 (무차별 대입 공격 방지)
- **Redis 기반**: 분산 환경에서도 정확한 제한
- **응답 헤더**: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

### Cloudflare 통합
- Cloudflare IP 범위 검증
- 실제 클라이언트 IP 추출
- Cloudflare 헤더 로깅 (개발 환경)

## 테스트
- [x] Security Headers 확인 (`/test-security`)
- [x] Rate Limiting 테스트 (`/api/test-rate-limit`)
- [x] 로그인 API Rate Limiting 동작 확인
- [x] 브라우저 개발자 도구에서 헤더 확인

## 참고
- 상세 문서: `docs/CLOUDFLARE_SECURITY_IMPLEMENTATION.md`
- 테스트 페이지: `/test-security`
- Rate Limiting 테스트 API: `/api/test-rate-limit`

