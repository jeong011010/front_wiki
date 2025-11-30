import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'error'

  try {
    let errorMessage: string | undefined

    switch (type) {
      case 'error':
        errorMessage = '테스트 에러: Sentry 서버 사이드 연동 확인용'
        throw new Error(errorMessage)
      case 'message':
        Sentry.captureMessage('테스트 메시지: Sentry 서버 사이드 연동 확인용', 'info')
        break
      case 'exception':
        Sentry.captureException(new Error('테스트 예외: Sentry 서버 사이드 연동 확인용'))
        break
      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: error, message, or exception' },
          { status: 400 }
        )
    }

    // 서버리스 환경에서 이벤트 전송 완료 보장
    await Sentry.flush(2000)

    return NextResponse.json({
      success: true,
      message: `Sentry에 테스트 ${type}가 전송되었습니다.`,
      error: errorMessage,
    })
  } catch (error) {
    Sentry.captureException(error)
    await Sentry.flush(2000)

    return NextResponse.json({
      success: true,
      message: 'Sentry에 테스트 에러가 전송되었습니다.',
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
