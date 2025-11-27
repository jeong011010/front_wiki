# Cloudflare 보안 강화 가이드

## 📋 개요

Cloudflare DNS를 사용 중인 `front-wiki.com` 도메인의 보안을 강화하는 방법입니다. Cloudflare의 무료 플랜에서도 제공하는 기본 보안 기능들을 설정합니다.

## 🔐 보안 기능 설정

### 1. SSL/TLS 설정

**목적**: HTTPS 연결 강제 및 최적화

**설정 방법**:
1. Cloudflare Dashboard → `front-wiki.com` 선택
2. 왼쪽 사이드바 → **SSL/TLS** 클릭
3. **Overview** 탭에서 설정:

   **SSL/TLS encryption mode**:
   - ✅ **Full (strict)** 선택 (권장)
     - Vercel은 자동 HTTPS를 제공하므로 Full (strict) 사용 가능
     - Cloudflare와 Vercel 간 암호화된 연결 보장

   **Always Use HTTPS**:
   - ✅ **On** 설정
   - HTTP 요청을 자동으로 HTTPS로 리다이렉트

   **Minimum TLS Version**:
   - ✅ **TLS 1.2** 이상 (기본값 유지)
   - 최신 보안 프로토콜 사용

**효과**:
- 모든 트래픽이 암호화됨
- 중간자 공격 방지
- SEO 점수 향상

---

### 2. Security Headers 설정

**목적**: 브라우저 보안 정책 강화

**설정 방법**:
1. Cloudflare Dashboard → `front-wiki.com` 선택
2. 왼쪽 사이드바 → **Rules** → **Transform Rules** 클릭
3. **Modify Response Header** 선택
4. **Create rule** 클릭

**추가할 Security Headers**:

#### A. Content Security Policy (CSP)
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.amazonaws.com https://*.cloudfront.net; connect-src 'self' https://*.vercel.app https://*.upstash.io; font-src 'self' data:;
```

#### B. X-Frame-Options
```
X-Frame-Options: DENY
```

#### C. X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```

#### D. Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```

#### E. Permissions-Policy
```
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**또는 간단한 방법: Page Rules 사용**:
1. **Rules** → **Page Rules** 클릭
2. **Create Page Rule** 클릭
3. URL 패턴: `*front-wiki.com/*`
4. Settings:
   - **Security Level**: Medium 또는 High
   - **Browser Integrity Check**: On

**효과**:
- XSS 공격 방지
- 클릭재킹 방지
- MIME 타입 스니핑 방지

---

### 3. Rate Limiting (무료 플랜 제한적)

**목적**: DDoS 공격 및 무차별 대입 공격 방지

**설정 방법**:
1. Cloudflare Dashboard → `front-wiki.com` 선택
2. 왼쪽 사이드바 → **Security** → **WAF** 클릭
3. **Rate limiting rules** 확인

**무료 플랜 제한**:
- Rate Limiting은 Pro 플랜($20/월) 이상에서 제공
- 무료 플랜에서는 기본 DDoS 보호만 제공

**대안: Vercel에서 Rate Limiting 설정**:
- Vercel Pro 플랜에 기본 Rate Limiting 포함
- 또는 Next.js API Routes에서 직접 구현

**효과**:
- 무차별 대입 공격 방지
- API 남용 방지
- 서버 리소스 보호

---

### 4. Bot Fight Mode (무료 플랜)

**목적**: 악성 봇 차단

**설정 방법**:
1. Cloudflare Dashboard → `front-wiki.com` 선택
2. 왼쪽 사이드바 → **Security** → **Bots** 클릭
3. **Bot Fight Mode**:
   - ✅ **On** 설정 (무료 플랜에서 사용 가능)

**효과**:
- 악성 봇 자동 차단
- 크롤러 봇은 허용 (Google, Bing 등)
- 서버 리소스 절약

---

### 5. Security Level 설정

**목적**: 의심스러운 트래픽 자동 차단

**설정 방법**:
1. Cloudflare Dashboard → `front-wiki.com` 선택
2. 왼쪽 사이드바 → **Security** → **Settings** 클릭
3. **Security Level**:
   - **Medium** 권장 (기본값)
   - 또는 **High** (더 엄격한 보안, 일부 정상 사용자도 차단될 수 있음)

**효과**:
- 의심스러운 IP 자동 차단
- DDoS 공격 완화
- 무료 플랜에서 사용 가능

---

### 6. Firewall Rules (기본)

**목적**: 특정 IP 또는 국가 차단

**설정 방법**:
1. Cloudflare Dashboard → `front-wiki.com` 선택
2. 왼쪽 사이드바 → **Security** → **WAF** 클릭
3. **Tools** → **Firewall Rules** 클릭

**예시: 특정 IP 차단**:
1. **Create rule** 클릭
2. Rule name: `Block Suspicious IP`
3. Field: `IP Source Address`
4. Operator: `equals`
5. Value: `1.2.3.4` (차단할 IP)
6. Action: `Block`
7. **Deploy** 클릭

**예시: 특정 국가 차단**:
1. **Create rule** 클릭
2. Rule name: `Block Country`
3. Field: `Country`
4. Operator: `equals`
5. Value: `CN` (예시)
6. Action: `Block`
7. **Deploy** 클릭

**효과**:
- 특정 IP/국가 차단
- 무료 플랜에서 기본 기능 제공

---

### 7. Page Rules (캐싱 및 보안)

**목적**: 특정 페이지에 대한 보안 정책 설정

**설정 방법**:
1. Cloudflare Dashboard → `front-wiki.com` 선택
2. 왼쪽 사이드바 → **Rules** → **Page Rules** 클릭
3. **Create Page Rule** 클릭

**예시: API 엔드포인트 보호**:
- URL: `*front-wiki.com/api/*`
- Settings:
  - **Security Level**: High
  - **Browser Integrity Check**: On
  - **Cache Level**: Bypass (API는 캐싱하지 않음)

**예시: 관리자 페이지 보호**:
- URL: `*front-wiki.com/admin/*`
- Settings:
  - **Security Level**: High
  - **Browser Integrity Check**: On
  - **IP Access Rules**: 특정 IP만 허용 (Pro 플랜)

---

## 🛡️ 보안 체크리스트

### 기본 보안 설정 (무료 플랜)

- [ ] SSL/TLS: Full (strict) 모드
- [ ] Always Use HTTPS: On
- [ ] Security Level: Medium
- [ ] Bot Fight Mode: On
- [ ] Browser Integrity Check: On (Page Rules)

### 고급 보안 설정 (Pro 플랜 $20/월)

- [ ] WAF (Web Application Firewall)
- [ ] Rate Limiting
- [ ] IP Access Rules
- [ ] Custom Security Headers
- [ ] Advanced DDoS Protection

---

## 📊 보안 모니터링

### 1. Security Events 확인

1. Cloudflare Dashboard → `front-wiki.com` 선택
2. 왼쪽 사이드바 → **Security** → **Events** 클릭
3. 차단된 요청, 공격 시도 등 확인

### 2. Analytics 확인

1. Cloudflare Dashboard → `front-wiki.com` 선택
2. 왼쪽 사이드바 → **Analytics & Logs** → **Security** 클릭
3. 보안 이벤트 통계 확인:
   - 차단된 요청 수
   - 공격 유형
   - 국가별 트래픽

---

## ⚠️ 주의사항

### 1. Bot Fight Mode와 검색 엔진

- **Bot Fight Mode**는 검색 엔진 크롤러(Google, Bing)는 허용
- 하지만 일부 정상 봇도 차단될 수 있음
- 문제 발생 시 **Off**로 변경

### 2. Security Level과 사용자 경험

- **High** 레벨은 일부 정상 사용자도 차단할 수 있음
- **Medium** 레벨 권장
- 문제 발생 시 **Low**로 낮춤

### 3. Rate Limiting과 API

- API 엔드포인트에 Rate Limiting 적용 시 주의
- 정상적인 사용자도 차단될 수 있음
- Vercel에서 별도 Rate Limiting 설정 권장

---

## 💰 비용

### 무료 플랜 (현재 사용 중)

- ✅ SSL/TLS (Full strict)
- ✅ Always Use HTTPS
- ✅ Security Level (Medium)
- ✅ Bot Fight Mode
- ✅ 기본 DDoS 보호
- ✅ Firewall Rules (기본)

**비용**: $0/월

### Pro 플랜 ($20/월)

- ✅ 모든 무료 기능
- ✅ WAF (Web Application Firewall)
- ✅ Rate Limiting
- ✅ IP Access Rules
- ✅ Custom Security Headers
- ✅ 고급 DDoS 보호
- ✅ Page Rules 20개

**권장**: 현재는 무료 플랜으로 충분, 트래픽 증가 시 Pro 플랜 고려

---

## 🔗 참고 자료

- [Cloudflare SSL/TLS 설정](https://developers.cloudflare.com/ssl/ssl-tls/)
- [Cloudflare Security 설정](https://developers.cloudflare.com/fundamentals/get-started/tasks/)
- [Cloudflare WAF](https://developers.cloudflare.com/waf/)
- [Cloudflare Bot Management](https://developers.cloudflare.com/bots/)

---

**다음 단계**: [모니터링 및 로깅 설정](./MONITORING_LOGGING_SETUP.md)

