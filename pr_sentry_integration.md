# feat: Sentry 모니터링 시스템 통합

## 관련 이슈
Closes #[이슈번호]

## 변경 사항

### 추가된 파일
- `components/SentryInit.tsx`: Sentry 클라이언트 초기화 컴포넌트
- `app/api/test-sentry/route.ts`: 서버 사이드 Sentry 테스트 API
- `app/test-sentry/page.tsx`: 클라이언트 사이드 Sentry 테스트 페이지
- `app/api/test-sentry-env/route.ts`: 환경 변수 확인 API
- `sentry.client.config.ts`: 클라이언트 사이드 Sentry 설정 (비활성화됨)
- `sentry.server.config.ts`: 서버 사이드 Sentry 설정
- `sentry.edge.config.ts`: Edge 함수 Sentry 설정

### 수정된 파일
- `app/layout.tsx`: SentryInit 컴포넌트 추가
- `next.config.ts`: withSentryConfig 통합

### 주요 기능
1. **자동 오류 캡처**
   - 클라이언트 사이드: JavaScript 오류, Promise rejection, 콘솔 오류
   - 서버 사이드: API 라우트 오류, 서버 컴포넌트 오류

2. **성능 모니터링**
   - Browser Tracing Integration으로 페이지 로드 시간 추적
   - API 요청 성능 추적

3. **세션 리플레이**
   - 오류 발생 시 100% 리플레이 캡처
   - 일반 세션 10% 샘플링

4. **분산 추적**
   - 클라이언트-서버 간 요청 추적
   - Trace propagation targets 설정

## 테스트
- [x] 클라이언트 사이드 오류 캡처 테스트
- [x] 서버 사이드 오류 캡처 테스트
- [x] Sentry 대시보드에서 이벤트 수신 확인
- [x] 환경 변수 설정 확인

## 환경 변수 설정 필요
다음 환경 변수를 Vercel에 추가해야 합니다:
```
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_ORG=...
SENTRY_PROJECT=front-wiki
```

## 스크린샷
- Sentry 대시보드에서 오류 이벤트 수신 확인됨
- 클라이언트/서버 사이드 오류 모두 정상 캡처됨

## 참고사항
- `sentry.client.config.ts`는 자동 로드가 작동하지 않아 `SentryInit` 컴포넌트로 대체
- 프로덕션 환경에서는 디버그 로그가 자동으로 비활성화됨

