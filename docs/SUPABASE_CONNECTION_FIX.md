# Supabase 연결 오류 해결 가이드

## 🔴 문제 증상

```
Can't reach database server at `aws-1-ap-northeast-2.pooler.supabase.com:5432`
```

## 🔍 원인 분석

### 가능한 원인들

1. **포트 번호 오류** (가장 흔함)
   - Session Pooler는 **6543** 포트 사용
   - Direct Connection은 **5432** 포트 사용
   - 에러 메시지: `pooler.supabase.com:5432` ← 잘못된 포트!

2. **DATABASE_URL 형식 오류**
   - Session Pooler URL에 `?pgbouncer=true` 파라미터 누락
   - 또는 Direct Connection URL을 사용해야 하는데 Session Pooler URL 사용

3. **Supabase 프로젝트 상태**
   - 프로젝트가 실제로 활성화되지 않음
   - 네트워크 문제

## ✅ 해결 방법

### 1단계: Supabase에서 올바른 DATABASE_URL 확인

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Settings → Database 접속**
   - 왼쪽 사이드바에서 **Settings** → **Database** 클릭

3. **Connection String 확인**
   - **Connection string** 섹션에서 확인
   - **Session mode** (권장) 또는 **Direct connection** 선택

### 2단계: 올바른 DATABASE_URL 형식

#### Session Pooler (권장 - Vercel용)
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**중요 포인트**:
- 포트: **6543** (5432 아님!)
- 파라미터: `?pgbouncer=true` 필수

#### Direct Connection (로컬 개발용)
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

**중요 포인트**:
- 포트: **5432**
- 파라미터: 없음

### 3단계: Vercel 환경 변수 수정

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard
   - 프로젝트 선택

2. **Settings → Environment Variables**
   - `DATABASE_URL` 찾기
   - **Edit** 클릭

3. **올바른 URL로 수정**
   - Session Pooler 사용 시: 포트를 **6543**으로 변경하고 `?pgbouncer=true` 추가
   - 예시:
     ```
     postgresql://postgres.xxxxx:password@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
     ```

4. **저장 후 재배포**
   - **Save** 클릭
   - 자동으로 재배포됨

### 4단계: 연결 확인

1. **Vercel Logs 확인**
   - Vercel Dashboard → **Logs** 탭
   - "✅ Supabase 연결 성공" 메시지 확인

2. **브라우저에서 테스트**
   - `front-wiki.com` 접속
   - API 호출이 정상 작동하는지 확인

## 🔧 일반적인 오류 패턴

### 오류 1: 포트 5432 사용 (Session Pooler)
```
❌ postgresql://...@pooler.supabase.com:5432/...
✅ postgresql://...@pooler.supabase.com:6543/...?pgbouncer=true
```

### 오류 2: pgbouncer 파라미터 누락
```
❌ postgresql://...@pooler.supabase.com:6543/postgres
✅ postgresql://...@pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 오류 3: 비밀번호 특수문자 인코딩
```
❌ password: my!password
✅ password: my%21password  (! → %21)
```

**특수문자 인코딩**:
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `*` → `%2A`
- `(` → `%28`
- `)` → `%29`
- `:` → `%3A`
- `;` → `%3B`
- `=` → `%3D`
- `?` → `%3F`
- `[` → `%5B`
- `]` → `%5D`

## 📝 체크리스트

- [ ] Supabase Dashboard에서 프로젝트 상태 확인 (Active)
- [ ] Settings → Database에서 Connection String 복사
- [ ] Session Pooler URL 사용 시 포트 **6543** 확인
- [ ] `?pgbouncer=true` 파라미터 포함 확인
- [ ] 비밀번호 특수문자 URL 인코딩 확인
- [ ] Vercel 환경 변수에 올바른 URL 설정
- [ ] 재배포 완료
- [ ] Vercel Logs에서 연결 성공 확인

## 🔗 참고 자료

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma Connection URLs](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

---

**가장 흔한 원인**: 포트 번호가 5432로 설정되어 있는 경우입니다. Session Pooler는 **6543**을 사용해야 합니다!

