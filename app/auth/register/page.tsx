'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { motion } from 'framer-motion'
import { Button, Input, Alert } from '@/components/ui'
import { toast } from '@/components/ui'
import { register } from '@/lib/auth-client'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      const errorMessage = '비밀번호가 일치하지 않습니다.'
      setError(errorMessage)
      toast.error(errorMessage)
      return
    }

    setIsLoading(true)

    try {
      await register(email, password, name)
      
      // 회원가입 성공 토스트
      toast.success('회원가입이 완료되었습니다.')
      
      // 회원가입 성공 시 메인 페이지로 이동
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Register error:', error)
      const errorMessage = error instanceof Error ? error.message : '회원가입에 실패했습니다.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center px-4 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-surface rounded-2xl shadow-lg p-6 md:p-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-text-primary">회원가입</h1>
          <p className="text-sm md:text-base text-text-secondary mb-6">프론트위키에 가입하세요</p>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-text-primary">
                이름
              </label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                required
                autoComplete="name"
                error={!!error}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-text-primary">
                이메일
              </label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
                error={!!error}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-text-primary">
                비밀번호
              </label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="최소 6자 이상"
                required
                minLength={6}
                autoComplete="new-password"
                error={!!error}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-text-primary">
                비밀번호 확인
              </label>
              <Input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                required
                minLength={6}
                autoComplete="new-password"
                error={!!error || !!(confirmPassword && password !== confirmPassword)}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary text-sm">
              이미 계정이 있으신가요?{' '}
              <Link href="/auth/login" className="text-primary-500 hover:text-primary-700 font-medium">
                로그인
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
            >
              ← 메인으로 돌아가기
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

