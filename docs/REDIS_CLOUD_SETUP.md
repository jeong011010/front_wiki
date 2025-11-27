# Redis Cloud 설정 및 대시보드 활용 가이드

## 📋 개요

Vercel Marketplace에서 생성한 Redis는 **Redis Cloud** (Redis Labs)를 사용합니다. Redis Cloud는 Upstash와 다른 서비스이므로 별도의 설정이 필요합니다.

## 🔍 Redis 연결 상태 확인

### 1. Redis Cloud 대시보드 접속

1. **Vercel Dashboard**에서:
   - 프로젝트 → **Storage** → Redis 인스턴스 선택
   - **"Open in Redis"** 버튼 클릭
   - 또는 직접 접속: https://cloud.redis.io/

2. **Redis Cloud 대시보드**에서:
   - **Databases** 메뉴 선택
   - 데이터베이스 이름 클릭 (예: `front-wiki-redis`)

### 2. 연결 정보 확인

Redis Cloud 대시보드에서 다음 정보를 확인하세요:

#### **REST API 엔드포인트 확인**
1. 데이터베이스 상세 페이지에서 **"Connect"** 버튼 클릭
2. 또는 **"Configuration"** 탭에서 확인
3. REST API 엔드포인트 형식:
   - `https://redis-xxxxx.c340.ap-northeast-2-1.ec2.cloud.redislabs.com:9443`
   - 또는 `https://redis-xxxxx.c340.ap-northeast-2-1.ec2.cloud.redislabs.com`

#### **API 키/토큰 확인**
1. **"API Keys"** 또는 **"Access Control & Security"** 섹션 확인
2. API 키 이름과 토큰 복사
3. 또는 **"Connect"** 버튼에서 연결 문자열 확인

### 3. IP 화이트리스트 확인

Redis Cloud는 기본적으로 IP 화이트리스트를 사용합니다.

1. **"Access Control & Security"** 또는 **"Configuration"** 탭
2. **"Source IP/subnet"** 섹션 확인
3. 로컬 개발 환경의 경우:
   - `0.0.0.0/0` (모든 IP 허용) 또는
   - 특정 IP 주소 추가

> **참고**: 로그에서 `"Source ip/subnet added. Ip/subnet - 0.0.0.0/0"`가 보이면 모든 IP에서 접근 가능합니다.

## 🔧 Redis Cloud와 서버리스 환경의 문제

### 문제: Redis Cloud는 서버리스 환경에서 사용 불가

**Redis Cloud는 일반 Redis 프로토콜(`redis://`)만 제공**하며, REST API를 제공하지 않습니다. 

Vercel의 서버리스 함수 환경에서는:
- TCP 연결이 제한됨
- 일반 Redis 클라이언트(`ioredis`, `redis`) 사용 불가
- `@upstash/redis`는 Upstash 전용이므로 Redis Cloud와 호환되지 않음

### 해결 방법

#### 방법 1: Vercel KV 사용 (권장) ⭐

Vercel KV는 서버리스 환경에 최적화된 REST API를 제공합니다.

1. **Vercel Dashboard** → **Storage** → **Create Database**
2. **Vercel KV** 선택 (Redis Cloud가 아닌 Vercel KV)
3. 환경 변수 자동 생성:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

#### 방법 2: Upstash Redis 사용

Upstash는 서버리스 환경을 위해 설계된 Redis 서비스입니다.

1. **Upstash Dashboard** (https://console.upstash.com/) 접속
2. **Create Database** 클릭
3. 환경 변수 설정:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

#### 방법 3: Redis Cloud를 일반 서버에서만 사용

Redis Cloud는 일반 서버(Node.js 서버, Docker 컨테이너 등)에서만 사용 가능합니다. Vercel 서버리스 함수에서는 사용할 수 없습니다.

## 📊 Redis Cloud 대시보드 활용

### 1. 모니터링

#### **Metrics (메트릭스)**
- **Commands/sec**: 초당 명령어 수
- **Memory usage**: 메모리 사용량
- **Connections**: 연결 수
- **Latency**: 응답 시간

#### **Logs (로그)**
- **System Logs**: 시스템 이벤트
- **Slow Logs**: 느린 쿼리
- **Audit Logs**: 감사 로그

### 2. 데이터 관리

#### **Redis Insight 사용**
1. **"Redis Insight"** 버튼 클릭
2. 브라우저에서 Redis 데이터 확인
3. 키 검색, 값 확인, 수정 가능

#### **CLI 사용**
```bash
# redis-cli로 연결 (로컬에서만 가능)
redis-cli -h redis-xxxxx.c340.ap-northeast-2-1.ec2.cloud.redislabs.com -p 6379 -a <password>
```

### 3. 설정 관리

#### **Configuration (설정)**
- **Memory limit**: 메모리 제한
- **Data persistence**: 데이터 영구 저장 설정
- **Replication**: 복제 설정
- **Backup**: 백업 설정

#### **Security (보안)**
- **API Keys**: API 키 관리
- **IP Whitelist**: IP 화이트리스트
- **SSL/TLS**: SSL 설정

## 🐛 문제 해결

### 문제 1: Connect Timeout Error

**증상**: `ConnectTimeoutError: Connect Timeout Error`

**원인**:
1. **Redis Cloud는 서버리스 환경에서 사용할 수 없음** (가장 중요)
2. Redis Cloud는 REST API를 제공하지 않음
3. `@upstash/redis`는 Upstash 전용이므로 Redis Cloud와 호환되지 않음

**해결**:
1. **Vercel KV 또는 Upstash Redis 사용** (서버리스 환경에 적합)
2. Redis Cloud는 일반 서버에서만 사용 가능
3. 코드에서 Redis Cloud 연결 시도 시 경고만 출력하고 캐시 비활성화

### 문제 2: Redis Cloud REST API 형식

Redis Cloud의 REST API는 Upstash와 다를 수 있습니다. Redis Cloud 대시보드에서 제공하는 연결 정보를 확인하세요.

### 문제 3: 로컬 개발 환경 연결

로컬 개발 환경에서 Redis Cloud에 연결하려면:
1. IP 화이트리스트에 로컬 IP 추가
2. 또는 `0.0.0.0/0` (모든 IP 허용) 설정
3. REST API 엔드포인트와 토큰 확인

## 📝 다음 단계

1. **Redis Cloud 대시보드에서 REST API 정보 확인**
2. **IP 화이트리스트 확인 및 설정**
3. **코드에서 Redis Cloud REST API 사용하도록 수정** (필요 시)
4. **로컬 환경에서 테스트**

## 🔗 참고 자료

- [Redis Cloud 문서](https://docs.redis.com/)
- [Redis Cloud REST API](https://docs.redis.com/latest/rc/api/)
- [Vercel KV 문서](https://vercel.com/docs/storage/vercel-kv)

