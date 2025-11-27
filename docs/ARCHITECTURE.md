# 프론트위키 서비스 아키텍처

## 📋 개요

프론트위키는 서버리스 아키텍처를 기반으로 한 지식 공유 위키 플랫폼입니다. 클라우드 네이티브 서비스를 활용하여 확장성, 안정성, 비용 효율성을 확보했습니다.

## 🏗️ 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                         사용자 (Browser)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             │ front-wiki.store
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel (Serverless Platform)                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Next.js Application (Full-Stack)            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │  │  Frontend    │  │  API Routes  │  │  Server      │    │   │
│  │  │  (React)     │  │  (Next.js)   │  │  Components  │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  - 자동 HTTPS (Let's Encrypt)                                    │
│  - 글로벌 CDN (Edge Network)                                      │
│  - 자동 스케일링                                                   │
│  - 서버리스 함수 (Edge Functions)                                  │
└─────────────────┬───────────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌──────────────┐   ┌──────────────────┐
│  Supabase    │   │   AWS S3         │
│  (Database)  │   │   (Storage)      │
│              │   │                  │
│  PostgreSQL  │   │  ┌────────────┐  │
│  - Users     │   │  │ CloudFront │  │
│  - Articles  │   │  │   (CDN)    │  │
│  - Categories│   │  └────────────┘  │
│  - Links     │   │                  │
│  - Tokens    │   │  이미지 파일        │
└──────────────┘   └──────────────────┘
```

## 🔧 구성 요소 상세

### 1. 프론트엔드 + 백엔드: Vercel

**서비스**: Vercel (Serverless Platform)  
**역할**: 
- 프론트엔드 배포 및 호스팅
- API 서버 (Next.js API Routes)
- 서버 사이드 렌더링 (SSR)
- 정적 파일 서빙

**주요 기능**:
- ✅ 자동 HTTPS (Let's Encrypt)
- ✅ 글로벌 CDN (Edge Network)
- ✅ 자동 스케일링
- ✅ 서버리스 함수 (Edge Functions)
- ✅ 환경 변수 관리
- ✅ CI/CD 통합 (GitHub)

**기술 스택**:
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4

**API 엔드포인트**:
- `/api/articles` - 글 CRUD
- `/api/auth` - 인증 (로그인, 회원가입, 토큰 갱신)
- `/api/diagram` - 다이어그램 데이터
- `/api/images/upload` - 이미지 업로드
- `/api/categories` - 카테고리 관리

**비용**: 
- Hobby 플랜 (무료) - 개인 프로젝트
- Pro 플랜 - 팀/상업적 사용 시

### 2. 데이터베이스: Supabase

**서비스**: Supabase (Managed PostgreSQL)  
**역할**: 
- 관계형 데이터베이스
- 사용자 데이터 저장
- 글 및 카테고리 데이터 저장
- 인증 토큰 관리

**주요 기능**:
- ✅ 관리형 PostgreSQL
- ✅ 자동 백업
- ✅ Connection Pooling
- ✅ 실시간 구독 (Realtime)
- ✅ Row Level Security (RLS)

**데이터 모델**:
- `User` - 사용자 정보
- `Article` - 글 데이터
- `Category` - 카테고리 (계층 구조)
- `ArticleLink` - 글 간 링크 관계
- `RefreshToken` - JWT 리프레시 토큰

**연결 방식**:
- Session Pooler (Vercel 최적화)
- Direct Connection (로컬 개발)

**비용**:
- Free 플랜 - 개발/소규모 프로젝트
- Pro 플랜 - 프로덕션 환경

### 3. 스토리지: AWS S3

**서비스**: AWS S3 (Simple Storage Service)  
**역할**: 
- 이미지 파일 저장
- 정적 자산 저장

**주요 기능**:
- ✅ 무제한 스토리지
- ✅ 높은 내구성 (99.999999999%)
- ✅ 버전 관리
- ✅ CORS 설정
- ✅ 접근 제어 (IAM)

**버킷 설정**:
- Region: `ap-northeast-2` (서울)
- CORS: Vercel 도메인 허용
- Public Access: 이미지 파일 공개

**비용**:
- 스토리지: $0.023/GB/월
- 요청: $0.005/1,000 requests
- 데이터 전송: 무료 (CloudFront 사용 시)

### 4. CDN: AWS CloudFront (선택사항, 현재 미사용)

**서비스**: AWS CloudFront  
**상태**: 
- ⚠️ 코드에서 지원하지만 현재 미사용
- `AWS_CLOUDFRONT_URL` 환경 변수 미설정
- 현재는 S3 직접 URL 사용 중

**역할** (설정 시):
- S3 이미지 파일 전송 최적화
- 글로벌 콘텐츠 배포
- 캐싱으로 비용 절감

**주요 기능**:
- ✅ 글로벌 엣지 로케이션
- ✅ 자동 캐싱
- ✅ HTTPS 지원
- ✅ 압축 (Gzip/Brotli)

**설정 방법** (필요 시):
- Origin: S3 Bucket
- Distribution: 이미지 파일 전용
- Cache Policy: 최적화된 캐싱
- 환경 변수: `AWS_CLOUDFRONT_URL` 설정

**비용** (설정 시):
- 데이터 전송: $0.085/GB (첫 10TB)
- 요청: $0.0075/10,000 requests

### 5. 도메인: 가비아

**서비스**: 가비아 (Domain Registrar)  
**역할**: 
- 도메인 등록 및 관리
- DNS 네임서버 설정

**도메인**:
- `front-wiki.store`
- `www.front-wiki.store` (리다이렉트)

**DNS 설정**:
- 네임서버: Vercel DNS
  - `ns1.vercel-dns.com`
  - `ns2.vercel-dns.com`
  - `ns3.vercel-dns.com`
  - `ns4.vercel-dns.com`

**비용**:
- 도메인 등록: 연간 구독료

## 🔐 보안 아키텍처

### 인증 및 인가

**JWT 기반 인증**:
- Access Token: 2시간 유효 (localStorage)
- Refresh Token: 7일 유효 (httpOnly Cookie)
- 토큰 로테이션 (Refresh 시 새 토큰 발급)

**보안 기능**:
- ✅ 비밀번호 해싱 (bcrypt)
- ✅ 리프레시 토큰 해싱 저장
- ✅ Role 기반 인가 (user/admin)
- ✅ HTTPS 강제 (Vercel 자동)

### 데이터 보안

**데이터베이스**:
- Connection String 암호화
- Row Level Security (Supabase)
- 자동 백업

**스토리지**:
- S3 버킷 정책 (접근 제어)
- IAM 역할 기반 접근
- CORS 설정

## 📊 데이터 흐름

### 1. 사용자 인증 흐름

```
사용자 → Vercel (로그인 API) → Supabase (사용자 확인)
  ↓
JWT 토큰 생성 → 클라이언트 저장
  ↓
이후 요청: Authorization 헤더에 토큰 포함
```

### 2. 글 작성 흐름

```
사용자 → Vercel (글 작성 API) → Supabase (저장)
  ↓
자동 키워드 감지 → ArticleLink 생성
  ↓
응답 반환
```

### 3. 이미지 업로드 흐름

```
사용자 → Vercel (이미지 업로드 API) → AWS S3 (저장)
  ↓
CloudFront URL 생성 → 클라이언트 반환
  ↓
마크다운에 이미지 URL 삽입
```

### 4. 글 조회 흐름

```
사용자 → Vercel (SSR/API) → Supabase (데이터 조회)
  ↓
마크다운 렌더링 → HTML 변환
  ↓
이미지 URL → CloudFront → S3
```

## 🚀 확장성

### 수평 확장
- **Vercel**: 자동 스케일링 (트래픽에 따라)
- **Supabase**: Connection Pooling으로 동시 연결 관리
- **S3**: 무제한 스토리지 확장
- **CloudFront**: 글로벌 엣지 네트워크

### 성능 최적화
- **CDN**: 정적 자산 캐싱
- **Edge Functions**: 사용자 근처에서 실행
- **Database Indexing**: 빠른 쿼리
- **Image Optimization**: Next.js 자동 최적화

## 💰 비용 구조

### 예상 월 비용 (소규모 트래픽)

| 서비스 | 플랜 | 월 비용 |
|--------|------|---------|
| Vercel | Hobby | $0 (무료) |
| Supabase | Free | $0 (무료) |
| AWS S3 | Pay-as-you-go | ~$1-5 |
| CloudFront | 미사용 | $0 |
| 도메인 | 연간 | ~$10-20/년 |
| **총계** | | **~$2-8/월** |

### 비용 최적화
- ✅ 서버리스 아키텍처 (사용한 만큼만 지불)
- ✅ CDN 캐싱으로 데이터 전송 비용 절감
- ✅ 무료 플랜 활용 (개발 단계)

## 📈 모니터링 및 로깅

### Vercel
- 배포 로그
- 함수 실행 로그
- 에러 추적
- 성능 메트릭

### Supabase
- 데이터베이스 쿼리 로그
- 연결 상태 모니터링
- 백업 상태

### AWS
- S3 메트릭 (AWS 자동 생성, 직접 사용하지 않음)
- 비용 모니터링 (AWS 콘솔)
- 액세스 로그 (S3 버킷 로깅 설정 시)

## 🔄 CI/CD 파이프라인

```
GitHub (코드 저장소)
  ↓ (Push/PR)
GitHub Actions (자동 테스트)
  ↓
Vercel (자동 배포)
  ↓
프로덕션 환경
```

**배포 전략**:
- `main` 브랜치 → Production
- `develop` 브랜치 → Preview
- Feature 브랜치 → Preview

## 🛠️ 개발 환경

### 로컬 개발
- Next.js 개발 서버
- Supabase 로컬 연결 (Session Pooler)
- 환경 변수 관리 (`.env`)

### 프로덕션 환경
- Vercel 자동 배포
- 환경 변수 (Vercel Dashboard)
- 데이터베이스 (Supabase Production)

## 📝 기술 스택 요약

### 프론트엔드
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Framer Motion

### 백엔드
- Next.js API Routes
- Prisma ORM
- JWT 인증
- Zod 검증

### 인프라
- Vercel (호스팅)
- Supabase (데이터베이스)
- AWS S3 (스토리지)
- CloudFront (CDN)

### 도구
- GitHub (버전 관리)
- GitHub Actions (CI/CD)
- Prisma (ORM)

## 🔗 참고 링크

- [Vercel 문서](https://vercel.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [AWS S3 문서](https://docs.aws.amazon.com/s3/)
- [CloudFront 문서](https://docs.aws.amazon.com/cloudfront/)

