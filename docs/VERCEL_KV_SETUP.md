# Vercel KV / Redis 캐싱 설정 가이드

## 📋 개요

Vercel KV는 서버리스 환경에 최적화된 Redis 캐싱 서비스입니다. 

> ⚠️ **주의**: Vercel Marketplace에서 생성한 Redis는 **Redis Cloud**일 수 있으며, 이는 서버리스 환경에서 사용할 수 없습니다. 
> - Redis Cloud: 일반 Redis 프로토콜만 제공 → 서버리스 환경에서 사용 불가
> - Vercel KV: REST API 제공 → 서버리스 환경에서 사용 가능
> - Upstash Redis: REST API 제공 → 서버리스 환경에서 사용 가능

**권장**: Vercel KV 또는 **Upstash for Redis**를 사용하세요.

> 📍 **리전 선택**: Upstash는 서울 리전을 제공하지 않습니다. 한국 사용자는:
> - **Tokyo, Japan (ap-northeast-1)** - 가장 가까움 (권장)
> - **Singapore (ap-southeast-1)** - 차선책
> - REST API이므로 지연 시간 영향은 크지 않습니다.

## 🚀 설정 방법

### 방법 1: Vercel Marketplace에서 Upstash Redis 생성 (권장)

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard 접속
   - 로그인

2. **Storage 메뉴로 이동**
   - 왼쪽 사이드바에서 **Storage** 클릭
   - 또는 프로젝트 설정 → **Storage** 탭

3. **Browse Storage 클릭**
   - **Create Database** 또는 **Browse Storage** 버튼 클릭

4. **Marketplace에서 Upstash 선택**
   - "Marketplace Database Providers" 섹션에서 **Upstash** 선택
   - 또는 **Redis** 선택 (Upstash가 제공)

5. **Upstash Redis 생성**
   - **Create Database** 또는 **Continue** 클릭
   - 데이터베이스 이름 입력 (예: `front-wiki-redis`)
   - **Primary Region 선택**:
     - 서울이 없으므로 가장 가까운 리전 선택:
       - **Tokyo, Japan (ap-northeast-1)** - 가장 가까움 (권장)
       - **Singapore (ap-southeast-1)** - 차선책
       - **Washington, D.C., USA (us-east-1)** - 기본값 (성능 영향 적음)
   - **Read Regions** (선택사항): 비워두거나 Primary와 동일하게
   - **Eviction**: 필요시 활성화 (기본값: 비활성화)
   - **Plans**: Free 플랜 선택 (월 50만 명령어 무료)
   - **Continue** → **Create** 클릭

6. **프로젝트 연결**
   - 생성된 Redis 데이터베이스 클릭
   - **Connect to Project** 버튼 클릭
   - 연결할 프로젝트 선택 (예: `front_wiki`)
   - **Connect** 클릭

7. **환경 변수 확인**
   - 프로젝트 설정 → **Environment Variables** 탭
   - 다음 환경 변수가 자동으로 추가되었는지 확인:
     - `REDIS_URL` (Vercel Marketplace Redis의 경우)
     - 또는 `UPSTASH_REDIS_REST_URL`과 `UPSTASH_REDIS_REST_TOKEN` (Upstash 직접 생성 시)

### 방법 2: Upstash 웹사이트에서 직접 생성

1. **Upstash 접속**
   - https://upstash.com 접속
   - 로그인 (GitHub 계정으로 로그인 가능)

2. **Redis Database 생성**
   - **Create Database** 클릭
   - 데이터베이스 이름 입력 (예: `front-wiki-redis`)
   - 리전 선택 (예: `ap-northeast-1` - 서울)
   - **Create** 클릭

3. **REST API 정보 확인**
   - 생성된 데이터베이스 클릭
   - **REST API** 탭에서 다음 정보 확인:
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`

4. **Vercel 환경 변수 설정**
   - Vercel Dashboard → 프로젝트 → Settings → Environment Variables
   - 다음 변수 추가:
     ```
     UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
     UPSTASH_REDIS_REST_TOKEN=xxx
     ```

### 3. 환경 변수 확인

**Vercel Dashboard에서:**
1. 프로젝트 선택
2. **Settings** → **Environment Variables**
3. 다음 변수 확인:
   ```
   REDIS_URL=redis://default:xxx@xxx.upstash.io:443
   ```
   또는
   ```
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=xxx
   ```

**로컬 개발 환경 설정:**

`.env.local` 파일에 환경 변수 추가:

```env
# Vercel KV / Upstash Redis (REST API 형식) - 권장
KV_REST_API_URL=https://sincere-alpaca-30419.upstash.io
KV_REST_API_TOKEN=AXbTAAIncDIxZThhNTI4OThjMzc0MTQ2YTIxMWMwNzBjMWQyYWY0MXAyMzA0MTk

# 또는 Upstash 직접 생성 시
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

> **참고**: 
> - Vercel Marketplace에서 생성한 Upstash for Redis는 `KV_REST_API_URL`과 `KV_REST_API_TOKEN`을 제공합니다.
> - `REDIS_URL`은 일반 Redis 프로토콜 형식이므로 서버리스 환경에서는 사용하지 않습니다.
> - 코드는 `KV_REST_API_URL`을 최우선으로 사용합니다.

> ⚠️ **주의**: 
> - `.env.local` 파일은 Git에 커밋하지 마세요 (`.gitignore`에 포함되어 있음)
> - Vercel Dashboard 또는 Upstash Dashboard에서 환경 변수를 복사하여 로컬에 추가하세요

### 3. 코드 확인

이미 구현된 캐싱 코드가 자동으로 Vercel KV를 사용합니다:

**`lib/cache.ts`:**
```typescript
// Vercel KV 우선 시도
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  const { kv: vercelKv } = await import('@vercel/kv')
  kv = vercelKv
  return
}
```

환경 변수가 설정되어 있으면 자동으로 Vercel KV를 사용합니다.

### 5. 테스트

#### 로컬에서 테스트

1. **환경 변수 설정 확인**
   ```bash
   # .env.local 파일 확인
   cat .env.local | grep KV
   ```

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```

3. **API 호출 테스트**
   ```bash
   # 첫 번째 호출 (캐시 없음 - DB 조회)
   curl http://localhost:3000/api/articles/featured
   
   # 두 번째 호출 (캐시에서 응답 - 빠름)
   curl http://localhost:3000/api/articles/featured
   ```

4. **캐시 확인**
   - Vercel Dashboard → Storage → KV 데이터베이스
   - **Data** 탭에서 캐시된 키 확인:
     - `articles:featured:recent:5:guest`
     - `diagram:guest`
     - `keywords`

#### 프로덕션에서 테스트

1. **Vercel에 배포**
   ```bash
   git push origin main
   # Vercel이 자동으로 배포
   ```

2. **프로덕션 API 호출**
   ```bash
   curl https://your-domain.vercel.app/api/articles/featured
   ```

3. **Upstash Dashboard에서 확인**
   - https://console.upstash.com 접속
   - Redis Database 선택 → **Data** 탭
   - 캐시된 데이터 확인

## 📊 캐시 전략

현재 구현된 캐시 전략:

| API | 캐시 키 패턴 | TTL | 비고 |
|-----|------------|-----|------|
| `/api/articles/featured` | `articles:featured:{sort}:{limit}:{role}` | 1시간 | 인기/최신 글 |
| `/api/diagram` | `diagram:{role}` | 30분 | 다이어그램 데이터 |
| `/api/keywords` | `keywords` | 1시간 | 키워드 목록 |
| `/api/articles` | `articles:{category}:{sort}:{limit}:{offset}:{role}` | 30분 | 글 목록 (검색 제외) |

### 캐시 무효화

다음 작업 시 자동으로 캐시가 무효화됩니다:
- 글 생성 (`POST /api/articles`)
- 글 수정 (`PUT /api/articles/[id]`)
- 글 삭제 (`DELETE /api/articles/[id]`)

## 💰 비용

### Vercel KV 가격

- **Hobby 플랜**: 무료 (제한적)
  - 256MB 저장 공간
  - 30,000 읽기/일
  - 30,000 쓰기/일

- **Pro 플랜**: $20/월
  - 1GB 저장 공간
  - 1,000,000 읽기/일
  - 1,000,000 쓰기/일

- **Enterprise 플랜**: 맞춤형
  - 무제한 저장 공간
  - 무제한 요청

### 사용량 확인

Vercel Dashboard → Storage → KV → **Usage** 탭에서 확인:
- 저장 공간 사용량
- 읽기/쓰기 요청 수

## 🔧 문제 해결

### 문제 1: "UPSTASH_REDIS_REST_URL is not defined"

**원인**: 환경 변수가 설정되지 않음

**해결**:
1. Vercel Dashboard에서 환경 변수 확인
2. `.env.local` 파일에 환경 변수 추가
3. 개발 서버 재시작

### 문제 2: "Failed to connect to Redis"

**원인**: 잘못된 환경 변수 또는 네트워크 문제

**해결**:
1. 환경 변수 값 확인 (URL과 Token이 올바른지)
2. Upstash Dashboard에서 Redis 데이터베이스 상태 확인
3. 네트워크 연결 확인

### 문제 3: 캐시가 작동하지 않음

**원인**: 캐시 키가 생성되지 않거나 TTL이 만료됨

**해결**:
1. Upstash Dashboard → Redis Database → **Data** 탭에서 키 확인
2. API 로그 확인 (캐시 hit/miss)
3. `lib/cache.ts`의 `isCacheAvailable()` 함수 확인

### 문제 4: 로컬에서 캐시가 작동하지 않음

**원인**: `.env.local` 파일에 환경 변수가 없음

**해결**:
1. Vercel Dashboard에서 `REDIS_URL` 환경 변수 복사
2. `.env.local` 파일에 추가:
   ```env
   # Vercel Marketplace Redis
   REDIS_URL=redis://default:xxx@xxx.upstash.io:443
   
   # 또는 Upstash 직접 생성 시
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=xxx
   ```
3. 개발 서버 재시작

## 📝 수동 캐시 관리

필요한 경우 Upstash Dashboard에서 수동으로 캐시를 관리할 수 있습니다:

1. **Upstash Dashboard** → **Redis Database** 선택
2. **Data** 탭에서 키 확인/삭제
3. 특정 키 삭제 또는 전체 삭제 가능
4. **Console** 탭에서 Redis 명령어 직접 실행 가능

## 🔗 참고 링크

- [Upstash Redis 문서](https://docs.upstash.com/redis)
- [Upstash 가격](https://upstash.com/pricing)
- [@upstash/redis 패키지](https://www.npmjs.com/package/@upstash/redis)
- [Vercel Marketplace](https://vercel.com/marketplace)
- [Upstash 대시보드 활용 가이드](./UPSTASH_DASHBOARD_GUIDE.md) - 상세한 대시보드 사용법

## ✅ 체크리스트

- [ ] Vercel Marketplace 또는 Upstash에서 Redis 데이터베이스 생성
- [ ] 프로젝트에 Redis 연결
- [ ] 환경 변수 자동 설정 확인 (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
- [ ] `.env.local` 파일에 환경 변수 추가 (로컬 개발용)
- [ ] 개발 서버 재시작
- [ ] API 호출 테스트
- [ ] Upstash Dashboard에서 캐시 데이터 확인
- [ ] 프로덕션 배포 및 테스트

