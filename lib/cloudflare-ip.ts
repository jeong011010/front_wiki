/**
 * Cloudflare IP 주소 목록 (IPv4)
 * Cloudflare의 공식 IP 범위
 * 
 * 참고: https://www.cloudflare.com/ips/
 */
export const CLOUDFLARE_IPV4_RANGES = [
  '173.245.48.0/20',
  '103.21.244.0/22',
  '103.22.200.0/22',
  '103.31.4.0/22',
  '141.101.64.0/18',
  '108.162.192.0/18',
  '190.93.240.0/20',
  '188.114.96.0/20',
  '197.234.240.0/22',
  '198.41.128.0/17',
  '162.158.0.0/15',
  '104.16.0.0/13',
  '104.24.0.0/14',
  '172.64.0.0/13',
  '131.0.72.0/22',
]

/**
 * Cloudflare IP 주소 목록 (IPv6)
 */
export const CLOUDFLARE_IPV6_RANGES = [
  '2400:cb00::/32',
  '2606:4700::/32',
  '2803:f800::/32',
  '2405:b500::/32',
  '2405:8100::/32',
  '2a06:98c0::/29',
  '2c0f:f248::/32',
]

/**
 * IP 주소가 CIDR 범위에 포함되는지 확인
 */
function isIPInRange(ip: string, cidr: string): boolean {
  const [rangeIP, prefixLength] = cidr.split('/')
  const prefix = parseInt(prefixLength, 10)
  
  // IPv4 처리
  if (ip.includes('.')) {
    const ipNum = ipToNumber(ip)
    const rangeNum = ipToNumber(rangeIP)
    const mask = (0xffffffff << (32 - prefix)) >>> 0
    
    return (ipNum & mask) === (rangeNum & mask)
  }
  
  // IPv6 처리 (간단한 구현)
  // 실제로는 더 복잡한 IPv6 CIDR 매칭이 필요할 수 있음
  return false
}

/**
 * IPv4 주소를 숫자로 변환
 */
function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
}

/**
 * IP 주소가 Cloudflare IP 범위에 포함되는지 확인
 */
export function isCloudflareIP(ip: string): boolean {
  // IPv4 확인
  for (const range of CLOUDFLARE_IPV4_RANGES) {
    if (isIPInRange(ip, range)) {
      return true
    }
  }
  
  // IPv6 확인
  for (const range of CLOUDFLARE_IPV6_RANGES) {
    if (isIPInRange(ip, range)) {
      return true
    }
  }
  
  return false
}

/**
 * Cloudflare 헤더에서 실제 클라이언트 IP 추출
 * 
 * @param request NextRequest 객체
 * @returns 실제 클라이언트 IP 주소
 */
export function getClientIP(request: Request): string {
  // Cloudflare를 통해 들어온 요청인 경우
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Vercel 환경
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  
  // 로컬 환경
  const xRealIP = request.headers.get('x-real-ip')
  if (xRealIP) {
    return xRealIP
  }
  
  return 'unknown'
}

