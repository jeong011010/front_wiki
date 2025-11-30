# 제목에도 하이퍼링크 자동 생성 기능 추가

## 📋 개요

글의 제목에서도 다른 글의 제목을 감지하여 자동으로 하이퍼링크를 생성하는 기능을 추가했습니다. 이제 "Next.js의 장점"이라는 제목에서 "Next.js" 부분이 자동으로 "Next.js" 글의 링크로 변환됩니다.

## ✨ 주요 변경사항

### 1. 제목 링크 삽입 함수 추가
- `lib/link-detector.ts`에 `insertLinksInTitle` 함수 추가
- 제목에서 다른 글의 제목을 감지하여 하이퍼링크로 변환
- 자기 자신을 참조하는 링크는 제외

### 2. API 수정
- **`app/api/articles/route.ts`**: 글 작성 시 제목과 내용 모두에서 키워드 감지
- **`app/api/articles/[id]/route.ts`**: 글 수정 시 제목과 내용 모두에서 키워드 감지
- **`app/api/articles/slug/[slug]/route.ts`**: slug로 글 수정 시 제목과 내용 모두에서 키워드 감지
- **`app/api/articles/featured/route.ts`**: 추천 글 API에 `titleWithLinks` 필드 추가
- **`app/api/mypage/cards/route.ts`**: 마이페이지 카드 API에 `titleWithLinks` 필드 추가

### 3. 컴포넌트 수정
- **`components/ArticleCard.tsx`**: 제목을 HTML로 렌더링하여 링크 표시
- **`app/articles/[slug]/page.tsx`**: 상세 페이지 제목에도 링크 삽입
- **`components/FeaturedArticles.tsx`**: `titleWithLinks` 인터페이스 추가
- **`components/FilteredArticles.tsx`**: `titleWithLinks` 인터페이스 추가
- **`components/ArticleListModal.tsx`**: `titleWithLinks` 인터페이스 추가

## 🔧 기술적 세부사항

### 링크 생성 로직
1. 제목과 내용 모두에서 `detectKeywords` 함수로 키워드 감지
2. 중복 링크 제거 (같은 articleId와 keyword 조합)
3. 자기 자신을 참조하는 링크 제외
4. `ArticleLink` 테이블에 자동 링크(`auto` 타입)로 저장

### 제목 렌더링
- `titleWithLinks` 필드에 HTML 형식의 링크가 포함된 제목 저장
- 클라이언트 컴포넌트에서 `dangerouslySetInnerHTML`로 렌더링
- 링크 스타일: `text-link hover:text-link-hover underline font-medium`

## 🎯 사용 예시

### Before
```
제목: "Next.js의 장점"
→ 제목에 링크 없음, 관련 글 섹션에 링크 없음
```

### After
```
제목: "Next.js의 장점"
→ "Next.js" 부분이 자동으로 링크로 변환
→ 관련 글 섹션에 "Next.js" 글이 표시됨
```

## 📝 참고사항

- 기존에 작성된 글들은 아직 링크가 생성되지 않았을 수 있습니다
- 새로 작성하거나 수정한 글부터는 제목에서도 링크가 자동 생성됩니다
- 기존 글들에도 링크를 생성하려면 각 글을 수정하거나 일괄 처리 스크립트를 실행해야 합니다

## 🔗 관련 이슈

- 제목에도 하이퍼링크 자동 생성 요청
- 관련 글 컴포넌트에 제목에서 생성된 링크 표시

