# 프론트위키 트러블슈팅 가이드

## 📋 목차

1. [데이터베이스 연결 문제](#데이터베이스-연결-문제)
2. [도메인 연결 문제](#도메인-연결-문제)
3. [Redis 연결 문제](#redis-연결-문제)
4. [배포 문제](#배포-문제)

---

## 데이터베이스 연결 문제

### PrismaClientInitializationError

**증상**: `Can't reach database server at ...`

**원인**: Supabase 프로젝트가 자동 일시정지됨 (무료 플랜)

**해결 방법**:
1. Supabase Dashboard에서 프로젝트 상태 확인
2. "Paused" 상태면 **Restore** 클릭
3. 또는 Vercel Cron Job이 자동으로 Keep-Alive 실행 중

**예방**: Vercel Cron Job이 `/api/health/supabase`를 매일 호출하도록 설정됨

**상세**: [Supabase 자동 일시정지 해결](./SUPABASE_AUTO_PAUSE_SOLUTION.md)

### DATABASE_URL 연결 오류

**증상**: 로컬에서는 연결 안 됨, 배포 환경에서는 정상

**해결 방법**:
1. `.env` 파일의 `DATABASE_URL` 확인
2. Session Pooler URL 사용 (Vercel 배포용)
3. Direct Connection URL 사용 (로컬 개발용)

**URL 형식**:
```
# Session Pooler (배포용)
postgresql://user:password@host:6543/db?pgbouncer=true

# Direct Connection (로컬용)
postgresql://user:password@host:5432/db
```

---

## 도메인 연결 문제

### Invalid Configuration

**증상**: Vercel Dashboard에서 "Invalid Configuration" 표시

**원인**: DNS 전파 중이거나 DNS 레코드 설정 오류

**해결 방법**:
1. Cloudflare DNS 레코드 확인:
   - A 레코드: `76.76.21.21` (Proxy: DNS only)
   - CNAME 레코드: `cname.vercel-dns.com` (Proxy: DNS only)
2. DNS 전파 확인: https://dnschecker.org/
3. 24-48시간 대기 (최대 72시간)

### SSL 인증서 오류

**증상**: HTTPS 연결 실패

**해결 방법**:
1. Cloudflare Dashboard → **SSL/TLS** → **Overview**
2. **SSL/TLS encryption mode**: `Full (strict)` 설정
3. **Always Use HTTPS**: `On` 설정

---

## Redis 연결 문제

### ERR_SSL_WRONG_VERSION_NUMBER

**증상**: Redis 연결 시 SSL 오류

**원인**: Redis Cloud를 사용하려고 시도 (서버리스 환경에서 사용 불가)

**해결 방법**:
1. Vercel Marketplace에서 **Upstash for Redis** 선택 (Redis Cloud 아님)
2. 환경 변수 확인:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
3. `lib/cache.ts`에서 Upstash Redis 사용 확인

**상세**: [Vercel KV 설정 가이드](./VERCEL_KV_SETUP.md)

---

## 배포 문제

### 빌드 실패

**증상**: Vercel 배포 시 빌드 에러

**해결 방법**:
1. 로컬에서 빌드 테스트: `npm run build`
2. 환경 변수 확인: Vercel Dashboard → **Settings** → **Environment Variables**
3. Prisma 생성 확인: `prisma generate` 실행

### 환경 변수 누락

**증상**: 런타임 에러 (환경 변수 undefined)

**해결 방법**:
1. Vercel Dashboard → **Settings** → **Environment Variables**
2. 필수 환경 변수 확인:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `SENTRY_DSN`

---

## 🔗 관련 문서

- [설정 가이드](./SETUP_GUIDE.md)
- [서비스 아키텍처](./ARCHITECTURE.md)

