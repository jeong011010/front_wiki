# 첫 이슈 생성 가이드

이제부터 이슈 기반으로 기능을 개발합니다. 첫 이슈로 추천하는 기능과 작성 방법을 안내합니다.

## 🎯 추천 첫 이슈: 목차 기능 추가

**이유:**
- 구현이 비교적 간단함
- 사용자 경험 개선에 도움이 됨
- 전체 워크플로우 연습에 적합함
- 시각적으로 결과를 확인하기 쉬움

## 📝 이슈 작성 방법

### 1. GitHub에서 이슈 생성

1. 저장소 페이지에서 "Issues" 탭 클릭
2. "New Issue" 버튼 클릭
3. "Feature Request" 템플릿 선택

### 2. 이슈 내용 작성

**제목:**
```
[FEATURE] 글 상세 페이지에 목차(Table of Contents) 기능 추가
```

**본문:**
```markdown
## 🎯 기능 제안
글 상세 페이지에 목차(Table of Contents) 기능을 추가하여 긴 글을 읽을 때 원하는 섹션으로 바로 이동할 수 있도록 합니다.

## 💡 문제점
현재 긴 글을 읽을 때 원하는 섹션으로 바로 이동하기 어렵습니다. 특히 기술 문서나 긴 가이드 글에서 불편함을 느낍니다.

## ✨ 제안하는 해결책
마크다운 헤딩(#, ##, ###)을 기반으로 목차를 자동 생성하고, 클릭 시 해당 섹션으로 부드럽게 스크롤되도록 합니다.

## 🎨 UI/UX 제안
- 왼쪽 사이드바에 고정 (또는 글 상단에 배치)
- 현재 읽고 있는 섹션 하이라이트
- 스크롤에 따라 자동 업데이트
- 모바일에서는 접을 수 있는 형태

## 📋 구현 세부사항

### 필요한 작업
- [ ] 마크다운 헤딩 파싱 로직
- [ ] TableOfContents 컴포넌트 생성
- [ ] 스크롤 이벤트 처리
- [ ] 현재 섹션 감지 로직 (Intersection Observer)
- [ ] 반응형 디자인
- [ ] 부드러운 스크롤 애니메이션

### 기술적 고려사항
- 마크다운 파싱은 `marked` 라이브러리 활용 또는 직접 파싱
- Intersection Observer API로 현재 섹션 감지
- 성능 최적화를 위한 메모이제이션
- 접근성 고려 (키보드 네비게이션)

### 파일 구조
```
components/
  └── TableOfContents/
      ├── TableOfContents.tsx
      └── index.ts

app/articles/[slug]/
  └── page.tsx (목차 통합)
```

## 🎯 기대 효과
- 긴 글을 읽는 사용자 경험 개선
- 원하는 정보로 빠르게 이동 가능
- 글의 구조를 한눈에 파악 가능
```

### 3. 라벨 추가
- `feature`
- `enhancement`
- `priority: medium` (또는 `low`)

### 4. 이슈 생성
"Submit new issue" 클릭

## 🚀 이슈 생성 후 작업 시작

### Step 1: 이슈 확인 및 브랜치 생성

```bash
# develop 브랜치로 이동 및 최신화
git checkout develop
git pull origin develop

# 기능 브랜치 생성 (이슈 번호를 포함하면 좋음)
git checkout -b feature/add-table-of-contents
# 또는 이슈 번호 포함: feature/issue-1-add-table-of-contents
```

### Step 2: 작업 및 커밋

```bash
# 컴포넌트 생성
# components/TableOfContents.tsx 파일 생성

git add components/TableOfContents.tsx
git commit -m "feat(ui): TableOfContents 컴포넌트 추가

마크다운 헤딩을 기반으로 목차 생성
- 헤딩 파싱 로직 구현
- 목차 아이템 렌더링
- 클릭 이벤트 처리

Refs #1"

# 페이지에 통합
git add app/articles/[slug]/page.tsx
git commit -m "feat(article): 글 상세 페이지에 목차 통합

TableOfContents 컴포넌트를 글 상세 페이지에 추가
- 마크다운 콘텐츠에서 헤딩 추출
- 스크롤 이벤트로 현재 섹션 하이라이트

Refs #1"

# 스타일 추가
git add app/globals.css
git commit -m "style(ui): 목차 스타일 추가

반응형 디자인 및 애니메이션 적용

Refs #1"
```

### Step 3: 푸시 및 PR 생성

```bash
# 브랜치 푸시
git push origin feature/add-table-of-contents
```

**GitHub에서 PR 생성:**
1. "New Pull Request" 클릭
2. Base: `develop` ← Compare: `feature/add-table-of-contents`
3. PR 제목: `feat(article): 글 상세 페이지에 목차 기능 추가`
4. PR 설명 작성 (템플릿 사용)
5. "Closes #1" 포함
6. PR 생성

### Step 4: 코드 리뷰 및 머지

- 코드 리뷰 (자기 자신 또는 다른 개발자)
- 수정 사항 반영 (필요한 경우)
- 승인 후 머지
- 이슈 자동 종료

## 📋 다른 추천 이슈들

### 이슈 #2: S3 이미지 업로드 연동
```
제목: [FEATURE] 이미지 업로드 S3 연동

현재 base64로 저장되는 이미지를 AWS S3에 업로드하도록 개선
```

### 이슈 #3: 댓글 기능 추가
```
제목: [FEATURE] 글 댓글 기능 추가

글에 댓글을 작성할 수 있는 기능 추가
```

### 이슈 #4: 다크 모드 지원
```
제목: [FEATURE] 다크 모드 지원

사용자가 다크 모드와 라이트 모드를 선택할 수 있는 기능 추가
```

### 이슈 #5: 테스트 코드 추가
```
제목: [FEATURE] 테스트 코드 추가

API 엔드포인트 및 컴포넌트 테스트 코드 작성
```

## 💡 팁

1. **이슈는 작게**: 하나의 이슈는 하나의 기능/개선사항만
2. **명확한 설명**: 무엇을, 왜, 어떻게 할지 명확히
3. **체크리스트 활용**: 작업 항목을 체크리스트로 정리
4. **이슈 번호 참조**: 커밋 메시지에 `Refs #1` 포함
5. **PR과 연결**: PR 설명에 `Closes #1` 포함하여 자동 종료

---

이제 첫 이슈를 생성하고 작업을 시작해보세요! 🚀

