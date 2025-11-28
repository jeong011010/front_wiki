// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
//
// NOTE: 현재는 SentryInit 컴포넌트를 통해 명시적으로 초기화하고 있습니다.
// 이 파일은 withSentryConfig가 자동으로 로드하지 않는 경우를 대비해 남겨두었습니다.
// 중복 초기화를 방지하기 위해 비활성화되어 있습니다.

// import * as Sentry from "@sentry/nextjs";

// 브라우저 환경에서만 실행
// if (typeof window !== 'undefined') {
//   const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
//   
//   if (!dsn) {
//     console.warn('⚠️ Sentry: NEXT_PUBLIC_SENTRY_DSN이 설정되지 않았습니다.');
//   } else {
//     console.log('✅ Sentry 클라이언트 초기화 중...');
//     
//     Sentry.init({
//       dsn,
//       tracesSampleRate: 1.0,
//       debug: process.env.NODE_ENV === 'development',
//       integrations: [
//         Sentry.browserTracingIntegration(),
//         Sentry.replayIntegration({
//           maskAllText: true,
//           blockAllMedia: true,
//         }),
//       ],
//       tracePropagationTargets: [
//         'localhost',
//         /^https:\/\/front-wiki\.com\/api/,
//         /^https:\/\/.*\.vercel\.app\/api/,
//       ],
//       replaysOnErrorSampleRate: 1.0,
//       replaysSessionSampleRate: 0.1,
//     });
//   }
// }


