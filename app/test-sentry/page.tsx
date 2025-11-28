'use client'

import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function TestSentryPage() {
  const [result, setResult] = useState<string>('')
  const [sentryStatus, setSentryStatus] = useState<string>('확인 중...')

  useEffect(() => {
    // Sentry 초기화 상태 확인
    const checkSentry = () => {
      // @ts-expect-error - window에 Sentry가 있는지 확인
      if (typeof window !== 'undefined' && window.Sentry) {
        setSentryStatus('✅ Sentry 초기화됨')
      } else {
        setSentryStatus('❌ Sentry 초기화 안 됨')
      }

    }

    checkSentry()
  }, [])

  const testUndefinedFunction = () => {
    setResult('테스트 실행 중...')
    try {
      // @ts-expect-error - 의도적인 오류
      myUndefinedFunction()
    } catch (error) {
      setResult(`오류 발생: ${error instanceof Error ? error.message : String(error)}`)
      Sentry.captureException(error)
    }
  }

  const testError = () => {
    setResult('테스트 실행 중...')
    try {
      throw new Error('클라이언트 사이드 테스트 에러: Sentry 연동 확인용')
    } catch (error) {
      setResult(`오류 발생: ${error instanceof Error ? error.message : String(error)}`)
      Sentry.captureException(error)
    }
  }

  const testConsoleError = () => {
    setResult('콘솔에 오류를 출력합니다. 브라우저 개발자 도구를 확인하세요.')
    Sentry.captureMessage('콘솔 오류 테스트: Sentry 연동 확인용', 'warning')
  }

  const testServerError = async () => {
    setResult('서버 사이드 테스트 실행 중...')
    try {
      const response = await fetch('/api/test-sentry?type=error')
      const data = await response.json()
      setResult(`서버 응답: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`서버 테스트 실패: ${error instanceof Error ? error.message : String(error)}`)
      console.error('서버 테스트 오류:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-surface rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-text-primary">Sentry 클라이언트 테스트</h1>
        <p className="text-text-secondary mb-6">
          클라이언트 사이드와 서버 사이드에서 Sentry 오류 캡처를 테스트합니다.
        </p>

        {/* Sentry 상태 표시 */}
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-text-primary">
            <strong>Sentry 상태:</strong> {sentryStatus}
          </p>
          <p className="text-sm text-text-secondary mt-2">
            브라우저 콘솔에서 환경 변수 확인 로그를 확인하세요.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold text-text-primary">클라이언트 사이드 테스트</h2>
          <button
            onClick={testUndefinedFunction}
            className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-all font-medium"
          >
            테스트 1: 정의되지 않은 함수 호출 (myUndefinedFunction)
          </button>

          <button
            onClick={testError}
            className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-700 transition-all font-medium"
          >
            테스트 2: 일반 에러 발생
          </button>

          <button
            onClick={testConsoleError}
            className="w-full px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-700 transition-all font-medium"
          >
            테스트 3: 콘솔 오류 출력
          </button>

          <h2 className="text-xl font-semibold text-text-primary mt-6">서버 사이드 테스트</h2>
          <button
            onClick={testServerError}
            className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-700 transition-all font-medium"
          >
            테스트 4: 서버 사이드 에러 (API 호출)
          </button>
        </div>

        {result && (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
            <pre className="text-text-primary text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h2 className="font-semibold text-text-primary mb-2">테스트 방법:</h2>
          <ol className="list-decimal list-inside space-y-1 text-text-secondary text-sm">
            <li>위 버튼 중 하나를 클릭하세요</li>
            <li>브라우저 개발자 도구 콘솔을 확인하세요</li>
            <li>Sentry 대시보드에서 오류가 나타나는지 확인하세요 (5-10분 소요)</li>
            <li>또는 브라우저 콘솔에서 직접 <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">myUndefinedFunction()</code> 실행</li>
          </ol>
        </div>

        <div className="mt-4 text-center">
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
