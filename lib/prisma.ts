import 'server-only'
import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// DATABASE_URL이 상대 경로인 경우 절대 경로로 변환
// Next.js API 라우트는 다른 작업 디렉토리에서 실행될 수 있으므로 절대 경로 사용
if (process.env.DATABASE_URL?.startsWith('file:./')) {
  const relativePath = process.env.DATABASE_URL.replace('file:', '')
  const absolutePath = path.resolve(process.cwd(), relativePath)
  process.env.DATABASE_URL = `file:${absolutePath}`
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // 연결 풀 설정 (Supabase 최적화)
    // connection_limit: 연결 풀 크기 (기본값: 10)
    // pool_timeout: 연결 대기 시간 (초)
    // connect_timeout: 연결 타임아웃 (초)
    // query_timeout: 쿼리 타임아웃 (초)
    // statement_cache_size: SQL 문 캐시 크기
    // idle_in_transaction_session_timeout: 유휴 트랜잭션 타임아웃 (초)
    // ...(process.env.DATABASE_URL?.includes('supabase') && {
    //   // Supabase 전용 설정은 Prisma에서 직접 지원하지 않으므로
    //   // DATABASE_URL에 파라미터를 추가하는 방식 사용
    // }),
  })

// 연결 재시도 헬퍼 함수
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | undefined
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // P1001 (Can't reach database server) 또는 P2021 (Table does not exist) 에러인 경우 재시도
      const prismaError = error as { code?: string }
      if (
        prismaError?.code === 'P1001' ||
        prismaError?.code === 'P2021'
      ) {
        if (i < maxRetries - 1) {
          console.warn(`Database connection failed, retrying... (${i + 1}/${maxRetries})`)
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)))
          continue
        }
      }
      
      // 다른 에러는 즉시 throw
      throw error
    }
  }
  
  throw lastError || new Error('Unknown error')
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

