# 접근 가능한 대시보드 및 GUI 목록

이 문서는 프론트위키 프로젝트에서 접근 가능한 모든 GUI, 대시보드, 모니터링 도구를 정리합니다.

## 📊 목차

1. [Prisma Studio (로컬 데이터베이스 GUI)](#1-prisma-studio-로컬-데이터베이스-gui)
2. [Supabase (PostgreSQL 데이터베이스)](#2-supabase-postgresql-데이터베이스)
3. [Upstash Redis (Vercel KV)](#3-upstash-redis-vercel-kv)
4. [Sentry (에러 모니터링)](#4-sentry-에러-모니터링)
5. [Vercel (배포 플랫폼)](#5-vercel-배포-플랫폼)
6. [Cloudflare (DNS/CDN)](#6-cloudflare-dnscdn)
7. [AWS S3 (이미지 저장소)](#7-aws-s3-이미지-저장소)
8. [AWS CloudFront (CDN)](#8-aws-cloudfront-cdn)

---

## 1. Prisma Studio (로컬 데이터베이스 GUI)

**설명**: Prisma 데이터베이스를 시각적으로 탐색하고 편집할 수 있는 GUI 도구입니다.

**접근 방법**:
```bash
# 로컬에서 실행
npx prisma studio
```

**URL**: `http://localhost:5555` (자동으로 브라우저가 열림)

**기능**:
- ✅ 데이터베이스 테이블 시각적 탐색
- ✅ 데이터 추가/수정/삭제
- ✅ 관계형 데이터 시각화
- ✅ 쿼리 실행 및 필터링
- ✅ 스키마 확인

**사용 시나리오**:
- 로컬 개발 중 데이터 확인
- 테스트 데이터 추가/수정
- 데이터베이스 구조 확인
- 관계형 데이터 탐색

**참고**: 
- 로컬 개발 환경에서만 사용 가능
- 프로덕션 데이터베이스(Supabase)에는 직접 연결되지 않음
- Supabase 대시보드를 사용하여 프로덕션 데이터 확인

---

## 2. Supabase (PostgreSQL 데이터베이스)

**설명**: 프로덕션 PostgreSQL 데이터베이스 관리 및 모니터링 플랫폼입니다.

**접근 URL**: https://supabase.com/dashboard

**주요 기능**:

### 2.1 데이터베이스 관리
- **Table Editor**: 테이블 데이터 시각적 편집
- **SQL Editor**: SQL 쿼리 실행 및 저장
- **Database**: 스키마, 테이블, 관계 확인
- **Migrations**: 데이터베이스 마이그레이션 관리

### 2.2 인증 관리
- **Authentication**: 사용자 관리
- **Users**: 사용자 목록 및 권한 관리
- **Policies**: Row Level Security (RLS) 정책 설정

### 2.3 모니터링
- **Logs**: 데이터베이스 로그 확인
- **Database**: 연결 상태, 쿼리 성능
- **API**: API 엔드포인트 및 사용량

### 2.4 설정
- **Settings**: 프로젝트 설정
- **Database**: 연결 정보, Connection Pooling 설정
- **API**: API 키 관리

**접근 경로**:
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 원하는 기능 선택

**유용한 기능**:
- **SQL Editor**: 복잡한 쿼리 실행 및 결과 확인
- **Table Editor**: GUI로 데이터 추가/수정/삭제
- **Logs**: 데이터베이스 오류 및 쿼리 로그 확인
- **Database > Connection Pooling**: 연결 풀링 설정 확인

**참고**: 
- 프로덕션 데이터베이스이므로 주의해서 사용
- 데이터 수정 시 백업 권장
- SQL Editor에서 직접 쿼리 실행 가능

---

## 3. Upstash Redis (Vercel KV)

**설명**: Redis 캐싱 데이터베이스 관리 및 모니터링 플랫폼입니다.

**접근 URL**: https://console.upstash.com/

**주요 기능**:

### 3.1 데이터 관리
- **Data Browser**: Redis 키-값 데이터 탐색
- **Commands**: Redis 명령어 실행
- **Keys**: 키 목록 및 검색

### 3.2 모니터링
- **Metrics**: 요청 수, 지연 시간, 메모리 사용량
- **Logs**: Redis 명령어 실행 로그
- **Analytics**: 사용량 통계

### 3.3 설정
- **Settings**: Redis 인스턴스 설정
- **API Keys**: REST API 키 관리
- **Regions**: 리전 설정

**접근 경로**:
1. https://console.upstash.com/ 접속
2. 로그인
3. Redis 데이터베이스 선택
4. 왼쪽 메뉴에서 원하는 기능 선택

**유용한 기능**:
- **Data Browser**: 캐시된 데이터 확인 및 삭제
- **Metrics**: 캐시 히트율, 요청 수 확인
- **Logs**: Redis 명령어 실행 내역 확인
- **Commands**: 직접 Redis 명령어 실행 (GET, SET, DEL 등)

**참고**: 
- Vercel KV와 Upstash Redis는 동일한 서비스
- REST API를 통해 접근하므로 브라우저에서 직접 데이터 확인 가능
- 캐시 무효화 시 Data Browser에서 키 삭제 가능

---

## 4. Sentry (에러 모니터링)

**설명**: 애플리케이션 오류 및 성능 모니터링 플랫폼입니다.

**접근 URL**: https://sentry.io/

**주요 기능**:

### 4.1 오류 모니터링
- **Issues**: 발생한 오류 목록 및 상세 정보
- **Alerts**: 오류 알림 설정
- **Releases**: 배포 버전별 오류 추적

### 4.2 성능 모니터링
- **Performance**: API 응답 시간, 트랜잭션 추적
- **Transactions**: 개별 트랜잭션 상세 분석
- **Web Vitals**: Core Web Vitals 지표

### 4.3 세션 리플레이
- **Replays**: 사용자 세션 재생
- **User Feedback**: 사용자 피드백 수집

### 4.4 설정
- **Settings**: 프로젝트 설정
- **Alerts**: 알림 규칙 설정
- **Integrations**: 외부 서비스 연동

**접근 경로**:
1. https://sentry.io/ 접속
2. 로그인
3. `front-wiki` 프로젝트 선택
4. 왼쪽 메뉴에서 원하는 기능 선택

**유용한 기능**:
- **Issues**: 발생한 오류 목록 및 스택 트레이스 확인
- **Performance**: 느린 API 엔드포인트 확인
- **Replays**: 오류 발생 시 사용자 행동 재생
- **Alerts**: Slack, 이메일 등으로 오류 알림 받기

**참고**: 
- 프로젝트 이름: `front-wiki`
- DSN은 환경 변수에 저장되어 있음
- 오류 발생 시 자동으로 Sentry에 전송됨

---

## 5. Vercel (배포 플랫폼)

**설명**: Next.js 애플리케이션 배포 및 모니터링 플랫폼입니다.

**접근 URL**: https://vercel.com/dashboard

**주요 기능**:

### 5.1 배포 관리
- **Deployments**: 배포 내역 및 상태 확인
- **Domains**: 도메인 관리 (`front-wiki.com`)
- **Environments**: 환경 변수 관리
- **Functions**: 서버리스 함수 로그

### 5.2 모니터링
- **Analytics**: 페이지뷰, 방문자 수, 성능 지표
- **Speed Insights**: Core Web Vitals, 실시간 성능
- **Logs**: 서버 로그 실시간 확인
- **Real User Monitoring**: 실제 사용자 성능 데이터

### 5.3 설정
- **Settings**: 프로젝트 설정
- **Git Integration**: GitHub 연동
- **Build & Development Settings**: 빌드 설정

**접근 경로**:
1. https://vercel.com/dashboard 접속
2. 로그인
3. `front-wiki` 프로젝트 선택
4. 상단 메뉴에서 원하는 기능 선택

**유용한 기능**:
- **Analytics**: 페이지뷰, 방문자 통계 확인
- **Speed Insights**: 페이지 로딩 속도, Core Web Vitals 확인
- **Logs**: API 오류 및 서버 로그 실시간 확인
- **Deployments**: 배포 내역 및 롤백
- **Environments**: 환경 변수 확인 및 수정

**참고**: 
- 프로젝트 이름: `front-wiki`
- 도메인: `front-wiki.com`
- GitHub와 자동 연동되어 PR마다 Preview 배포 생성

---

## 6. Cloudflare (DNS/CDN)

**설명**: DNS 관리 및 CDN, 보안 서비스 플랫폼입니다.

**접근 URL**: https://dash.cloudflare.com/

**주요 기능**:

### 6.1 DNS 관리
- **DNS**: DNS 레코드 관리 (A, CNAME 등)
- **Records**: 도메인 레코드 추가/수정/삭제

### 6.2 보안
- **Security**: DDoS 보호, WAF 설정
- **Firewall Rules**: 방화벽 규칙 설정
- **Page Rules**: 페이지별 규칙 설정

### 6.3 성능
- **Speed**: 캐싱 설정, 이미지 최적화
- **Caching**: 캐시 규칙 설정
- **Analytics**: 트래픽 통계

### 6.4 모니터링
- **Analytics**: 트래픽, 요청 수, 대역폭
- **Logs**: 요청 로그 확인 (Enterprise 플랜)

**접근 경로**:
1. https://dash.cloudflare.com/ 접속
2. 로그인
3. `front-wiki.com` 도메인 선택
4. 왼쪽 메뉴에서 원하는 기능 선택

**유용한 기능**:
- **DNS**: DNS 레코드 확인 및 수정
- **Analytics**: 트래픽 통계 확인
- **Security**: 보안 이벤트 확인
- **Speed**: 캐싱 설정으로 성능 최적화

**참고**: 
- 도메인: `front-wiki.com`
- DNS는 Vercel로 설정되어 있음
- 보안 헤더는 Next.js 미들웨어에서 관리

---

## 7. AWS S3 (이미지 저장소)

**설명**: AWS S3 버킷에서 이미지 파일을 관리합니다.

**접근 URL**: https://console.aws.amazon.com/s3/

**주요 기능**:

### 7.1 파일 관리
- **Objects**: 업로드된 이미지 파일 목록
- **Upload**: 파일 업로드
- **Download**: 파일 다운로드
- **Delete**: 파일 삭제

### 7.2 설정
- **Properties**: 버킷 설정
- **Permissions**: 접근 권한 설정
- **CORS**: CORS 설정

### 7.3 모니터링
- **Metrics**: 요청 수, 데이터 전송량
- **Storage**: 저장 공간 사용량

**접근 경로**:
1. https://console.aws.amazon.com/s3/ 접속
2. AWS 계정 로그인
3. 버킷 선택 (버킷 이름은 환경 변수 `AWS_S3_BUCKET_NAME` 확인)
4. 파일 탐색 및 관리

**유용한 기능**:
- **Objects**: 업로드된 이미지 확인 및 삭제
- **Properties > Static website hosting**: 정적 웹사이트 호스팅 설정
- **Permissions**: 공개 접근 권한 설정
- **Metrics**: 사용량 통계 확인

**참고**: 
- 버킷 이름은 환경 변수에서 확인
- Region: `ap-northeast-2` (서울)
- 이미지는 공개 접근 가능하도록 설정됨

---

## 8. AWS CloudFront (CDN)

**설명**: AWS CloudFront CDN으로 이미지를 전역 배포합니다. (현재 미사용)

**접근 URL**: https://console.aws.amazon.com/cloudfront/

**주요 기능**:

### 8.1 배포 관리
- **Distributions**: CloudFront 배포 목록
- **Behaviors**: 캐싱 규칙 설정
- **Origins**: 원본 서버 설정

### 8.2 모니터링
- **Reports**: 요청 수, 데이터 전송량
- **Real-time metrics**: 실시간 통계

**접근 경로**:
1. https://console.aws.amazon.com/cloudfront/ 접속
2. AWS 계정 로그인
3. Distribution 선택
4. 상세 정보 확인

**참고**: 
- 현재 프로젝트에서 CloudFront는 설정되어 있지만 실제로는 사용하지 않음
- S3에서 직접 이미지를 제공하고 있음
- 필요 시 CloudFront를 활성화하여 이미지 전송 속도 향상 가능

---

## 📋 빠른 참조

| 서비스 | URL | 용도 | 로컬/프로덕션 |
|--------|-----|------|--------------|
| **Prisma Studio** | `http://localhost:5555` | 데이터베이스 GUI | 로컬만 |
| **Supabase** | https://supabase.com/dashboard | PostgreSQL 관리 | 프로덕션 |
| **Upstash Redis** | https://console.upstash.com/ | Redis 캐시 관리 | 프로덕션 |
| **Sentry** | https://sentry.io/ | 에러 모니터링 | 프로덕션 |
| **Vercel** | https://vercel.com/dashboard | 배포/모니터링 | 프로덕션 |
| **Cloudflare** | https://dash.cloudflare.com/ | DNS/보안 | 프로덕션 |
| **AWS S3** | https://console.aws.amazon.com/s3/ | 이미지 저장소 | 프로덕션 |
| **AWS CloudFront** | https://console.aws.amazon.com/cloudfront/ | CDN (미사용) | 프로덕션 |

---

## 🔑 로그인 정보

각 서비스의 로그인 정보는 별도로 관리하시기 바랍니다. 환경 변수에서 API 키나 연결 정보를 확인할 수 있습니다.

---

## 💡 팁

1. **로컬 개발 시**: Prisma Studio를 사용하여 로컬 데이터베이스 확인
2. **프로덕션 데이터 확인**: Supabase Table Editor 사용
3. **캐시 확인**: Upstash Redis Data Browser에서 키 확인
4. **오류 확인**: Sentry Issues에서 발생한 오류 확인
5. **성능 확인**: Vercel Analytics 및 Speed Insights 확인
6. **트래픽 확인**: Cloudflare Analytics에서 트래픽 통계 확인

---

**마지막 업데이트**: 2025-01-27

