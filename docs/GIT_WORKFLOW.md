# GitHub 워크플로우 완전 가이드

이 문서는 프론트위키 프로젝트에서 사용하는 GitHub 워크플로우를 상세히 설명합니다.

## 📋 목차

1. [브랜치 전략](#브랜치-전략)
2. [커밋 컨벤션](#커밋-컨벤션)
3. [이슈 관리](#이슈-관리)
4. [Pull Request 프로세스](#pull-request-프로세스)
5. [실제 워크플로우 예시](#실제-워크플로우-예시)

---

## 🌿 브랜치 전략

### 브랜치 구조

```
main (프로덕션)
  ├── develop (개발)
  │   ├── feature/기능명
  │   ├── fix/버그명
  │   └── refactor/리팩토링명
```

### 브랜치 종류 및 사용 시점

#### 1. `main` 브랜치
- **용도**: 프로덕션 배포 가능한 안정적인 코드
- **보호 규칙**: 
  - 직접 푸시 금지 (PR 통해서만)
  - 최소 1명의 승인 필요
  - CI 통과 필수
- **언제 사용**: 
  - 배포 준비가 완료된 코드만 머지
  - `develop`에서 테스트 완료 후 머지

#### 2. `develop` 브랜치
- **용도**: 개발 중인 기능들이 통합되는 브랜치
- **언제 사용**: 
  - 새로운 기능 개발 시작 전 `develop`에서 브랜치 생성
  - 기능 완성 후 `develop`으로 머지
- **주의사항**: 항상 최신 상태 유지

#### 3. `feature/기능명` 브랜치
- **용도**: 새로운 기능 개발
- **생성 시점**: 
  - 새로운 기능을 추가할 때
  - 이슈가 생성되고 작업을 시작할 때
- **네이밍 규칙**: 
  ```
  feature/add-table-of-contents
  feature/user-profile-page
  feature/comment-system
  ```
- **생명주기**:
  1. `develop`에서 생성
  2. 기능 개발
  3. `develop`으로 PR 생성
  4. 머지 후 삭제

#### 4. `fix/버그명` 브랜치
- **용도**: 버그 수정
- **생성 시점**: 
  - 버그 이슈가 생성되고 수정을 시작할 때
  - 긴급한 핫픽스가 필요할 때
- **네이밍 규칙**:
  ```
  fix/login-500-error
  fix/article-slug-duplicate
  fix/diagram-drag-issue
  ```
- **생명주기**:
  1. `develop` 또는 `main`에서 생성 (긴급도에 따라)
  2. 버그 수정
  3. 해당 브랜치로 PR 생성
  4. 머지 후 삭제

#### 5. `refactor/리팩토링명` 브랜치
- **용도**: 코드 리팩토링
- **생성 시점**: 
  - 코드 개선이 필요할 때
  - 성능 최적화
  - 구조 개선
- **네이밍 규칙**:
  ```
  refactor/auth-module
  refactor/api-error-handling
  refactor/component-structure
  ```

#### 6. `docs/문서명` 브랜치
- **용도**: 문서 수정
- **생성 시점**: README, 가이드 문서 수정 시
- **네이밍 규칙**:
  ```
  docs/update-installation-guide
  docs/add-api-documentation
  ```

### 브랜치 생성 예시

```bash
# develop 브랜치 생성 (처음 한 번만)
git checkout -b develop
git push -u origin develop

# 기능 개발 시작
git checkout develop
git pull origin develop  # 최신 상태로 업데이트
git checkout -b feature/add-table-of-contents

# 버그 수정 시작
git checkout develop
git pull origin develop
git checkout -b fix/login-500-error
```

---

## 💬 커밋 컨벤션

### 커밋 메시지 구조

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (필수)

| Type | 사용 시점 | 예시 |
|------|----------|------|
| `feat` | 새로운 기능 추가 | `feat(article): 목차 기능 추가` |
| `fix` | 버그 수정 | `fix(auth): 로그인 500 에러 수정` |
| `docs` | 문서 수정 | `docs(readme): 설치 가이드 업데이트` |
| `style` | 코드 포맷팅 (동작 변경 없음) | `style(editor): 코드 포맷팅` |
| `refactor` | 코드 리팩토링 | `refactor(api): 에러 핸들링 개선` |
| `perf` | 성능 개선 | `perf(diagram): 렌더링 성능 최적화` |
| `test` | 테스트 추가/수정 | `test(auth): 로그인 테스트 추가` |
| `chore` | 빌드/설정 변경 | `chore: 의존성 업데이트` |
| `ci` | CI 설정 변경 | `ci: GitHub Actions 워크플로우 추가` |

### Scope (선택, 권장)

변경이 발생한 영역:

- `auth`: 인증 관련
- `article`: 글 관련
- `diagram`: 다이어그램 관련
- `editor`: 에디터 관련
- `api`: API 관련
- `ui`: UI 컴포넌트
- `db`: 데이터베이스/Prisma
- `seo`: SEO 관련
- `config`: 설정 파일

### Subject (필수)

- **50자 이내**로 작성
- **첫 글자는 소문자**로 시작
- **마지막에 마침표(.) 없음**
- **명령형으로 작성** (과거형 X, 현재형 X)
  - ✅ 좋은 예: "추가함", "수정함", "개선함"
  - ❌ 나쁜 예: "추가했습니다", "수정", "개선"

### Body (선택, 권장)

- **72자마다 줄바꿈**
- **무엇을 변경했는지** 설명
- **왜 변경했는지** 설명
- **어떻게 변경했는지** (필요한 경우)

### Footer (선택)

- **이슈 번호 참조**: `Closes #123`, `Fixes #456`, `Refs #789`
- **Breaking Changes**: `BREAKING CHANGE: 설명`

### 커밋 예시

#### 예시 1: 기능 추가 (간단한 경우)

```bash
git commit -m "feat(article): 글 상세 페이지에 목차 기능 추가"
```

#### 예시 2: 기능 추가 (상세한 경우)

```bash
git commit -m "feat(article): 글 상세 페이지에 목차 기능 추가

- 마크다운 헤딩(#, ##, ###)을 기반으로 목차 자동 생성
- 스크롤 위치에 따라 현재 섹션 하이라이트
- 목차 클릭 시 해당 섹션으로 부드럽게 스크롤
- 반응형 디자인 지원

Closes #123"
```

#### 예시 3: 버그 수정

```bash
git commit -m "fix(auth): 회원가입 시 500 에러 수정

Prisma 클라이언트가 제대로 로드되지 않는 문제 해결
- Prisma 클라이언트 재생성 로직 추가
- 에러 핸들링 개선
- JSON 파싱 오류 처리 추가

Fixes #456"
```

#### 예시 4: 리팩토링

```bash
git commit -m "refactor(api): 에러 핸들링 통합

모든 API 라우트에서 일관된 에러 핸들링 적용
- 공통 에러 핸들링 함수 생성
- 에러 타입 정의
- 개발 환경에서 상세 에러 메시지 표시

Refs #789"
```

#### 예시 5: 문서 수정

```bash
git commit -m "docs(readme): 설치 가이드 업데이트

환경 변수 설정 방법을 더 자세히 설명
- .env 파일 예시 추가
- 각 환경 변수 설명 추가
- 트러블슈팅 섹션 추가"
```

#### 예시 6: 여러 파일 변경 (논리적으로 분리)

```bash
# 첫 번째 커밋
git add app/articles/[slug]/page.tsx
git commit -m "feat(article): 목차 컴포넌트 추가"

# 두 번째 커밋
git add components/TableOfContents.tsx
git commit -m "feat(ui): TableOfContents 컴포넌트 구현"

# 세 번째 커밋
git add app/globals.css
git commit -m "style(ui): 목차 스타일 추가"
```

**❌ 나쁜 예:**
```bash
# 너무 많은 변경사항을 한 번에
git commit -m "fix: 여러 버그 수정"

# 의미 없는 메시지
git commit -m "update"

# 과거형 사용
git commit -m "feat: 목차 기능을 추가했습니다"
```

---

## 🐛 이슈 관리

### 이슈를 생성하는 시점

#### 1. 버그 발견 시
- **즉시 생성**: 버그를 발견하면 바로 이슈 생성
- **템플릿 사용**: Bug Report 템플릿 사용
- **우선순위 설정**: 
  - `critical`: 서비스 중단
  - `high`: 주요 기능 동작 안 함
  - `medium`: 일부 기능 문제
  - `low`: 사소한 문제

#### 2. 기능 제안 시
- **생성 후 논의**: 기능 제안은 이슈로 먼저 논의
- **템플릿 사용**: Feature Request 템플릿 사용
- **라벨 추가**: `enhancement`, `feature`

#### 3. 개선 사항 발견 시
- **기록**: 개선할 점을 발견하면 이슈로 기록
- **템플릿 사용**: Improvement 템플릿 사용
- **우선순위**: `low` 또는 `medium`

#### 4. 작업 시작 전
- **계획**: 큰 작업을 시작하기 전에 이슈로 계획 수립
- **작업 분해**: 큰 작업을 작은 이슈로 분해
- **의존성 표시**: 관련 이슈 연결

### 이슈 작성 형식

#### 버그 리포트 예시

```markdown
## 🐛 버그 설명
회원가입 시 500 에러가 발생합니다.

## 🔄 재현 방법
1. /auth/register 페이지로 이동
2. 이메일, 이름, 비밀번호 입력
3. "회원가입" 버튼 클릭
4. 500 에러 발생

## ✅ 예상 동작
회원가입이 성공하고 메인 페이지로 리다이렉트되어야 합니다.

## ❌ 실제 동작
500 Internal Server Error 발생

## 💻 환경 정보
- OS: macOS 14.5
- 브라우저: Chrome 120
- Node.js: 18.17.0

## 📋 추가 컨텍스트
서버 콘솔에 다음 에러가 표시됩니다:
```
Register error: TypeError: Cannot read properties of undefined
```

## 🔗 관련 이슈
없음
```

#### 기능 제안 예시

```markdown
## 🎯 기능 제안
글 상세 페이지에 목차(Table of Contents) 기능 추가

## 💡 문제점
긴 글을 읽을 때 원하는 섹션으로 바로 이동하기 어렵습니다.

## ✨ 제안하는 해결책
마크다운 헤딩을 기반으로 목차를 자동 생성하고, 클릭 시 해당 섹션으로 스크롤되도록 합니다.

## 📸 목업
[목업 이미지 또는 스크린샷]

## 🎨 UI/UX 제안
- 왼쪽 사이드바에 고정
- 현재 섹션 하이라이트
- 스크롤에 따라 자동 업데이트

## 📋 구현 세부사항
- [ ] 마크다운 헤딩 파싱
- [ ] 목차 컴포넌트 생성
- [ ] 스크롤 이벤트 처리
- [ ] 반응형 디자인
```

### 이슈 라벨 전략

| 라벨 | 용도 | 색상 |
|------|------|------|
| `bug` | 버그 | 빨간색 |
| `enhancement` | 기능 개선 | 파란색 |
| `feature` | 새 기능 | 초록색 |
| `documentation` | 문서 | 노란색 |
| `question` | 질문 | 보라색 |
| `help wanted` | 도움 요청 | 핑크색 |
| `good first issue` | 초보자용 | 연두색 |
| `priority: critical` | 긴급 | 빨간색 |
| `priority: high` | 높음 | 주황색 |
| `priority: medium` | 보통 | 노란색 |
| `priority: low` | 낮음 | 회색 |
| `status: in progress` | 진행 중 | 파란색 |
| `status: blocked` | 차단됨 | 빨간색 |
| `status: needs review` | 리뷰 필요 | 보라색 |

### 이슈 해결 프로세스

#### 1. 이슈 생성
```
사용자/개발자 → 이슈 생성 → 라벨 추가 → 우선순위 설정
```

#### 2. 이슈 할당
```
이슈 확인 → 담당자 할당 → "in progress" 라벨 추가
```

#### 3. 작업 시작
```
브랜치 생성 → 작업 진행 → 커밋 (이슈 번호 참조)
```

#### 4. PR 생성
```
PR 생성 → 이슈와 연결 (Closes #123) → 리뷰 요청
```

#### 5. 머지 및 이슈 종료
```
PR 머지 → 이슈 자동 종료 (Closes #123 사용 시)
```

### 이슈 예시 시나리오

#### 시나리오 1: 버그 발견 → 수정

1. **버그 발견**
   - 사용자가 회원가입 시 500 에러 발견
   - 이슈 #123 생성: `[BUG] 회원가입 시 500 에러 발생`

2. **이슈 확인 및 할당**
   - 개발자가 이슈 확인
   - 라벨: `bug`, `priority: high`
   - 담당자 할당

3. **작업 시작**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b fix/register-500-error
   ```

4. **버그 수정 및 커밋**
   ```bash
   # 수정 작업...
   git add .
   git commit -m "fix(auth): 회원가입 시 500 에러 수정

   Prisma 클라이언트 로드 문제 해결
   - Prisma 클라이언트 재생성 로직 추가
   - 에러 핸들링 개선

   Fixes #123"
   ```

5. **PR 생성**
   - 브랜치: `fix/register-500-error` → `develop`
   - PR 제목: `fix(auth): 회원가입 시 500 에러 수정`
   - PR 설명에 "Fixes #123" 포함

6. **리뷰 및 머지**
   - 코드 리뷰
   - 승인 후 머지
   - 이슈 #123 자동 종료

#### 시나리오 2: 기능 제안 → 구현

1. **기능 제안**
   - 이슈 #456 생성: `[FEATURE] 글 상세 페이지에 목차 기능 추가`
   - 라벨: `feature`, `enhancement`

2. **논의 및 계획**
   - 이슈 댓글로 구현 방법 논의
   - 작업 항목 정리

3. **작업 시작**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/add-table-of-contents
   ```

4. **단계별 커밋**
   ```bash
   # 1단계: 컴포넌트 생성
   git add components/TableOfContents.tsx
   git commit -m "feat(ui): TableOfContents 컴포넌트 추가

   마크다운 헤딩을 기반으로 목차 생성

   Refs #456"

   # 2단계: 페이지에 통합
   git add app/articles/[slug]/page.tsx
   git commit -m "feat(article): 글 상세 페이지에 목차 통합

   TableOfContents 컴포넌트를 글 상세 페이지에 추가
   스크롤 이벤트로 현재 섹션 하이라이트

   Refs #456"

   # 3단계: 스타일 추가
   git add app/globals.css
   git commit -m "style(ui): 목차 스타일 추가

   반응형 디자인 및 애니메이션 적용

   Refs #456"
   ```

5. **PR 생성**
   - 브랜치: `feature/add-table-of-contents` → `develop`
   - PR 제목: `feat(article): 글 상세 페이지에 목차 기능 추가`
   - PR 설명:
     ```markdown
     ## 변경 사항
     - TableOfContents 컴포넌트 추가
     - 글 상세 페이지에 목차 통합
     - 스크롤 기반 하이라이트 기능
     
     ## 테스트
     - [x] 목차가 올바르게 생성됨
     - [x] 클릭 시 해당 섹션으로 스크롤
     - [x] 현재 섹션 하이라이트 동작
     
     Closes #456
     ```

6. **리뷰 및 머지**
   - 코드 리뷰
   - 수정 사항 반영
   - 승인 후 머지
   - 이슈 #456 자동 종료

---

## 🔀 Pull Request 프로세스

### PR을 생성하는 시점

1. **기능 개발 완료 시**
   - 기능이 완성되고 테스트 완료
   - `develop`에 머지할 준비가 되었을 때

2. **버그 수정 완료 시**
   - 버그 수정 완료 및 테스트 완료
   - 긴급한 경우 `main`으로 직접 PR

3. **리팩토링 완료 시**
   - 리팩토링 완료 및 테스트 통과
   - 기능 변경 없이 코드 개선만

### PR 생성 전 체크리스트

- [ ] 코드가 프로젝트의 코딩 스타일을 따름
- [ ] 필요한 테스트를 추가하거나 수정함
- [ ] 문서를 업데이트함 (필요한 경우)
- [ ] 커밋 메시지가 컨벤션을 따름
- [ ] 브랜치가 최신 `develop` 브랜치와 동기화됨
- [ ] 린트 오류가 없음
- [ ] 빌드가 성공적으로 완료됨
- [ ] 관련 이슈를 참조함

### PR 제목 형식

```
<type>(<scope>): <subject>
```

**예시:**
- `feat(article): 글 상세 페이지에 목차 기능 추가`
- `fix(auth): 회원가입 시 500 에러 수정`
- `refactor(api): 에러 핸들링 통합`

### PR 설명 템플릿

```markdown
## 📋 변경 사항 요약
<!-- 이 PR에서 무엇을 변경했는지 간단히 설명 -->

## 🎯 변경 이유
<!-- 왜 이 변경이 필요한지 설명 -->
<!-- 관련 이슈가 있다면 이슈 번호를 참조 -->

## 🔍 변경 내용 상세

### 주요 변경 사항
- 변경 사항 1
- 변경 사항 2
- 변경 사항 3

### 코드 변경 사항
- 파일 1: 변경 내용
- 파일 2: 변경 내용

## 🧪 테스트 방법

### 테스트 시나리오
1. 테스트 1
2. 테스트 2
3. 테스트 3

### 스크린샷
<!-- UI 변경인 경우 스크린샷을 첨부 -->

## ✅ 체크리스트
- [ ] 코드가 프로젝트의 코딩 스타일을 따름
- [ ] 필요한 테스트를 추가하거나 수정함
- [ ] 문서를 업데이트함 (필요한 경우)
- [ ] 커밋 메시지가 컨벤션을 따름
- [ ] 브랜치가 최신 develop 브랜치와 동기화됨
- [ ] 린트 오류가 없음
- [ ] 빌드가 성공적으로 완료됨
- [ ] 관련 이슈를 참조함

## 🔗 관련 이슈
Closes #123
Fixes #456
Refs #789

## 📝 추가 정보
<!-- 리뷰어가 알아야 할 추가 정보 -->
```

### PR 리뷰 프로세스

#### 1. PR 생성
```
작업 완료 → PR 생성 → 리뷰어 할당 → 리뷰 요청
```

#### 2. 코드 리뷰
```
리뷰어 확인 → 코멘트 작성 → 수정 요청 (필요 시)
```

#### 3. 수정 및 재리뷰
```
작업자 수정 → 커밋 푸시 → 자동으로 리뷰 재요청
```

#### 4. 승인 및 머지
```
리뷰 승인 → 머지 → 브랜치 삭제 → 이슈 자동 종료
```

### PR 머지 전략

#### 1. Squash and Merge (권장)
- 여러 커밋을 하나로 합침
- 깔끔한 히스토리 유지
- 작은 기능/버그 수정에 적합

#### 2. Merge Commit
- 모든 커밋 히스토리 보존
- 큰 기능 개발에 적합

#### 3. Rebase and Merge
- 선형 히스토리 유지
- 개인 프로젝트에 적합

---

## 🔄 실제 워크플로우 예시

### 시나리오: "글 상세 페이지에 목차 기능 추가"

#### 1단계: 이슈 생성

GitHub에서:
1. "New Issue" 클릭
2. "Feature Request" 템플릿 선택
3. 제목: `[FEATURE] 글 상세 페이지에 목차 기능 추가`
4. 내용 작성:
   ```markdown
   ## 🎯 기능 제안
   글 상세 페이지에 목차(Table of Contents) 기능 추가
   
   ## 💡 문제점
   긴 글을 읽을 때 원하는 섹션으로 바로 이동하기 어렵습니다.
   
   ## ✨ 제안하는 해결책
   마크다운 헤딩을 기반으로 목차를 자동 생성하고, 클릭 시 해당 섹션으로 스크롤되도록 합니다.
   ```
5. 라벨 추가: `feature`, `enhancement`
6. 이슈 생성 → 이슈 번호: #123

#### 2단계: 브랜치 생성 및 작업 시작

```bash
# develop 브랜치로 이동 및 최신화
git checkout develop
git pull origin develop

# 기능 브랜치 생성
git checkout -b feature/add-table-of-contents

# 작업 시작...
```

#### 3단계: 단계별 커밋

```bash
# 1. 컴포넌트 생성
git add components/TableOfContents.tsx
git commit -m "feat(ui): TableOfContents 컴포넌트 추가

마크다운 헤딩을 기반으로 목차 생성
- 헤딩 파싱 로직 구현
- 목차 아이템 렌더링
- 클릭 이벤트 처리

Refs #123"

# 2. 페이지에 통합
git add app/articles/[slug]/page.tsx
git commit -m "feat(article): 글 상세 페이지에 목차 통합

TableOfContents 컴포넌트를 글 상세 페이지에 추가
- 마크다운 콘텐츠에서 헤딩 추출
- 목차 컴포넌트 렌더링
- 스크롤 이벤트로 현재 섹션 하이라이트

Refs #123"

# 3. 스타일 추가
git add app/globals.css
git commit -m "style(ui): 목차 스타일 추가

반응형 디자인 및 애니메이션 적용
- 사이드바 고정 스타일
- 현재 섹션 하이라이트 효과
- 모바일 반응형 디자인

Refs #123"
```

#### 4단계: PR 생성

```bash
# 브랜치 푸시
git push origin feature/add-table-of-contents
```

GitHub에서:
1. "New Pull Request" 클릭
2. Base: `develop` ← Compare: `feature/add-table-of-contents`
3. PR 제목: `feat(article): 글 상세 페이지에 목차 기능 추가`
4. PR 설명 작성:
   ```markdown
   ## 📋 변경 사항 요약
   글 상세 페이지에 목차(Table of Contents) 기능을 추가했습니다.
   
   ## 🎯 변경 이유
   긴 글을 읽을 때 원하는 섹션으로 바로 이동할 수 있도록 목차 기능이 필요했습니다.
   
   ## 🔍 변경 내용 상세
   
   ### 주요 변경 사항
   - TableOfContents 컴포넌트 추가
   - 글 상세 페이지에 목차 통합
   - 스크롤 기반 현재 섹션 하이라이트
   - 반응형 디자인 적용
   
   ### 코드 변경 사항
   - `components/TableOfContents.tsx`: 목차 컴포넌트 구현
   - `app/articles/[slug]/page.tsx`: 목차 통합
   - `app/globals.css`: 목차 스타일 추가
   
   ## 🧪 테스트 방법
   
   ### 테스트 시나리오
   1. 글 상세 페이지 접속
   2. 목차가 올바르게 생성되는지 확인
   3. 목차 아이템 클릭 시 해당 섹션으로 스크롤되는지 확인
   4. 스크롤 시 현재 섹션이 하이라이트되는지 확인
   5. 모바일에서도 정상 동작하는지 확인
   
   ### 스크린샷
   [스크린샷 첨부]
   
   ## ✅ 체크리스트
   - [x] 코드가 프로젝트의 코딩 스타일을 따름
   - [x] 필요한 테스트를 추가하거나 수정함
   - [x] 문서를 업데이트함 (필요한 경우)
   - [x] 커밋 메시지가 컨벤션을 따름
   - [x] 브랜치가 최신 develop 브랜치와 동기화됨
   - [x] 린트 오류가 없음
   - [x] 빌드가 성공적으로 완료됨
   - [x] 관련 이슈를 참조함
   
   ## 🔗 관련 이슈
   Closes #123
   ```
5. 리뷰어 할당 (자기 자신 또는 다른 개발자)
6. 라벨 추가: `feature`, `enhancement`
7. PR 생성

#### 5단계: 코드 리뷰

리뷰어가:
1. 코드 확인
2. 코멘트 작성 (필요 시)
3. 승인 또는 수정 요청

#### 6단계: 수정 (필요한 경우)

```bash
# 수정 작업...
git add .
git commit -m "refactor(ui): TableOfContents 컴포넌트 리팩토링

리뷰 피드백 반영
- 타입 정의 개선
- 성능 최적화

Refs #123"

git push origin feature/add-table-of-contents
```

#### 7단계: 머지

1. 리뷰 승인
2. "Squash and Merge" 선택
3. 머지 메시지 확인:
   ```
   feat(article): 글 상세 페이지에 목차 기능 추가
   
   Closes #123
   ```
4. 머지 완료
5. 브랜치 삭제
6. 이슈 #123 자동 종료

#### 8단계: 정리

```bash
# 로컬 브랜치 삭제
git checkout develop
git pull origin develop
git branch -d feature/add-table-of-contents
```

---

## 📊 워크플로우 다이어그램

```
[이슈 생성]
    ↓
[브랜치 생성] (feature/fix/refactor)
    ↓
[작업 및 커밋] (커밋 컨벤션 준수)
    ↓
[PR 생성] (이슈 연결)
    ↓
[코드 리뷰]
    ↓
[수정] (필요한 경우)
    ↓
[머지] (Squash and Merge)
    ↓
[브랜치 삭제]
    ↓
[이슈 자동 종료]
```

---

## 🎯 실전 팁

### 1. 작은 단위로 커밋
- 논리적으로 분리된 작업마다 커밋
- 한 커밋에 너무 많은 변경사항 포함하지 않기

### 2. 이슈와 커밋 연결
- 커밋 메시지에 `Refs #123` 포함
- PR 설명에 `Closes #123` 포함

### 3. PR은 작게
- 하나의 PR은 하나의 기능/버그 수정
- 큰 작업은 여러 PR로 분리

### 4. 정기적인 동기화
- 작업 시작 전: `git pull origin develop`
- 작업 중: 주기적으로 `develop`과 동기화

### 5. 의미 있는 커밋 메시지
- 나중에 히스토리를 볼 때 이해할 수 있도록
- 왜 변경했는지 설명 포함

---

이 가이드를 따라하면 현업 수준의 GitHub 워크플로우를 유지할 수 있습니다! 🚀

