# 프론트위키 (FrontWiki)

프론트엔드와 클라우드 개발에 집중한 지식 공유 위키 플랫폼입니다.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)

## 📋 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [개발 가이드](#개발-가이드)
- [기여하기](#기여하기)
- [라이선스](#라이선스)

## ✨ 주요 기능

### 🎯 핵심 기능

1. **자동 하이퍼링크 생성**
   - 글 작성 시 기존 글의 제목과 매칭되는 키워드에 자동으로 하이퍼링크가 생성됩니다
   - 실시간으로 키워드 감지 및 링크 제안 기능
   - 한글과 영문 모두 지원하는 스마트 키워드 매칭

2. **지식 그래프 다이어그램**
   - 메인 페이지에서 모든 글과 링크 관계를 시각화한 다이어그램 제공
   - 노드 클릭으로 해당 글 페이지로 이동
   - 부모-자식 관계를 중심으로 한 의미 있는 연결 표시
   - 드래그 앤 드롭으로 노드 위치 조정 가능

3. **마크다운 에디터**
   - 실시간 미리보기 기능
   - GitHub 스타일 마크다운 렌더링
   - 이미지 드래그 앤 드롭 업로드
   - 코드 블록, 인라인 코드, 리스트, 인용문 등 다양한 포맷 지원

4. **회원 시스템**
   - 회원가입/로그인 기능
   - 역할 기반 접근 제어 (회원/관리자)
   - 글 검토 시스템 (일반 회원 글은 관리자 승인 후 공개)
   - 세션 기반 인증

5. **SEO 최적화**
   - 동적 메타 태그 생성
   - Open Graph 태그 지원
   - 자동 sitemap.xml 생성
   - robots.txt 설정

6. **검색 기능**
   - 제목 우선 검색
   - 내용 검색
   - 최신순 정렬

## 🛠 기술 스택

### 프론트엔드
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Diagram**: ReactFlow
- **Markdown**: marked, github-markdown-css

### 백엔드
- **Framework**: Next.js API Routes
- **ORM**: Prisma 5.22
- **Database**: SQLite (개발) / PostgreSQL (프로덕션 예정)
- **Authentication**: bcryptjs (비밀번호 해싱)
- **Validation**: Zod

### 인프라
- **Hosting**: Vercel (서버리스)
- **Database**: Supabase/Neon (관리형 PostgreSQL)
- **Storage**: AWS S3 (이미지 저장)
- **CDN**: CloudFront (선택사항, 현재 미사용)
- **Caching**: Vercel KV / Upstash Redis (선택사항)
- **Monitoring**: Sentry, Vercel Analytics
- **Security**: Cloudflare (선택사항)

## 🚀 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn
- Git

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/yourusername/kimjazz_blog.git
cd kimjazz_blog
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**

`.env` 파일을 생성하고 다음 내용을 추가하세요:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"  # 프로덕션에서는 실제 도메인으로 변경

# JWT 인증 설정 (필수)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_ACCESS_EXPIRES_IN="2h"  # 선택사항 (기본값: 2h)
JWT_REFRESH_EXPIRES_IN="7d"  # 선택사항 (기본값: 7d)

# Redis 캐싱 설정 (선택사항)
# Vercel KV 사용 시 (Vercel Dashboard에서 자동 생성됨)
KV_REST_API_URL="https://xxx.kv.vercel-storage.com"
KV_REST_API_TOKEN="xxx"

# 또는 Upstash Redis 사용 시
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# Sentry 모니터링 설정 (선택사항)
SENTRY_DSN="https://...@..."
NEXT_PUBLIC_SENTRY_DSN="https://...@..."
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"
```

**JWT 시크릿 키 생성 방법:**
터미널에서 다음 명령어로 강력한 랜덤 키를 생성할 수 있습니다:
```bash
# Node.js 사용
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 또는 OpenSSL 사용
openssl rand -hex 64
```

**S3 이미지 업로드 설정 (선택사항):**
프로덕션 환경에서는 AWS S3를 사용하여 이미지를 저장할 수 있습니다. S3를 사용하지 않으면 로컬 파일 시스템(`public/uploads`)에 저장됩니다.

> 📖 **상세 설정 가이드**: [S3 설정 가이드](./docs/S3_SETUP_GUIDE.md) 참고

```env
# AWS S3 설정 (최소 필수: 버킷 이름만)
AWS_S3_BUCKET_NAME="your-bucket-name"

# AWS 리전 (기본값: ap-northeast-2 - 서울)
AWS_REGION="ap-northeast-2"

# 인증 방법 (선택사항 - 아래 중 하나 선택)
# 방법 1: 환경 변수로 credentials 제공 (로컬 개발용)
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"

# 방법 2: EC2 Instance Profile 사용 (EC2 배포 시)
# - EC2 인스턴스에 IAM Role을 연결하면 자동으로 인증됩니다
# - 환경 변수 설정 불필요

# 방법 3: GitHub Actions OIDC 사용 (CI/CD)
# - GitHub Secrets에 설정하거나 OIDC를 사용하면 자동으로 인증됩니다

# CloudFront URL (선택사항 - CDN 사용 시)
AWS_CLOUDFRONT_URL="https://your-cloudfront-domain.cloudfront.net"
```

**인증 방법:**
- **EC2 배포**: EC2 인스턴스에 IAM Role을 연결하면 자동으로 인증됩니다 (환경 변수 불필요)
- **GitHub Actions**: GitHub Secrets 또는 OIDC를 사용하면 자동으로 인증됩니다
- **로컬 개발**: 환경 변수로 credentials를 제공하거나, 로컬 파일 시스템 사용

**S3 버킷 설정:**
1. AWS S3에서 버킷 생성
2. 버킷 정책에서 공개 읽기 권한 설정:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/images/*"
    }
  ]
}
```
3. CORS 설정 (필요한 경우):
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

> 💡 **참고**: `.env.example` 파일을 참고하여 필요한 환경 변수를 설정하세요.

4. **데이터베이스 마이그레이션**
```bash
npx prisma migrate dev
```

5. **Prisma 클라이언트 생성**
```bash
npx prisma generate
```

6. **개발 서버 실행**
```bash
npm run dev
```

7. **브라우저에서 확인**
   - 메인 페이지: [http://localhost:3000](http://localhost:3000)
   - 글 목록: [http://localhost:3000/articles](http://localhost:3000/articles)

### 관리자 계정 생성

```bash
npm run create-admin
```

## 📁 프로젝트 구조

```
kimjazz_blog/
├── app/                      # Next.js App Router
│   ├── api/                  # API 라우트
│   │   ├── articles/         # 글 CRUD API
│   │   ├── auth/             # 인증 API
│   │   ├── diagram/          # 다이어그램 데이터 API
│   │   ├── images/           # 이미지 업로드 API
│   │   └── keywords/         # 키워드 관련 API
│   ├── articles/             # 글 관련 페이지
│   │   ├── [slug]/           # 글 상세/수정 페이지
│   │   └── new/              # 새 글 작성
│   ├── auth/                 # 인증 페이지
│   ├── admin/                 # 관리자 페이지
│   ├── layout.tsx             # 루트 레이아웃
│   ├── page.tsx               # 메인 페이지 (다이어그램)
│   ├── sitemap.ts             # sitemap.xml 생성
│   └── robots.ts              # robots.txt 생성
├── components/                # React 컴포넌트
│   ├── Admin/                 # 관리자 컴포넌트
│   ├── Diagram/               # 다이어그램 컴포넌트
│   ├── Editor/                # 에디터 컴포넌트
│   └── ...                    # 기타 컴포넌트
├── lib/                       # 유틸리티 함수
│   ├── auth.ts                # 인증 관련 함수
│   ├── link-detector.ts       # 자동 링크 감지 로직
│   ├── prisma.ts              # Prisma 클라이언트
│   └── utils.ts               # 유틸리티 함수
├── prisma/                    # Prisma 설정
│   ├── schema.prisma          # 데이터베이스 스키마
│   └── migrations/            # 마이그레이션 파일
├── public/                    # 정적 파일
│   └── uploads/               # 업로드된 이미지
├── scripts/                   # 스크립트
│   └── create-admin.ts        # 관리자 계정 생성
├── types/                     # TypeScript 타입 정의
└── .github/                   # GitHub 설정
    ├── ISSUE_TEMPLATE/        # Issue 템플릿
    └── PULL_REQUEST_TEMPLATE.md
```

## 💻 개발 가이드

### 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint

# 관리자 계정 생성
npm run create-admin
```

### 데이터베이스 관리

```bash
# 마이그레이션 생성 및 적용
npx prisma migrate dev

# Prisma Studio 실행 (데이터베이스 GUI)
npx prisma studio

# 스키마 변경 후 클라이언트 재생성
npx prisma generate
```

### 코드 스타일

- TypeScript 사용 (any 타입 사용 금지)
- ESLint 규칙 준수
- Prettier 포맷팅 (설정 예정)
- 컴포넌트는 함수형 컴포넌트 사용
- 타입은 `types/` 디렉토리에서 중앙 관리

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면 다음 가이드를 참고해주세요:

1. [기여 가이드](CONTRIBUTING.md)를 읽어주세요
2. [GitHub 워크플로우 가이드](docs/GIT_WORKFLOW.md)를 참고하세요
3. [이슈를 생성](https://github.com/yourusername/kimjazz_blog/issues)하거나 기존 이슈를 확인하세요
4. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
5. 변경사항을 커밋하세요 (커밋 컨벤션 준수)
6. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
7. Pull Request를 생성하세요

### 📚 상세 가이드

- **[GitHub 워크플로우 완전 가이드](docs/GIT_WORKFLOW.md)**: 커밋, 브랜치, PR, 이슈 관리 전체 프로세스
- **[커밋 메시지 예시](docs/COMMIT_EXAMPLES.md)**: 실제 사용 가능한 커밋 메시지 예시 모음
- **[브랜치 전략 가이드](docs/BRANCH_STRATEGY.md)**: 브랜치 생성 및 관리 전략
- **[기여 가이드](CONTRIBUTING.md)**: 코드 기여 방법

## 📝 주요 기능 설명

### 자동 링크 생성

글을 작성하거나 수정할 때, 내용에 포함된 단어가 기존 글의 제목과 일치하면 자동으로 하이퍼링크가 생성됩니다.

**예시:**
- "React"라는 제목의 글이 이미 존재
- 새 글에서 "React는 프론트엔드 프레임워크입니다"라고 작성
- "React" 단어에 자동으로 링크가 생성됨

**특징:**
- 한글과 영문 모두 지원
- 실시간 키워드 제안 드롭다운
- 긴 제목부터 우선 매칭 (더 구체적인 매칭 우선)

### 지식 그래프

메인 페이지에서 모든 글을 노드로, 글 간의 링크 관계를 엣지로 시각화합니다.

**기능:**
- 노드 클릭으로 해당 글 페이지로 이동
- 부모-자식 관계만 표시 (의미 있는 연결)
- 드래그 앤 드롭으로 노드 위치 조정
- 줌 인/아웃, 패닝 지원

### 글 검토 시스템

일반 회원이 작성한 글은 관리자 승인 후 공개됩니다.

**워크플로우:**
1. 회원이 글 작성 → `pending` 상태
2. 관리자가 `/admin/review`에서 검토
3. 승인 → `published` 상태로 변경
4. 거부 → `rejected` 상태로 변경

## 🐛 알려진 이슈

현재 알려진 이슈는 [Issues](https://github.com/yourusername/kimjazz_blog/issues)에서 확인할 수 있습니다.

## 🚀 배포

서버리스 아키텍처로 비용 없이 배포할 수 있습니다.

**주요 서비스:**
- **Vercel**: 서버리스 호스팅 (무료)
- **Supabase/Neon**: 관리형 PostgreSQL (무료)
- **AWS S3**: 이미지 저장 (프리티어)
- **CloudFront**: CDN (프리티어)
- **CloudWatch**: 모니터링 (프리티어)

자세한 배포 가이드는 [배포 가이드](docs/DEPLOYMENT_GUIDE.md)를 참고하세요.

## 🗺 로드맵

- [x] S3 이미지 업로드 연동
- [ ] 댓글 시스템
- [ ] 좋아요/북마크 기능
- [x] 카테고리/태그 시스템
- [ ] 사용자 프로필 페이지
- [ ] 알림 시스템
- [ ] 다이어그램 필터링/검색 기능

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 👤 작성자

- **kimjazz** - [GitHub](https://github.com/yourusername)

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들을 사용합니다:
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Prisma](https://www.prisma.io/)
- [ReactFlow](https://reactflow.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!
