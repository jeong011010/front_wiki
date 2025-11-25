# S3 설정 완료 체크리스트

## ✅ 설정 확인 사항

### 1. S3 버킷 설정
- [ ] 버킷 생성 완료 (`front-wiki-images`)
- [ ] 버킷 정책 설정 (공개 읽기 권한)
- [ ] CORS 정책 설정 (선택사항, 필요 시)

### 2. IAM 사용자 설정
- [ ] IAM 사용자 생성 (`vercel-s3-user`)
- [ ] S3 접근 권한 정책 연결 (`FrontWikiS3Access`)
- [ ] 액세스 키 생성 완료

### 3. 환경 변수 설정
- [ ] 로컬 `.env` 파일 설정
- [ ] Vercel 환경 변수 설정

**필수 환경 변수:**
```
AWS_S3_BUCKET_NAME=front-wiki-images
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### 4. 재배포
- [ ] Vercel 재배포 완료

## 🧪 테스트 방법

### 1. 로컬 테스트 (선택사항)
```bash
# .env 파일 확인
cat .env | grep AWS

# 개발 서버 실행
npm run dev
```

### 2. 프로덕션 테스트
1. Vercel 재배포 완료 대기
2. 프로덕션 사이트 접속
3. 로그인 후 글 작성 페이지로 이동
4. 이미지 업로드 시도 (드래그 앤 드롭 또는 파일 선택)
5. 업로드 성공 확인

### 3. S3 버킷 확인
1. AWS S3 콘솔 → 버킷 선택
2. `images/2024/11/` (또는 현재 년/월) 폴더 확인
3. 업로드된 이미지 파일 확인

## 🔍 문제 해결

### 이미지 업로드 실패 시

**1. Vercel 로그 확인**
- Vercel Dashboard → 프로젝트 → Deployments → 함수 로그
- 에러 메시지 확인

**2. 환경 변수 확인**
- Vercel Settings → Environment Variables
- 모든 변수가 올바르게 설정되었는지 확인
- 변수 이름에 오타가 없는지 확인

**3. IAM 권한 확인**
- AWS IAM 콘솔 → 사용자 → `vercel-s3-user`
- 권한 탭에서 `FrontWikiS3Access` 정책 확인
- 정책 내용에서 버킷 이름이 올바른지 확인

**4. 버킷 정책 확인**
- S3 콘솔 → 버킷 → 권한 탭
- 버킷 정책에서 공개 읽기 권한 확인

**5. 네트워크 확인**
- 브라우저 개발자 도구 → Network 탭
- `/api/images/upload` 요청 확인
- 응답 상태 코드 및 에러 메시지 확인

## ✅ 성공 확인

이미지 업로드가 성공하면:
- 마크다운 에디터에 이미지가 표시됨
- 이미지 URL이 S3 URL 형식: `https://front-wiki-images.s3.ap-northeast-2.amazonaws.com/images/2024/11/xxx.jpg`
- S3 버킷에 파일이 생성됨

