# Vercel 도메인 "Invalid Configuration" 문제 해결

## 🔴 "Invalid Configuration" 상태의 원인

### 1. DNS 전파 중 (가장 흔한 원인) ✅
- 네임서버 변경 후 DNS 전파가 완료되지 않음
- 일반적으로 **1-2시간** 소요 (최대 48시간)
- 시간이 지나면 자동으로 해결됨

### 2. 네임서버 설정 오류
- 네임서버가 올바르게 설정되지 않음
- 오타 또는 누락된 네임서버

### 3. DNS 레코드 충돌
- 도메인이 다른 서비스에 연결되어 있음
- 이전 DNS 레코드가 남아있음

### 4. 도메인 등록 정보 문제
- 도메인 등록 정보가 올바르지 않음
- 도메인 만료 또는 정지 상태

## 🔍 확인 방법

### 1. DNS 전파 상태 확인

**온라인 도구 사용:**
1. https://dnschecker.org 접속
2. `front-wiki.store` 도메인 입력
3. Record Type: `NS` (네임서버) 선택
4. 검색 버튼 클릭
5. 전 세계 DNS 서버에서 네임서버 확인

**예상 결과 (전파 완료 시):**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
ns3.vercel-dns.com
ns4.vercel-dns.com
```

**전파 중인 경우:**
- 일부 지역에서만 `vercel-dns.com` 표시
- 일부 지역에서는 이전 네임서버 또는 "No DNS records" 표시

### 2. 네임서버 직접 확인

**터미널에서 확인:**
```bash
# macOS/Linux
dig NS front-wiki.store

# 또는
nslookup -type=NS front-wiki.store
```

**예상 출력:**
```
front-wiki.store.    NS    ns1.vercel-dns.com.
front-wiki.store.    NS    ns2.vercel-dns.com.
front-wiki.store.    NS    ns3.vercel-dns.com.
front-wiki.store.    NS    ns4.vercel-dns.com.
```

### 3. 가비아에서 네임서버 재확인

1. **가비아 로그인**
   - https://www.gabia.com

2. **도메인 관리**
   - "도메인" → "도메인 관리"
   - `front-wiki.store` 선택

3. **네임서버 확인**
   - 네임서버가 4개 모두 입력되어 있는지 확인
   - 오타가 없는지 확인:
     ```
     ns1.vercel-dns.com ✅
     ns2.vercel-dns.com ✅
     ns3.vercel-dns.com ✅
     ns4.vercel-dns.com ✅
     ```

## 🛠️ 해결 방법

### 방법 1: DNS 전파 대기 (권장)

**일반적인 전파 시간:**
- 최소: 5분
- 평균: 1-2시간
- 최대: 48시간

**확인 방법:**
- Vercel Dashboard → Domains에서 주기적으로 확인
- "Invalid Configuration" → "Valid Configuration"으로 변경되면 완료

### 방법 2: 네임서버 재설정

**가비아에서:**
1. 네임서버 설정 페이지로 이동
2. 기존 네임서버 삭제
3. Vercel 네임서버 4개 다시 입력
4. 저장

**주의사항:**
- 네임서버 변경 시 DNS 전파 시간이 다시 시작될 수 있음

### 방법 3: Vercel에서 도메인 재추가

1. **Vercel Dashboard → Domains**
2. `front-wiki.store` 도메인 **Remove** 클릭
3. **Add Domain** 클릭
4. `front-wiki.store` 다시 입력
5. 네임서버 정보 확인

### 방법 4: DNS 레코드 직접 설정 (네임서버 변경 불가 시)

**가비아에서 네임서버 변경이 불가능한 경우:**

1. **Vercel Dashboard → Domains → `front-wiki.store`**
2. **"View DNS Records" 또는 "Configuration" 클릭**
3. **A 레코드 또는 CNAME 레코드 확인**
   - Vercel이 제공하는 IP 주소 또는 CNAME 값 확인

4. **가비아에서 DNS 레코드 설정**
   - Type: `A` 또는 `CNAME`
   - Name: `@` (루트 도메인) 또는 `www` (서브도메인)
   - Value: Vercel이 제공하는 값
   - TTL: 3600 (기본값)

**주의사항:**
- 이 방법은 네임서버 변경보다 복잡
- SSL 인증서 발급이 지연될 수 있음
- 네임서버 변경을 권장

## 📋 체크리스트

- [ ] 가비아에서 네임서버 4개 모두 입력 확인
- [ ] 네임서버 오타 확인
- [ ] DNS 전파 확인 (dnschecker.org)
- [ ] DNS 전파 대기 (1-2시간)
- [ ] Vercel Dashboard에서 상태 확인
- [ ] "Invalid Configuration" → "Valid Configuration" 변경 확인

## ⏱️ 예상 시간

| 단계 | 시간 |
|------|------|
| 네임서버 설정 | 즉시 |
| DNS 전파 시작 | 5-10분 |
| DNS 전파 완료 | 1-2시간 (평균) |
| SSL 인증서 발급 | DNS 전파 후 5-10분 |
| **총 소요 시간** | **1-3시간** |

## 🔍 추가 디버깅

### Vercel 로그 확인

1. **Vercel Dashboard → Domains → `front-wiki.store`**
2. **에러 메시지 확인**
   - "DNS not configured" → 네임서버 설정 확인
   - "Domain not found" → 도메인 등록 확인
   - "Invalid nameservers" → 네임서버 오타 확인

### 가비아 고객센터 문의

**문제가 지속되는 경우:**
- 가비아 고객센터: 1588-5820
- "도메인 네임서버 변경이 적용되지 않음" 문의

## 💡 요약

**"Invalid Configuration"의 가장 흔한 원인:**
1. ✅ **DNS 전파 중** (90% 이상)
2. 네임서버 설정 오류
3. DNS 레코드 충돌

**해결 방법:**
1. DNS 전파 대기 (1-2시간)
2. 네임서버 재확인
3. DNS 전파 상태 확인 (dnschecker.org)

**확인 방법:**
- `dig NS front-wiki.store` 또는 `nslookup`
- dnschecker.org에서 전 세계 DNS 확인
- Vercel Dashboard에서 상태 확인


