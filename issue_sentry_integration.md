# Sentry 모니터링 시스템 통합

## 개요
프로덕션 환경에서 발생하는 오류를 실시간으로 모니터링하고 추적하기 위해 Sentry를 통합했습니다.

## 목표
- 클라이언트 사이드 및 서버 사이드 오류 자동 캡처
- 실시간 오류 알림 및 대시보드 모니터링
- 성능 추적 및 세션 리플레이 기능 활성화

## 작업 내용

### 1. Sentry 설정 파일 생성
- `sentry.client.config.ts`: 클라이언트 사이드 초기화 설정
- `sentry.server.config.ts`: 서버 사이드 초기화 설정
- `sentry.edge.config.ts`: Edge 함수 초기화 설정

### 2. SentryInit 컴포넌트 생성
- `components/SentryInit.tsx`: 클라이언트 컴포넌트로 명시적 초기화
- `app/layout.tsx`에 통합하여 모든 페이지에서 자동 초기화
- 중복 초기화 방지 로직 포함

### 3. Next.js 설정 업데이트
- `next.config.ts`에 `withSentryConfig` 통합
- Source maps 업로드 설정
- Tunnel route 설정

### 4. 테스트 도구 생성
- `/api/test-sentry`: 서버 사이드 테스트 API
- `/test-sentry`: 클라이언트 사이드 테스트 페이지
- `/api/test-sentry-env`: 환경 변수 확인 API

### 5. 주요 기능
- **오류 캡처**: 클라이언트/서버 사이드 자동 오류 캡처
- **성능 모니터링**: Browser Tracing Integration
- **세션 리플레이**: Session Replay Integration (오류 발생 시 100%, 일반 세션 10%)
- **분산 추적**: Trace Propagation Targets 설정

## 환경 변수
다음 환경 변수가 필요합니다:
- `SENTRY_DSN`: 서버 사이드 DSN
- `NEXT_PUBLIC_SENTRY_DSN`: 클라이언트 사이드 DSN
- `SENTRY_ORG`: Sentry 조직 ID
- `SENTRY_PROJECT`: Sentry 프로젝트 이름

## 테스트
1. `/test-sentry` 페이지에서 클라이언트 사이드 오류 테스트
2. `/api/test-sentry?type=error` API로 서버 사이드 오류 테스트
3. Sentry 대시보드에서 이벤트 수신 확인

## 참고
- Sentry 대시보드: https://sentry.io
- 프로젝트: front-wiki
- 환경: development, production

