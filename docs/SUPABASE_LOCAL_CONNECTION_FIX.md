# 로컬 Supabase 연결 문제 해결

## 🔴 현재 오류

```
Can't reach database server at `aws-1-ap-northeast-2.pooler.supabase.com:5432`
```

## 🔍 가능한 원인

1. **Session Pooler가 로컬 네트워크에서 차단됨**
   - Session Pooler는 클라우드 환경(Vercel)에 최적화되어 있음
   - 로컬 개발 환경에서는 Direct Connection이 더 안정적일 수 있음

2. **Supabase 프로젝트 일시 중지**
   - 무료 플랜의 경우 7일간 비활성화 시 자동 일시 중지
   - Dashboard에서 "Active"로 보여도 실제로는 연결 불가능할 수 있음

3. **비밀번호 URL 인코딩 문제**
   - 특수문자(`!`, `@`, `#` 등)가 URL 인코딩되지 않음
   - `!` → `%21`로 변환 필요

## 🛠️ 해결 방법

### 방법 1: Direct Connection으로 변경 ⭐ (권장)

로컬 개발 환경에서는 Direct Connection을 사용하는 것이 더 안정적입니다.

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard

2. **프로젝트 선택 → Settings → Database**

3. **Connection string 섹션에서 "Direct connection" 선택**

4. **Connection string 복사**
   - 형식: `postgresql://postgres.utvpqdncdsfhcdxkpyls:[PASSWORD]@db.utvpqdncdsfhcdxkpyls.supabase.co:5432/postgres`
   - 포트는 보통 `5432` 또는 `6543`

5. **로컬 `.env` 파일 수정**
   ```env
   # Direct Connection (로컬 개발용)
   DATABASE_URL="postgresql://postgres.utvpqdncdsfhcdxkpyls:[PASSWORD]@db.utvpqdncdsfhcdxkpyls.supabase.co:5432/postgres"
   ```

6. **비밀번호 URL 인코딩 확인**
   - 특수문자가 있다면 URL 인코딩 필요
   - 예: `!` → `%21`, `@` → `%40`, `#` → `%23`

7. **개발 서버 재시작**
   ```bash
   # 개발 서버 중지 후 재시작
   npm run dev
   ```

### 방법 2: Supabase 프로젝트 재시작

프로젝트가 일시 중지된 경우:

1. **Supabase Dashboard 접속**
2. **프로젝트 선택**
3. **Settings → General**
4. **"Restore project"** 또는 **"Resume project"** 클릭
5. **재시작 완료 대기 (2-3분)**
6. **로컬 개발 서버 재시작**

### 방법 3: Connection String 재확인

1. **Supabase Dashboard → Settings → Database**
2. **Connection string → Session mode** 선택
3. **최신 Connection string 복사**
4. **로컬 `.env` 파일에 업데이트**
5. **비밀번호 URL 인코딩 확인**
6. **개발 서버 재시작**

## 📋 체크리스트

- [ ] Supabase 프로젝트가 활성화되어 있는지 확인
- [ ] Direct Connection으로 변경 시도
- [ ] 비밀번호 URL 인코딩 확인 (`!` → `%21`)
- [ ] `.env` 파일의 `DATABASE_URL` 확인
- [ ] 개발 서버 재시작
- [ ] 로그인 다시 시도

## 💡 권장 설정

### 로컬 개발 환경 (`.env`)
```env
# Direct Connection 사용 (로컬에서 더 안정적)
DATABASE_URL="postgresql://postgres.utvpqdncdsfhcdxkpyls:[PASSWORD]@db.utvpqdncdsfhcdxkpyls.supabase.co:5432/postgres"
```

### 프로덕션 환경 (Vercel)
```env
# Session Pooler 사용 (Vercel에서 더 안정적)
DATABASE_URL="postgresql://postgres.utvpqdncdsfhcdxkpyls:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true"
```

## 🔄 문제 해결 후

1. 로컬 개발 서버 재시작
2. 로그인 다시 시도
3. 연결 성공 확인

