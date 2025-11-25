# [FEATURE] JWT 기반 인증 시스템 구현 #13

## 🎯 개요

기존 쿠키 기반 세션 인증을 JWT 기반 토큰 인증으로 전환하여 보안성과 확장성을 향상시켰습니다.

## ✨ 주요 변경사항

### 백엔드

#### 1. Prisma 스키마 수정
- `RefreshToken` 모델 추가
- 리프레시 토큰 저장 및 관리

#### 2. JWT 유틸리티 (`lib/jwt.ts`)
- 액세스 토큰 생성/검증 (2시간 유효)
- 리프레시 토큰 생성/검증 (7일 유효)
- 토큰 만료 시간 확인 및 검증 함수

#### 3. 인증/인가 미들웨어 (`lib/auth-middleware.ts`)
- `authenticateToken`: 액세스 토큰 검증 (선택적 인증)
- `requireAuth`: 필수 인증 미들웨어
- `requireAdmin`: 관리자 전용 인증 미들웨어
- `authorizeRole`: Role 기반 인가

#### 4. 인증 API 라우트 수정/생성
- `POST /api/auth/login`: JWT 토큰 발급
- `POST /api/auth/register`: 회원가입 후 JWT 토큰 발급
- `POST /api/auth/refresh`: 리프레시 토큰으로 액세스 토큰 갱신 (토큰 로테이션)
- `POST /api/auth/logout`: 리프레시 토큰 삭제
- `GET /api/auth/me`: 현재 사용자 정보 조회

#### 5. 기존 API에 인증 미들웨어 적용
- **필수 인증**: `requireAuth` 사용
  - `POST /api/images/upload`
  - `POST /api/articles`
  - `PUT /api/articles/[id]`, `DELETE /api/articles/[id]`
  - `PUT /api/articles/slug/[slug]`, `DELETE /api/articles/slug/[slug]`
- **선택적 인증**: `authenticateToken` 사용 (비회원도 조회 가능)
  - `GET /api/articles`
  - `GET /api/articles/[id]`
  - `GET /api/articles/slug/[slug]`
  - `GET /api/articles/featured`
  - `GET /api/articles/search`
  - `GET /api/articles/preview/[slug]`
  - `GET /api/articles/categories`
  - `GET /api/articles/categories/list`
  - `GET /api/diagram`
- **관리자 전용**: `requireAdmin` 사용
  - `GET /api/articles/review`, `POST /api/articles/review`
  - `POST /api/categories`
  - `PUT /api/categories/[id]`, `DELETE /api/categories/[id]`

### 프론트엔드

#### 1. 통합 API 관리 (`lib/http.ts`)
- Next.js 네이티브 `fetch` 기반 통합 API 관리
- 액세스 토큰 자동 추가 (Authorization 헤더)
- 401 에러 시 자동 리프레시 토큰으로 갱신
- 토큰 만료 전 자동 갱신 (10분 전)
- `apiGet`, `apiPost`, `apiPut`, `apiDelete` 헬퍼 함수 제공

#### 2. 인증 클라이언트 함수 (`lib/auth-client.ts`)
- `login`: 로그인 및 토큰 저장
- `register`: 회원가입 및 토큰 저장
- `logout`: 로그아웃 및 토큰 제거
- `getCurrentUser`: 현재 사용자 정보 조회
- `refreshAccessToken`: 액세스 토큰 갱신
- 토큰 관리 유틸리티 함수

#### 3. 컴포넌트 마이그레이션
- `app/auth/login/page.tsx`: `login` 함수 사용
- `app/auth/register/page.tsx`: `register` 함수 사용
- `components/AuthButton.tsx`: `getCurrentUser`, `logout` 함수 사용

## 🔧 기술적 세부사항

### 토큰 저장 전략
- **액세스 토큰**: localStorage 저장 (2시간 유효)
- **리프레시 토큰**: httpOnly cookie 저장 (7일 유효)

### 보안 기능
- 리프레시 토큰 해싱 저장 (bcrypt)
- 토큰 로테이션 (리프레시 시 새 토큰 발급)
- 한 기기당 하나의 리프레시 토큰만 유지
- Role 기반 인가 (user/admin)

### 자동 토큰 갱신
- 토큰 만료 10분 전 자동 갱신
- 401 에러 시 자동 리프레시 시도
- 갱신 실패 시 자동 로그아웃 및 로그인 페이지 리다이렉트

## 📋 환경 변수

`.env` 파일에 다음 환경 변수 추가 필요:

```env
# JWT 인증 설정 (필수)
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_ACCESS_EXPIRES_IN="2h"  # 선택사항 (기본값: 2h)
JWT_REFRESH_EXPIRES_IN="7d"  # 선택사항 (기본값: 7d)
```

## 🗑️ 제거된 코드

- `getSessionUser` 사용 제거 (모든 API)
- 쿠키 기반 세션 생성 코드 제거 (`createSession`, `setUserIdCookie`는 유지하되 사용하지 않음)

## ✅ 테스트

- [x] 로그인/회원가입 테스트
- [x] 토큰 자동 갱신 테스트
- [x] 401 에러 시 자동 리프레시 테스트
- [x] 관리자 권한 인가 테스트
- [x] 비회원 조회 기능 테스트

## 📝 참고사항

- Prisma 타입 캐시 문제로 인해 `app/api/articles/[id]/route.ts`에 `@ts-expect-error` 주석 추가
- TypeScript 서버 재시작 시 해결 가능
- 실제 런타임에서는 정상 작동

## 🔗 관련 이슈

Closes #13

