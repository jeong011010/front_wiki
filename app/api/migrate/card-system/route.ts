import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * 임시 마이그레이션 API
 * 카드 시스템 테이블 생성
 * ⚠️ 프로덕션에서는 사용하지 마세요
 * ⚠️ 마이그레이션 완료 후 이 파일을 삭제하세요
 */
export async function POST(request: NextRequest) {
  // 개발 환경에서만 실행 가능
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  // 보안: 특정 시크릿 키 필요
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET || 'dev-only'}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // 각 SQL 명령을 개별적으로 실행
    const commands = [
      // UserCard 테이블 생성
      `CREATE TABLE IF NOT EXISTS "UserCard" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "articleId" TEXT NOT NULL,
        "obtainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "obtainedBy" TEXT NOT NULL DEFAULT 'author',
        CONSTRAINT "UserCard_pkey" PRIMARY KEY ("id")
      )`,
      
      // UserPoint 테이블 생성
      `CREATE TABLE IF NOT EXISTS "UserPoint" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "points" INTEGER NOT NULL DEFAULT 0,
        "totalPoints" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "UserPoint_pkey" PRIMARY KEY ("id")
      )`,
      
      // CardDraw 테이블 생성
      `CREATE TABLE IF NOT EXISTS "CardDraw" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "articleId" TEXT,
        "cost" INTEGER NOT NULL DEFAULT 100,
        "drawType" TEXT NOT NULL DEFAULT 'normal',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CardDraw_pkey" PRIMARY KEY ("id")
      )`,
    ]

    // 테이블 생성
    for (const sql of commands) {
      try {
        await prisma.$executeRawUnsafe(sql)
      } catch (error: any) {
        // 테이블이 이미 존재하는 경우 무시
        if (!error.message?.includes('already exists')) {
          throw error
        }
      }
    }

    // 인덱스 생성 (존재하지 않는 경우에만)
    const indexes = [
      `CREATE UNIQUE INDEX IF NOT EXISTS "UserCard_userId_articleId_key" ON "UserCard"("userId", "articleId")`,
      `CREATE INDEX IF NOT EXISTS "UserCard_userId_idx" ON "UserCard"("userId")`,
      `CREATE INDEX IF NOT EXISTS "UserCard_articleId_idx" ON "UserCard"("articleId")`,
      `CREATE INDEX IF NOT EXISTS "UserCard_obtainedAt_idx" ON "UserCard"("obtainedAt")`,
      `CREATE INDEX IF NOT EXISTS "UserCard_obtainedBy_idx" ON "UserCard"("obtainedBy")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "UserPoint_userId_key" ON "UserPoint"("userId")`,
      `CREATE INDEX IF NOT EXISTS "UserPoint_userId_idx" ON "UserPoint"("userId")`,
      `CREATE INDEX IF NOT EXISTS "CardDraw_userId_idx" ON "CardDraw"("userId")`,
      `CREATE INDEX IF NOT EXISTS "CardDraw_articleId_idx" ON "CardDraw"("articleId")`,
      `CREATE INDEX IF NOT EXISTS "CardDraw_createdAt_idx" ON "CardDraw"("createdAt")`,
    ]

    for (const sql of indexes) {
      try {
        await prisma.$executeRawUnsafe(sql)
      } catch (error: any) {
        // 인덱스가 이미 존재하는 경우 무시
        if (!error.message?.includes('already exists')) {
          console.warn('Index creation warning:', error.message)
        }
      }
    }

    // 외래 키 추가 (존재하지 않는 경우에만)
    const foreignKeys = [
      `DO $$ 
       BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserCard_userId_fkey') THEN
           ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_userId_fkey" 
           FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
         END IF;
       END $$`,
      `DO $$ 
       BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserCard_articleId_fkey') THEN
           ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_articleId_fkey" 
           FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
         END IF;
       END $$`,
      `DO $$ 
       BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserPoint_userId_fkey') THEN
           ALTER TABLE "UserPoint" ADD CONSTRAINT "UserPoint_userId_fkey" 
           FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
         END IF;
       END $$`,
    ]

    for (const sql of foreignKeys) {
      try {
        await prisma.$executeRawUnsafe(sql)
      } catch (error: any) {
        // 제약 조건이 이미 존재하는 경우 무시
        if (!error.message?.includes('already exists')) {
          console.warn('Foreign key creation warning:', error.message)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Card system tables created successfully',
    })
  } catch (error) {
    console.error('Migration error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}

