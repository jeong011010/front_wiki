import { S3Client } from '@aws-sdk/client-s3'

// S3 클라이언트 인스턴스 생성
// 환경 변수가 설정되어 있으면 S3 사용, 없으면 null 반환 (로컬 개발용)
export function getS3Client(): S3Client | null {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const region = process.env.AWS_REGION || 'ap-northeast-2' // 기본값: 서울 리전

  // 환경 변수가 없으면 null 반환 (로컬 파일 시스템 사용)
  if (!accessKeyId || !secretAccessKey) {
    return null
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

// S3 버킷 이름 가져오기
export function getS3BucketName(): string | null {
  return process.env.AWS_S3_BUCKET_NAME || null
}

// S3 URL 생성 (CloudFront 또는 직접 S3 URL)
export function getS3Url(key: string): string {
  const bucketName = getS3BucketName()
  const cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL
  
  if (cloudFrontUrl) {
    // CloudFront URL 사용
    return `${cloudFrontUrl}/${key}`
  }
  
  if (bucketName) {
    // 직접 S3 URL 사용
    const region = process.env.AWS_REGION || 'ap-northeast-2'
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`
  }
  
  // 폴백: 상대 경로 (로컬 개발용)
  return `/${key}`
}

// S3 사용 가능 여부 확인
export function isS3Configured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET_NAME
  )
}

