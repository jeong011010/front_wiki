# 커밋 메시지 예시 모음

실제 프로젝트에서 사용할 수 있는 커밋 메시지 예시입니다.

## 기능 추가 (feat)

### 간단한 기능 추가
```bash
git commit -m "feat(article): 글 상세 페이지에 목차 기능 추가"
```

### 상세한 기능 추가
```bash
git commit -m "feat(article): 글 상세 페이지에 목차 기능 추가

- 마크다운 헤딩(#, ##, ###)을 기반으로 목차 자동 생성
- 스크롤 위치에 따라 현재 섹션 하이라이트
- 목차 클릭 시 해당 섹션으로 부드럽게 스크롤
- 반응형 디자인 지원

Closes #123"
```

### 여러 파일 변경 (논리적으로 분리)
```bash
# 첫 번째 커밋
git add components/TableOfContents.tsx
git commit -m "feat(ui): TableOfContents 컴포넌트 추가

마크다운 헤딩을 기반으로 목차 생성

Refs #123"

# 두 번째 커밋
git add app/articles/[slug]/page.tsx
git commit -m "feat(article): 글 상세 페이지에 목차 통합

TableOfContents 컴포넌트를 글 상세 페이지에 추가

Refs #123"

# 세 번째 커밋
git add app/globals.css
git commit -m "style(ui): 목차 스타일 추가

반응형 디자인 및 애니메이션 적용

Refs #123"
```

## 버그 수정 (fix)

### 간단한 버그 수정
```bash
git commit -m "fix(auth): 회원가입 시 500 에러 수정"
```

### 상세한 버그 수정
```bash
git commit -m "fix(auth): 회원가입 시 500 에러 수정

Prisma 클라이언트가 제대로 로드되지 않는 문제 해결
- Prisma 클라이언트 재생성 로직 추가
- 에러 핸들링 개선
- JSON 파싱 오류 처리 추가

Fixes #456"
```

### 긴급 핫픽스
```bash
git commit -m "fix(api): 글 삭제 시 500 에러 수정

긴급 핫픽스: 권한 체크 로직 오류 수정

Fixes #789"
```

## 리팩토링 (refactor)

### 코드 리팩토링
```bash
git commit -m "refactor(api): 에러 핸들링 통합

모든 API 라우트에서 일관된 에러 핸들링 적용
- 공통 에러 핸들링 함수 생성
- 에러 타입 정의
- 개발 환경에서 상세 에러 메시지 표시

Refs #101"
```

### 성능 최적화
```bash
git commit -m "perf(diagram): 다이어그램 렌더링 성능 최적화

ReactFlow 노드 렌더링 최적화
- 불필요한 리렌더링 방지
- 메모이제이션 적용
- 노드 수가 많을 때 가상화 적용

Refs #202"
```

## 문서 (docs)

### README 업데이트
```bash
git commit -m "docs(readme): 설치 가이드 업데이트

환경 변수 설정 방법을 더 자세히 설명
- .env 파일 예시 추가
- 각 환경 변수 설명 추가
- 트러블슈팅 섹션 추가"
```

### API 문서 추가
```bash
git commit -m "docs(api): API 엔드포인트 문서 추가

모든 API 엔드포인트에 대한 상세 문서 작성
- 요청/응답 형식
- 에러 코드 설명
- 예시 코드 추가"
```

## 스타일 (style)

### 코드 포맷팅
```bash
git commit -m "style(editor): 코드 포맷팅

Prettier 설정에 맞춰 코드 포맷팅
- 들여쓰기 통일
- 세미콜론 추가
- 따옴표 통일"
```

## 테스트 (test)

### 테스트 추가
```bash
git commit -m "test(auth): 로그인 기능 테스트 추가

로그인 API 엔드포인트에 대한 테스트 작성
- 성공 케이스 테스트
- 실패 케이스 테스트
- 에러 핸들링 테스트"
```

## 설정 (chore)

### 의존성 업데이트
```bash
git commit -m "chore: 의존성 업데이트

- Next.js 16.0.3 → 16.0.4
- React 19.2.0 → 19.2.1
- Prisma 5.22.0 → 5.22.1"
```

### CI/CD 설정
```bash
git commit -m "ci: GitHub Actions 워크플로우 추가

- 린트 검사 자동화
- 빌드 테스트 자동화
- PR 생성 시 자동 실행"
```

## 여러 타입 조합

### 기능 추가 + 리팩토링
```bash
# 기능 추가
git commit -m "feat(article): 댓글 기능 추가

댓글 작성, 수정, 삭제 기능 구현

Refs #301"

# 리팩토링
git commit -m "refactor(article): 댓글 컴포넌트 구조 개선

컴포넌트를 더 작은 단위로 분리

Refs #301"
```

## Breaking Changes

### Breaking Change 포함
```bash
git commit -m "feat(api): API 응답 형식 변경

BREAKING CHANGE: API 응답 형식이 변경되었습니다.
이전: { data: {...} }
이후: { article: {...} }

마이그레이션 가이드: docs/MIGRATION.md 참고

Closes #401"
```

## 이슈 참조 방법

### 이슈 종료
```bash
# 이슈를 종료하는 경우
git commit -m "feat(article): 목차 기능 추가

Closes #123"
```

### 이슈 참조 (종료하지 않음)
```bash
# 관련 이슈만 참조하는 경우
git commit -m "refactor(api): 에러 핸들링 개선

Refs #456"
```

### 여러 이슈 참조
```bash
git commit -m "fix(auth): 인증 관련 버그 수정

Fixes #123
Refs #456
Closes #789"
```

---

## ❌ 나쁜 예시

### 너무 모호함
```bash
git commit -m "수정"
git commit -m "update"
git commit -m "변경사항"
```

### 과거형 사용
```bash
git commit -m "feat: 목차 기능을 추가했습니다"
git commit -m "fix: 버그를 수정했습니다"
```

### 너무 많은 변경사항
```bash
git commit -m "fix: 여러 버그 수정"
git commit -m "feat: 여러 기능 추가"
```

### 의미 없는 메시지
```bash
git commit -m "WIP"
git commit -m "asdf"
git commit -m "test"
```

---

## ✅ 좋은 커밋 메시지 체크리스트

- [ ] Type이 명확함 (`feat`, `fix`, `refactor` 등)
- [ ] Scope가 적절함 (선택사항이지만 권장)
- [ ] Subject가 50자 이내
- [ ] Subject가 명령형으로 작성됨
- [ ] Body에 변경 이유가 설명됨 (필요한 경우)
- [ ] 관련 이슈가 참조됨 (있는 경우)
- [ ] 마지막에 마침표 없음

