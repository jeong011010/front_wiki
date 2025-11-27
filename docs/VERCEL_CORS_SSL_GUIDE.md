# Vercel 서버리스 아키텍처에서 CORS와 SSL 가이드

## 📋 아키텍처 비교

### 기존 구조 (EC2 백엔드 + 프론트엔드 분리)

```
프론트엔드 (예: example.com)
    ↓ (CORS 필요)
백엔드 API (예: api.example.com 또는 다른 도메인)
    ↓ (HTTPS 필요)
SSL 인증서 설정 필요
```

**필요한 설정:**
- ✅ 백엔드에서 프론트엔드 도메인 CORS 허용
- ✅ SSL 인증서 구매 및 설정
- ✅ HTTPS 통신 설정

### Vercel 서버리스 구조 (현재)

```
프론트엔드 + API (같은 도메인: front-wiki.store)
    ├── / (프론트엔드)
    ├── /api/articles (API)
    ├── /api/auth (API)
    └── /api/* (모든 API)
```

**필요한 설정:**
- ❌ **CORS 설정 불필요** (같은 도메인)
- ✅ **SSL 자동 발급** (Vercel이 처리)
- ✅ **HTTPS 자동 활성화** (Vercel이 처리)

## ✅ Vercel이 자동으로 처리하는 것들

### 1. SSL 인증서
- **Let's Encrypt 자동 발급**
- 도메인 연결 시 자동으로 HTTPS 활성화
- 인증서 갱신도 자동 처리
- **별도 구매나 설정 불필요**

### 2. CORS (같은 도메인)
- 프론트엔드와 API가 같은 도메인에서 제공
- **CORS 설정이 필요 없음**
- 브라우저가 같은 출처(Same-Origin)로 인식

### 3. HTTPS 통신
- 모든 요청이 자동으로 HTTPS로 리다이렉트
- HTTP → HTTPS 자동 변환
- 보안 헤더 자동 설정

## 🔍 현재 프로젝트 구조

### API 라우트 위치
```
front-wiki.store/
├── /                    # 프론트엔드 (Next.js 페이지)
├── /api/articles        # API 엔드포인트
├── /api/auth           # 인증 API
├── /api/diagram        # 다이어그램 API
└── /api/*              # 기타 API
```

### 프론트엔드에서 API 호출
```typescript
// 같은 도메인이므로 CORS 불필요
fetch('/api/articles')  // ✅ 자동으로 https://front-wiki.store/api/articles
```

## ⚠️ CORS가 필요한 경우

### 외부 서비스 호출 시

#### 1. AWS S3 이미지 업로드
- S3 버킷에서 CORS 설정 필요 (이미 설정됨)
- Vercel과는 무관, S3 버킷 설정

#### 2. 외부 API 호출
만약 다른 도메인의 API를 호출한다면:
```typescript
// 예: 외부 API 호출
fetch('https://external-api.com/data')
```
- 외부 API 서버에서 CORS 허용 필요
- Vercel에서는 설정 불필요

## 📝 실제 설정 확인

### 현재 프로젝트의 CORS 설정
- ✅ **API 라우트에 CORS 헤더 없음** (불필요)
- ✅ **Next.js가 자동으로 처리**
- ✅ **같은 도메인이므로 CORS 문제 없음**

### S3 CORS 설정 (별도)
- S3 버킷 → Permissions → CORS
- 이미지 업로드를 위한 설정 (Vercel과 무관)

## 🚀 도메인 변경 시 확인사항

### 1. 환경 변수 확인
```env
NEXT_PUBLIC_SITE_URL=https://front-wiki.store
```

### 2. API 호출 확인
- 모든 API 호출이 상대 경로(`/api/*`)로 되어 있는지 확인
- 절대 URL 사용 시 도메인 업데이트 필요

### 3. 외부 서비스 설정
- S3 CORS 설정에 새 도메인 추가 (필요 시)
- OAuth 리다이렉트 URL 업데이트 (필요 시)

## 💡 요약

### 질문: CORS와 SSL 설정이 필요한가?

**답변:**
- ❌ **CORS 설정 불필요** - 같은 도메인에서 프론트엔드와 API 제공
- ✅ **SSL 자동 처리** - Vercel이 Let's Encrypt로 자동 발급
- ✅ **HTTPS 자동 활성화** - 도메인 연결 시 자동

### 기존 EC2 구조와의 차이

| 항목 | EC2 구조 | Vercel 구조 |
|------|---------|------------|
| CORS 설정 | ✅ 필요 | ❌ 불필요 |
| SSL 인증서 | ✅ 수동 구매/설정 | ✅ 자동 발급 |
| HTTPS 설정 | ✅ 수동 설정 | ✅ 자동 활성화 |
| 도메인 분리 | 프론트/백엔드 분리 | 같은 도메인 |

## 🔗 참고 링크

- [Vercel 도메인 설정](https://vercel.com/docs/concepts/projects/domains)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [CORS 설명](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)


