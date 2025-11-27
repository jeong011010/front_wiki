# 모니터링 및 로깅 설정 가이드

## 📋 개요

프론트위키 서비스의 모니터링 및 로깅 시스템을 설정합니다. 에러 추적, 성능 모니터링, 사용자 분석을 위한 도구들을 통합합니다.

## 🔍 현재 상태

### ✅ 이미 설정됨
- **Sentry**: 에러 추적 및 성능 모니터링 (설정 완료)
- **Upstash Redis**: 캐싱 및 로깅 (설정 완료)

### 🚀 추가 설정 필요
- **Vercel Analytics**: 사용자 분석 및 Web Vitals
- **Vercel Speed Insights**: 성능 모니터링
- **Cloudflare Analytics**: 트래픽 분석 (선택사항)

---

## 1. Sentry 설정 확인 및 최적화

### 현재 설정 확인

Sentry는 이미 설정되어 있습니다. 다음 파일들을 확인하세요:

- `sentry.client.config.ts` - 클라이언트 사이드 설정
- `sentry.server.config.ts` - 서버 사이드 설정
- `sentry.edge.config.ts` - Edge Functions 설정
- `next.config.ts` - Next.js 통합

### 환경 변수 확인

Vercel Dashboard에서 다음 환경 변수가 설정되어 있는지 확인:

```env
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

### Sentry 최적화 설정

#### 1. 샘플링 레이트 조정

**현재 설정** (`sentry.client.config.ts`):
```typescript
tracesSampleRate: 1.0, // 100% 샘플링 (개발 환경)
```

**프로덕션 권장 설정**:
```typescript
tracesSampleRate: 0.1, // 10% 샘플링 (비용 절감)
```

#### 2. Release 추적 설정

`next.config.ts`에 추가:
```typescript
export default process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      // Release 추적 추가
      release: {
        name: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
      },
    })
  : nextConfig;
```

#### 3. 사용자 컨텍스트 추가

API Routes에서 사용자 정보 추가:
```typescript
import * as Sentry from "@sentry/nextjs";

// 사용자 로그인 후
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});
```

---

## 2. Vercel Analytics 설정

### 설치

```bash
npm install @vercel/analytics
```

### 설정

#### 1. Root Layout에 추가

`app/layout.tsx` 파일 수정:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### 2. Vercel Dashboard에서 활성화

1. Vercel Dashboard → 프로젝트 선택
2. **Settings** → **Analytics** 클릭
3. **Enable Analytics** 토글 On
4. **Save** 클릭

### 기능

- ✅ 페이지뷰 추적
- ✅ 사용자 세션 분석
- ✅ 국가별 트래픽 분석
- ✅ 디바이스별 분석
- ✅ 브라우저별 분석

**비용**: Vercel Pro 플랜에 포함 (Hobby 플랜은 제한적)

---

## 3. Vercel Speed Insights 설정

### 설치

```bash
npm install @vercel/speed-insights
```

### 설정

#### Root Layout에 추가

`app/layout.tsx` 파일 수정:

```typescript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 기능

- ✅ Core Web Vitals 추적
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)
- ✅ 실시간 성능 모니터링
- ✅ 성능 개선 제안

**비용**: Vercel Pro 플랜에 포함

---

## 4. Cloudflare Analytics (선택사항)

### 설정

1. Cloudflare Dashboard → `front-wiki.com` 선택
2. 왼쪽 사이드바 → **Analytics & Logs** → **Web Analytics** 클릭
3. **Add a site** 클릭
4. `front-wiki.com` 선택
5. **Begin setup** 클릭
6. 제공된 스크립트를 `app/layout.tsx`에 추가:

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "your-token"}'
        ></script>
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 기능

- ✅ 트래픽 분석
- ✅ 보안 이벤트 추적
- ✅ 성능 메트릭

**비용**: 무료 플랜에서 사용 가능

---

## 5. 로깅 전략

### 클라이언트 사이드 로깅

#### 구조화된 로깅

`lib/logger.ts` 생성:

```typescript
type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export function log(
  level: LogLevel,
  message: string,
  context?: LogContext
) {
  // 개발 환경에서는 console.log
  if (process.env.NODE_ENV === 'development') {
    console[level](message, context);
    return;
  }

  // 프로덕션에서는 Sentry로 전송
  if (level === 'error') {
    Sentry.captureMessage(message, {
      level: 'error',
      extra: context,
    });
  } else {
    // Info/Warn는 Sentry에 전송하지 않음 (비용 절감)
    // 필요시 다른 로깅 서비스 사용
  }
}

// 편의 함수
export const logger = {
  info: (message: string, context?: LogContext) =>
    log('info', message, context),
  warn: (message: string, context?: LogContext) =>
    log('warn', message, context),
  error: (message: string, context?: LogContext) =>
    log('error', message, context),
};
```

### 서버 사이드 로깅

#### API Routes 로깅

`lib/api-logger.ts` 생성:

```typescript
import { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export function logApiRequest(
  request: NextRequest,
  responseTime: number,
  statusCode: number
) {
  const url = request.nextUrl.pathname;
  const method = request.method;
  const userAgent = request.headers.get('user-agent');
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  // 에러인 경우 Sentry에 전송
  if (statusCode >= 500) {
    Sentry.captureMessage('API Error', {
      level: 'error',
      extra: {
        url,
        method,
        statusCode,
        responseTime,
        userAgent,
        ip,
      },
    });
  }

  // 구조화된 로그 (Vercel Logs에서 확인 가능)
  console.log(JSON.stringify({
    type: 'api_request',
    url,
    method,
    statusCode,
    responseTime,
    timestamp: new Date().toISOString(),
  }));
}
```

#### 미들웨어에서 사용

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logApiRequest } from '@/lib/api-logger';

export async function middleware(request: NextRequest) {
  const start = Date.now();
  
  const response = NextResponse.next();
  
  const responseTime = Date.now() - start;
  const statusCode = response.status;
  
  logApiRequest(request, responseTime, statusCode);
  
  return response;
}
```

---

## 6. Grafana/Prometheus 대안

### 서버리스 환경의 제약

Grafana와 Prometheus는 전통적인 서버 기반 모니터링 도구입니다. Vercel의 서버리스 환경에서는 직접 설치가 어렵습니다.

### 대안: Vercel Analytics + Sentry

**권장 조합**:
1. **Vercel Analytics**: 사용자 분석, 페이지뷰
2. **Vercel Speed Insights**: 성능 메트릭 (Web Vitals)
3. **Sentry**: 에러 추적, 성능 모니터링
4. **Cloudflare Analytics**: 트래픽 분석 (선택사항)

**장점**:
- ✅ 서버리스 환경에 최적화
- ✅ 별도 인프라 불필요
- ✅ 자동 스케일링
- ✅ 낮은 비용

### Grafana/Prometheus가 필요한 경우

**대안 서비스**:
1. **Grafana Cloud** (관리형)
   - 비용: $8/월 (무료 플랜 있음)
   - Prometheus 호환
   - Vercel과 통합 가능

2. **Datadog** (관리형)
   - 비용: $15/월 (무료 플랜 있음)
   - APM, 로깅, 모니터링 통합

3. **New Relic** (관리형)
   - 비용: 무료 플랜 있음
   - 서버리스 모니터링 지원

---

## 📊 모니터링 대시보드 구성

### 1. Vercel Dashboard

**확인 항목**:
- 배포 상태
- 함수 실행 시간
- 에러 로그
- 트래픽 통계

**접근**: https://vercel.com/dashboard → 프로젝트 선택

### 2. Sentry Dashboard

**확인 항목**:
- 에러 발생 추이
- 성능 메트릭
- 사용자 영향도
- Release별 에러

**접근**: https://sentry.io → 프로젝트 선택

### 3. Cloudflare Dashboard

**확인 항목**:
- 트래픽 분석
- 보안 이벤트
- DNS 쿼리
- SSL/TLS 상태

**접근**: https://dash.cloudflare.com → 도메인 선택

---

## 🔔 알림 설정

### Sentry 알림

1. Sentry Dashboard → **Settings** → **Alerts** 클릭
2. **Create Alert Rule** 클릭
3. 조건 설정:
   - 에러 발생 횟수
   - 에러 발생률
   - 특정 에러 타입
4. 알림 채널 선택:
   - Email
   - Slack
   - Discord
   - PagerDuty

### Vercel 알림

1. Vercel Dashboard → **Settings** → **Notifications** 클릭
2. 알림 설정:
   - 배포 실패
   - 함수 에러
   - 도메인 문제

---

## 📈 성능 모니터링 체크리스트

### 기본 모니터링 (무료)

- [ ] Sentry 에러 추적 활성화
- [ ] Vercel Analytics 설정 (Hobby 플랜 제한적)
- [ ] Cloudflare Analytics 설정 (무료)
- [ ] 구조화된 로깅 구현

### 고급 모니터링 (Pro 플랜)

- [ ] Vercel Analytics 전체 기능
- [ ] Vercel Speed Insights
- [ ] Sentry Performance Monitoring
- [ ] 사용자 세션 재현

---

## 💰 비용

### 무료 구성

- Sentry Developer 플랜: $0/월 (5K 이벤트/월)
- Cloudflare Analytics: $0/월
- Vercel Analytics: Hobby 플랜 제한적

**총 비용**: $0/월

### 권장 구성 (Pro 플랜)

- Sentry Team: $26/월 (50K 이벤트/월)
- Vercel Analytics: Vercel Pro에 포함
- Vercel Speed Insights: Vercel Pro에 포함

**총 비용**: $26/월 (Sentry만)

---

## 🔗 참고 자료

- [Sentry Next.js 문서](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Analytics 문서](https://vercel.com/docs/analytics)
- [Vercel Speed Insights 문서](https://vercel.com/docs/speed-insights)
- [Cloudflare Analytics 문서](https://developers.cloudflare.com/analytics/)

---

**다음 단계**: [Cloudflare 보안 강화](./CLOUDFLARE_SECURITY_SETUP.md)

