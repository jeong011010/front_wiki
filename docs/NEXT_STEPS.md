# 다음 단계 가이드

## 🎯 지금 해야 할 일

### 1단계: Cloudflare 보안 설정 (5-10분) ⭐

**목적**: 도메인 보안 강화

**방법**:
1. https://dash.cloudflare.com/ 접속
2. `front-wiki.com` 선택
3. 다음 설정 적용:

   **SSL/TLS 설정**:
   - **SSL/TLS** → **Overview**
   - **SSL/TLS encryption mode**: `Full (strict)` 선택
   - **Always Use HTTPS**: `On` 설정
   - **Save** 클릭

   **보안 레벨 설정**:
   - **Security** → **Settings**
   - **Security Level**: `Medium` 선택
   - **Save** 클릭http://localhost:3000/articles/redux-vs-zustand

   **봇 차단 활성화**:
   - **Security** → **Bots**
   - **Bot Fight Mode**: `On` 설정
   - **Save** 클릭

**완료 확인**: Cloudflare Dashboard에서 설정이 적용되었는지 확인

---

### 2단계: Vercel Analytics 활성화 (2분) ⭐

**목적**: 사용자 분석 및 성능 모니터링

**방법**:
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택 (`front-wiki`)
3. **Settings** → **Analytics** 탭
4. **Enable Analytics** 토글 **On**
5. **Save** 클릭

**확인 방법**:
- Vercel Dashboard → **Analytics** 탭에서 데이터 확인
- **Speed Insights** 탭에서 성능 메트릭 확인

**참고**: 
- Hobby 플랜: 제한적 기능
- Pro 플랜: 전체 기능 사용 가능

---

### 3단계: Sentry 설정 및 연결 (5-10분) ⭐

**현재 상태**: ❌ 아직 연결 안 됨 (코드만 설정됨)

**필요한 작업**: Sentry 프로젝트 생성 및 환경 변수 설정

**방법**:
1. **Sentry 프로젝트 생성**
   - https://sentry.io/signup/ 접속
   - Next.js 프로젝트 생성
   - DSN 복사

2. **Vercel 환경 변수 설정**
   - Vercel Dashboard → **Settings** → **Environment Variables**
   - 다음 4개 변수 추가:
     - `SENTRY_DSN`: Sentry DSN
     - `NEXT_PUBLIC_SENTRY_DSN`: 같은 DSN
     - `SENTRY_ORG`: Organization Slug
     - `SENTRY_PROJECT`: 프로젝트 이름

3. **재배포**
   - 환경 변수 추가 후 자동 재배포

**상세 가이드**: [Sentry 설정 가이드](./SENTRY_SETUP.md)

---

## 📊 모니터링 도구 사용법

### 1. Sentry (에러 추적)

**접근**: https://sentry.io/

**주요 기능**:
- ✅ 실시간 에러 알림
- ✅ 에러 발생 위치 추적
- ✅ 사용자 영향도 분석
- ✅ 성능 모니터링

**확인 항목**:
- **Issues**: 발생한 에러 목록
- **Performance**: API 응답 시간, 페이지 로딩 시간
- **Releases**: 배포별 에러 추적

**알림 설정** (선택사항):
1. Sentry Dashboard → **Settings** → **Alerts**
2. **Create Alert Rule** 클릭
3. 조건 설정 (예: 에러 발생 시)
4. 알림 채널 선택 (Email, Slack 등)

---

### 2. Vercel Analytics

**접근**: Vercel Dashboard → **Analytics** 탭

**주요 기능**:
- ✅ 페이지뷰 추적
- ✅ 사용자 세션 분석
- ✅ 국가별/디바이스별 트래픽 분석

**확인 항목**:
- 페이지뷰 수
- 고유 방문자 수
- 국가별 트래픽
- 디바이스별 트래픽 (Desktop, Mobile, Tablet)

---

### 3. Vercel Speed Insights

**접근**: Vercel Dashboard → **Speed Insights** 탭

**주요 기능**:
- ✅ Core Web Vitals 추적
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)
- ✅ 성능 점수
- ✅ 개선 제안

**확인 항목**:
- 성능 점수 (0-100)
- Core Web Vitals 메트릭
- 페이지별 성능 비교

---

### 4. Cloudflare Analytics

**접근**: Cloudflare Dashboard → **Analytics & Logs** → **Web Analytics**

**주요 기능**:
- ✅ 트래픽 분석
- ✅ 보안 이벤트 추적
- ✅ DNS 쿼리 분석

**확인 항목**:
- 일일/주간/월간 트래픽
- 보안 이벤트 (차단된 요청)
- 국가별 트래픽

**설정 방법** (선택사항):
1. Cloudflare Dashboard → **Analytics & Logs** → **Web Analytics**
2. **Add a site** 클릭
3. `front-wiki.com` 선택
4. 제공된 스크립트를 `app/layout.tsx`에 추가

---

## 🔍 추가 모니터링 도구

### 현재 사용 중인 도구

1. **Sentry** ✅ - 에러 추적 및 성능 모니터링
2. **Vercel Analytics** ✅ - 사용자 분석
3. **Vercel Speed Insights** ✅ - 성능 모니터링
4. **Cloudflare Analytics** (선택사항) - 트래픽 분석

### 추가로 고려할 수 있는 도구

#### 1. Grafana / Prometheus

**현재 상태**: ❌ 사용 안 함

**이유**:
- 서버리스 환경(Vercel)에서는 직접 설치 어려움
- Sentry + Vercel Analytics로 충분함

**대안**:
- **Grafana Cloud** (관리형): $8/월
- **Datadog** (관리형): $15/월
- **New Relic** (관리형): 무료 플랜 있음

**권장**: 현재는 Sentry + Vercel Analytics로 충분합니다. 트래픽이 증가하면 고려하세요.

#### 2. 로깅 서비스

**현재 상태**: Vercel Logs 사용 중

**Vercel Logs**:
- Vercel Dashboard → **Logs** 탭
- 함수 실행 로그 확인 가능
- 에러 로그 자동 수집

**추가 로깅 서비스** (선택사항):
- **Logtail** (관리형): $0.5/GB/월
- **Papertrail** (관리형): $7/월
- **Datadog Logs**: $0.10/GB/월

**권장**: 현재는 Vercel Logs로 충분합니다.

---

## ✅ 체크리스트

### 즉시 실행 (약 15분)

- [ ] Cloudflare SSL/TLS 설정 (Full strict)
- [ ] Cloudflare Security Level 설정 (Medium)
- [ ] Cloudflare Bot Fight Mode 활성화
- [ ] Vercel Analytics 활성화
- [ ] Sentry 대시보드 확인

### 선택사항 (나중에)

- [ ] Sentry 알림 설정
- [ ] Cloudflare Analytics 설정
- [ ] Sentry 샘플링 레이트 조정 (프로덕션)

---

## 📊 모니터링 대시보드 요약

| 도구 | 접근 방법 | 주요 기능 | 비용 |
|------|----------|----------|------|
| **Sentry** | https://sentry.io/ | 에러 추적, 성능 모니터링 | 무료 (5K 이벤트/월) |
| **Vercel Analytics** | Vercel Dashboard → Analytics | 사용자 분석, 페이지뷰 | Hobby: 제한적 |
| **Vercel Speed Insights** | Vercel Dashboard → Speed Insights | Core Web Vitals | Vercel Pro 포함 |
| **Cloudflare Analytics** | Cloudflare Dashboard → Analytics | 트래픽 분석, 보안 이벤트 | 무료 |
| **Vercel Logs** | Vercel Dashboard → Logs | 함수 실행 로그 | Vercel 포함 |

---

## 🎯 권장 워크플로우

### 일일 확인
1. **Sentry**: 에러 발생 여부 확인
2. **Vercel Analytics**: 트래픽 확인

### 주간 확인
1. **Vercel Speed Insights**: 성능 메트릭 확인
2. **Cloudflare Analytics**: 보안 이벤트 확인

### 월간 확인
1. 모든 대시보드 종합 분석
2. 성능 개선 사항 확인

---

## 🔗 관련 문서

- [설정 가이드](./SETUP_GUIDE.md)
- [모니터링 및 로깅 설정](./MONITORING_LOGGING_SETUP.md)
- [Cloudflare 보안 강화](./CLOUDFLARE_SECURITY_SETUP.md)

---

**다음 단계**: 위 체크리스트를 따라 설정을 완료하세요! 🚀

