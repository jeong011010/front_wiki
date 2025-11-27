# Upstash 대시보드 활용 가이드

## 📋 목차

- [대시보드 접근](#대시보드-접근)
- [주요 기능](#주요-기능)
- [데이터 관리](#데이터-관리)
- [모니터링](#모니터링)
- [설정 관리](#설정-관리)
- [효율적인 사용 팁](#효율적인-사용-팁)

## 🚀 대시보드 접근

### 1. 접속 방법

1. **Vercel Dashboard에서 접근**
   - Vercel Dashboard → **Storage** → Redis 인스턴스 선택
   - **"Open in Upstash"** 버튼 클릭

2. **직접 접속**
   - https://console.upstash.com/ 접속
   - 로그인 후 데이터베이스 선택

### 2. 대시보드 구조

```
┌─────────────────────────────────────┐
│  Upstash Console                    │
├─────────────────────────────────────┤
│  [Databases] [Vector] [Queue] ...   │  ← 상단 메뉴
├─────────────────────────────────────┤
│  [Overview] [Data] [Metrics] ...    │  ← 데이터베이스 탭
└─────────────────────────────────────┘
```

## 📊 주요 기능

### 1. Overview (개요)

**위치**: 데이터베이스 선택 → **Overview** 탭

**확인 가능한 정보**:
- **Status**: 데이터베이스 상태 (Active, Paused 등)
- **Region**: 리전 정보 (예: Tokyo, Japan)
- **Plan**: 플랜 정보 (Free, Pay as You Go)
- **Endpoint**: REST API 엔드포인트 URL
- **Connection Info**: 연결 정보 (URL, Token)

**유용한 기능**:
- **Quick Start**: 코드 예제 확인
- **Connection String**: 연결 문자열 복사
- **Pause/Resume**: 데이터베이스 일시 중지/재개

### 2. Data Browser (데이터 관리)

**위치**: 데이터베이스 선택 → **Data Browser** 탭

#### **데이터 조회**

1. **키 검색**
   - 검색창에 키 입력 (예: `articles:*`)
   - 와일드카드 지원: `*`, `?`
   - 예시:
     - `articles:*` - articles로 시작하는 모든 키
     - `cache:diagram:*` - diagram 캐시 키들
   - **"All Types"** 드롭다운으로 키 타입 필터링

2. **키 목록 (왼쪽 패널)**
   - 모든 키 목록 표시
   - 키 개수 표시 (예: "2 Keys")
   - 키 타입 아이콘 표시
   - 새로고침 버튼으로 최신 상태 유지

3. **값 확인 (오른쪽 패널)**
   - 왼쪽 패널에서 키 클릭 → 오른쪽 패널에 값 표시
   - JSON 형식 자동 포맷팅
   - 큰 값은 축약 표시
   - 키 타입, TTL, 크기 등 상세 정보 표시

4. **실제 사용 예시**
   - `articles:all:recent:6:0:...` - 최근 글 목록 캐시
   - `articles:featured:rece...` - 추천 글 캐시
   - 키 이름을 클릭하면 상세 값 확인 가능

#### **데이터 수정**

1. **값 수정**
   - 키 클릭 → 오른쪽 패널에서 **Edit** 버튼
   - 값 수정 후 **Save**

2. **키 삭제**
   - 키 선택 → **Delete** 버튼 또는 휴지통 아이콘
   - 여러 키 선택 가능 (체크박스)
   - 왼쪽 패널 상단의 **"+"** 버튼 옆에 삭제 옵션

3. **TTL 설정**
   - 키 클릭 → 오른쪽 패널에서 **TTL** 설정
   - 만료 시간 설정 (초 단위)
   - TTL이 없으면 "No expiration" 표시

#### **데이터 추가**

1. **새 키 추가**
   - 왼쪽 패널 상단의 **"+"** 버튼 클릭
   - 키 이름, 타입, 값 입력
   - TTL 설정 (선택사항)

2. **대량 데이터 추가**
   - **Import** 기능 사용
   - JSON 파일 업로드

3. **새 탭 열기**
   - **"New Tab"** 버튼으로 여러 데이터 브라우저 세션 열기
   - 각 탭에서 다른 키 조회 가능

### 3. Monitor (실시간 모니터링)

**위치**: 데이터베이스 선택 → **Monitor** 탭

#### **모니터링 시작**

1. **"Start Monitor"** 버튼 클릭
2. 실시간으로 명령어 처리 상황 확인
3. **자동 일시 중지**: 1분간 비활성 시 자동으로 모니터링 중지 (성능 보호)

#### **주요 그래프**

1. **Top Commands Usage (상위 명령어 사용량)**
   - GET, SET, MONITOR 등 명령어별 사용 빈도
   - 시간대별 트렌드 확인
   - 어떤 명령어가 가장 많이 사용되는지 파악

2. **Throughput (처리량)**
   - **Read**: 읽기 명령어 수 (초당)
   - **Write**: 쓰기 명령어 수 (초당)
   - **Total**: 전체 명령어 수 (초당)
   - 트래픽 패턴 확인

3. **Service Time Latency (서비스 시간 지연)**
   - 평균 응답 시간 (밀리초)
   - 성능 모니터링
   - 느린 쿼리 감지

4. **Data Size (데이터 크기)**
   - 저장된 데이터 크기 변화
   - 메모리 사용량 추이

5. **Connections (연결 수)**
   - 활성 연결 수
   - 연결 패턴 확인

6. **Keyspace (키 공간)**
   - 전체 키 개수
   - 키 추가/삭제 추이

7. **Hits / Misses (캐시 적중률)**
   - **Hits per second**: 캐시 적중 수
   - **Misses per second**: 캐시 미스 수
   - 캐시 효율성 확인

#### **시간 범위 선택**

- **Last Hour**: 최근 1시간
- **Last 24 Hours**: 최근 24시간
- **Last 7 Days**: 최근 7일
- **Custom Range**: 사용자 지정 기간

### 4. Usage (사용량 통계)

**위치**: 데이터베이스 선택 → **Usage** 탭

#### **사용량 요약 카드**

1. **COMMANDS (명령어)**
   - 현재 사용량 / 월 제한 (예: 18 / 500k per month)
   - 진행률 표시 (프로그레스 바)
   - Free 플랜: 월 50만 명령어 무료

2. **BANDWIDTH (대역폭)**
   - 현재 사용량 / 제한 (예: 0 B / 50 GB)
   - Free 플랜: 월 50GB 무료

3. **STORAGE (저장 공간)**
   - 현재 사용량 / 제한 (예: 91 B / 256 MB)
   - Free 플랜: 256MB 무료

4. **COST (비용)**
   - 현재 비용 (Free 플랜: $0.00)

#### **일일 통계 차트**

1. **Daily Commands by Regions (지역별 일일 명령어)**
   - 최근 5일간의 명령어 사용량
   - 지역별 분류 (예: us-east-1)
   - UTC+0 기준 계산

2. **Daily Bandwidth by Regions (지역별 일일 대역폭)**
   - 최근 5일간의 대역폭 사용량
   - 지역별 분류
   - 트래픽 패턴 확인

### 5. CLI (명령줄 인터페이스)

**위치**: 데이터베이스 선택 → **CLI** 탭

#### **기능**

1. **온라인 Redis CLI**
   - 브라우저에서 직접 Redis 명령어 실행
   - `SET key value`, `GET key` 등 모든 Redis 명령어 지원

2. **사용 방법**
   - 초록색 화살표 `→` 프롬프트에 명령어 입력
   - Enter 키로 실행
   - `help` 입력 시 도움말 표시

3. **예시 명령어**
   ```
   SET test "hello"
   GET test
   KEYS *
   TTL test
   DEL test
   ```

4. **Supported Commands 패널**
   - 오른쪽 패널에서 지원되는 명령어 확인
   - 그룹별 필터링
   - 명령어 검색

### 6. Logs (로그)

**위치**: 데이터베이스 선택 → **Logs** 탭 (있는 경우)

**확인 가능한 정보**:
- **Command Logs**: 실행된 명령어 로그
- **Error Logs**: 에러 로그
- **Slow Logs**: 느린 쿼리 로그

**유용한 기능**:
- 로그 필터링 (시간, 타입별)
- 로그 검색
- 로그 다운로드

### 7. Details (상세 정보)

**위치**: 데이터베이스 선택 → **Details** 탭

#### **연결 정보**

1. **Endpoint (엔드포인트)**
   - REST API URL (예: `sincere-alpaca-30419.upstash.io`)
   - 복사 버튼으로 쉽게 복사

2. **Token / Readonly Token**
   - 인증 토큰 (보안상 마스킹됨)
   - 눈 아이콘으로 토큰 확인 가능
   - 복사 버튼으로 복사

3. **Port (포트)**
   - TCP 연결 포트 (예: 6379)

4. **TLS/SSL**
   - 암호화 연결 상태 (Enabled/Disabled)

5. **연결 문자열 예시**
   - CLI 연결 예시 제공
   - 환경 변수 예시 제공

#### **서비스 정보**

- **Free Tier**: 플랜 정보
- **AWS**: 클라우드 제공자
- **N. Virginia, USA (us-east-1)**: 리전 정보
- **Global**: 글로벌 접근 가능 여부

### 8. Settings (설정)

**위치**: 데이터베이스 선택 → **Settings** 탭 (또는 Details에서 설정)

#### **일반 설정**

1. **Database Name**: 데이터베이스 이름 변경
2. **Region**: 리전 변경 (제한적)
3. **Plan**: 플랜 변경 (Free → Pay as You Go)

#### **고급 설정**

1. **Eviction Policy**: 메모리 부족 시 키 제거 정책
   - **noeviction**: 키 제거 안 함 (기본값)
   - **allkeys-lru**: 최근 사용 안 한 키 제거
   - **volatile-lru**: TTL이 있는 키 중 최근 사용 안 한 것 제거

2. **Data Persistence**: 데이터 영구 저장
   - 활성화 시 데이터 백업
   - 비활성화 시 메모리만 사용 (더 빠름)

3. **Read Replicas**: 읽기 전용 복제본
   - 여러 리전에 복제본 생성 가능
   - 읽기 성능 향상

## 💡 효율적인 사용 팁

### 1. 키 네이밍 규칙

**권장 패턴**:
```
<서비스>:<타입>:<식별자>:<필드>
```

**예시**:
```
articles:list:recent          # 최근 글 목록
articles:detail:slug-123      # 특정 글 상세
cache:diagram:admin           # 다이어그램 캐시 (관리자용)
cache:diagram:guest           # 다이어그램 캐시 (비회원용)
keywords:all                  # 모든 키워드
```

**장점**:
- 키 검색이 쉬움 (`articles:*`)
- 패턴 삭제가 쉬움 (`cache:diagram:*`)
- 네임스페이스 분리

### 2. TTL (Time To Live) 활용

**적절한 TTL 설정**:
- **짧은 TTL (1-5분)**: 자주 변경되는 데이터
  - 예: 실시간 조회수, 댓글 수
- **중간 TTL (1-24시간)**: 자주 변경되지 않는 데이터
  - 예: 글 목록, 다이어그램 데이터
- **긴 TTL (7일 이상)**: 거의 변경되지 않는 데이터
  - 예: 정적 설정, 통계 데이터

**코드에서 TTL 설정**:
```typescript
// lib/cache.ts에서
await setCache('articles:list', articles, 3600) // 1시간
await setCache('diagram:data', diagram, 7200)  // 2시간
```

### 3. 메모리 관리

**모니터링**:
1. **Metrics** 탭에서 메모리 사용량 확인
2. **Data** 탭에서 큰 키 확인
3. 불필요한 키 정기적으로 삭제

**최적화**:
- 큰 값은 압축하거나 분할 저장
- TTL이 없는 키는 정기적으로 정리
- Eviction Policy 적절히 설정

### 4. 성능 최적화

**읽기 성능**:
- 자주 조회되는 데이터는 캐시
- Read Replicas 활용 (여러 리전)

**쓰기 성능**:
- 배치 작업 사용 (여러 키 한 번에)
- 불필요한 쓰기 최소화

**네트워크 최적화**:
- 가까운 리전 선택 (Tokyo 권장)
- REST API 사용 (서버리스 환경)

### 5. 데이터 백업 및 복구

**백업**:
1. **Settings** → **Data Persistence** 활성화
2. 정기적으로 데이터 내보내기 (Export)

**복구**:
1. **Data** → **Import** 기능 사용
2. 백업 파일 업로드

### 6. 비용 관리

**Free 플랜 제한**:
- 월 50만 명령어 무료
- 1개 데이터베이스만 무료

**비용 절감 팁**:
- 불필요한 캐시 최소화
- TTL 적절히 설정 (자동 만료)
- 큰 값은 압축 또는 분할

**사용량 확인**:
- **Metrics** 탭에서 명령어 수 확인
- **Billing** 섹션에서 비용 확인

## 🔍 실전 활용 예시

### 예시 1: 캐시 키 확인 및 관리

1. **Data Browser** 탭 접속
2. 왼쪽 패널에서 키 목록 확인 (예: "2 Keys")
3. 검색창에 `articles:*` 입력
4. 관련 키 필터링 (예: `articles:all:recent:6:0:...`, `articles:featured:rece...`)
5. 키 클릭하여 오른쪽 패널에서 값 확인
6. 불필요한 키 선택 후 삭제

### 예시 2: 성능 문제 진단

1. **Monitor** 탭 접속
2. **"Start Monitor"** 버튼 클릭
3. **Service Time Latency** 그래프 확인
4. **Throughput** 그래프에서 읽기/쓰기 비율 확인
5. **Top Commands Usage**에서 가장 많이 사용되는 명령어 확인
6. 지연 시간이 높은 시간대 확인
7. **CLI** 탭에서 직접 명령어 실행하여 테스트
8. 느린 쿼리 확인 및 최적화

### 예시 3: 메모리 부족 해결

1. **Usage** 탭에서 **STORAGE** 카드 확인 (예: 91 B / 256 MB)
2. **Monitor** 탭에서 **Data Size** 그래프 확인
3. **Data Browser** 탭에서 큰 키 확인
4. 불필요한 키 삭제
5. **Settings** → **Eviction Policy** 변경

### 예시 4: 캐시 적중률 확인

1. **Monitor** 탭 접속
2. **"Start Monitor"** 버튼 클릭
3. **Hits / Misses** 그래프 확인
4. **Hits per second**가 높으면 캐시 효율적
5. **Misses per second**가 높으면 캐시 전략 재검토

### 예시 5: CLI로 직접 테스트

1. **CLI** 탭 접속
2. 다음 명령어로 테스트:
   ```
   SET test:key "Hello Upstash"
   GET test:key
   KEYS test:*
   TTL test:key
   DEL test:key
   ```
3. **Data Browser**에서 변경사항 확인

### 예시 6: 사용량 모니터링

1. **Usage** 탭 접속
2. **COMMANDS** 카드에서 월 사용량 확인 (예: 18 / 500k)
3. **Daily Commands by Regions** 차트에서 사용 패턴 확인
4. Free 플랜 한도 초과 시 경고 확인
5. 필요시 Pay as You Go 플랜으로 전환

## 🛠 유용한 단축키 및 팁

### 대시보드 단축키

- **Ctrl/Cmd + K**: 검색 (키워드, 키 등)
- **Ctrl/Cmd + F**: 페이지 내 검색

### 데이터 검색 팁

- `*`: 모든 문자 매칭
- `?`: 단일 문자 매칭
- `[abc]`: 문자 집합 매칭
- `articles:*`: articles로 시작하는 모든 키

### 빠른 작업

1. **여러 키 선택**: Shift + 클릭
2. **전체 선택**: Ctrl/Cmd + A
3. **빠른 삭제**: 선택 후 Delete 키

## 📝 체크리스트

### 정기적으로 확인할 항목

- [ ] 메모리 사용량 (주 1회)
- [ ] 에러 로그 (일 1회)
- [ ] 느린 쿼리 (주 1회)
- [ ] 불필요한 키 정리 (월 1회)
- [ ] TTL 설정 확인 (월 1회)

### 최적화 체크리스트

- [ ] 키 네이밍 규칙 준수
- [ ] 적절한 TTL 설정
- [ ] Eviction Policy 설정
- [ ] Read Replicas 활용 (필요 시)
- [ ] 데이터 압축 (큰 값)

## 🔗 참고 자료

- [Upstash 공식 문서](https://docs.upstash.com/)
- [Upstash Redis 가이드](https://docs.upstash.com/redis)
- [Redis 명령어 참조](https://redis.io/commands)
- [Vercel KV 문서](https://vercel.com/docs/storage/vercel-kv)

## 💬 문제 해결

### 문제 1: 메모리 부족

**증상**: 메모리 사용량이 100%에 근접

**해결**:
1. 불필요한 키 삭제
2. Eviction Policy 변경
3. 플랜 업그레이드

### 문제 2: 느린 응답

**증상**: Latency가 높음

**해결**:
1. 가까운 리전 선택
2. 큰 값 최적화
3. Read Replicas 활용

### 문제 3: 비용 초과

**증상**: Free 플랜 제한 초과

**해결**:
1. 불필요한 캐시 최소화
2. TTL 적절히 설정
3. Pay as You Go 플랜으로 전환

---

이 가이드를 참고하여 Upstash 대시보드를 효율적으로 활용하세요! 🚀

