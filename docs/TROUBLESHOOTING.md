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
1. **즉시 해결**: Supabase Dashboard에서 수동으로 Restore
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택
   - "Paused" 상태면 **Restore** 버튼 클릭
   - 몇 분 후 연결 복구됨

2. **장기 해결**: Keep-Alive 설정 (선택사항)
   - 외부 서비스 사용 (예: UptimeRobot, cron-job.org)
   - 또는 Supabase Pro 플랜으로 업그레이드 (자동 일시정지 없음)

**참고**: 
- 무료 플랜은 7일간 비활성 시 자동 일시정지
- Vercel Hobby 플랜은 Cron Jobs 제한이 있어 Keep-Alive 구현이 어려움
- **상세 가이드**: [Supabase Keep-Alive 설정](./SUPABASE_KEEP_ALIVE.md)

### DATABASE_URL 연결 오류

**증상**: `Can't reach database server at pooler.supabase.com:5432`

**원인**: 포트 번호 오류 또는 URL 형식 오류

**해결 방법**:
1. **포트 번호 확인**
   - Session Pooler: **6543** 포트 사용
   - Direct Connection: **5432** 포트 사용
   - 에러 메시지에 `pooler.supabase.com:5432`가 보이면 포트가 잘못됨!

2. **올바른 URL 형식**
   ```
   # Session Pooler (Vercel 배포용 - 권장)
   postgresql://postgres.xxx:password@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
   
   # Direct Connection (로컬 개발용)
   postgresql://postgres.xxx:password@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
   ```

3. **Vercel 환경 변수 수정**
   - Vercel Dashboard → Settings → Environment Variables
   - `DATABASE_URL` 수정: 포트를 **6543**으로 변경하고 `?pgbouncer=true` 추가
   - 재배포

**상세 가이드**: [Supabase 연결 오류 해결](./SUPABASE_CONNECTION_FIX.md)

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

