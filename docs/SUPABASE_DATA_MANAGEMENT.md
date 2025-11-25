# Supabase 데이터 조회 및 관리 가이드

## 📊 데이터 조회 방법

### 1. Table Editor (가장 쉬움) ⭐

1. Supabase Dashboard → 좌측 메뉴 → **Table Editor** 클릭
2. 테이블 선택:
   - `User` - 사용자 데이터
   - `Article` - 글 데이터
   - `Category` - 카테고리 데이터
   - `ArticleLink` - 글 간 링크 데이터
3. 데이터 확인 및 편집:
   - 테이블 형태로 데이터 표시
   - 행 클릭하여 편집 가능
   - 새 행 추가 가능
   - 행 삭제 가능

### 2. SQL Editor (고급)

1. Supabase Dashboard → 좌측 메뉴 → **SQL Editor** 클릭
2. SQL 쿼리 작성 및 실행

**유용한 쿼리 예시:**

```sql
-- 모든 사용자 조회
SELECT * FROM "User";

-- 최근 가입한 사용자 10명
SELECT * FROM "User" 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- 모든 글 조회 (카테고리 포함)
SELECT 
  a.*,
  c.name as category_name
FROM "Article" a
LEFT JOIN "Category" c ON a."categoryId" = c.id
ORDER BY a."createdAt" DESC;

-- 특정 사용자가 작성한 글
SELECT * FROM "Article" 
WHERE "authorId" = 'user-id-here';

-- 글과 링크 관계 조회
SELECT 
  al.*,
  fa.title as from_article_title,
  ta.title as to_article_title
FROM "ArticleLink" al
JOIN "Article" fa ON al."fromArticleId" = fa.id
JOIN "Article" ta ON al."toArticleId" = ta.id;
```

### 3. API (프로그래밍 방식)

Supabase는 자동으로 REST API를 제공합니다:

**Base URL:**
```
https://utvpqdncdsfhcdxkpyls.supabase.co/rest/v1/
```

**예시:**
```bash
# 모든 사용자 조회
curl 'https://utvpqdncdsfhcdxkpyls.supabase.co/rest/v1/User' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## 🔧 데이터 관리 작업

### 사용자 관리

**Table Editor에서:**
1. `User` 테이블 선택
2. 사용자 행 클릭하여 편집
3. `role` 필드를 `admin`으로 변경하여 관리자 권한 부여

**SQL Editor에서:**
```sql
-- 사용자를 관리자로 변경
UPDATE "User" 
SET role = 'admin' 
WHERE email = 'user@example.com';

-- 사용자 삭제
DELETE FROM "User" WHERE id = 'user-id-here';
```

### 글 관리

**Table Editor에서:**
1. `Article` 테이블 선택
2. 글 행 클릭하여 편집
3. `status` 필드 변경:
   - `published` - 공개
   - `pending` - 검토 대기
   - `rejected` - 거부

**SQL Editor에서:**
```sql
-- 모든 글 조회
SELECT * FROM "Article";

-- 검토 대기 중인 글 조회
SELECT * FROM "Article" WHERE status = 'pending';

-- 글 승인 (공개로 변경)
UPDATE "Article" 
SET status = 'published' 
WHERE id = 'article-id-here';
```

### 카테고리 관리

**Table Editor에서:**
1. `Category` 테이블 선택
2. 카테고리 추가/편집/삭제

**SQL Editor에서:**
```sql
-- 카테고리 추가
INSERT INTO "Category" (id, name, slug, description)
VALUES ('cuid-here', 'React', 'react', 'React 관련 글');

-- 카테고리 조회 (계층 구조 포함)
SELECT * FROM "Category" ORDER BY "order";
```

## 🔍 유용한 조회 쿼리

### 통계 조회

```sql
-- 총 사용자 수
SELECT COUNT(*) as total_users FROM "User";

-- 총 글 수
SELECT COUNT(*) as total_articles FROM "Article";

-- 카테고리별 글 수
SELECT 
  c.name,
  COUNT(a.id) as article_count
FROM "Category" c
LEFT JOIN "Article" a ON c.id = a."categoryId"
GROUP BY c.id, c.name;

-- 최근 가입한 사용자
SELECT name, email, "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

### 관계 데이터 조회

```sql
-- 글과 작성자 정보
SELECT 
  a.title,
  a."createdAt",
  u.name as author_name,
  u.email as author_email
FROM "Article" a
LEFT JOIN "User" u ON a."authorId" = u.id
ORDER BY a."createdAt" DESC;

-- 글 간 링크 관계
SELECT 
  fa.title as from_article,
  ta.title as to_article,
  al.keyword,
  al."relationType"
FROM "ArticleLink" al
JOIN "Article" fa ON al."fromArticleId" = fa.id
JOIN "Article" ta ON al."toArticleId" = ta.id;
```

## 🛠️ 관리자 작업

### 관리자 계정 생성

**로컬에서:**
```bash
npm run create-admin
```

**또는 SQL Editor에서:**
```sql
-- 기존 사용자를 관리자로 변경
UPDATE "User" 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 데이터 백업

1. Supabase Dashboard → Database → Backups
2. 자동 백업 확인
3. 수동 백업 생성 가능

### 데이터 내보내기

**SQL Editor에서:**
```sql
-- CSV로 내보내기 (Supabase UI에서 제공)
-- Table Editor → Export 버튼 클릭
```

## 📝 주의사항

1. **Row Level Security (RLS)**
   - 현재 RLS가 비활성화되어 있음
   - 프로덕션에서는 RLS 활성화 권장

2. **데이터 삭제 시 주의**
   - 외래키 관계로 인해 연쇄 삭제될 수 있음
   - `ArticleLink`는 `Article` 삭제 시 자동 삭제됨

3. **대소문자 구분**
   - Prisma는 테이블/컬럼명을 따옴표로 감싸므로 대소문자 구분
   - SQL에서 `"User"`, `"Article"` 형식 사용

## 🎯 빠른 시작

1. **사용자 확인**: Table Editor → `User` 테이블
2. **글 확인**: Table Editor → `Article` 테이블
3. **관리자 권한 부여**: `User` 테이블에서 `role`을 `admin`으로 변경

