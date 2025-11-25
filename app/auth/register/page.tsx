'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsLoading(true)

    try {
      await register(email, password, name)
      
      // 회원가입 성공 시 메인 페이지로 이동
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Register error:', error)
      setError(error instanceof Error ? error.message : '회원가입에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface rounded-2xl shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold mb-2 text-text-primary">회원가입</h1>
        <p className="text-text-secondary mb-6">프론트위키에 가입하세요</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-text-primary">
              이름
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-text-primary placeholder:text-text-tertiary transition-all"
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-text-primary">
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-text-primary placeholder:text-text-tertiary transition-all"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-text-primary">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-text-primary placeholder:text-text-tertiary transition-all"
              placeholder="최소 6자 이상"
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-text-primary">
              비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-text-primary placeholder:text-text-tertiary transition-all"
              placeholder="비밀번호를 다시 입력하세요"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all hover:shadow-md"
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
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
  )
}

