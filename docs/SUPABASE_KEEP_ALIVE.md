# Supabase 자동 일시정지 방지 가이드

## 📋 문제

Supabase 무료 플랜은 **7일간 비활성 시 자동으로 일시정지**됩니다. 이로 인해 데이터베이스 연결 오류가 발생할 수 있습니다.

## 🔧 해결 방법

### 방법 1: 수동 Restore (즉시 해결)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **프로젝트 상태 확인**
   - "Paused" 상태면 **Restore** 버튼 클릭
   - 몇 분 후 연결 복구됨

### 방법 2: 외부 Keep-Alive 서비스 사용 (권장)

Vercel Hobby 플랜은 Cron Jobs 제한이 있어, 외부 서비스를 사용하는 것이 좋습니다.

#### 옵션 A: UptimeRobot (무료)

1. **UptimeRobot 가입**
   - https://uptimerobot.com/ 접속
   - 무료 플랜: 50개 모니터링

2. **HTTP(S) Monitor 생성**
   - **Add New Monitor** 클릭
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `Supabase Keep-Alive`
   - **URL**: `https://front-wiki.com/api/articles?limit=1`
   - **Monitoring Interval**: 30 minutes (또는 1 hour)
   - **Save** 클릭

3. **동작 원리**
   - 30분마다 API를 호출하여 Supabase를 활성 상태로 유지
   - Supabase는 7일간 비활성 시 일시정지되므로, 30분 간격으로 충분

#### 옵션 B: cron-job.org (무료)

1. **cron-job.org 가입**
   - https://cron-job.org/ 접속
   - 무료 플랜: 2개 작업

2. **Cron Job 생성**
   - **Create Cronjob** 클릭
   - **Title**: `Supabase Keep-Alive`
   - **Address**: `https://front-wiki.com/api/articles?limit=1`
   - **Schedule**: `0 */6 * * *` (6시간마다)
   - **Save** 클릭

### 방법 3: Supabase Pro 플랜 (유료)

- **비용**: $25/월
- **장점**: 자동 일시정지 없음
- **권장**: 트래픽이 많거나 프로덕션 환경에서 권장

## 📊 Keep-Alive API 엔드포인트

현재 사용 가능한 엔드포인트:
- `GET /api/articles?limit=1` - 가장 가벼운 쿼리
- `GET /api/diagram` - 다이어그램 데이터 조회

**권장**: `/api/articles?limit=1` 사용 (가장 가벼움)

## ⚠️ 주의사항

1. **과도한 호출 방지**
   - 30분~1시간 간격 권장
   - 너무 자주 호출하면 비용 증가

2. **Vercel Hobby 플랜 제한**
   - Cron Jobs는 Pro 플랜 이상에서만 사용 가능
   - 외부 서비스 사용 권장

3. **Supabase 무료 플랜 제한**
   - 7일간 비활성 시 자동 일시정지
   - Keep-Alive로 방지 가능

## 🔗 참고 자료

- [Supabase Pricing](https://supabase.com/pricing)
- [UptimeRobot](https://uptimerobot.com/)
- [cron-job.org](https://cron-job.org/)

---

**권장**: UptimeRobot을 사용하여 30분 간격으로 Keep-Alive 설정

