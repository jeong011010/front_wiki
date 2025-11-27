# 데이터베이스 아키텍처 가이드

## 📋 개요

프로젝트에서는 **두 가지 다른 종류의 저장소**를 사용합니다:
1. **Supabase (PostgreSQL)** - 주 데이터베이스
2. **Upstash Redis** - 캐시 저장소

이들은 서로 다른 목적을 가진 **별개의 저장소**이며, Redis는 Supabase에 접근하는 것이 아니라 **Supabase의 데이터를 캐싱**하는 역할을 합니다.

## 🗄️ 저장소 비교

### 1. Supabase (PostgreSQL) - 주 데이터베이스

**역할**: 영구 데이터 저장소

**저장하는 데이터**:
- 사용자 정보 (User)
- 글 데이터 (Article)
- 카테고리 (Category)
- 글 링크 관계 (ArticleLink)
- 리프레시 토큰 (RefreshToken)

**특징**:
- 관계형 데이터베이스 (RDBMS)
- ACID 트랜잭션 지원
- 복잡한 쿼리 및 조인 가능
- 데이터 영구 저장
- SQL 쿼리 사용

**접근 방법**:
- Prisma ORM을 통해 접근
- `DATABASE_URL` 환경 변수로 연결

### 2. Upstash Redis - 캐시 저장소

**역할**: 임시 캐시 데이터 저장소

**저장하는 데이터**:
- API 응답 캐시 (예: 글 목록, 다이어그램 데이터)
- 자주 조회되는 데이터의 복사본
- TTL(Time To Live)이 있는 임시 데이터

**특징**:
- 키-값 저장소 (Key-Value Store)
- 매우 빠른 읽기/쓰기 속도
- 메모리 기반 저장
- TTL로 자동 만료
- REST API 사용 (서버리스 환경)

**접근 방법**:
- `@vercel/kv` 또는 `@upstash/redis` 라이브러리
- `KV_REST_API_URL`, `KV_REST_API_TOKEN` 환경 변수로 연결

## 🔄 데이터 흐름

### 일반적인 요청 흐름

```
1. 클라이언트 요청
   ↓
2. API Route (예: /api/articles)
   ↓
3. Redis 캐시 확인
   ├─ 캐시 Hit → Redis에서 데이터 반환 (빠름) ✅
   └─ 캐시 Miss → Supabase에서 데이터 조회
      ↓
4. Supabase (PostgreSQL) 쿼리
   ↓
5. 데이터 반환 + Redis에 캐시 저장
   ↓
6. 클라이언트에 응답
```

### 실제 코드 예시

```typescript
// app/api/articles/route.ts

export async function GET(request: NextRequest) {
  // 1. 캐시 키 생성
  const cacheKey = createCacheKey('articles', 'all', 'recent', limit, offset)
  
  // 2. Redis 캐시 확인
  if (isCacheAvailable()) {
    const cached = await getCache<ArticleListResponse>(cacheKey)
    if (cached) {
      return NextResponse.json(cached) // 캐시 Hit - 빠른 응답
    }
  }
  
  // 3. 캐시 Miss - Supabase에서 데이터 조회
  const articles = await prisma.article.findMany({
    // ... 쿼리 조건
  })
  
  // 4. 응답 데이터 생성
  const response = {
    articles,
    total,
    // ...
  }
  
  // 5. Redis에 캐시 저장 (다음 요청을 위해)
  if (isCacheAvailable()) {
    await setCache(cacheKey, response, 3600) // 1시간 TTL
  }
  
  // 6. 클라이언트에 응답
  return NextResponse.json(response)
}
```

## 🎯 왜 두 개의 저장소가 필요한가?

### Supabase (PostgreSQL)의 역할

1. **영구 데이터 저장**
   - 사용자가 작성한 글
   - 사용자 계정 정보
   - 데이터가 삭제되지 않음

2. **복잡한 쿼리**
   - JOIN, GROUP BY, 집계 함수 등
   - 관계형 데이터 관리

3. **트랜잭션**
   - 여러 작업의 원자성 보장
   - 데이터 일관성 유지

### Redis의 역할

1. **성능 향상**
   - 자주 조회되는 데이터를 빠르게 제공
   - 데이터베이스 부하 감소

2. **비용 절감**
   - Supabase 쿼리 수 감소
   - 응답 시간 단축

3. **확장성**
   - 높은 트래픽 처리
   - 서버리스 환경에 최적화

## 📊 데이터 저장 위치

### Supabase에만 저장되는 데이터

- 사용자 정보 (User)
- 글 본문 및 메타데이터 (Article)
- 카테고리 정보 (Category)
- 글 링크 관계 (ArticleLink)
- 리프레시 토큰 (RefreshToken)

### Redis에만 저장되는 데이터

- API 응답 캐시
  - `articles:all:recent:6:0` - 최근 글 목록
  - `articles:featured:recent:5` - 추천 글 목록
  - `diagram:admin` - 다이어그램 데이터 (관리자용)
  - `diagram:guest` - 다이어그램 데이터 (비회원용)
  - `keywords:all` - 모든 키워드 목록

### 두 곳 모두에 있는 데이터

- **Supabase**: 원본 데이터 (영구 저장)
- **Redis**: 캐시 복사본 (임시 저장, TTL 있음)

## 🔍 실제 예시

### 시나리오: 글 목록 조회

1. **첫 번째 요청** (캐시 없음)
   ```
   클라이언트 → API → Redis (캐시 Miss)
   → Supabase (데이터 조회)
   → Redis (캐시 저장)
   → 클라이언트 (응답)
   ```
   - 시간: ~500ms (Supabase 쿼리 시간)

2. **두 번째 요청** (캐시 있음)
   ```
   클라이언트 → API → Redis (캐시 Hit)
   → 클라이언트 (응답)
   ```
   - 시간: ~50ms (Redis 읽기 시간)
   - **10배 빠름!** ⚡

3. **글 작성/수정/삭제 시**
   ```
   클라이언트 → API → Supabase (데이터 변경)
   → Redis (관련 캐시 삭제)
   → 클라이언트 (응답)
   ```
   - 캐시 무효화로 다음 요청 시 최신 데이터 조회

## 🛠️ 관리 방법

### Supabase 관리

- **Supabase Dashboard**: https://supabase.com/dashboard
- 데이터 확인, 쿼리 실행, 스키마 관리
- Prisma Studio: `npx prisma studio`

### Redis 관리

- **Upstash Dashboard**: https://console.upstash.com/
- 캐시 키 확인, 삭제, 모니터링
- 자세한 내용: `docs/UPSTASH_DASHBOARD_GUIDE.md`

## ❓ 자주 묻는 질문

### Q1: Redis가 Supabase에 접근할 수 있나요?

**A**: 아니요. Redis는 Supabase에 직접 접근하지 않습니다. 
- Redis는 **캐시 저장소**일 뿐입니다
- API 코드가 Supabase에서 데이터를 가져와 Redis에 저장합니다
- Redis는 단순히 키-값 쌍을 저장하는 저장소입니다

### Q2: 데이터는 어디에 저장되나요?

**A**: 데이터 종류에 따라 다릅니다:
- **영구 데이터** (글, 사용자 등): Supabase에만 저장
- **캐시 데이터** (API 응답): Redis에만 저장 (임시)
- **원본은 Supabase, 복사본은 Redis**

### Q3: Redis가 다운되면 어떻게 되나요?

**A**: 문제없습니다:
- Redis는 **캐시**일 뿐이므로 없어도 작동합니다
- 캐시 Miss가 발생하여 Supabase에서 직접 조회
- 응답은 느려지지만 기능은 정상 작동

### Q4: Supabase가 다운되면 어떻게 되나요?

**A**: 심각한 문제입니다:
- 원본 데이터가 없으므로 새 데이터 조회 불가
- 캐시된 데이터만 사용 가능 (제한적)
- 가능한 빨리 복구해야 합니다

### Q5: 두 데이터베이스를 동기화해야 하나요?

**A**: 자동으로 동기화됩니다:
- 데이터 변경 시 관련 캐시 자동 삭제
- 다음 요청 시 최신 데이터 조회 후 캐시 저장
- 수동 동기화 불필요

## 📝 요약

| 항목 | Supabase (PostgreSQL) | Upstash Redis |
|------|----------------------|---------------|
| **역할** | 주 데이터베이스 | 캐시 저장소 |
| **데이터** | 영구 데이터 | 임시 캐시 |
| **목적** | 데이터 저장 및 관리 | 성능 향상 |
| **접근** | Prisma ORM | REST API |
| **다운 시** | 서비스 중단 | 느려짐 (기능 정상) |
| **관리** | Supabase Dashboard | Upstash Dashboard |

**결론**: 
- **Supabase** = 실제 데이터 저장소 (필수)
- **Redis** = 성능 향상을 위한 캐시 (선택적이지만 권장)
- 이들은 **별개의 저장소**이며, Redis는 Supabase의 **보조 역할**을 합니다

