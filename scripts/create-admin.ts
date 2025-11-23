import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function createAdmin() {
  try {
    console.log('=== 관리자 계정 생성 ===\n')

    const email = await question('이메일: ')
    if (!email || !email.includes('@')) {
      console.error('올바른 이메일을 입력해주세요.')
      process.exit(1)
    }

    // 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.error(`이미 존재하는 이메일입니다: ${email}`)
      if (existingUser.role === 'admin') {
        console.log('이 계정은 이미 관리자입니다.')
      } else {
        const update = await question('이 계정을 관리자로 변경하시겠습니까? (y/n): ')
        if (update.toLowerCase() === 'y') {
          await prisma.user.update({
            where: { email },
            data: { role: 'admin' },
          })
          console.log('✅ 계정이 관리자로 변경되었습니다.')
        }
      }
      process.exit(0)
    }

    const name = await question('이름: ')
    if (!name || name.trim().length === 0) {
      console.error('이름을 입력해주세요.')
      process.exit(1)
    }

    const password = await question('비밀번호: ')
    if (!password || password.length < 6) {
      console.error('비밀번호는 최소 6자 이상이어야 합니다.')
      process.exit(1)
    }

    const confirmPassword = await question('비밀번호 확인: ')
    if (password !== confirmPassword) {
      console.error('비밀번호가 일치하지 않습니다.')
      process.exit(1)
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10)

    // 관리자 계정 생성
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name.trim(),
        role: 'admin',
      },
    })

    console.log('\n✅ 관리자 계정이 생성되었습니다!')
    console.log(`이메일: ${admin.email}`)
    console.log(`이름: ${admin.name}`)
    console.log(`역할: ${admin.role}`)
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

createAdmin()

