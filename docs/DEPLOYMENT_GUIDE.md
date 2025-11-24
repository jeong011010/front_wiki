# 서버리스 배포 가이드 (비용 $0)

이 가이드는 AWS 프리티어와 무료 서비스를 활용하여 비용 없이 서버리스 아키텍처로 배포하는 방법을 설명합니다.

## 🏗️ 아키텍처 구성

```
Internet
  ↓
도메인 (별도 구매)
  ↓
Vercel (무료 플랜)
  ├─ Next.js App (서버리스 함수)
  ├─ Edge Functions
  └─ 자동 배포 (GitHub 연동)
  ↓
Supabase/Neon (무료 PostgreSQL)
  ↓
AWS S3 (프리티어)
  ├─ 이미지 저장
  └─ CloudFront (프리티어) - CDN
  ↓
CloudWatch (프리티어) - 모니터링
  └─ Vercel Analytics (무료) - 분석
```

## 📋 사용 서비스 및 비용

### 무료 서비스
1. **Vercel** (무료 플랜)
   - 무제한 개인 프로젝트
   - 100GB 대역폭/월
   - 자동 SSL
   - Edge Functions

2. **Supabase** (무료 플랜)
   - PostgreSQL 500MB
   - 2GB 대역폭/월
   - 또는 **Neon** (무료 플랜)
   - PostgreSQL 3GB
   - 무제한 프로젝트

3. **AWS S3** (프리티어)
   - 5GB 스토리지
   - 20,000 GET 요청
   - 2,000 PUT 요청

4. **CloudFront** (프리티어)
   - 50GB 데이터 전송
   - 2,000,000 HTTP/HTTPS 요청

5. **CloudWatch** (프리티어)
   - 10개 커스텀 메트릭
   - 5GB 로그 수집
   - 10개 알람

6. **Vercel Analytics** (무료 플랜)
   - 기본 웹 분석

## 🚀 배포 단계

### 1. Vercel 배포

#### 1.1 Vercel 계정 생성 및 프로젝트 연결
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 프로젝트 배포
vercel
```

또는 GitHub 연동:
1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택
4. 자동 배포 설정

#### 1.2 환경 변수 설정 (Vercel Dashboard)
Vercel 프로젝트 설정 → Environment Variables에서 다음 추가:

```env
# 데이터베이스 (Supabase 또는 Neon)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# 사이트 URL
NEXT_PUBLIC_SITE_URL="https://your-domain.com"

# AWS S3 (프리티어)
AWS_S3_BUCKET_NAME="your-bucket-name"
AWS_REGION="ap-northeast-2"

# AWS 인증 (Vercel에서는 환경 변수로 제공 필요)
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"

# CloudFront (선택사항)
AWS_CLOUDFRONT_URL="https://your-cloudfront-domain.cloudfront.net"
```

**주의**: Vercel에서는 IAM Role을 사용할 수 없으므로, S3 업로드를 위해서는 환경 변수로 Access Key를 제공해야 합니다. 보안을 위해 Vercel Environment Variables에만 저장하고 Git에는 커밋하지 마세요.

### 2. 데이터베이스 설정 (Supabase 또는 Neon)

#### 옵션 A: Supabase
1. [Supabase](https://supabase.com) 가입
2. 새 프로젝트 생성
3. Settings → Database → Connection String 복사
4. Vercel Environment Variables에 `DATABASE_URL` 추가

#### 옵션 B: Neon
1. [Neon](https://neon.tech) 가입
2. 새 프로젝트 생성
3. Connection String 복사
4. Vercel Environment Variables에 `DATABASE_URL` 추가

#### 데이터베이스 마이그레이션
```bash
# Prisma 마이그레이션 실행
npx prisma migrate deploy

# 또는 Supabase/Neon SQL Editor에서 직접 실행
```

**중요**: `package.json`에 이미 `prisma generate`가 빌드 스크립트에 포함되어 있습니다:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```
이렇게 하면 Vercel 빌드 시 Prisma Client가 자동으로 생성됩니다.

### 3. AWS S3 설정

#### 3.1 IAM 사용자 생성 (S3 접근용)
Vercel에서는 IAM Role을 사용할 수 없으므로, S3 접근을 위한 IAM 사용자를 생성해야 합니다.

1. AWS 콘솔 → IAM → Users
2. "Create user" 클릭
3. 사용자 이름 입력 (예: `vercel-s3-user`)
4. "Attach policies directly" 선택
5. `AmazonS3FullAccess` 정책 선택 (또는 커스텀 정책으로 특정 버킷만 접근 허용)
6. 사용자 생성
7. "Security credentials" 탭 → "Create access key"
8. Access Key ID와 Secret Access Key 복사 → **Vercel Environment Variables에 추가**

**보안 팁**: 최소 권한 원칙에 따라, 특정 버킷만 접근할 수 있는 커스텀 정책을 사용하는 것을 권장합니다:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/images/*"
    }
  ]
}
```

#### 3.2 S3 버킷 생성
1. AWS 콘솔 → S3
2. "Create bucket" 클릭
3. 버킷 이름 입력 (예: `frontwiki-images`)
4. 리전: `ap-northeast-2` (서울)
5. "Block all public access" 해제 (이미지 공개 필요)
6. 버킷 생성

#### 3.3 버킷 정책 설정
버킷 → Permissions → Bucket Policy:
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

#### 3.4 CORS 설정 (필요한 경우)
버킷 → Permissions → CORS:
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

### 4. CloudFront 설정 (CDN)

#### 4.1 CloudFront 배포 생성
1. AWS 콘솔 → CloudFront
2. "Create Distribution" 클릭
3. Origin Domain: S3 버킷 선택
4. Origin Path: `/images` (이미지만 CDN)
5. Viewer Protocol Policy: `Redirect HTTP to HTTPS`
6. "Create Distribution" 클릭

#### 4.2 CloudFront URL 확인
배포 완료 후 Domain Name 복사 → Vercel Environment Variables에 추가:
```
AWS_CLOUDFRONT_URL="https://d1234567890.cloudfront.net"
```

### 5. 도메인 연결

#### 5.1 Vercel에 도메인 추가
1. Vercel 프로젝트 → Settings → Domains
2. 도메인 입력 (예: `frontwiki.com`)
3. DNS 설정 안내 확인

#### 5.2 도메인 구매처에서 네임서버 변경
Vercel에서 제공하는 네임서버로 변경:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

또는 A 레코드/CNAME 레코드 설정 (Vercel 가이드 참고)

### 6. 모니터링 설정

#### 6.1 Vercel Analytics
1. Vercel 프로젝트 → Analytics 탭
2. "Enable Analytics" 클릭
3. 무료 플랜 활성화

#### 6.2 CloudWatch 설정
1. AWS 콘솔 → CloudWatch
2. Metrics → S3 메트릭 확인
3. Alarms → 알람 생성 (선택사항)

## 📊 모니터링 대시보드

### Vercel Analytics
- 페이지뷰
- 방문자 수
- 성능 메트릭
- 지리적 분포

### CloudWatch
- S3 요청 수
- 데이터 전송량
- 에러율

## 💰 비용 분석

### 월 예상 비용: $0
- Vercel: $0 (무료 플랜)
- Supabase/Neon: $0 (무료 플랜)
- S3: $0 (프리티어 내)
- CloudFront: $0 (프리티어 내)
- CloudWatch: $0 (프리티어 내)
- 도메인: 별도 구매 (연간 $10-15)

### 프리티어 한도
- **S3**: 5GB 스토리지, 20,000 GET, 2,000 PUT
- **CloudFront**: 50GB 전송, 2M 요청
- **CloudWatch**: 10 메트릭, 5GB 로그

### 한도 초과 시 (사용자 100명/일 기준)
- S3: $0.023/GB (5GB 초과 시)
- CloudFront: $0.085/GB (50GB 초과 시)
- 예상 추가 비용: $0-2/월

## 🔒 보안 설정

### 1. 환경 변수 보호
- Vercel Environment Variables에 민감 정보 저장
- `.env` 파일은 Git에 커밋하지 않음

### 2. S3 버킷 정책
- 최소 권한 원칙 적용
- `images/*` 경로만 공개

### 3. HTTPS/SSL
- Vercel 자동 SSL 인증서
- CloudFront HTTPS 강제

## 🎯 클라우드 컴퓨팅 과제 포인트

### 1. 서버리스 아키텍처
- ✅ 서버 관리 불필요
- ✅ 자동 스케일링
- ✅ 사용한 만큼만 과금

### 2. 다양한 AWS 서비스 활용
- ✅ S3 (객체 스토리지)
- ✅ CloudFront (CDN)
- ✅ CloudWatch (모니터링)
- ✅ IAM (인증, Vercel에서 제한적)

### 3. 관리형 서비스
- ✅ Supabase/Neon (관리형 PostgreSQL)
- ✅ Vercel (관리형 호스팅)

### 4. 비용 최적화
- ✅ 프리티어 활용
- ✅ 서버리스로 인한 비용 절감
- ✅ CDN 캐싱으로 트래픽 절감

### 5. 모니터링 및 분석
- ✅ Vercel Analytics
- ✅ CloudWatch 메트릭
- ✅ 성능 모니터링

## 📝 배포 체크리스트

- [ ] Vercel 프로젝트 생성 및 배포
- [ ] Supabase/Neon 데이터베이스 생성
- [ ] Prisma 마이그레이션 실행
- [ ] S3 버킷 생성 및 정책 설정
- [ ] CloudFront 배포 생성
- [ ] Vercel 환경 변수 설정
- [ ] 도메인 연결 및 SSL 확인
- [ ] Vercel Analytics 활성화
- [ ] CloudWatch 메트릭 확인
- [ ] 이미지 업로드 테스트
- [ ] 성능 테스트

## 🐛 트러블슈팅

### 데이터베이스 연결 오류
- Connection String 확인
- Vercel Environment Variables 확인
- Supabase/Neon 방화벽 설정 확인

### S3 업로드 실패
- IAM 권한 확인 (Vercel에서는 환경 변수로 credentials 필요)
- 버킷 정책 확인
- CORS 설정 확인

### CloudFront 캐싱 문제
- Cache Policy 확인
- Invalidation 실행 (필요 시)

## 📚 참고 자료

- [Vercel 문서](https://vercel.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Neon 문서](https://neon.tech/docs)
- [AWS S3 프리티어](https://aws.amazon.com/free/)
- [CloudFront 프리티어](https://aws.amazon.com/cloudfront/pricing/)

