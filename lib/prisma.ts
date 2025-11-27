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

  // 비동기로 연결 시도 (블로킹하지 않음)
  connectWithRetry().catch(console.error)
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

