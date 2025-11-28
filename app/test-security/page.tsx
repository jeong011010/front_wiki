'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TestSecurityPage() {
  const [rateLimitResult, setRateLimitResult] = useState<string>('')
  const [headersResult, setHeadersResult] = useState<string>('')

  const testRateLimit = async () => {
    setRateLimitResult('테스트 실행 중...')
    try {
      const responses: string[] = []
      
      // 10번 연속 요청 (제한은 60초에 10회)
      for (let i = 1; i <= 12; i++) {
        const response = await fetch('/api/test-rate-limit')
        const data = await response.json()
        const headers = {
          'X-RateLimit-Limit': response.headers.get('X-RateLimit-Limit'),
          'X-RateLimit-Remaining': response.headers.get('X-RateLimit-Remaining'),
          'X-RateLimit-Reset': response.headers.get('X-RateLimit-Reset'),
        }
        
        responses.push(
          `요청 ${i}: ${response.status} - ${data.success ? '성공' : data.error || '실패'}\n` +
          `  Limit: ${headers['X-RateLimit-Limit']}, Remaining: ${headers['X-RateLimit-Remaining']}`
        )
        
        // 11번째 요청부터는 429 에러가 나와야 함
        if (response.status === 429) {
          responses.push(`\n✅ Rate Limiting 작동 확인: ${i}번째 요청에서 제한됨`)
          break
        }
        
        // 요청 간 짧은 딜레이
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      setRateLimitResult(responses.join('\n'))
    } catch (error) {
      setRateLimitResult(`오류 발생: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const checkSecurityHeaders = async () => {
    setHeadersResult('Security Headers 확인 중...')
    try {
      const response = await fetch('/')
      const headers: Record<string, string> = {}
      
      const securityHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Referrer-Policy',
        'Permissions-Policy',
        'Strict-Transport-Security',
        'Content-Security-Policy',
      ]
      
      securityHeaders.forEach(header => {
        const value = response.headers.get(header)
        if (value) {
          headers[header] = value
        }
      })
      
      if (Object.keys(headers).length > 0) {
        setHeadersResult(
          '✅ Security Headers 확인:\n\n' +
          Object.entries(headers)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')
        )
      } else {
        setHeadersResult('⚠️ Security Headers가 설정되지 않았습니다.\n브라우저 개발자 도구 > Network > Headers에서 확인하세요.')
      }
    } catch (error) {
      setHeadersResult(`오류 발생: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-surface rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-text-primary">Cloudflare 보안 기능 테스트</h1>
        <p className="text-text-secondary mb-6">
          Security Headers와 Rate Limiting 기능을 테스트합니다.
        </p>

        <div className="space-y-6">
          {/* Security Headers 테스트 */}
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h2 className="text-xl font-semibold text-text-primary mb-4">1. Security Headers 확인</h2>
            <button
              onClick={checkSecurityHeaders}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-all font-medium mb-4"
            >
              Security Headers 확인
            </button>
            {headersResult && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <pre className="text-text-primary text-sm whitespace-pre-wrap">{headersResult}</pre>
              </div>
            )}
            <p className="text-sm text-text-secondary mt-4">
              💡 브라우저 개발자 도구 &gt; Network 탭 &gt; Headers에서도 확인할 수 있습니다.
            </p>
          </div>

          {/* Rate Limiting 테스트 */}
          <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h2 className="text-xl font-semibold text-text-primary mb-4">2. Rate Limiting 테스트</h2>
            <p className="text-sm text-text-secondary mb-4">
              제한: 60초에 10회 요청 (12번 연속 요청하여 제한 확인)
            </p>
            <button
              onClick={testRateLimit}
              className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-all font-medium mb-4"
            >
              Rate Limiting 테스트 실행
            </button>
            {rateLimitResult && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <pre className="text-text-primary text-sm whitespace-pre-wrap">{rateLimitResult}</pre>
              </div>
            )}
          </div>

          {/* 로그인 Rate Limiting 안내 */}
          <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h2 className="text-xl font-semibold text-text-primary mb-4">3. 로그인 Rate Limiting</h2>
            <p className="text-sm text-text-secondary mb-2">
              로그인 API는 5분에 5회로 제한됩니다.
            </p>
            <p className="text-sm text-text-secondary">
              💡 로그인 페이지에서 5번 이상 실패하면 429 에러가 발생합니다.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
          >
            ← 메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}

