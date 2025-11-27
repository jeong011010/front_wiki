# Supabase 연결 문제 빠른 해결

## 🔴 현재 문제

`Can't reach database server at pooler.supabase.com:5432`

## ✅ 즉시 확인 사항

### 1. Supabase 프로젝트 상태 확인

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. **상태 확인**:
   - "Active" (녹색) → 정상
   - "Paused" (회색) → **Restore** 클릭 필요

### 2. DATABASE_URL 확인 (Vercel)

1. Vercel Dashboard → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. `DATABASE_URL` 확인:
   - **Session Pooler 사용 시**: 포트 **6543**, `?pgbouncer=true` 포함
   - **Direct Connection 사용 시**: 포트 **5432**

**올바른 형식 예시**:
```
postgresql://postgres.xxx:password@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 3. Supabase에서 Connection String 재확인

1. Supabase Dashboard → **Settings** → **Database**
2. **Connection string** 섹션
3. **Session mode** 선택 (권장)
4. Connection string 복사
5. Vercel 환경 변수에 붙여넣기

### 4. 재배포

- 환경 변수 수정 후 자동 재배포
- 또는 수동 재배포

## 🔍 문제 진단

### 에러 메시지 분석

- `pooler.supabase.com:5432` → 포트 오류 (6543 사용해야 함)
- `Can't reach database server` → 프로젝트 일시정지 또는 네트워크 문제
- `Authentication failed` → 비밀번호 오류

## 💡 빠른 해결

**가장 흔한 원인**: Supabase 프로젝트가 일시정지됨

1. Supabase Dashboard에서 **Restore** 클릭
2. 2-3분 대기
3. Vercel에서 재시도

---

**참고**: 포트 번호는 Supabase Dashboard의 Connection String을 그대로 사용하면 됩니다.

