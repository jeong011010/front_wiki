# Vercel Supabase 연결 확인 체크리스트

## ✅ Supabase 상태 (정상)
- 모든 서비스 Healthy
- SQL Editor에서 쿼리 실행 성공
- 테이블 5개 생성됨

## 🔍 Vercel 환경 변수 확인

### 정확한 Connection String
```
postgresql://postgres.utvpqdncdsfhcdxkpyls:rlawjdgns10!@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

### Vercel Dashboard에서 확인할 사항

1. **Settings → Environment Variables**
2. `DATABASE_URL` 찾기
3. 다음을 확인:
   - ✅ 값이 위의 Connection String과 정확히 일치하는지
   - ✅ `[YOUR-PASSWORD]` 부분이 `rlawjdgns10!`로 교체되었는지
   - ✅ 앞뒤 공백이나 따옴표가 없는지
   - ✅ Environment가 "All Environments" 또는 "Production"에 체크되어 있는지

### 주의사항

**특수문자 인코딩:**
- 비밀번호에 `!`가 포함되어 있음
- URL에서 `!`는 그대로 사용 가능하지만, 일부 환경에서는 인코딩 필요할 수 있음
- 만약 문제가 계속되면 `!`를 `%21`로 인코딩 시도:
  ```
  postgresql://postgres.utvpqdncdsfhcdxkpyls:rlawjdgns10%21@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
  ```

## 🔧 해결 단계

1. Vercel Dashboard → Settings → Environment Variables
2. `DATABASE_URL` 클릭하여 편집
3. 값 복사하여 텍스트 에디터에 붙여넣기
4. 다음 확인:
   - 사용자명: `postgres.utvpqdncdsfhcdxkpyls`
   - 비밀번호: `rlawjdgns10!`
   - 호스트: `aws-1-ap-northeast-2.pooler.supabase.com`
   - 포트: `5432`
   - 데이터베이스: `postgres`
5. 문제가 있으면 수정 후 **Save** 클릭
6. Vercel 재배포

## 🧪 테스트

재배포 후:
1. Vercel 로그에서 DATABASE_URL preview 확인
2. 회원가입 시도
3. 연결 성공 여부 확인

