# Supabase 자동 일시 중지 문제 해결

## 🔴 문제 상황

매번 Vercel 재배포 시 Supabase 연결 오류가 발생하고, Supabase를 수동으로 재시작해야 하는 문제:

```
Can't reach database server at `aws-1-ap-northeast-2.pooler.supabase.com:5432`
```

**증상:**
- Supabase Dashboard에서는 프로젝트가 "Active"로 표시됨
- 하지만 실제로는 데이터베이스 연결이 차단됨
- Supabase 재시작 후 정상 작동

## 🔍 원인 분석

### Supabase 무료 플랜의 자동 일시 중지

**무료 플랜 제한:**
- 7일간 비활성화 시 프로젝트가 **자동으로 일시 중지**됨
- Dashboard에서는 "Active"로 보일 수 있지만, 실제 연결은 차단됨
- Vercel 재배포 시 새로운 연결 시도 → 실패

**왜 Dashboard에서는 "Active"로 보이는가?**
- Dashboard UI는 캐시된 상태를 표시할 수 있음
- 실제 데이터베이스 연결 상태와 다를 수 있음
- 프로젝트가 "깨어나야" 실제 연결 가능

## 🛠️ 해결 방법

### 방법 1: Supabase 프로젝트를 항상 활성 상태로 유지 ⭐ (권장)

#### 1-1. 주기적인 핑 (Keep-Alive)

**Vercel Cron Jobs 사용:**

> ⚠️ **주의**: Vercel Hobby 플랜 제한사항
> - 계정당 최대 2개의 cron job
> - 하루에 한 번만 실행 가능
> - 정확한 시간 보장 안 됨 (예: 1시로 설정해도 1:00-1:59 사이에 실행될 수 있음)

1. **Vercel Dashboard → 프로젝트 → Settings → Cron Jobs**
2. **Create Cron Job** 클릭
3. 설정:
   - **Path**: `/api/health/supabase`
   - **Schedule**: `0 1 * * *` (매일 새벽 1시, Hobby 플랜 제한)
   - 또는 `0 */6 * * *` (6시간마다, Pro 플랜 필요)

4. **API Route 생성**: `app/api/health/supabase/route.ts`
   ```typescript
   import { NextResponse } from 'next/server'
   import { prisma } from '@/lib/prisma'

   export async function GET() {
     try {
       // 간단한 쿼리로 Supabase 연결 유지
       await prisma.$queryRaw`SELECT 1`
       return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
     } catch (error) {
       return NextResponse.json({ status: 'error', error: String(error) }, { status: 500 })
     }
   }
   ```

**장점:**
- 자동으로 Supabase 프로젝트를 활성 상태로 유지
- 수동 재시작 불필요
- Vercel Cron Jobs는 무료 플랜에서도 사용 가능

**제한사항 (Hobby 플랜):**
- 하루에 한 번만 실행 가능
- 정확한 시간 보장 안 됨 (1:00-1:59 사이에 실행될 수 있음)
- 계정당 최대 2개의 cron job

**Pro 플랜 업그레이드 시:**
- 무제한 cron 호출
- 정확한 시간 보장
- 더 자주 실행 가능 (예: 6시간마다)

#### 1-2. 애플리케이션 시작 시 연결 확인

**`lib/prisma.ts` 수정:**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// 프로젝트 시작 시 연결 확인
if (process.env.NODE_ENV === 'production') {
  prisma.$connect()
    .then(() => {
      console.log('✅ Supabase 연결 성공')
    })
    .catch((error) => {
      console.error('❌ Supabase 연결 실패:', error)
    })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 방법 2: Supabase 프로젝트 재시작 자동화

#### 2-1. Supabase API를 사용한 자동 재시작

**Supabase Management API 사용:**

1. **Supabase Access Token 생성**
   - Supabase Dashboard → Account → Access Tokens
   - 새 토큰 생성

2. **환경 변수 추가**
   ```env
   SUPABASE_ACCESS_TOKEN=your_access_token
   SUPABASE_PROJECT_REF=your_project_ref
   ```

3. **API Route 생성**: `app/api/admin/restart-supabase/route.ts`
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'
   import { requireAdmin } from '@/lib/auth-middleware'

   export async function POST(request: NextRequest) {
     // 관리자만 접근 가능
     const authResult = await requireAdmin(request)
     if (authResult.error || !authResult.user) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
     }

     try {
       const projectRef = process.env.SUPABASE_PROJECT_REF
       const accessToken = process.env.SUPABASE_ACCESS_TOKEN

       if (!projectRef || !accessToken) {
         return NextResponse.json({ error: 'Missing credentials' }, { status: 500 })
       }

       // Supabase Management API로 프로젝트 재시작
       const response = await fetch(
         `https://api.supabase.com/v1/projects/${projectRef}/restart`,
         {
           method: 'POST',
           headers: {
             'Authorization': `Bearer ${accessToken}`,
             'Content-Type': 'application/json',
           },
         }
       )

       if (!response.ok) {
         const error = await response.text()
         return NextResponse.json({ error }, { status: response.status })
       }

       return NextResponse.json({ success: true, message: 'Supabase 프로젝트 재시작 중...' })
     } catch (error) {
       return NextResponse.json({ error: String(error) }, { status: 500 })
     }
   }
   ```

4. **Vercel 배포 후 자동 호출**
   - Vercel의 `vercel.json`에 배포 후 훅 추가
   - 또는 GitHub Actions에서 배포 후 호출

### 방법 3: 연결 재시도 로직 추가

**Prisma Client에 재시도 로직 추가:**

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// 연결 재시도 헬퍼
async function connectWithRetry(maxRetries = 3, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect()
      return true
    } catch (error) {
      if (i === maxRetries - 1) throw error
      console.warn(`연결 실패, ${delay}ms 후 재시도... (${i + 1}/${maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  return false
}

// 프로덕션 환경에서 자동 연결
if (process.env.NODE_ENV === 'production') {
  connectWithRetry().catch(console.error)
}

export { prisma }
```

### 방법 4: Supabase Pro 플랜으로 업그레이드

**Pro 플랜 ($25/월):**
- 자동 일시 중지 없음
- 프로젝트가 항상 활성 상태
- 더 많은 리소스 및 기능

**무료 플랜 vs Pro 플랜:**
- 무료: 7일 비활성화 시 자동 일시 중지
- Pro: 항상 활성 상태, 자동 일시 중지 없음

## 📋 권장 해결책

### 단기 해결책 (무료 플랜)

1. **Vercel Cron Jobs로 Keep-Alive 설정** ⭐
   - 30분마다 간단한 쿼리 실행
   - Supabase 프로젝트를 활성 상태로 유지
   - 수동 재시작 불필요

2. **연결 재시도 로직 추가**
   - Prisma Client에 재시도 로직 추가
   - 일시적인 연결 실패 시 자동 재시도

### 장기 해결책

1. **Supabase Pro 플랜으로 업그레이드**
   - 자동 일시 중지 없음
   - 프로덕션 환경에 적합

2. **다른 데이터베이스 서비스 고려**
   - Neon (서버리스 PostgreSQL, 자동 일시 중지 없음)
   - PlanetScale (MySQL, 자동 스케일링)

## 🔧 구현 가이드

### 1. Keep-Alive API Route 생성

**`app/api/health/supabase/route.ts`:**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Supabase 연결 상태 확인 및 Keep-Alive
 * Vercel Cron Jobs에서 주기적으로 호출하여 프로젝트를 활성 상태로 유지
 */
export async function GET() {
  try {
    // 간단한 쿼리로 연결 확인
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Supabase 연결 정상',
    })
  } catch (error) {
    console.error('Supabase 연결 실패:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
```

### 2. Vercel Cron Jobs 설정

**`vercel.json`에 추가:**

```json
{
  "crons": [
    {
      "path": "/api/health/supabase",
      "schedule": "0 1 * * *"
    }
  ]
}
```

> **Hobby 플랜**: 하루에 한 번만 실행 가능 (`0 1 * * *` - 매일 새벽 1시)
> **Pro 플랜**: 더 자주 실행 가능 (`0 */6 * * *` - 6시간마다)

**또는 Vercel Dashboard에서 설정:**
1. Vercel Dashboard → 프로젝트 → Settings → Cron Jobs
2. Create Cron Job
3. Path: `/api/health/supabase`
4. Schedule: `0 1 * * *` (매일 새벽 1시, Hobby 플랜 제한)

### 3. 연결 재시도 로직 추가

**`lib/prisma.ts` 수정:**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// 프로덕션 환경에서 연결 확인 및 재시도
if (process.env.NODE_ENV === 'production') {
  const connectWithRetry = async (maxRetries = 3, delay = 2000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await prisma.$connect()
        console.log('✅ Supabase 연결 성공')
        return
      } catch (error) {
        if (i === maxRetries - 1) {
          console.error('❌ Supabase 연결 실패 (최대 재시도 횟수 초과):', error)
          return
        }
        console.warn(`⚠️ Supabase 연결 실패, ${delay}ms 후 재시도... (${i + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  connectWithRetry().catch(console.error)
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## ✅ 체크리스트

### 즉시 적용 가능한 해결책

- [ ] Keep-Alive API Route 생성 (`/api/health/supabase`)
- [ ] Vercel Cron Jobs 설정 (30분마다 호출)
- [ ] 연결 재시도 로직 추가 (`lib/prisma.ts`)
- [ ] 테스트: Cron Job이 정상 작동하는지 확인

### 장기 해결책

- [ ] Supabase Pro 플랜으로 업그레이드 고려
- [ ] 또는 다른 데이터베이스 서비스 검토 (Neon, PlanetScale)

## 📊 예상 효과

### Keep-Alive 설정 후

- ✅ Supabase 프로젝트가 항상 활성 상태 유지
- ✅ 수동 재시작 불필요
- ✅ Vercel 재배포 시 연결 오류 방지
- ✅ 무료 플랜에서도 사용 가능

### 비용

- **Vercel Cron Jobs**: 무료 플랜에서도 사용 가능
- **API 호출 비용**: 매우 낮음 (30분마다 1회)
- **Supabase 쿼리 비용**: 무료 플랜 범위 내

## 🔗 참고 자료

- [Supabase 무료 플랜 제한](https://supabase.com/pricing)
- [Vercel Cron Jobs 문서](https://vercel.com/docs/cron-jobs)
- [Prisma 연결 관리](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management)

---

**결론**: Vercel Cron Jobs로 Keep-Alive를 설정하면 매번 수동으로 재시작할 필요가 없습니다! 🚀

