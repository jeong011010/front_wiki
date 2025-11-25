# [FEATURE] JWT 기반 인증 시스템 구현

## 🎯 목표

현재 쿠키 기반 세션 인증을 JWT 기반 토큰 인증으로 전환하여 보안성과 확장성을 향상시킵니다.

## 💡 문제점

### 현재 시스템의 문제점
- ❌ `userId`를 쿠키에 직접 저장하여 보안 취약
- ❌ 세션 ID를 생성하지만 실제로 검증하지 않음
- ❌ 세션 테이블이 없어 세션 관리 불가
- ❌ 토큰 만료 관리 없음
- ❌ 리프레시 토큰 없음
- ❌ 모바일/SPA 환경에서 쿠키 관리 복잡

## ✨ 제안하는 해결책

JWT 기반 인증 시스템으로 전환:
- ✅ 액세스 토큰 (Access Token): 2시간 유효
- ✅ 리프레시 토큰 (Refresh Token): 장기 유효
- ✅ 자동 토큰 갱신 (프론트엔드)
- ✅ Role 기반 인가 (백엔드)
- ✅ 통합 API 관리 (프론트엔드)

## 📋 구현 세부사항

### 1. 백엔드 구현

#### 1.1 Prisma 스키마 수정
- `RefreshToken` 모델 추가
  - `id`: 토큰 ID
  - `token`: 리프레시 토큰 (해시)
  - `userId`: 사용자 ID
  - `expiresAt`: 만료 시간
  - `createdAt`: 생성 시간

#### 1.2 JWT 유틸리티 생성 (`lib/jwt.ts`)
- `generateAccessToken(userId, role)`: 액세스 토큰 생성 (2시간)
- `generateRefreshToken(userId)`: 리프레시 토큰 생성
- `verifyAccessToken(token)`: 액세스 토큰 검증
- `verifyRefreshToken(token)`: 리프레시 토큰 검증
- `decodeToken(token)`: 토큰 디코딩 (검증 없이)

#### 1.3 인증 미들웨어 생성 (`lib/auth-middleware.ts`)
- `authenticateToken()`: 액세스 토큰 검증 미들웨어
- `authorizeRole(roles: string[])`: Role 기반 인가 미들웨어
- `getUserFromToken(token)`: 토큰에서 사용자 정보 추출

#### 1.4 API 라우트 수정
- `POST /api/auth/login`: JWT 토큰 발급
  - 액세스 토큰 + 리프레시 토큰 반환
  - 리프레시 토큰을 DB에 저장 (해시)
- `POST /api/auth/register`: 회원가입 후 토큰 발급
- `POST /api/auth/refresh`: 리프레시 토큰으로 액세스 토큰 갱신
- `POST /api/auth/logout`: 리프레시 토큰 무효화
- `GET /api/auth/me`: 현재 사용자 정보 (토큰 검증)

#### 1.5 기존 API 보호
- 모든 보호된 API에 `authenticateToken()` 미들웨어 적용
- Role 기반 인가가 필요한 API에 `authorizeRole()` 적용
  - 예: 관리자 전용 API

### 2. 프론트엔드 구현

#### 2.1 통합 API 관리 (`lib/http.ts`)
- **Next.js 네이티브 `fetch` 사용** (Axios 대신)
- `fetch` 래퍼 함수 생성
- 요청 전처리: 액세스 토큰 자동 추가
- 응답 후처리: 401 에러 시 자동 리프레시
- 토큰 저장: localStorage 또는 httpOnly cookie
- 토큰 만료 전 자동 갱신

**Next.js `fetch` 사용 이유:**
- 서버 컴포넌트와 클라이언트 컴포넌트 모두 지원
- 번들 크기 감소 (Axios 불필요)
- Next.js 최적화된 `fetch` 사용
- 자동 요청 중복 제거 (deduplication)

#### 2.2 인증 관련 함수 (`lib/auth-client.ts`)
- `login(email, password)`: 로그인 및 토큰 저장
- `logout()`: 로그아웃 및 토큰 제거
- `refreshAccessToken()`: 액세스 토큰 갱신
- `getAccessToken()`: 저장된 액세스 토큰 가져오기
- `isTokenExpired()`: 토큰 만료 확인

#### 2.3 인증 상태 관리
- React Context 또는 Zustand로 전역 상태 관리
- 로그인 상태, 사용자 정보 관리
- 토큰 만료 시 자동 로그아웃

#### 2.4 기존 컴포넌트 수정
- `AuthButton`: 토큰 기반 인증 상태 확인
- 로그인/회원가입 페이지: 토큰 저장 로직 추가

### 3. 보안 고려사항

#### 3.1 토큰 저장
- **옵션 1**: 액세스 토큰 (localStorage) + 리프레시 토큰 (httpOnly cookie)
- **옵션 2**: 모두 httpOnly cookie (XSS 방지, CSRF 고려 필요)
- **옵션 3**: 메모리 저장 (가장 안전, 새로고침 시 재로그인 필요)

#### 3.2 토큰 만료 시간
- 액세스 토큰: 2시간
- 리프레시 토큰: 7일 또는 30일

#### 3.3 토큰 갱신 전략
- 액세스 토큰 만료 전 자동 갱신 (예: 10분 전)
- 401 에러 시 리프레시 토큰으로 자동 갱신
- 리프레시 토큰 만료 시 로그아웃

## 🔧 기술적 고려사항

### 필요한 패키지
- `jsonwebtoken`: JWT 생성 및 검증
- `@types/jsonwebtoken`: TypeScript 타입
- 또는 `jose`: JWT 라이브러리 (더 현대적)

### 환경 변수
```env
JWT_SECRET=your-secret-key (강력한 랜덤 문자열)
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRES_IN=2h
JWT_REFRESH_EXPIRES_IN=7d
```

### 데이터베이스 마이그레이션
- `RefreshToken` 모델 추가
- 기존 세션 관련 코드 제거

## 📝 구현 체크리스트

### 백엔드
- [ ] `RefreshToken` 모델 추가 (Prisma)
- [ ] 마이그레이션 실행
- [ ] `lib/jwt.ts` 생성 (JWT 유틸리티)
- [ ] `lib/auth-middleware.ts` 생성 (인증/인가 미들웨어)
- [ ] `POST /api/auth/login` 수정 (JWT 토큰 발급)
- [ ] `POST /api/auth/register` 수정 (JWT 토큰 발급)
- [ ] `POST /api/auth/refresh` 생성 (토큰 갱신)
- [ ] `POST /api/auth/logout` 수정 (리프레시 토큰 무효화)
- [ ] `GET /api/auth/me` 수정 (토큰 검증)
- [ ] 기존 API에 인증 미들웨어 적용
- [ ] 기존 쿠키 기반 인증 코드 제거

### 프론트엔드
- [ ] `lib/http.ts` 또는 `lib/api.ts` 생성 (통합 API 관리)
- [ ] `lib/auth-client.ts` 생성 (인증 클라이언트 함수)
- [ ] 인증 상태 관리 (Context 또는 Zustand)
- [ ] 로그인 페이지 수정 (토큰 저장)
- [ ] 회원가입 페이지 수정 (토큰 저장)
- [ ] `AuthButton` 컴포넌트 수정
- [ ] 자동 토큰 갱신 로직 구현
- [ ] 토큰 만료 시 자동 로그아웃

### 테스트
- [ ] 로그인/회원가입 테스트
- [ ] 토큰 갱신 테스트
- [ ] 토큰 만료 처리 테스트
- [ ] Role 기반 인가 테스트
- [ ] 자동 리프레시 테스트

## 🎯 기대 효과

- ✅ 보안성 향상 (토큰 기반 인증)
- ✅ 확장성 향상 (stateless)
- ✅ 모바일/SPA 환경 지원
- ✅ 세션 관리 용이
- ✅ Role 기반 인가 체계화

## 🔗 참고 자료

- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [JWT.io](https://jwt.io/)

## 📌 관련 이슈

- 기존 쿠키 기반 인증 시스템 개선

---

**우선순위**: High
**예상 작업 시간**: 2-3일
**복잡도**: Medium-High

