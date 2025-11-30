# Prisma와 Supabase 연결 가이드

## 문제 상황
Prisma 마이그레이션 명령어가 타임아웃되거나 연결이 안 되는 경우 해결 방법입니다.

## 방법 1: 포트 변경 (6543 → 5432)

### 현재 설정 (Pooler - 6543)
```
DATABASE_URL="postgresql://postgres.utvpqdncdsfhcdxkpyls:rlawjdgns10%21@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Direct Connection (5432)로 변경
`.env.local` 파일에서 `DATABASE_URL`을 다음과 같이 변경:

```bash
DATABASE_URL="postgresql://postgres.utvpqdncdsfhcdxkpyls:rlawjdgns10%21@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
```

**주의사항:**
- `pgbouncer=true` 파라미터 제거
- 포트를 `6543`에서 `5432`로 변경
- Supabase 대시보드 → Settings → Database → Connection string에서 "Direct connection" 선택

## 방법 2: Supabase 대시보드에서 직접 연결

### 2.1 Connection String 확인
1. Supabase 대시보드 접속
2. Settings → Database 이동
3. Connection string 섹션에서:
   - **Connection pooling** (포트 6543): 서버리스/Next.js API에 권장
   - **Direct connection** (포트 5432): 마이그레이션에 권장

### 2.2 마이그레이션 SQL 직접 실행
Prisma 마이그레이션이 안 될 때는 Supabase SQL Editor에서 직접 실행:

1. Supabase 대시보드 → SQL Editor
2. `prisma/migrations/20251130185549_add_card_tier_system_fields/migration.sql` 파일 내용 복사
3. SQL Editor에 붙여넣고 실행
4. Prisma Client 재생성: `npx prisma generate`

### 2.3 마이그레이션 히스토리 수동 등록
Supabase SQL Editor에서 실행:

```sql
-- 마이그레이션 히스토리에 수동으로 레코드 추가
INSERT INTO "_prisma_migrations" (
  id,
  checksum,
  finished_at,
  migration_name,
  logs,
  rolled_back_at,
  started_at,
  applied_steps_count
) VALUES (
  gen_random_uuid()::text,
  'manual_migration_20251130185549',
  NOW(),
  '20251130185549_add_card_tier_system_fields',
  NULL,
  NULL,
  NOW(),
  1
);
```

## 방법 3: Prisma DB Pull (스키마 동기화)

데이터베이스에 직접 테이블을 만들었다면, Prisma 스키마를 DB에서 가져올 수 있습니다:

```bash
# 주의: 기존 스키마를 덮어씁니다!
npx prisma db pull
```

이 명령어는:
- 데이터베이스의 현재 스키마를 읽어옴
- `prisma/schema.prisma` 파일을 업데이트
- 관계와 인덱스도 자동으로 감지

**주의:** 이 방법은 기존 스키마 파일을 덮어쓰므로 백업 후 진행하세요.

## 방법 4: Prisma Studio로 확인

데이터베이스 연결이 제대로 되는지 확인:

```bash
npx prisma studio
```

브라우저에서 `http://localhost:5555` 접속하여 테이블과 데이터를 확인할 수 있습니다.

## 연결 테스트

### 간단한 연결 테스트 스크립트

`test-connection.ts` 파일 생성:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ 데이터베이스 연결 성공!')
    
    // 간단한 쿼리 테스트
    const userCount = await prisma.user.count()
    console.log(`📊 User 테이블 레코드 수: ${userCount}`)
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error)
    process.exit(1)
  }
}

testConnection()
```

실행:
```bash
npx tsx test-connection.ts
```

## 문제 해결 체크리스트

- [ ] `.env.local` 파일에 `DATABASE_URL`이 올바르게 설정되어 있는지 확인
- [ ] 포트가 올바른지 확인 (6543 또는 5432)
- [ ] `pgbouncer=true` 파라미터가 필요 없는지 확인 (5432 포트 사용 시)
- [ ] Supabase 프로젝트가 활성화되어 있는지 확인
- [ ] 방화벽이나 네트워크 문제는 없는지 확인
- [ ] Prisma Client가 최신인지 확인: `npx prisma generate`

## 권장 워크플로우

1. **개발 중**: 포트 6543 (Pooler) 사용 - API 요청에 최적화
2. **마이그레이션 실행**: 포트 5432 (Direct) 사용 - 마이그레이션에 안정적
3. **프로덕션**: 포트 6543 (Pooler) 사용 - 연결 풀링으로 성능 향상

## 참고 자료

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma Migrate Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma DB Pull](https://www.prisma.io/docs/concepts/components/prisma-db-pull)

