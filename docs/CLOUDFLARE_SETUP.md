# Cloudflare 설정 가이드

## 📋 개요

Cloudflare를 Vercel과 통합하여 DDoS 방어, WAF, Rate Limiting 등의 보안 기능을 추가합니다.

## 🚀 설정 방법

### 방법 1: Cloudflare를 DNS로 사용 (권장)

**장점:**
- DDoS 방어 자동 활성화
- WAF (Web Application Firewall)
- Rate Limiting
- Bot Protection
- 무료 SSL 인증서

**단계:**

1. **Cloudflare 계정 생성**
   - https://dash.cloudflare.com/sign-up

2. **도메인 추가**
   - "Add a Site" 클릭
   - `front-wiki.store` 입력
   - 플랜 선택 (Free 플랜으로 시작 가능)

3. **DNS 레코드 설정**
   - Cloudflare가 자동으로 DNS 레코드 스캔
   - 또는 수동으로 추가:
     - Type: `CNAME`
     - Name: `@` (루트 도메인)
     - Target: `cname.vercel-dns.com` (Vercel이 제공하는 CNAME)
     - Proxy: ✅ (주황색 구름) - Cloudflare 프록시 활성화

4. **네임서버 변경**
   - 가비아에서 Cloudflare 네임서버로 변경
   - Cloudflare Dashboard에서 제공하는 네임서버 사용:
     ```
     ns1.cloudflare.com
     ns2.cloudflare.com
     ```
   - 또는 가비아에서 DNS 레코드만 설정 (네임서버 변경 없이)

5. **Vercel 도메인 설정**
   - Vercel Dashboard → Settings → Domains
   - `front-wiki.store` 도메인 확인
   - Cloudflare를 통해 접근 가능하도록 설정

### 방법 2: Cloudflare를 프록시로만 사용

**현재 Vercel DNS 사용 중인 경우:**

1. **Cloudflare 계정 생성**

2. **DNS 레코드 추가**
   - Type: `CNAME`
   - Name: `@`
   - Target: Vercel이 제공하는 도메인 또는 IP
   - Proxy: ✅ (주황색 구름)

3. **가비아에서 CNAME 설정**
   - 가비아 DNS 관리에서 CNAME 레코드 추가
   - Cloudflare를 통해 프록시

## 🔐 보안 기능 설정

### 1. WAF (Web Application Firewall)

**Cloudflare Dashboard → Security → WAF**

- **Free 플랜**: 기본 보안 규칙
- **Pro 플랜**: 커스텀 규칙, Rate Limiting

**설정:**
- Security Level: Medium (기본값)
- Challenge Passage: 30분
- Browser Integrity Check: 활성화

### 2. Rate Limiting

**Cloudflare Dashboard → Security → Rate Limiting**

- **Free 플랜**: 제한적
- **Pro 플랜**: 상세 설정 가능

**예시 규칙:**
- API 엔드포인트: 100 requests/분
- 로그인 페이지: 5 attempts/분

### 3. Bot Protection

**Cloudflare Dashboard → Security → Bots**

- **Free 플랜**: 기본 봇 차단
- **Pro 플랜**: 고급 봇 관리

**설정:**
- Bot Fight Mode: 활성화 (Free)
- Super Bot Fight Mode: Pro 플랜

### 4. DDoS Protection

**자동 활성화:**
- Cloudflare를 프록시로 사용하면 자동으로 DDoS 방어 활성화
- 추가 설정 불필요

## ⚙️ 성능 최적화

### 1. 캐싱 설정

**Cloudflare Dashboard → Caching → Configuration**

- **Caching Level**: Standard
- **Browser Cache TTL**: 4 hours
- **Edge Cache TTL**: 2 hours

### 2. 압축

**Cloudflare Dashboard → Speed → Optimization**

- **Auto Minify**: HTML, CSS, JavaScript
- **Brotli**: 활성화

### 3. 이미지 최적화 (Pro 플랜)

- **Polish**: 이미지 자동 최적화
- **Mirage**: 모바일 이미지 최적화

## 📊 모니터링

### Analytics

**Cloudflare Dashboard → Analytics**

- 트래픽 분석
- 보안 이벤트
- 성능 메트릭

### 알림 설정

**Cloudflare Dashboard → Notifications**

- DDoS 공격 알림
- 보안 이벤트 알림
- 트래픽 급증 알림

## 💰 비용

### Free 플랜
- ✅ DDoS 방어
- ✅ 기본 WAF
- ✅ SSL 인증서
- ✅ 기본 캐싱
- ✅ 기본 봇 차단
- **비용: $0/월**

### Pro 플랜
- ✅ 모든 Free 기능
- ✅ 고급 WAF
- ✅ Rate Limiting
- ✅ 이미지 최적화
- ✅ 더 빠른 응답 시간
- **비용: $20/월**

## 🔄 Vercel과의 통합

### 주의사항

1. **SSL 인증서**
   - Cloudflare와 Vercel 모두 SSL 제공
   - Cloudflare를 프록시로 사용하면 Cloudflare SSL 사용
   - Vercel SSL도 유지 (이중 SSL)

2. **IP 주소**
   - Cloudflare를 프록시로 사용하면 실제 IP가 Cloudflare IP로 표시됨
   - Vercel에서 `X-Forwarded-For` 헤더 확인 필요

3. **캐싱**
   - Cloudflare 캐싱과 Vercel Edge 캐싱이 함께 작동
   - 캐시 무효화 시 두 곳 모두 고려 필요

## 📝 설정 체크리스트

- [ ] Cloudflare 계정 생성
- [ ] 도메인 추가
- [ ] DNS 레코드 설정 (CNAME 또는 네임서버 변경)
- [ ] SSL 인증서 확인 (자동 발급)
- [ ] WAF 설정 확인
- [ ] Rate Limiting 설정 (Pro 플랜)
- [ ] 캐싱 설정
- [ ] Vercel 도메인 설정 확인
- [ ] 테스트 (도메인 접속 확인)

## 🔗 참고 링크

- [Cloudflare 문서](https://developers.cloudflare.com/)
- [Vercel + Cloudflare 통합](https://vercel.com/docs/concepts/edge-network/cloudflare)
- [Cloudflare 가격](https://www.cloudflare.com/plans/)


