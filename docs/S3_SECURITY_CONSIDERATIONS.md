# S3 이미지 보안 고려사항

## 🔓 현재 구현 (공개 읽기)

현재 S3 버킷 정책에서 `images/*` 경로에 대해 공개 읽기 권한을 설정했습니다.

**특징:**
- ✅ 누구나 URL을 알면 이미지에 접근 가능
- ✅ 직접 링크 공유 가능
- ✅ CDN(CloudFront) 사용 가능
- ✅ 빠른 이미지 로딩

**보안 영향:**
- ⚠️ URL을 알면 누구나 이미지 접근 가능
- ⚠️ 직접 링크로 이미지 공유 가능
- ⚠️ 이미지 URL 추측 가능 (파일명 패턴을 알면)

## 📊 사용 사례별 권장사항

### 1. 공개 블로그/위키 (현재 프로젝트) ✅

**현재 방식이 적합한 경우:**
- 블로그, 위키, 공개 문서 사이트
- 이미지가 공개되어도 문제없는 경우
- SEO 최적화가 중요한 경우
- 빠른 이미지 로딩이 중요한 경우

**장점:**
- 간단한 구현
- 빠른 로딩 속도
- CDN 활용 가능
- SEO 친화적

**단점:**
- URL을 알면 누구나 접근 가능
- 직접 링크 공유 가능

### 2. 비공개 이미지가 필요한 경우

**Presigned URL 사용 (권장):**

임시 접근 권한을 부여하는 방식:

```typescript
// 업로드 시: 공개 URL 반환
// 조회 시: Presigned URL 생성 (만료 시간 설정)
```

**장점:**
- 임시 접근 권한 (예: 1시간)
- URL 만료 후 접근 불가
- 더 안전한 이미지 관리

**단점:**
- 구현 복잡도 증가
- URL 생성 오버헤드
- 만료 시간 관리 필요

**CloudFront Signed URL 사용:**

CDN을 통한 서명된 URL:

```typescript
// CloudFront Signed URL 생성
// 만료 시간 설정 가능
```

**장점:**
- CDN 성능 유지
- 임시 접근 권한
- 더 안전한 이미지 관리

**단점:**
- CloudFront 설정 필요
- 구현 복잡도 증가

### 3. 완전 비공개 이미지

**프록시 API를 통한 접근:**

```typescript
// /api/images/[key] 엔드포인트 생성
// 인증 확인 후 S3에서 이미지 가져와서 반환
```

**장점:**
- 완전한 접근 제어
- 인증 필수
- 사용량 추적 가능

**단점:**
- 서버 부하 증가
- 느린 이미지 로딩
- CDN 활용 불가

## 🛡️ 보안 강화 방법

### 방법 1: 파일명 난수화 (현재 구현됨)

**현재:**
```typescript
const fileName = `${timestamp}-${originalName}`
```

**개선:**
```typescript
import { randomBytes } from 'crypto'
const randomId = randomBytes(16).toString('hex')
const fileName = `${timestamp}-${randomId}-${originalName}`
```

**효과:**
- URL 추측 어려움
- 보안성 향상

### 방법 2: 버킷 정책 제한 강화

**현재:**
```json
{
  "Effect": "Allow",
  "Principal": "*",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::bucket-name/images/*"
}
```

**개선 (Referer 제한):**
```json
{
  "Effect": "Allow",
  "Principal": "*",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::bucket-name/images/*",
  "Condition": {
    "StringLike": {
      "aws:Referer": [
        "https://your-domain.com/*",
        "https://*.vercel.app/*"
      ]
    }
  }
}
```

**효과:**
- 특정 도메인에서만 접근 가능
- 직접 링크 공유 제한

**단점:**
- Referer는 우회 가능
- 완벽한 보안은 아님

### 방법 3: Presigned URL 구현

**구현 예시:**

```typescript
// lib/s3.ts에 추가
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'

export async function getPresignedImageUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const s3Client = getS3Client()
  const bucketName = getS3BucketName()
  
  if (!s3Client || !bucketName) {
    throw new Error('S3 not configured')
  }
  
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  })
  
  return await getSignedUrl(s3Client, command, { expiresIn })
}
```

**사용:**
```typescript
// 이미지 조회 시 Presigned URL 생성
const presignedUrl = await getPresignedImageUrl(imageKey, 3600) // 1시간 유효
```

## 💡 권장사항

### 현재 프로젝트 (공개 블로그/위키)

**현재 방식 유지 권장:**
- ✅ 공개 이미지가 적합
- ✅ SEO 최적화
- ✅ 빠른 로딩 속도
- ✅ 간단한 구현

**보안 강화 (선택사항):**
1. 파일명 난수화 (구현 쉬움)
2. Referer 제한 (부분적 보안)
3. Presigned URL (더 안전하지만 복잡)

### 비공개 이미지가 필요한 경우

**Presigned URL 구현 권장:**
- 임시 접근 권한
- 만료 시간 설정
- 더 안전한 이미지 관리

## 📝 결론

**현재 프로젝트의 경우:**
- 공개 블로그/위키이므로 현재 방식이 적합
- 이미지가 공개되어도 문제없음
- SEO와 성능이 중요하므로 공개 방식 유지 권장

**보안이 중요한 경우:**
- Presigned URL 구현 고려
- 또는 프록시 API를 통한 접근 제어

**현재 구현으로 충분한 경우:**
- 블로그, 위키, 공개 문서
- 이미지가 공개되어도 문제없는 콘텐츠

