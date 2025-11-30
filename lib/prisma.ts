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

// DATABASE_URL 확인 및 로깅 (개발 환경에서만)
if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL is not set! Please check your .env or .env.local file.')
}

// Supabase 연결 정보는 에러 발생 시에만 출력

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [], // Prisma 로그 비활성화 (에러는 try-catch로 처리)
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
  // 로컬 개발 환경에서는 재시도 없이 바로 실행 (디버깅을 위해)
  if (process.env.NODE_ENV === 'development') {
    try {
      return await fn()
    } catch (error) {
      // 개발 환경에서는 상세 에러 정보 로깅
      console.error('❌ Prisma query error (development):', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
        
        // Supabase 연결 문제인 경우 추가 정보 제공
        if (error.message.includes("Can't reach database server")) {
          console.error('')
          console.error('🔍 Supabase 연결 문제 진단:')
          console.error('  1. Supabase 프로젝트가 일시 중지되었을 수 있습니다 (무료 플랜)')
          console.error('  2. Supabase 대시보드에서 프로젝트 상태를 확인하세요')
          console.error('  3. 네트워크/방화벽 문제일 수 있습니다')
          console.error('  4. 배포 환경에서는 캐시로 인해 정상 작동할 수 있습니다')
          console.error('')
        }
      }
      throw error
    }
  }
  
  // 프로덕션 환경에서만 재시도 로직 적용
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

