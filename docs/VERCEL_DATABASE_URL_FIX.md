# Vercel DATABASE_URL 연결 문제 해결

## 🔴 현재 문제

Vercel 환경 변수는 정확히 설정되어 있지만 연결 실패:
```
Can't reach database server at `aws-1-ap-northeast-2.pooler.supabase.com:5432`
```

## 🔍 가능한 원인

### 1. 특수문자 인코딩 문제
Connection String에 `!`가 포함되어 있음:
```
postgresql://postgres.utvpqdncdsfhcdxkpyls:rlawjdgns10!@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

일부 환경에서는 특수문자가 URL로 인코딩되어야 할 수 있습니다.

### 2. Vercel 환경 변수 로드 타이밍
Vercel이 환경 변수를 제대로 로드하지 못했을 수 있습니다.

## ✅ 해결 방법

### 방법 1: 특수문자 URL 인코딩 (권장)

Vercel Dashboard → Settings → Environment Variables:
1. `DATABASE_URL` 클릭하여 편집
2. Value를 다음으로 변경:
   ```
   postgresql://postgres.utvpqdncdsfhcdxkpyls:rlawjdgns10%21@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
   ```
   (`!` → `%21`로 인코딩)
3. **Save** 클릭
4. Vercel 재배포

### 방법 2: Supabase 프로젝트 재시작

1. Supabase Dashboard → Settings → General
2. "Restart project" 클릭
3. 재시작 완료 대기 (약 2-3분)
4. Vercel 재배포

### 방법 3: Direct Connection 사용 (임시 테스트)

IPv4 호환성 문제가 있다고 하지만, 테스트 목적으로 Direct Connection을 시도:

1. Supabase Connect → Method: "Direct connection"
2. Connection String 복사
3. Vercel 환경 변수에 설정
4. 재배포 및 테스트

## 🧪 테스트 순서

1. 특수문자 인코딩 적용 (`!` → `%21`)
2. Vercel 재배포
3. 회원가입 테스트
4. 실패 시 Supabase 프로젝트 재시작
5. 여전히 실패 시 Direct Connection 시도

## 📝 참고

- `!`는 URL에서 특수문자이지만 일반적으로 그대로 사용 가능
- 일부 환경(특히 Vercel 서버리스 함수)에서는 인코딩이 필요할 수 있음
- `%21`은 `!`의 URL 인코딩된 형태

