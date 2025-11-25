# AWS S3 이미지 업로드 설정 가이드

이 가이드는 AWS S3를 사용하여 이미지를 저장하고 관리하는 방법을 설명합니다.

## 📋 목차

- [개요](#개요)
- [S3 버킷 생성](#s3-버킷-생성)
- [IAM 사용자 생성 및 권한 설정](#iam-사용자-생성-및-권한-설정)
- [환경 변수 설정](#환경-변수-설정)
- [버킷 정책 설정](#버킷-정책-설정)
- [CloudFront 설정 (선택사항)](#cloudfront-설정-선택사항)
- [테스트](#테스트)
- [문제 해결](#문제-해결)

## 개요

현재 프로젝트는 다음과 같이 이미지 저장을 지원합니다:

- **S3 설정 시**: AWS S3에 이미지 저장
- **S3 미설정 시**: 로컬 파일 시스템(`public/uploads`)에 저장 (개발 환경)

S3를 사용하면:
- ✅ 서버 확장성 향상
- ✅ CDN을 통한 빠른 이미지 로딩
- ✅ 프로덕션 환경에서 안정적인 이미지 관리

## S3 버킷 생성

### 1. AWS 콘솔 접속

1. [AWS 콘솔](https://console.aws.amazon.com/)에 로그인
2. **S3** 서비스 선택

### 2. 버킷 생성

1. **"버킷 만들기"** 클릭
2. 버킷 설정:
   - **버킷 이름**: 고유한 이름 입력 (예: `front-wiki-images`)
   - **AWS 리전**: `ap-northeast-2` (서울) 선택
   - **객체 소유권**: ACL 비활성화 (권장) 또는 버킷 소유자 선호
   - **퍼블릭 액세스 차단 설정**: 
     - ✅ "모든 퍼블릭 액세스 차단" 해제 (이미지 공개 필요)
     - 또는 버킷 정책으로 제어 (권장)
   - **버전 관리**: 필요 시 활성화
   - **기본 암호화**: 필요 시 활성화
3. **"버킷 만들기"** 클릭

### 3. CORS 설정 (필요 시)

이미지가 다른 도메인에서 접근 가능하도록 CORS 설정:

> ⚠️ **중요**: CORS 정책은 **배열 형식** `[{...}]`입니다. 버킷 정책과는 다른 섹션입니다!

1. 버킷 선택 → **권한** 탭
2. **CORS (교차 출처 리소스 공유)** 섹션을 찾아서 → **편집** 클릭
   - ⚠️ **"버킷 정책"** 섹션이 아닙니다!
   - **"CORS"** 섹션을 찾아야 합니다!
3. 다음 정책을 **전체 복사**하여 붙여넣기:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-domain.vercel.app",
      "https://your-custom-domain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

> ⚠️ **주의**: 
> - **CORS 정책은 배열 형식** `[{...}]`입니다
> - **버킷 정책은 객체 형식** `{...}`입니다 (다른 섹션!)
> - JSON 형식이 정확해야 합니다 (쉼표, 따옴표 확인)
> - `AllowedMethods` 키가 반드시 있어야 합니다

## IAM 사용자 생성 및 권한 설정

Vercel에서는 IAM Role을 사용할 수 없으므로, S3 접근을 위한 IAM 사용자를 생성해야 합니다.

> 💡 **기존 IAM 사용자 재사용 가능**: 이미 S3 접근 권한이 있는 IAM 사용자가 있다면 재사용할 수 있습니다. 하지만 보안상 최소 권한 원칙에 따라 새로운 IAM 사용자를 만드는 것을 권장합니다.

### 옵션 1: 기존 IAM 사용자 재사용

**기존 IAM 사용자를 사용하려면:**

1. AWS 콘솔 → **IAM** → **사용자**
2. 기존 사용자 선택 → **보안 자격 증명** 탭
3. **액세스 키** 섹션에서:
   - 기존 액세스 키가 있으면 그대로 사용 가능
   - 없거나 만료되었으면 **"액세스 키 만들기"** 클릭
4. **권한** 탭에서 S3 접근 권한 확인:
   - `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:ListBucket` 권한이 있는지 확인
   - 권한이 없으면 아래 "권한 설정" 섹션 참고하여 추가

> ⚠️ **주의**: 기존 IAM 사용자가 다른 서비스에도 접근 권한이 있다면, 보안상 새로운 IAM 사용자를 만드는 것이 더 안전합니다.

### 옵션 2: 새 IAM 사용자 생성 (권장)

### 1. IAM 사용자 생성

1. AWS 콘솔 → **IAM** 서비스
2. **사용자** → **사용자 만들기**
3. 사용자 이름 입력 (예: `vercel-s3-user`)
4. **"AWS 자격 증명 유형 제공"** 선택:
   - ✅ **액세스 키 - 프로그래밍 방식 액세스** 선택
5. **"다음"** 클릭

### 2. 권한 설정

**옵션 1: 기존 정책 직접 연결 (간단)**

1. **"기존 정책 직접 연결"** 선택
2. `AmazonS3FullAccess` 검색 및 선택
3. **"다음"** → **"사용자 만들기"** 클릭

**옵션 2: 커스텀 정책 (권장 - 최소 권한 원칙)**

1. **"정책 생성"** 클릭
2. JSON 탭에서 다음 정책 입력:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

> ⚠️ **중요**: JSON의 마지막에 닫는 중괄호 `}`가 반드시 있어야 합니다!

> ⚠️ **주의**: `your-bucket-name`을 실제 버킷 이름으로 변경하세요.

3. 정책 이름 입력 (예: `FrontWikiS3Access`)
4. **"정책 생성"** 클릭
5. 사용자 생성 화면으로 돌아가서 생성한 정책 선택

### 3. 액세스 키 생성 및 저장

> 💡 **참고**: 사용자 생성 시 액세스 키를 만들지 않았다면, 아래 단계를 따라 액세스 키를 생성하세요.

**액세스 키 생성 방법:**

1. IAM 콘솔 → **사용자** → `vercel-s3-user` 선택
2. **보안 자격 증명** 탭 클릭
3. **액세스 키** 섹션에서 **"액세스 키 만들기"** 클릭
4. **사용 사례** 선택:
   - "다른 AWS 서비스, AWS CLI, AWS SDK 또는 타사 도구에서 사용" 선택
5. **"다음"** → **"만들기"** 클릭
6. **액세스 키 ID**와 **비밀 액세스 키** 표시

> ⚠️ **중요**: 
> - 이 키는 **한 번만 표시**되므로 반드시 저장하세요!
> - 비밀 액세스 키는 나중에 다시 확인할 수 없습니다
> - 안전한 곳에 저장하거나 바로 환경 변수에 설정하세요

**저장할 정보:**
- `AWS_ACCESS_KEY_ID` = 액세스 키 ID
- `AWS_SECRET_ACCESS_KEY` = 비밀 액세스 키

## 환경 변수 설정

### 로컬 개발 환경 (`.env`)

프로젝트 루트에 `.env` 파일 생성 또는 수정:

```env
# AWS S3 설정
AWS_S3_BUCKET_NAME="your-bucket-name"
AWS_REGION="ap-northeast-2"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"

# CloudFront URL (선택사항 - CDN 사용 시)
AWS_CLOUDFRONT_URL="https://d1234567890.cloudfront.net"
```

### Vercel 환경 변수 설정

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 → **Settings** → **Environment Variables**
3. 다음 변수 추가:

| 변수 이름 | 값 | 환경 |
|---------|-----|------|
| `AWS_S3_BUCKET_NAME` | `your-bucket-name` | Production, Preview, Development |
| `AWS_REGION` | `ap-northeast-2` | Production, Preview, Development |
| `AWS_ACCESS_KEY_ID` | `your-access-key-id` | Production, Preview, Development |
| `AWS_SECRET_ACCESS_KEY` | `your-secret-access-key` | Production, Preview, Development |
| `AWS_CLOUDFRONT_URL` | `https://...` (선택사항) | Production, Preview, Development |

4. **Save** 클릭
5. **Redeploy** 실행 (환경 변수 변경 후 재배포 필요)

## 버킷 정책 설정

이미지를 공개적으로 접근 가능하도록 버킷 정책 설정:

### 1. 버킷 정책 편집

1. S3 콘솔 → 버킷 선택 → **권한** 탭
2. **버킷 정책** 섹션 → **편집**

### 2. 정책 추가

다음 정책을 추가 (버킷 이름 수정 필요):

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

> ⚠️ **주의**: 
> - `your-bucket-name`을 실제 버킷 이름으로 변경
> - `images/*` 경로만 공개 (보안 강화)

### 3. 퍼블릭 액세스 차단 설정

1. **"퍼블릭 액세스 차단 설정"** 섹션 → **편집**
2. 다음 설정:
   - ✅ "새 퍼블릭 버킷 정책을 차단" 해제
   - ✅ "버킷과 객체에 대한 퍼블릭 액세스를 허용" 해제
   - ✅ "버킷과 객체에 대한 퍼블릭 및 교차 계정 액세스를 허용" 해제
   - ✅ "버킷과 객체에 대한 퍼블릭 및 교차 계정 액세스를 차단" 해제

> 💡 **참고**: 버킷 정책으로 제어하는 것이 더 안전합니다.

## CloudFront 설정 (선택사항)

CDN을 통해 이미지 로딩 속도를 향상시킬 수 있습니다.

### 1. CloudFront 배포 생성

1. AWS 콘솔 → **CloudFront** 서비스
2. **배포 만들기** 클릭
3. 설정:
   - **원본 도메인**: S3 버킷 선택
   - **이름**: 자동 생성됨
   - **뷰어 프로토콜 정책**: HTTPS 리디렉션 또는 HTTPS만
   - **허용된 HTTP 메서드**: GET, HEAD, OPTIONS
   - **캐시 정책**: CachingOptimized (또는 커스텀)
4. **배포 만들기** 클릭

### 2. CloudFront URL 설정

1. 배포 생성 완료 후 **도메인 이름** 복사
2. Vercel 환경 변수에 추가:
   ```
   AWS_CLOUDFRONT_URL=https://d1234567890.cloudfront.net
   ```

### 3. 이미지 URL 형식

CloudFront 설정 시 이미지 URL은 자동으로 CloudFront URL을 사용합니다:
- CloudFront 설정 시: `https://d1234567890.cloudfront.net/images/2024/11/image.jpg`
- CloudFront 미설정 시: `https://bucket-name.s3.ap-northeast-2.amazonaws.com/images/2024/11/image.jpg`

## 테스트

### 1. 로컬 테스트

1. `.env` 파일에 S3 설정 추가
2. 개발 서버 재시작:
   ```bash
   npm run dev
   ```
3. 글 작성 페이지에서 이미지 업로드 시도
4. 브라우저 개발자 도구 → Network 탭에서 업로드 요청 확인
5. S3 버킷에서 이미지 확인

### 2. 프로덕션 테스트

1. Vercel 환경 변수 설정 확인
2. Vercel 재배포
3. 프로덕션 사이트에서 이미지 업로드 시도
4. S3 버킷에서 이미지 확인

### 3. 이미지 접근 확인

업로드된 이미지 URL로 직접 접근하여 이미지가 표시되는지 확인:
- S3 직접 URL: `https://bucket-name.s3.ap-northeast-2.amazonaws.com/images/2024/11/image.jpg`
- CloudFront URL: `https://d1234567890.cloudfront.net/images/2024/11/image.jpg`

## 문제 해결

### 이미지 업로드 실패

**증상**: "이미지 업로드에 실패했습니다" 오류

**해결 방법**:
1. 환경 변수 확인:
   ```bash
   # 로컬에서 확인
   echo $AWS_S3_BUCKET_NAME
   echo $AWS_ACCESS_KEY_ID
   ```
2. IAM 사용자 권한 확인
3. 버킷 이름 확인
4. 리전 확인 (`ap-northeast-2`)

### 이미지가 표시되지 않음

**증상**: 업로드는 성공하지만 이미지가 표시되지 않음

**해결 방법**:
1. 버킷 정책 확인 (공개 읽기 권한)
2. CORS 설정 확인
3. 이미지 URL 직접 접근 테스트
4. 브라우저 개발자 도구 → Console에서 오류 확인

### 권한 오류

**증상**: `AccessDenied` 오류

**해결 방법**:
1. IAM 사용자 정책 확인
2. 버킷 정책 확인
3. 액세스 키 ID와 비밀 키 확인

### 로컬에서는 작동하지만 프로덕션에서 실패

**해결 방법**:
1. Vercel 환경 변수 확인
2. Vercel 재배포
3. Vercel 로그 확인:
   - Vercel Dashboard → 프로젝트 → Deployments → 함수 로그

## 비용 참고

### AWS S3 프리티어 (12개월)

- **스토리지**: 5GB
- **요청**: 
  - GET: 20,000건
  - PUT: 2,000건

### 초과 시 비용 (서울 리전)

- **스토리지**: $0.025/GB/월
- **GET 요청**: $0.0004/1,000건
- **PUT 요청**: $0.005/1,000건

> 💡 **팁**: 이미지 최적화 및 CDN 사용으로 요청 수와 데이터 전송량을 줄일 수 있습니다.

## 다음 단계

- [ ] S3 버킷 생성 완료
- [ ] IAM 사용자 생성 및 권한 설정 완료
- [ ] 환경 변수 설정 완료
- [ ] 버킷 정책 설정 완료
- [ ] 로컬 테스트 완료
- [ ] 프로덕션 배포 및 테스트 완료
- [ ] CloudFront 설정 (선택사항)

