'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function SentryInit() {
  useEffect(() => {
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined') return

    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

    if (!dsn) {
      return
    }

    // 이미 초기화되었는지 확인
    // @ts-expect-error - window에 Sentry가 있는지 확인
    if (window.Sentry && window.Sentry.getCurrentHub) {
      return
    }

    Sentry.init({
      dsn,

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1.0,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false, // 콘솔 로그 비활성화

      // Browser tracing integration for performance monitoring
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          // Additional Replay configuration goes in here, for example:
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Trace propagation targets for distributed tracing
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/front-wiki\.com\/api/,
        /^https:\/\/.*\.vercel\.app\/api/,
      ],

      replaysOnErrorSampleRate: 1.0,

      // This sets the sample rate to be 10%. You may want this to be 100% while
      // in development and sample at a lower rate in production
      replaysSessionSampleRate: 0.1,
    })
  }, [])

  return null
}

