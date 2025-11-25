# Supabase 네트워크 연결 문제 해결

## 🔴 현재 오류

```
Can't reach database server at `aws-1-ap-northeast-2.pooler.supabase.com:5432`
```

## 🛠️ 해결 방법

### 방법 1: Direct Connection으로 변경 ⭐ (Session Pooler가 계속 실패하는 경우)

Session Pooler가 Vercel에서 연결되지 않는 경우, Direct Connection을 시도하세요:

1. **Supabase Dashboard → Connect**
2. **Connection string** → **Direct connection** 선택
3. Connection string 복사 (포트는 보통 `5432` 또는 `6543`)
4. **Vercel → Settings → Environment Variables**
5. `DATABASE_URL` 업데이트
6. **Vercel 재배포**

**Direct Connection 형식:**
```
postgresql://postgres.utvpqdncdsfhcdxkpyls:[PASSWORD]@db.utvpqdncdsfhcdxkpyls.supabase.co:5432/postgres
```

> ⚠️ **주의**: Direct Connection은 IPv4 호환성 경고가 있을 수 있지만, Vercel에서는 작동할 수 있습니다.

### 방법 2: Connection String에 `?pgbouncer=true` 추가 (이미 시도함)

**현재:**
```
postgresql://postgres.utvpqdncdsfhcdxkpyls:rlawjdgns10%21@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

**변경 후:**
```
postgresql://postgres.utvpqdncdsfhcdxkpyls:rlawjdgns10%21@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true
```

**단계:**
1. Vercel → Settings → Environment Variables
2. `DATABASE_URL` 편집
3. 끝에 `?pgbouncer=true` 추가
4. Save 클릭
5. Vercel 재배포

### 방법 2: Direct Connection 시도

Session Pooler가 문제인 경우 Direct Connection 사용:

1. Supabase Dashboard → Connect
2. **Connection string** → **Direct connection** 선택
3. Connection string 복사
4. Vercel 환경 변수에 업데이트
5. ⚠️ **주의**: Direct Connection은 IPv4 호환성 문제가 있을 수 있음

### 방법 3: Supabase 프로젝트 재시작

1. Supabase Dashboard → 프로젝트 선택
2. Settings → General
3. **"Restore project"** 또는 **"Resume project"** 클릭
4. 재시작 완료 대기 (2-3분)
5. Vercel 재배포

### 방법 4: Connection String 재생성

1. Supabase Dashboard → Connect
2. **Connection string** → **Session mode** 선택
3. 최신 Connection string 복사
4. Vercel 환경 변수에 업데이트
5. Vercel 재배포

## 🔍 추가 확인 사항

### Vercel 환경 변수 확인

1. Vercel Dashboard → 프로젝트 → Settings → Environment Variables
2. `DATABASE_URL` 확인:
   - 값이 올바른지
   - 특수문자가 URL 인코딩되었는지 (`!` → `%21`)
   - `?pgbouncer=true`가 포함되어 있는지

### 네트워크 연결 테스트

Vercel에서 Supabase로의 연결이 차단되었을 수 있습니다:
- Vercel의 네트워크 설정 확인
- Supabase IP 허용 목록 확인

## 📋 빠른 해결 순서

1. ✅ Connection String에 `?pgbouncer=true` 추가 (이미 시도함)
2. ✅ Vercel 재배포 (이미 시도함)
3. ❌ **Direct Connection으로 변경** ⭐ (다음 단계)
4. ❌ Vercel 재배포
5. ❌ 로그인 다시 시도
6. ❌ 실패 시 Supabase 프로젝트 재시작

## 🔍 추가 디버깅

### Vercel 로그에서 실제 DATABASE_URL 확인

1. Vercel Dashboard → 프로젝트 → Deployments
2. 최신 배포 → Functions 탭
3. 로그인 API 호출 시 로그 확인
4. `DATABASE_URL`이 올바르게 로드되었는지 확인

### Supabase 프로젝트 상태 확인

1. Supabase Dashboard → 프로젝트 선택
2. 프로젝트 상태가 "Active"인지 확인
3. Settings → Database → Connection string 확인
4. 최신 Connection string이 이전과 다른지 확인

