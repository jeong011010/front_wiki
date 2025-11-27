# 프론트위키 설정 가이드

## 📋 목차

1. [도메인 및 DNS 설정](#도메인-및-dns-설정)
2. [Redis 캐싱 설정](#redis-캐싱-설정)
3. [Cloudflare 보안 설정](#cloudflare-보안-설정)
4. [모니터링 설정](#모니터링-설정)

---

## 도메인 및 DNS 설정

### Cloudflare DNS 사용 (현재 구성)

**현재 상태**: `front-wiki.com` 도메인이 Cloudflare DNS로 연결됨

**DNS 레코드**:
- **A 레코드**: `76.76.21.21` → Vercel (루트 도메인)
- **CNAME 레코드**: `cname.vercel-dns.com` → Vercel (www 서브도메인)
- **Proxy Status**: DNS only (회색 구름) - Vercel과 충돌 방지

**설정 위치**: Cloudflare Dashboard → DNS → Records

---

## Redis 캐싱 설정

### 현재 구성: Upstash Redis

**서비스**: Upstash for Redis (Vercel Marketplace)

**환경 변수**:
```env
KV_REST_API_URL=https://your-redis.upstash.io
KV_REST_API_TOKEN=your-token
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

**리전**: Tokyo, Japan (ap-northeast-1) - 권장

**대시보드**: https://console.upstash.com/

**상세 가이드**: [Upstash Dashboard 가이드](./UPSTASH_DASHBOARD_GUIDE.md)

---

## Cloudflare 보안 설정

### 1. SSL/TLS 설정

1. Cloudflare Dashboard → `front-wiki.com` 선택
2. **SSL/TLS** → **Overview** 탭
3. 설정:
   - **SSL/TLS encryption mode**: `Full (strict)` 선택
   - **Always Use HTTPS**: `On` 설정
4. **Save** 클릭

### 2. Security Level 설정

1. **Security** → **Settings** 탭
2. **Security Level**: `Medium` 선택
3. **Save** 클릭

### 3. Bot Fight Mode 활성화

1. **Security** → **Bots** 탭
2. **Bot Fight Mode**: `On` 설정
3. **Save** 클릭

### 4. Page Rules 설정 (선택사항)

1. **Rules** → **Page Rules** 탭
2. **Create Page Rule** 클릭
3. 설정:
   - **URL**: `*front-wiki.com/*`
   - **Security Level**: `Medium`
   - **Browser Integrity Check**: `On`
4. **Save and Deploy** 클릭

**상세 가이드**: [Cloudflare 보안 강화 가이드](./CLOUDFLARE_SECURITY_SETUP.md)

---

## 모니터링 설정

### 1. Sentry (에러 추적)

**현재 상태**: ✅ 설정 완료

**환경 변수**:
```env
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

**대시보드**: https://sentry.io/

### 2. Vercel Analytics

**설정 방법**:
1. Vercel Dashboard → 프로젝트 선택
2. **Settings** → **Analytics** 탭
3. **Enable Analytics** 토글 On

**코드**: `app/layout.tsx`에 이미 추가됨

### 3. Vercel Speed Insights

**코드**: `app/layout.tsx`에 이미 추가됨

**확인**: Vercel Dashboard → **Speed Insights** 탭

**상세 가이드**: [모니터링 및 로깅 설정](./MONITORING_LOGGING_SETUP.md)

---

## 🔗 관련 문서

- [서비스 아키텍처](./ARCHITECTURE.md)
- [트러블슈팅 가이드](./TROUBLESHOOTING.md)

