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
