# Cloudflare에서 Vercel로 네임서버 변경 가이드

## 📋 개요

Cloudflare에서 구매한 도메인을 Vercel에 연결하는 방법입니다. 두 가지 방법이 있습니다:
1. **Vercel 네임서버 사용** (권장) - Vercel이 DNS를 관리
2. **Cloudflare DNS 사용** - Cloudflare가 DNS를 관리하고 Vercel에 연결

## 🚀 방법 1: Vercel 네임서버로 변경 (권장)

### 1. Vercel에서 도메인 추가

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard

2. **프로젝트 선택**
   - `front-wiki` 프로젝트 선택

3. **Settings → Domains**
   - 왼쪽 메뉴에서 **Settings** 클릭
   - **Domains** 탭 클릭

4. **Add Domain 클릭**
   - **Add** 또는 **Add Domain** 버튼 클릭

5. **도메인 입력**
   - 구매한 `.com` 도메인 입력 (예: `example.com`)
   - **Add** 클릭

6. **네임서버 정보 확인**
   - Vercel이 네임서버 정보를 표시합니다:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ns3.vercel-dns.com
     ns4.vercel-dns.com
     ```
   - 이 네임서버들을 복사해두세요

### 2. Cloudflare에서 네임서버 변경

1. **Cloudflare Dashboard 접속**
   - https://dash.cloudflare.com/

2. **도메인 선택**
   - 구매한 `.com` 도메인 클릭

3. **DNS 설정으로 이동**
   - 왼쪽 메뉴에서 **DNS** 클릭
   - 또는 상단에서 **DNS** 탭 클릭

4. **네임서버 변경**
   - **Nameservers** 섹션 찾기
   - **Change nameservers** 또는 **Edit** 버튼 클릭
   - 또는 **Overview** 탭에서 **Nameservers** 섹션 확인

5. **Vercel 네임서버 입력**
   - 기존 Cloudflare 네임서버를 삭제
   - Vercel 네임서버 추가:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ns3.vercel-dns.com
     ns4.vercel-dns.com
     ```
   - **Save** 또는 **Continue** 클릭

6. **확인 대기**
   - "Nameservers updated" 메시지 확인
   - DNS 전파 대기 (보통 24-48시간, 최대 72시간)

### 3. Vercel에서 도메인 확인

1. **Vercel Dashboard → Settings → Domains**
2. 도메인 상태 확인:
   - **Valid Configuration**: DNS 전파 완료
   - **Invalid Configuration**: DNS 전파 중 (대기 필요)

3. **DNS 전파 확인**
   - 온라인 도구 사용:
     - https://dnschecker.org/
     - https://www.whatsmydns.net/
   - 도메인 입력 후 네임서버 확인

## 🔧 방법 2: Cloudflare DNS 사용 (Cloudflare 기능 유지)

Cloudflare의 보안 기능(CDN, DDoS 보호 등)을 계속 사용하려면:

### 1. Vercel에서 도메인 추가

1. **Vercel Dashboard → Settings → Domains**
2. **Add Domain** 클릭
3. 도메인 입력 (예: `example.com`)
4. **Add** 클릭

### 2. Vercel DNS 레코드 확인

Vercel이 필요한 DNS 레코드를 표시합니다:
- **A 레코드**: `76.76.21.21` (또는 다른 IP)
- **CNAME 레코드**: `cname.vercel-dns.com`

### 3. Cloudflare에서 DNS 레코드 추가

1. **Cloudflare Dashboard → DNS**
2. **Add record** 클릭
3. **A 레코드 추가**:
   - **Type**: `A`
   - **Name**: `@` (루트 도메인) 또는 비워두기
   - **IPv4 address**: Vercel이 제공한 IP 주소 (예: `76.76.21.21`)
   - **Proxy status**: **DNS only** (주황색 구름 끄기)
   - **TTL**: `Auto`
   - **Save** 클릭

4. **CNAME 레코드 추가** (선택사항):
   - **Type**: `CNAME`
   - **Name**: `www`
   - **Target**: `cname.vercel-dns.com`
   - **Proxy status**: **DNS only** (주황색 구름 끄기)
   - **TTL**: `Auto`
   - **Save** 클릭

### 4. 기존 레코드 확인

- Cloudflare의 기본 레코드가 있다면 확인
- Vercel과 충돌하는 레코드는 삭제하거나 수정

## 📝 단계별 가이드 (한국어)

### Cloudflare Dashboard에서 네임서버 변경

1. **로그인**
   - https://dash.cloudflare.com/ 접속
   - 로그인

2. **도메인 선택**
   - 왼쪽 사이드바에서 구매한 `.com` 도메인 클릭

3. **Overview 탭 확인**
   - 상단에 **Overview** 탭이 선택되어 있는지 확인
   - **Nameservers** 섹션 찾기
   - 현재 Cloudflare 네임서버가 표시됨 (예: `alice.ns.cloudflare.com`)

4. **네임서버 변경**
   - **Nameservers** 섹션에서 **Change** 또는 **Edit** 버튼 클릭
   - 또는 **DNS** 탭 → **Nameservers** 섹션

5. **Vercel 네임서버 입력**
   - **Custom nameservers** 또는 **Use custom nameservers** 선택
   - 네임서버 입력 필드에 Vercel 네임서버 입력:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ns3.vercel-dns.com
     ns4.vercel-dns.com
     ```
   - **Save** 또는 **Continue** 클릭

6. **확인**
   - "Nameservers updated successfully" 메시지 확인
   - 변경사항이 적용되는 데 몇 분 소요될 수 있음

## ⚠️ 주의사항

### 네임서버 변경 시

1. **Cloudflare 기능 비활성화**
   - 네임서버를 Vercel로 변경하면 Cloudflare의 CDN, DDoS 보호 등이 비활성화됨
   - Vercel은 자체 CDN을 제공하므로 문제없음

2. **DNS 전파 시간**
   - 네임서버 변경은 24-48시간 소요 (최대 72시간)
   - 전파 완료 전까지 도메인 접속 불가

3. **기존 DNS 레코드**
   - 네임서버 변경 시 Cloudflare의 모든 DNS 레코드가 무시됨
   - Vercel에서 필요한 레코드를 자동으로 설정

### Cloudflare DNS 사용 시

1. **Proxy 비활성화**
   - DNS 레코드 추가 시 **Proxy status**를 **DNS only**로 설정
   - 주황색 구름 아이콘을 회색으로 변경
   - Vercel과 Cloudflare가 충돌할 수 있음

2. **SSL/TLS 설정**
   - Cloudflare → **SSL/TLS** 탭
   - **Full** 또는 **Full (strict)** 모드 선택
   - Vercel의 자동 HTTPS와 함께 작동

## 🔍 DNS 전파 확인

### 온라인 도구 사용

1. **DNS Checker**
   - https://dnschecker.org/
   - 도메인 입력
   - **NS** 레코드 선택
   - 전 세계 서버에서 네임서버 확인

2. **What's My DNS**
   - https://www.whatsmydns.net/
   - 도메인 입력
   - **NS** 레코드 확인

### 명령어로 확인

```bash
# 네임서버 확인
dig NS example.com

# 또는
nslookup -type=NS example.com
```

## ✅ 체크리스트

### Vercel 네임서버 사용 시

- [ ] Vercel Dashboard에서 도메인 추가
- [ ] Vercel 네임서버 정보 복사 (ns1-4.vercel-dns.com)
- [ ] Cloudflare Dashboard 접속
- [ ] 도메인 선택
- [ ] Nameservers 섹션에서 Change 클릭
- [ ] Vercel 네임서버 4개 입력
- [ ] Save 클릭
- [ ] DNS 전파 대기 (24-48시간)
- [ ] Vercel에서 "Valid Configuration" 확인

### Cloudflare DNS 사용 시

- [ ] Vercel Dashboard에서 도메인 추가
- [ ] Vercel이 제공한 A 레코드 IP 확인
- [ ] Cloudflare Dashboard → DNS
- [ ] A 레코드 추가 (@ 또는 루트 도메인)
- [ ] Proxy status: DNS only 설정
- [ ] www 서브도메인용 CNAME 추가 (선택)
- [ ] DNS 전파 대기
- [ ] Vercel에서 "Valid Configuration" 확인

## 🔗 참고 자료

- [Vercel 도메인 설정 문서](https://vercel.com/docs/concepts/projects/domains)
- [Cloudflare 네임서버 변경 가이드](https://developers.cloudflare.com/dns/zone-setups/full-setup/)
- [DNS 전파 확인 도구](https://dnschecker.org/)

---

**권장**: Vercel 네임서버를 사용하면 Vercel이 자동으로 DNS를 관리하므로 더 간단합니다! 🚀

