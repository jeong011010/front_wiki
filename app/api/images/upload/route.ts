import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getS3Client, getS3BucketName, getS3Url, isS3Configured } from '@/lib/s3'
import { requireAuth } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    // 로그인 확인 (이미지 업로드는 로그인한 사용자만 가능)
    const authResult = await requireAuth(request)
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_') // 특수문자 제거
    const fileName = `${timestamp}-${originalName}`

    // S3가 설정되어 있으면 S3에 업로드, 없으면 로컬 파일 시스템 사용
    if (isS3Configured()) {
      const s3Client = getS3Client()
      const bucketName = getS3BucketName()

      if (!s3Client || !bucketName) {
        throw new Error('S3 client or bucket name is not configured')
      }

      // S3 키 생성 (images/년/월/파일명 형식으로 구성)
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const s3Key = `images/${year}/${month}/${fileName}`

      // S3에 업로드
      // 주의: 버킷 정책에서 공개 읽기 권한을 설정해야 합니다.
      // ACL은 최신 AWS 권장사항에 따라 제거되었습니다.
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: buffer,
          ContentType: file.type,
        })
      )

      // S3 URL 반환
      const url = getS3Url(s3Key)

      return NextResponse.json({ url, fileName: s3Key })
    } else {
      // 로컬 파일 시스템 사용 (개발 환경)
      const uploadDir = join(process.cwd(), 'public', 'uploads')
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      // 파일 저장
      const filePath = join(uploadDir, fileName)
      await writeFile(filePath, buffer)

      // URL 반환
      const url = `/uploads/${fileName}`

      return NextResponse.json({ url, fileName })
    }
  } catch (error) {
    console.error('Image upload error:', error)
    
    // AWS S3 관련 오류 처리
    if (error && typeof error === 'object' && 'name' in error) {
      const awsError = error as { name: string; message: string }
      if (awsError.name === 'AccessDenied' || awsError.name === 'Forbidden') {
        return NextResponse.json(
          { error: 'S3 접근 권한이 없습니다. IAM 사용자 권한을 확인해주세요.' },
          { status: 403 }
        )
      }
      if (awsError.name === 'NoSuchBucket') {
        return NextResponse.json(
          { error: 'S3 버킷을 찾을 수 없습니다. 버킷 이름을 확인해주세요.' },
          { status: 404 }
        )
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
    return NextResponse.json(
      { 
        error: '이미지 업로드에 실패했습니다.',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

