# 인증 토큰 이슈 근본 원인 분석

## 문제 상황
로그인 상태임에도 불구하고 인증이 필요한 API에 접근할 수 없는 문제가 반복적으로 발생했습니다.

## 근본 원인

### 1. **클라이언트 컴포넌트에서 일반 `fetch` 사용**
- 문제: 클라이언트 컴포넌트에서 API 호출 시 일반 `fetch()`를 사용하여 인증 토큰이 포함되지 않음
- 예시:
  ```typescript
  // ❌ 잘못된 방법
  const response = await fetch('/api/articles/slug/.../comments', {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
  ```
- 결과: Authorization 헤더가 없어서 서버에서 인증 실패 (401)

### 2. **기존 API 클라이언트 함수 미사용**
- `lib/http.ts`에 완전한 API 클라이언트 함수가 이미 존재:
  - `apiGet`, `apiPost`, `apiPut`, `apiDelete`
  - 자동 토큰 포함
  - 401 에러 시 자동 토큰 갱신
  - 토큰 만료 전 자동 갱신
- 하지만 대부분의 컴포넌트에서 이 함수들을 사용하지 않음

### 3. **`authenticatedFetch` 함수의 불완전한 사용**
- `lib/api-client.ts`에 `authenticatedFetch` 함수가 존재하지만:
  - 일부 컴포넌트에서만 사용됨
  - `lib/http.ts`의 더 완전한 함수들보다 기능이 제한적

## 해결 방법

### ✅ 올바른 방법 1: `lib/http.ts`의 API 클라이언트 사용 (권장)

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/http'

// GET 요청
const data = await apiGet<{ comments: Comment[] }>('/api/articles/slug/.../comments')

// POST 요청
await apiPost('/api/articles/slug/.../comments', { content })

// PUT 요청
await apiPut('/api/articles/slug/.../comments/123', { content })

// DELETE 요청
await apiDelete('/api/articles/slug/.../comments/123')
```

**장점:**
- 자동으로 Authorization 헤더 포함
- 401 에러 시 자동 토큰 갱신 및 재시도
- 토큰 만료 전 자동 갱신 (10분 전)
- 에러 처리 자동화
- JSON 파싱 자동화

### ✅ 올바른 방법 2: `authenticatedFetch` 사용

```typescript
import { authenticatedFetch } from '@/lib/api-client'

const response = await authenticatedFetch('/api/articles/slug/.../comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ content }),
})
```

**장점:**
- 자동으로 Authorization 헤더 포함
- 쿠키 자동 포함 (`credentials: 'include'`)

**단점:**
- 401 에러 시 자동 갱신 없음
- 수동 에러 처리 필요

## 인증 토큰 저장 및 전달 흐름

### 1. 로그인 시
```
사용자 로그인
  ↓
POST /api/auth/login
  ↓
서버: accessToken 생성 (JWT)
  ↓
응답: { user, accessToken }
  ↓
클라이언트: localStorage.setItem('accessToken', token)
```

### 2. API 요청 시
```
클라이언트 컴포넌트
  ↓
apiPost('/api/...', data) 또는 authenticatedFetch(...)
  ↓
lib/http.ts 또는 lib/api-client.ts
  ↓
localStorage.getItem('accessToken')
  ↓
Authorization: Bearer ${token} 헤더 추가
  ↓
fetch(url, { headers: { Authorization: ... } })
  ↓
서버: extractAccessToken(request) → 토큰 검증
```

### 3. 토큰 갱신 시
```
401 에러 발생
  ↓
lib/http.ts의 apiRequest
  ↓
refreshAccessToken() 호출
  ↓
POST /api/auth/refresh (쿠키에 refreshToken 포함)
  ↓
새로운 accessToken 받음
  ↓
localStorage.setItem('accessToken', newToken)
  ↓
원래 요청 재시도
```

## 수정된 파일

### 1. `components/ArticleComments.tsx`
- ❌ 이전: 일반 `fetch()` 사용
- ✅ 이후: `apiGet`, `apiPost`, `apiPut`, `apiDelete` 사용

### 2. `lib/api-client.ts`
- ✅ `getAccessToken`을 `lib/auth-client.ts`에서 import하도록 개선
- ✅ 일관성 향상

## 향후 개발 가이드

### ✅ DO: 인증이 필요한 API 호출 시

```typescript
// lib/http.ts의 함수 사용 (권장)
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/http'

const data = await apiPost('/api/...', { ... })
```

### ❌ DON'T: 일반 fetch 사용

```typescript
// ❌ 절대 사용하지 말 것
const response = await fetch('/api/...', {
  method: 'POST',
  body: JSON.stringify({ ... }),
})
```

### 예외: 인증이 필요 없는 API

```typescript
// 공개 API는 일반 fetch 사용 가능
const response = await fetch('/api/articles/featured')
```

## 체크리스트

새로운 인증이 필요한 기능을 추가할 때:

- [ ] `lib/http.ts`의 `apiGet`, `apiPost`, `apiPut`, `apiDelete` 사용
- [ ] 일반 `fetch()` 사용하지 않기
- [ ] Authorization 헤더 수동 추가하지 않기
- [ ] 테스트: 로그인 상태에서 API 호출이 정상 작동하는지 확인

## 관련 파일

- `lib/http.ts` - 완전한 API 클라이언트 (자동 토큰 관리)
- `lib/api-client.ts` - 간단한 인증 fetch 래퍼
- `lib/auth-client.ts` - 인증 관련 클라이언트 함수
- `lib/auth-middleware.ts` - 서버 측 인증 미들웨어

