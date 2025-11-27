# Vercel 도메인 설정 가이드 (가비아)

## 📋 개요

가비아에서 구매한 도메인(`front-wiki.store`)을 Vercel에 연결하는 방법입니다.

## ✅ Vercel의 자동 SSL 인증서

**중요**: Vercel은 **Let's Encrypt를 통해 자동으로 SSL 인증서를 발급**합니다. 별도로 인증서를 구매하거나 설정할 필요가 없습니다!

- 도메인이 Vercel에 연결되면 자동으로 HTTPS 활성화
- 인증서 갱신도 자동으로 처리
- 무료로 제공

## 🚀 설정 절차

### 1단계: Vercel에서 도메인 추가

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard

2. **프로젝트 선택**
   - `front-wiki` 프로젝트 선택

3. **Settings → Domains**
   - "Add Domain" 또는 "Add" 버튼 클릭

4. **도메인 입력**
   - `front-wiki.store` 입력
   - "Add" 클릭

5. **네임서버 정보 확인**
   - Vercel이 네임서버 정보를 표시합니다:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ns3.vercel-dns.com
     ns4.vercel-dns.com
     ```
   - 이 정보를 복사해두세요

### 2단계: 가비아에서 네임서버 설정

1. **가비아 접속**
   - https://www.gabia.com

2. **로그인 후 도메인 관리**
   - "도메인" → "도메인 관리" 메뉴
   - 또는 "나의 서비스" → "도메인" 선택

3. **도메인 선택**
   - `front-wiki.store` 도메인 선택

4. **네임서버 설정**
   - "네임서버 설정" 또는 "DNS 설정" 메뉴 선택
   - "네임서버 변경" 또는 "네임서버 설정" 클릭

5. **Vercel 네임서버 입력**
   - 네임서버 1: `ns1.vercel-dns.com`
   - 네임서버 2: `ns2.vercel-dns.com`
   - 네임서버 3: `ns3.vercel-dns.com`
   - 네임서버 4: `ns4.vercel-dns.com`
   - **모든 네임서버를 입력** (4개 모두)

6. **저장**
   - "저장" 또는 "적용" 버튼 클릭

### 3단계: DNS 전파 대기

1. **전파 시간**
   - 일반적으로 **5분 ~ 48시간** 소요
   - 대부분의 경우 **1-2시간 내** 완료

2. **전파 확인**
   - Vercel Dashboard → Domains에서 상태 확인
   - "Valid Configuration" 또는 "Active" 상태가 되면 완료
   - 또는 온라인 도구 사용:
     - https://dnschecker.org
     - `front-wiki.store` 도메인 검색
     - 네임서버가 `vercel-dns.com`으로 표시되면 전파 완료

### 4단계: SSL 인증서 자동 발급 확인

1. **자동 발급**
   - DNS 전파가 완료되면 Vercel이 자동으로 SSL 인증서 발급
   - 보통 **5-10분 내** 완료

2. **확인 방법**
   - Vercel Dashboard → Domains
   - 도메인 옆에 **자물쇠 아이콘(🔒)** 표시되면 HTTPS 활성화
   - 또는 브라우저에서 `https://front-wiki.store` 접속 확인

## 🔍 문제 해결

### DNS 전파가 오래 걸리는 경우

1. **캐시 확인**
   - 브라우저 캐시 삭제
   - DNS 캐시 삭제:
     ```bash
     # macOS
     sudo dscacheutil -flushcache
     sudo killall -HUP mDNSResponder
     
     # Windows
     ipconfig /flushdns
     
     # Linux
     sudo systemd-resolve --flush-caches
     ```

2. **네임서버 재확인**
   - 가비아에서 네임서버가 올바르게 설정되었는지 확인
   - 오타가 없는지 확인

3. **Vercel 로그 확인**
   - Vercel Dashboard → Domains → 도메인 선택
   - 에러 메시지 확인

### SSL 인증서가 발급되지 않는 경우

1. **DNS 전파 완료 확인**
   - DNS 전파가 완전히 완료되어야 SSL 발급 가능

2. **도메인 상태 확인**
   - Vercel Dashboard에서 도메인 상태 확인
   - "Invalid Configuration" 에러가 있는지 확인

3. **시간 대기**
   - DNS 전파 후 최대 24시간까지 대기
   - 대부분의 경우 몇 시간 내 해결

### 가비아에서 네임서버 설정을 찾을 수 없는 경우

1. **고객센터 문의**
   - 가비아 고객센터: 1588-5820
   - "도메인 네임서버 변경" 문의

2. **대안: DNS 레코드 설정**
   - 네임서버 변경이 불가능한 경우
   - 가비아에서 DNS 레코드를 직접 설정:
     - Type: `A` 또는 `CNAME`
     - Vercel Dashboard → Domains에서 제공하는 IP 주소 또는 CNAME 값 사용
   - **주의**: 이 방법은 네임서버 변경보다 복잡하고, Vercel의 자동 SSL 발급이 지연될 수 있음

## 📝 체크리스트

- [ ] Vercel Dashboard에서 `front-wiki.store` 도메인 추가
- [ ] Vercel 네임서버 정보 확인 (4개)
- [ ] 가비아에서 네임서버 설정 변경
- [ ] 네임서버 4개 모두 입력
- [ ] DNS 전파 대기 (1-2시간)
- [ ] Vercel에서 도메인 상태 확인
- [ ] SSL 인증서 자동 발급 확인 (자물쇠 아이콘)
- [ ] `https://front-wiki.store` 접속 테스트

## 💡 추가 정보

### 서브도메인 설정

서브도메인(예: `www.front-wiki.store`)도 추가할 수 있습니다:

1. Vercel Dashboard → Domains → "Add Domain"
2. `www.front-wiki.store` 입력
3. Vercel이 자동으로 DNS 레코드 생성
4. 가비아에서 CNAME 레코드 추가 (또는 네임서버 사용 시 자동)

### 프로덕션 환경 설정

1. Vercel Dashboard → Domains
2. 도메인 선택 → "Production" 환경에 연결 확인
3. 또는 Settings → Git에서 Production Branch가 `main`인지 확인

## 🔗 참고 링크

- [Vercel 도메인 설정 문서](https://vercel.com/docs/concepts/projects/domains)
- [가비아 도메인 관리](https://www.gabia.com)
- [DNS 전파 확인 도구](https://dnschecker.org)


