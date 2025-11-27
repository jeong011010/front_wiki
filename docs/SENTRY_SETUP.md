# Sentry 설정 가이드

## 📋 개요

Sentry는 에러 추적 및 성능 모니터링 도구입니다. 이 가이드에서는 Sentry 프로젝트를 생성하고 연결하는 방법을 설명합니다.

## 🚀 단계별 설정

### 1단계: Sentry 계정 생성 및 프로젝트 생성

1. **Sentry 가입**
   - https://sentry.io/signup/ 접속
   - GitHub, Google, 또는 이메일로 가입

2. **프로젝트 생성**
   - Sentry Dashboard 접속
   - **Create Project** 클릭
   - **Next.js** 선택
   - 프로젝트 이름 입력 (예: `front-wiki`)
   - **Create Project** 클릭

3. **DSN 확인**
   - 프로젝트 생성 후 **Client Keys (DSN)** 표시됨
   - DSN 형식: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
   - 이 DSN을 복사해두세요

---

### 2단계: Vercel 환경 변수 설정

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard 접속
   - 프로젝트 선택 (`front-wiki`)

2. **환경 변수 추가**
   - **Settings** → **Environment Variables** 클릭
   - 다음 환경 변수 추가:

   **변수 1: SENTRY_DSN**
   - Key: `SENTRY_DSN`
   - Value: Sentry에서 복사한 DSN (예: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)
   - Environment: `Production`, `Preview`, `Development` 모두 선택
   - **Save** 클릭

   **변수 2: NEXT_PUBLIC_SENTRY_DSN**
   - Key: `NEXT_PUBLIC_SENTRY_DSN`
   - Value: 같은 DSN 값
   - Environment: `Production`, `Preview`, `Development` 모두 선택
   - **Save** 클릭

   **변수 3: SENTRY_ORG**
   - Key: `SENTRY_ORG`
   - Value: Sentry Organization Slug (Sentry Dashboard URL에서 확인)
     - 예: URL이 `https://sentry.io/organizations/my-org/`이면 `my-org`
   - Environment: `Production`, `Preview`, `Development` 모두 선택
   - **Save** 클릭

   **변수 4: SENTRY_PROJECT**
   - Key: `SENTRY_PROJECT`
   - Value: 프로젝트 이름 (예: `front-wiki`)
   - Environment: `Production`, `Preview`, `Development` 모두 선택
   - **Save** 클릭

3. **재배포**
   - 환경 변수 추가 후 자동으로 재배포됨
   - 또는 **Deployments** 탭에서 수동으로 재배포 가능

---

### 3단계: 로컬 환경 변수 설정 (선택사항)

로컬 개발 환경에서도 Sentry를 사용하려면:

1. **`.env.local` 파일 생성** (또는 기존 파일 수정)
   ```env
   SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   SENTRY_ORG=your-org-slug
   SENTRY_PROJECT=front-wiki
   ```

2. **개발 서버 재시작**
   ```bash
   npm run dev
   ```

---

### 4단계: 연결 확인

#### 방법 1: Sentry 대시보드에서 확인

1. Sentry Dashboard 접속
2. 프로젝트 선택
3. **Issues** 탭 확인
4. 테스트 에러 발생 시 Sentry에 표시되는지 확인

#### 방법 2: 테스트 에러 발생

**옵션 A: 브라우저 콘솔에서 테스트**
```javascript
// 브라우저 개발자 도구 콘솔에서 실행
throw new Error('Sentry 테스트 에러');
```

**옵션 B: API Route에서 테스트**

`app/api/test-sentry/route.ts` 파일 생성:
```typescript
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    // 테스트 에러 발생
    throw new Error('Sentry 테스트 에러');
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { message: '테스트 에러가 Sentry로 전송되었습니다.' },
      { status: 500 }
    );
  }
}
```

브라우저에서 `/api/test-sentry` 접속 후 Sentry Dashboard 확인

---

## ✅ 확인 체크리스트

- [ ] Sentry 계정 생성 완료
- [ ] 프로젝트 생성 완료
- [ ] DSN 복사 완료
- [ ] Vercel 환경 변수 4개 추가 완료
  - [ ] `SENTRY_DSN`
  - [ ] `NEXT_PUBLIC_SENTRY_DSN`
  - [ ] `SENTRY_ORG`
  - [ ] `SENTRY_PROJECT`
- [ ] Vercel 재배포 완료
- [ ] Sentry 대시보드에서 에러 확인 가능

---

## 🔍 Sentry 대시보드 사용법

### Issues 탭
- 발생한 모든 에러 목록
- 에러 클릭 시 상세 정보 확인
- 스택 트레이스, 사용자 정보, 브라우저 정보 등

### Performance 탭
- API 응답 시간
- 페이지 로딩 시간
- 느린 쿼리 추적

### Releases 탭
- 배포별 에러 추적
- 배포 전후 에러 비교

---

## ⚙️ 고급 설정 (선택사항)

### 샘플링 레이트 조정

프로덕션 환경에서 비용 절감을 위해 샘플링 레이트를 낮출 수 있습니다.

`sentry.client.config.ts` 수정:
```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 프로덕션: 10%
  // ...
});
```

### Release 추적 설정

`next.config.ts` 수정:
```typescript
export default process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      release: {
        name: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
      },
    })
  : nextConfig;
```

---

## 🐛 문제 해결

### Sentry에 에러가 표시되지 않음

1. **환경 변수 확인**
   - Vercel Dashboard → **Settings** → **Environment Variables**
   - 모든 Sentry 관련 환경 변수가 설정되어 있는지 확인

2. **재배포 확인**
   - 환경 변수 추가 후 재배포가 완료되었는지 확인

3. **DSN 확인**
   - DSN이 올바른 형식인지 확인
   - `https://`로 시작해야 함

4. **브라우저 콘솔 확인**
   - 개발자 도구 → Console 탭
   - Sentry 관련 에러 메시지 확인

### 로컬에서 Sentry 작동 안 함

1. **`.env.local` 파일 확인**
   - 환경 변수가 올바르게 설정되어 있는지 확인

2. **개발 서버 재시작**
   ```bash
   npm run dev
   ```

---

## 💰 비용

### Developer 플랜 (무료)
- 5,000 이벤트/월
- 1개 프로젝트
- 30일 데이터 보관

### Team 플랜 ($26/월)
- 50,000 이벤트/월
- 무제한 프로젝트
- 90일 데이터 보관

**권장**: 현재는 Developer 플랜으로 충분합니다.

---

## 🔗 참고 자료

- [Sentry Next.js 문서](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Dashboard](https://sentry.io/)
- [Sentry 가격](https://sentry.io/pricing/)

---

**다음 단계**: 환경 변수 설정 후 Vercel 재배포하면 Sentry가 작동합니다! 🚀

