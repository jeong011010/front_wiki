# Vercel Supabase 연결 문제 해결

## 🔴 현재 문제

Vercel에서 Supabase 연결 실패:
```
Can't reach database server at `aws-1-ap-northeast-2.pooler.supabase.com:5432`
```

## ✅ 해결 방법

### 1. Vercel 환경 변수 확인 및 수정

**정확한 Connection String:**
```
postgresql://postgres.utvpqdncdsfhcdxkpyls:rlawjdgns10!@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

**확인 사항:**
1. Vercel Dashboard → Settings → Environment Variables
2. `DATABASE_URL` 값이 위와 정확히 일치하는지 확인
3. `[YOUR-PASSWORD]` 부분이 실제 비밀번호(`rlawjdgns10!`)로 교체되었는지 확인
4. **Save** 버튼 클릭하여 저장 확인

### 2. Supabase 프로젝트 상태 확인

1. Supabase Dashboard → 프로젝트 상태 확인
2. 모든 서비스가 "Healthy" 상태인지 확인:
   - Database
   - PostgREST
   - Auth
   - Realtime
   - Storage
   - Edge Functions

### 3. Vercel 재배포

환경 변수 수정 후:
1. Vercel Dashboard → Deployments
2. 최신 배포의 **"..."** 메뉴 → **Redeploy** 클릭
3. 또는 GitHub에 푸시하여 자동 재배포

### 4. 연결 테스트

재배포 완료 후:
1. 사이트 접속
2. 회원가입 시도
3. Vercel 로그에서 연결 성공 여부 확인

## 🔍 추가 확인 사항

### Connection String 형식 확인

**올바른 형식:**
- 사용자명: `postgres.utvpqdncdsfhcdxkpyls` (프로젝트 ID 포함)
- 호스트: `aws-1-ap-northeast-2.pooler.supabase.com`
- 포트: `5432`
- 데이터베이스: `postgres`
- 비밀번호: 실제 비밀번호로 교체

### 네트워크 문제 가능성

만약 여전히 연결이 안 되면:
1. Supabase 프로젝트가 일시 중지되었을 수 있음
2. Vercel의 네트워크에서 Supabase로의 아웃바운드 연결이 차단되었을 수 있음
3. Supabase 방화벽 설정 확인 필요

## 📝 체크리스트

- [ ] Vercel 환경 변수에 정확한 Connection String 설정
- [ ] 비밀번호가 실제 값으로 교체되었는지 확인
- [ ] Supabase 프로젝트가 Active 상태인지 확인
- [ ] 모든 서비스가 Healthy 상태인지 확인
- [ ] Vercel 재배포 완료
- [ ] 회원가입 테스트 성공

