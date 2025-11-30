import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Cloudflare 보안 헤더 및 Rate Limiting 미들웨어
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security Headers 추가
  const securityHeaders = {
    // XSS 방지
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer 정책
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    
    // HSTS (HTTPS 강제)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
      // Content Security Policy (기본)
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-insights.com https://va.vercel-scripts.com",
        "script-src-elem 'self' 'unsafe-inline' https://vercel.live https://*.vercel-insights.com https://va.vercel-scripts.com",
        "worker-src 'self' blob:",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https://*.amazonaws.com https://*.cloudfront.net https://*.vercel.com",
        "connect-src 'self' https://*.vercel.app https://*.upstash.io https://*.sentry.io https://o4510438503743488.ingest.us.sentry.io https://va.vercel-scripts.com",
        "font-src 'self' data:",
        "frame-ancestors 'none'",
      ].join('; '),
  }

  // Security Headers 적용
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Cloudflare IP 검증 (선택적)
  // Cloudflare를 통해 들어오는 요청인지 확인
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  const cfRay = request.headers.get('cf-ray')
  
  // Cloudflare를 통해 들어온 요청인 경우 로깅 (선택적)
  if (cfConnectingIp && process.env.NODE_ENV === 'development') {
    console.log(`[Cloudflare] IP: ${cfConnectingIp}, CF-Ray: ${cfRay}`)
  }

  return response
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청에 적용:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

