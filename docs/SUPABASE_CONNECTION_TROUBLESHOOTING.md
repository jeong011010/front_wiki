# Supabase 연결 문제 해결 가이드

## 🔴 현재 오류

```
Can't reach database server at `aws-1-ap-northeast-2.pooler.supabase.com:5432`
```

## 🔍 가능한 원인 및 해결 방법

### 1. Supabase 프로젝트 일시 중지 확인 ⭐ (가장 흔한 원인)

**무료 플랜의 경우:**
- 7일간 비활성화 시 프로젝트가 자동으로 일시 중지됨
- 프로젝트가 일시 중지되면 데이터베이스에 접근할 수 없음
- **하지만 Dashboard에서는 "Active"로 보일 수 있음** (버그 또는 지연)
- 실제로는 데이터베이스 연결이 차단된 상태

**증상:**
- Dashboard에서는 프로젝트가 "Active"로 표시됨
- 데이터도 Table Editor에서 보임
- 하지만 외부 연결(Session Pooler, Direct Connection)은 실패
- `Can't reach database server` 오류 발생

**해결 방법:**
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 상태 확인
3. 프로젝트가 일시 중지되어 있다면 **"Restore"** 또는 **"Resume"** 클릭
4. 프로젝트 재시작 완료 대기 (2-3분 소요)
5. 재시작 후 Vercel 재배포 (필요 시)

### 2. DATABASE_URL 확인

**Vercel 환경 변수 확인:**
1. Vercel Dashboard → 프로젝트 → Settings → Environment Variables
2. `DATABASE_URL` 확인:
   - 값이 올바르게 설정되어 있는지
   - Session Pooler URL 형식인지 확인

**올바른 형식:**
```
postgresql://postgres.utvpqdncdsfhcdxkpyls:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true
```

또는

```
postgresql://postgres.utvpqdncdsfhcdxkpyls:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

### 3. Supabase 프로젝트 삭제 확인

1. Supabase Dashboard에서 프로젝트가 존재하는지 확인
2. 프로젝트가 삭제되었다면 새로 생성 필요

### 4. Connection String 재확인

**Supabase에서 최신 Connection String 가져오기:**
1. Supabase Dashboard → 프로젝트 선택
2. **Settings** → **Database**
3. **Connection string** 섹션
4. **Session mode** 선택
5. Connection string 복사
6. Vercel 환경 변수에 업데이트

### 5. 네트워크/방화벽 문제

**확인 사항:**
- Vercel에서 Supabase로의 아웃바운드 연결이 차단되지 않았는지
- Supabase IP 허용 목록에 Vercel이 포함되어 있는지

### 6. Vercel 재배포 필요 ⭐ (환경 변수 변경 후 필수)

**환경 변수를 변경한 후에는 반드시 재배포해야 합니다!**

**재배포 방법:**
1. Vercel Dashboard → 프로젝트 → Deployments
2. 최신 배포 선택
3. **"Redeploy"** 버튼 클릭
4. 또는 자동 재배포 대기 (코드 푸시 시)

**환경 변수 변경 후 재배포하지 않으면:**
- 기존 배포는 이전 환경 변수를 사용
- 새로운 환경 변수가 적용되지 않음
- 연결 오류가 계속 발생

### 7. Connection Pooling 문제

**Session Pooler vs Direct Connection:**
- **Session Pooler**: IPv4 네트워크에 최적화, Vercel과 호환성 좋음
- **Direct Connection**: IPv6 네트워크 필요, Vercel에서 문제 발생 가능

**현재 설정 확인:**
- Vercel의 `DATABASE_URL`이 Session Pooler 형식인지 확인
- 포트가 `5432`인지 확인 (Session Pooler)
- `?pgbouncer=true` 파라미터가 필요할 수 있음

## 🛠️ 즉시 시도할 수 있는 해결 방법

### 방법 1: Supabase 프로젝트 재시작

1. Supabase Dashboard 접속
2. 프로젝트 선택
3. Settings → General
4. **"Restore project"** 또는 **"Resume project"** 클릭
5. 재시작 완료 대기 (2-3분)
6. Vercel 재배포

### 방법 2: DATABASE_URL 재설정

1. Supabase Dashboard → Settings → Database
2. **Connection string** → **Session mode** 선택
3. 최신 Connection string 복사
4. Vercel → Settings → Environment Variables
5. `DATABASE_URL` 업데이트
6. Vercel 재배포

### 방법 3: Direct Connection 시도 (임시)

Session Pooler가 문제인 경우 Direct Connection 시도:

1. Supabase Dashboard → Settings → Database
2. **Connection string** → **Direct connection** 선택
3. Connection string 복사
4. Vercel 환경 변수에 업데이트
5. ⚠️ **주의**: Direct Connection은 IPv4 호환성 문제가 있을 수 있음

## 📋 체크리스트

- [ ] Supabase 프로젝트가 활성화되어 있는지 확인
- [ ] DATABASE_URL이 올바르게 설정되어 있는지 확인
- [ ] Connection String이 최신인지 확인
- [ ] Vercel 환경 변수가 올바른지 확인
- [ ] 프로젝트 재시작 시도
- [ ] Vercel 재배포

## 🔄 프로젝트 재시작 후

1. Supabase 프로젝트 재시작 완료 대기
2. Vercel 재배포
3. 로그인 다시 시도
4. Vercel 로그에서 연결 성공 확인

## 💡 예방 방법

**무료 플랜 사용 시:**
- 정기적으로 프로젝트에 접속하여 비활성화 방지
- 또는 프로젝트를 자주 사용하여 자동 일시 중지 방지

**프로덕션 환경:**
- 유료 플랜 사용 고려 (자동 일시 중지 없음)
