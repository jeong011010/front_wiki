# 기여 가이드 (Contributing Guide)

프론트위키 프로젝트에 기여해주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 📋 목차

- [코드 기여하기](#코드-기여하기)
- [커밋 컨벤션](#커밋-컨벤션)
- [Pull Request 가이드](#pull-request-가이드)
- [이슈 리포트](#이슈-리포트)
- [코드 스타일](#코드-스타일)
- [테스트](#테스트)

## 💻 코드 기여하기

### 1. 저장소 포크 및 클론

```bash
# 저장소 포크 후 클론
git clone https://github.com/yourusername/kimjazz_blog.git
cd kimjazz_blog
```

### 2. 원본 저장소 추가

```bash
git remote add upstream https://github.com/originalowner/kimjazz_blog.git
```

### 3. 브랜치 생성

기능별로 브랜치를 생성합니다:

```bash
# 기능 추가
git checkout -b feature/feature-name

# 버그 수정
git checkout -b fix/bug-description

# 문서 수정
git checkout -b docs/documentation-update

# 리팩토링
git checkout -b refactor/refactoring-description
```

**브랜치 네이밍 규칙:**
- `feature/`: 새로운 기능 추가
- `fix/`: 버그 수정
- `docs/`: 문서 수정
- `refactor/`: 코드 리팩토링
- `style/`: 코드 포맷팅, 세미콜론 누락 등
- `test/`: 테스트 추가 또는 수정
- `chore/`: 빌드 프로세스 또는 보조 도구 변경

### 4. 변경사항 커밋

커밋 메시지는 [커밋 컨벤션](#커밋-컨벤션)을 따라 작성합니다.

### 5. 원본 저장소와 동기화

```bash
git fetch upstream
git rebase upstream/main
```

### 6. 푸시 및 Pull Request 생성

```bash
git push origin feature/feature-name
```

그 후 GitHub에서 Pull Request를 생성합니다.

## 📝 커밋 컨벤션

커밋 메시지는 다음 형식을 따릅니다:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (필수)

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등 (코드 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가 또는 수정
- `chore`: 빌드 프로세스 또는 보조 도구 변경
- `perf`: 성능 개선
- `ci`: CI 설정 파일 및 스크립트 변경

### Scope (선택)

변경이 발생한 영역을 명시합니다:

- `auth`: 인증 관련
- `article`: 글 관련
- `diagram`: 다이어그램 관련
- `editor`: 에디터 관련
- `api`: API 관련
- `ui`: UI 컴포넌트
- `db`: 데이터베이스 관련
- `seo`: SEO 관련

### Subject (필수)

- 50자 이내로 작성
- 첫 글자는 대문자로 시작하지 않음
- 마지막에 마침표(.)를 붙이지 않음
- 명령형으로 작성 (예: "추가" 대신 "추가함")

### Body (선택)

- 72자마다 줄바꿈
- 무엇을 변경했는지, 왜 변경했는지 설명
- 어떻게 변경했는지도 포함 가능

### Footer (선택)

- 이슈 번호 참조: `Closes #123`, `Fixes #456`
- Breaking Changes: `BREAKING CHANGE: 설명`

### 예시

```
feat(article): 글 상세 페이지에 목차 기능 추가

- 마크다운 헤딩을 기반으로 목차 자동 생성
- 스크롤에 따라 현재 섹션 하이라이트
- 클릭 시 해당 섹션으로 스크롤 이동

Closes #123
```

```
fix(auth): 회원가입 시 500 에러 수정

Prisma 클라이언트가 제대로 로드되지 않는 문제 해결
- Prisma 클라이언트 재생성 로직 추가
- 에러 핸들링 개선

Fixes #456
```

```
docs(readme): 설치 가이드 업데이트

환경 변수 설정 방법을 더 자세히 설명
```

## 🔀 Pull Request 가이드

### PR 생성 전 체크리스트

- [ ] 코드가 프로젝트의 코딩 스타일을 따름
- [ ] 필요한 테스트를 추가하거나 수정함
- [ ] 문서를 업데이트함 (필요한 경우)
- [ ] 커밋 메시지가 컨벤션을 따름
- [ ] 브랜치가 최신 main 브랜치와 동기화됨
- [ ] 린트 오류가 없음

### PR 제목 형식

```
<type>(<scope>): <subject>
```

예시:
- `feat(article): 글 상세 페이지에 목차 기능 추가`
- `fix(auth): 회원가입 시 500 에러 수정`

### PR 설명 템플릿

PR 설명에는 다음 내용을 포함하세요:

1. **변경 사항 요약**
   - 무엇을 변경했는지 간단히 설명

2. **변경 이유**
   - 왜 이 변경이 필요한지 설명

3. **테스트 방법**
   - 어떻게 테스트했는지 설명
   - 스크린샷이나 GIF (UI 변경인 경우)

4. **관련 이슈**
   - `Closes #123` 형식으로 이슈 번호 참조

5. **체크리스트**
   - [ ] 코드 리뷰 준비 완료
   - [ ] 테스트 완료
   - [ ] 문서 업데이트 완료

## 🐛 이슈 리포트

버그를 발견하셨거나 기능을 제안하고 싶으시다면 이슈를 생성해주세요.

### 버그 리포트

버그 리포트에는 다음 정보를 포함해주세요:

1. **버그 설명**
   - 무엇이 문제인지 명확히 설명

2. **재현 방법**
   - 단계별로 어떻게 재현할 수 있는지 설명

3. **예상 동작**
   - 어떻게 동작해야 하는지 설명

4. **실제 동작**
   - 실제로 어떻게 동작하는지 설명

5. **스크린샷**
   - 가능하면 스크린샷 첨부

6. **환경 정보**
   - 브라우저 및 버전
   - OS 및 버전
   - Node.js 버전

### 기능 제안

기능 제안에는 다음 정보를 포함해주세요:

1. **문제점**
   - 이 기능이 해결할 문제는 무엇인가?

2. **제안하는 해결책**
   - 어떻게 해결할 수 있는지 설명

3. **대안**
   - 고려한 다른 방법이 있다면 설명

4. **추가 컨텍스트**
   - 스크린샷, 목업 등

## 🎨 코드 스타일

### TypeScript

- `any` 타입 사용 금지
- 모든 함수와 변수에 타입 명시
- 타입은 `types/` 디렉토리에서 중앙 관리

### 컴포넌트

- 함수형 컴포넌트 사용
- 컴포넌트는 PascalCase로 명명
- 파일명은 컴포넌트명과 동일하게

### 파일 구조

```
components/
  ComponentName/
    ComponentName.tsx
    ComponentName.test.tsx
    index.ts
```

### 네이밍

- 변수/함수: camelCase
- 컴포넌트: PascalCase
- 상수: UPPER_SNAKE_CASE
- 타입/인터페이스: PascalCase

## 🧪 테스트

(테스트 프레임워크 도입 시 업데이트 예정)

## 📚 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [React 문서](https://react.dev/)
- [Prisma 문서](https://www.prisma.io/docs)
- [TypeScript 문서](https://www.typescriptlang.org/docs/)

## ❓ 질문이 있으신가요?

이슈를 생성하거나 토론에 참여해주세요!

---

감사합니다! 🎉

