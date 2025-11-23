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

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

