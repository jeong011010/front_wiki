# 실전 GitHub 워크플로우 예시

실제 프로젝트에서 사용할 수 있는 구체적인 시나리오 예시입니다.

## 📋 시나리오 1: 버그 발견 → 수정 → 배포

### 상황
사용자가 회원가입 시 500 에러를 발견했습니다.

### 1단계: 이슈 생성

**GitHub에서:**
1. "New Issue" 클릭
2. "Bug Report" 템플릿 선택
3. 제목: `[BUG] 회원가입 시 500 에러 발생`
4. 내용 작성:
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
   ```
5. 라벨 추가: `bug`, `priority: high`
6. 이슈 생성 → 이슈 번호: #123

### 2단계: 브랜치 생성 및 작업 시작

```bash
# develop 브랜치로 이동 및 최신화
git checkout develop
git pull origin develop

# 버그 수정 브랜치 생성
git checkout -b fix/register-500-error

# 버그 원인 파악 및 수정
# app/api/auth/register/route.ts 파일 수정
# lib/auth.ts 파일 수정
```

### 3단계: 버그 수정 및 커밋

```bash
# 수정된 파일 추가
git add app/api/auth/register/route.ts lib/auth.ts

# 커밋 (커밋 컨벤션 준수)
git commit -m "fix(auth): 회원가입 시 500 에러 수정

Prisma 클라이언트가 제대로 로드되지 않는 문제 해결
- Prisma 클라이언트 재생성 로직 추가
- 에러 핸들링 개선
- JSON 파싱 오류 처리 추가
- 개발 환경에서 상세 에러 메시지 표시

Fixes #123"
```

### 4단계: 테스트

```bash
# 로컬에서 테스트
npm run dev

# 회원가입 테스트
# 1. /auth/register 접속
# 2. 정보 입력 및 제출
# 3. 정상 동작 확인
```

### 5단계: PR 생성

```bash
# 브랜치 푸시
git push origin fix/register-500-error
```

**GitHub에서:**
1. "New Pull Request" 클릭
2. Base: `develop` ← Compare: `fix/register-500-error`
3. PR 제목: `fix(auth): 회원가입 시 500 에러 수정`
4. PR 설명 작성:
   ```markdown
   ## 📋 변경 사항 요약
   회원가입 시 발생하던 500 에러를 수정했습니다.
   
   ## 🎯 변경 이유
   사용자가 회원가입을 할 수 없어 서비스 사용에 문제가 발생했습니다. (#123)
   
   ## 🔍 변경 내용 상세
   
   ### 주요 변경 사항
   - Prisma 클라이언트 로드 문제 해결
   - 에러 핸들링 개선
   - JSON 파싱 오류 처리 추가
   
   ### 코드 변경 사항
   - `app/api/auth/register/route.ts`: 에러 핸들링 개선
   - `lib/auth.ts`: 세션 생성 함수 에러 처리 추가
   
   ## 🧪 테스트 방법
   
   ### 테스트 시나리오
   1. /auth/register 페이지 접속
   2. 유효한 이메일, 이름, 비밀번호 입력
   3. "회원가입" 버튼 클릭
   4. 회원가입 성공 및 메인 페이지 리다이렉트 확인
   5. 로그인 테스트
   
   ### 테스트 결과
   - ✅ 회원가입 정상 동작
   - ✅ 에러 메시지 개선
   - ✅ 로그인 정상 동작
   
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
   Fixes #123
   ```
5. 리뷰어 할당 (자기 자신 또는 다른 개발자)
6. 라벨 추가: `bug`, `priority: high`
7. PR 생성

### 6단계: 코드 리뷰

**리뷰어가:**
1. 코드 확인
2. 코멘트 작성 (필요한 경우):
   ```
   좋은 수정입니다! 다만 에러 로깅을 더 상세하게 하는 것이 좋을 것 같습니다.
   ```
3. 승인 또는 수정 요청

### 7단계: 수정 (필요한 경우)

```bash
# 리뷰 피드백 반영
# 에러 로깅 개선

git add app/api/auth/register/route.ts
git commit -m "refactor(auth): 에러 로깅 개선

리뷰 피드백 반영
- 더 상세한 에러 로깅 추가
- 스택 트레이스 포함

Refs #123"

git push origin fix/register-500-error
# PR이 자동으로 업데이트됨
```

### 8단계: 머지

1. 리뷰 승인
2. "Squash and Merge" 선택
3. 머지 메시지 확인:
   ```
   fix(auth): 회원가입 시 500 에러 수정
   
   Fixes #123
   ```
4. 머지 완료
5. 브랜치 자동 삭제
6. 이슈 #123 자동 종료

### 9단계: 정리

```bash
# 로컬 브랜치 삭제
git checkout develop
git pull origin develop
git branch -d fix/register-500-error
```

---

## 📋 시나리오 2: 기능 제안 → 논의 → 구현

### 상황
"글 상세 페이지에 목차 기능을 추가하고 싶다"는 제안이 있습니다.

### 1단계: 이슈 생성 및 논의

**GitHub에서:**
1. "New Issue" 클릭
2. "Feature Request" 템플릿 선택
3. 제목: `[FEATURE] 글 상세 페이지에 목차 기능 추가`
4. 내용 작성:
   ```markdown
   ## 🎯 기능 제안
   글 상세 페이지에 목차(Table of Contents) 기능 추가
   
   ## 💡 문제점
   긴 글을 읽을 때 원하는 섹션으로 바로 이동하기 어렵습니다.
   특히 기술 문서나 긴 가이드 글에서 불편함을 느낍니다.
   
   ## ✨ 제안하는 해결책
   마크다운 헤딩(#, ##, ###)을 기반으로 목차를 자동 생성하고,
   클릭 시 해당 섹션으로 부드럽게 스크롤되도록 합니다.
   
   ## 🎨 UI/UX 제안
   - 왼쪽 사이드바에 고정
   - 현재 읽고 있는 섹션 하이라이트
   - 스크롤에 따라 자동 업데이트
   - 모바일에서는 접을 수 있는 형태
   
   ## 📋 구현 세부사항
   
   ### 필요한 작업
   - [ ] 마크다운 헤딩 파싱 로직
   - [ ] TableOfContents 컴포넌트 생성
   - [ ] 스크롤 이벤트 처리
   - [ ] 현재 섹션 감지 로직
   - [ ] 반응형 디자인
   
   ### 기술적 고려사항
   - 마크다운 파싱은 `marked` 라이브러리 활용
   - Intersection Observer API로 현재 섹션 감지
   - 성능 최적화를 위한 메모이제이션
   ```
5. 라벨 추가: `feature`, `enhancement`, `priority: medium`
6. 이슈 생성 → 이슈 번호: #456

### 2단계: 논의

**이슈 댓글로 논의:**
```
개발자 A: 좋은 아이디어네요! 구현 방법에 대해 몇 가지 제안이 있습니다.
- 목차는 고정 사이드바보다는 스크롤 가능한 형태가 좋을 것 같습니다.
- 헤딩 레벨은 H2, H3만 표시하는 것이 좋을 것 같습니다.

개발자 B: 동의합니다. 또한 접근성을 위해 키보드 네비게이션도 지원하면 좋겠습니다.
```

**이슈 업데이트:**
- 댓글 내용을 반영하여 이슈 내용 수정
- 구현 계획 업데이트

### 3단계: 작업 시작

```bash
# develop 브랜치로 이동 및 최신화
git checkout develop
git pull origin develop

# 기능 브랜치 생성
git checkout -b feature/add-table-of-contents
```

### 4단계: 단계별 개발 및 커밋

```bash
# 1단계: 컴포넌트 생성
# components/TableOfContents.tsx 파일 생성

git add components/TableOfContents.tsx
git commit -m "feat(ui): TableOfContents 컴포넌트 추가

마크다운 헤딩을 기반으로 목차 생성
- 헤딩 파싱 로직 구현
- 목차 아이템 렌더링
- 클릭 이벤트 처리
- Intersection Observer로 현재 섹션 감지

Refs #456"

# 2단계: 페이지에 통합
# app/articles/[slug]/page.tsx 파일 수정

git add app/articles/[slug]/page.tsx
git commit -m "feat(article): 글 상세 페이지에 목차 통합

TableOfContents 컴포넌트를 글 상세 페이지에 추가
- 마크다운 콘텐츠에서 헤딩 추출
- 목차 컴포넌트 렌더링
- 스크롤 이벤트로 현재 섹션 하이라이트

Refs #456"

# 3단계: 스타일 추가
# app/globals.css 파일 수정

git add app/globals.css
git commit -m "style(ui): 목차 스타일 추가

반응형 디자인 및 애니메이션 적용
- 사이드바 고정 스타일
- 현재 섹션 하이라이트 효과
- 모바일 반응형 디자인
- 부드러운 스크롤 애니메이션

Refs #456"

# 4단계: 접근성 개선
# 키보드 네비게이션 추가

git add components/TableOfContents.tsx
git commit -m "feat(ui): 목차에 키보드 네비게이션 추가

접근성 개선
- Tab 키로 목차 아이템 포커스
- Enter 키로 섹션 이동
- 화살표 키로 목차 아이템 간 이동

Refs #456"
```

### 5단계: PR 생성

```bash
# 브랜치 푸시
git push origin feature/add-table-of-contents
```

**GitHub에서:**
1. "New Pull Request" 클릭
2. Base: `develop` ← Compare: `feature/add-table-of-contents`
3. PR 제목: `feat(article): 글 상세 페이지에 목차 기능 추가`
4. PR 설명 작성:
   ```markdown
   ## 📋 변경 사항 요약
   글 상세 페이지에 목차(Table of Contents) 기능을 추가했습니다.
   
   ## 🎯 변경 이유
   긴 글을 읽을 때 원하는 섹션으로 바로 이동할 수 있도록 목차 기능이 필요했습니다. (#456)
   
   ## 🔍 변경 내용 상세
   
   ### 주요 변경 사항
   - TableOfContents 컴포넌트 추가
   - 글 상세 페이지에 목차 통합
   - 스크롤 기반 현재 섹션 하이라이트
   - 반응형 디자인 적용
   - 키보드 네비게이션 지원
   
   ### 코드 변경 사항
   - `components/TableOfContents.tsx`: 목차 컴포넌트 구현 (신규)
   - `app/articles/[slug]/page.tsx`: 목차 통합
   - `app/globals.css`: 목차 스타일 추가
   
   ## 🧪 테스트 방법
   
   ### 테스트 시나리오
   1. 글 상세 페이지 접속 (헤딩이 있는 글)
   2. 목차가 올바르게 생성되는지 확인
   3. 목차 아이템 클릭 시 해당 섹션으로 스크롤되는지 확인
   4. 스크롤 시 현재 섹션이 하이라이트되는지 확인
   5. 키보드로 목차 네비게이션 테스트
   6. 모바일에서도 정상 동작하는지 확인
   
   ### 테스트 결과
   - ✅ 목차가 올바르게 생성됨
   - ✅ 클릭 시 해당 섹션으로 스크롤
   - ✅ 현재 섹션 하이라이트 동작
   - ✅ 키보드 네비게이션 동작
   - ✅ 모바일 반응형 디자인 동작
   
   ### 스크린샷
   [데스크톱 스크린샷]
   [모바일 스크린샷]
   
   ## ✅ 체크리스트
   - [x] 코드가 프로젝트의 코딩 스타일을 따름
   - [x] 필요한 테스트를 추가하거나 수정함
   - [x] 문서를 업데이트함 (필요한 경우)
   - [x] 커밋 메시지가 컨벤션을 따름
   - [x] 브랜치가 최신 develop 브랜치와 동기화됨
   - [x] 린트 오류가 없음
   - [x] 빌드가 성공적으로 완료됨
   - [x] 관련 이슈를 참조함
   - [x] 접근성 고려 (키보드 네비게이션)
   - [x] 반응형 디자인 적용
   
   ## 🔗 관련 이슈
   Closes #456
   
   ## 📝 추가 정보
   - 이슈 #456에서 논의된 내용을 반영했습니다.
   - 키보드 네비게이션은 접근성 개선을 위해 추가했습니다.
   ```
5. 리뷰어 할당
6. 라벨 추가: `feature`, `enhancement`
7. PR 생성

### 6단계: 코드 리뷰 및 수정

**리뷰어 코멘트:**
```
좋은 구현입니다! 몇 가지 제안이 있습니다:

1. 목차 컴포넌트의 타입 정의를 더 명확하게 하는 것이 좋을 것 같습니다.
2. Intersection Observer의 옵션을 조정하여 성능을 개선할 수 있을 것 같습니다.
```

**수정:**
```bash
# 리뷰 피드백 반영
git add components/TableOfContents.tsx
git commit -m "refactor(ui): TableOfContents 컴포넌트 개선

리뷰 피드백 반영
- 타입 정의 개선
- Intersection Observer 옵션 최적화
- 성능 개선

Refs #456"

git push origin feature/add-table-of-contents
```

### 7단계: 머지

1. 리뷰 승인
2. "Squash and Merge" 선택
3. 머지 메시지 확인
4. 머지 완료
5. 브랜치 삭제
6. 이슈 #456 자동 종료

---

## 📋 시나리오 3: 긴급 핫픽스

### 상황
프로덕션에서 보안 취약점이 발견되었습니다.

### 1단계: 이슈 생성 (긴급)

**GitHub에서:**
1. "New Issue" 클릭
2. "Bug Report" 템플릿 선택
3. 제목: `[BUG] [CRITICAL] 보안 취약점: 비밀번호 평문 저장`
4. 라벨: `bug`, `priority: critical`, `security`
5. 이슈 생성 → 이슈 번호: #789

### 2단계: 긴급 브랜치 생성

```bash
# main 브랜치에서 직접 브랜치 생성 (긴급)
git checkout main
git pull origin main
git checkout -b fix/security-password-plaintext
```

### 3단계: 긴급 수정

```bash
# 보안 취약점 수정
# 비밀번호 해싱 로직 추가

git add lib/auth.ts
git commit -m "fix(security): 비밀번호 평문 저장 취약점 수정

긴급 보안 패치
- 비밀번호 bcrypt 해싱 적용
- 기존 평문 비밀번호 마이그레이션 스크립트 추가

Fixes #789"
```

### 4단계: 긴급 PR 생성

**GitHub에서:**
1. "New Pull Request" 클릭
2. Base: `main` ← Compare: `fix/security-password-plaintext`
3. PR 제목: `fix(security): 비밀번호 평문 저장 취약점 수정 [HOTFIX]`
4. 라벨: `bug`, `priority: critical`, `security`
5. 리뷰어에게 긴급 리뷰 요청
6. PR 생성

### 5단계: 빠른 리뷰 및 머지

- 리뷰어가 빠르게 확인
- 승인 후 즉시 머지
- `main`에 배포

### 6단계: develop에도 머지

```bash
# develop에도 머지 (충돌 해결)
git checkout develop
git pull origin develop
git merge main
# 충돌 해결 (있는 경우)
git push origin develop
```

---

## 📋 시나리오 4: 리팩토링

### 상황
API 에러 핸들링이 일관되지 않아 개선이 필요합니다.

### 1단계: 이슈 생성

**GitHub에서:**
1. "New Issue" 클릭
2. "Improvement" 템플릿 선택
3. 제목: `[IMPROVEMENT] API 에러 핸들링 통합`
4. 내용:
   ```markdown
   ## 🔧 개선 제안
   모든 API 라우트에서 일관된 에러 핸들링 적용
   
   ## 📍 현재 상태
   각 API 라우트마다 에러 핸들링 방식이 다릅니다.
   - 일부는 try-catch 사용
   - 일부는 에러 메시지 형식이 다름
   - 개발 환경 에러 표시가 일관되지 않음
   
   ## 🎯 개선 목표
   - 공통 에러 핸들링 함수 생성
   - 일관된 에러 응답 형식
   - 개발 환경에서 상세 에러 메시지 표시
   ```
5. 라벨: `enhancement`, `refactor`, `priority: low`
6. 이슈 생성 → 이슈 번호: #101

### 2단계: 브랜치 생성

```bash
git checkout develop
git pull origin develop
git checkout -b refactor/api-error-handling
```

### 3단계: 리팩토링 작업

```bash
# 1. 공통 에러 핸들링 함수 생성
git add lib/api-error-handler.ts
git commit -m "refactor(api): 공통 에러 핸들링 함수 추가

모든 API 라우트에서 사용할 수 있는 공통 에러 핸들링 함수 생성
- 일관된 에러 응답 형식
- 개발 환경에서 상세 에러 메시지 표시
- 에러 타입 정의

Refs #101"

# 2. 각 API 라우트에 적용
git add app/api/articles/route.ts
git commit -m "refactor(api): articles API에 공통 에러 핸들링 적용

Refs #101"

git add app/api/auth/register/route.ts
git commit -m "refactor(api): auth API에 공통 에러 핸들링 적용

Refs #101"

# ... 다른 API 라우트들도 동일하게
```

### 4단계: PR 생성

```bash
git push origin refactor/api-error-handling
```

**PR 설명:**
```markdown
## 📋 변경 사항 요약
모든 API 라우트에서 일관된 에러 핸들링을 적용했습니다.

## 🎯 변경 이유
각 API 라우트마다 에러 핸들링 방식이 달라 유지보수가 어려웠습니다. (#101)

## 🔍 변경 내용 상세

### 주요 변경 사항
- 공통 에러 핸들링 함수 생성
- 모든 API 라우트에 적용
- 일관된 에러 응답 형식
- 개발 환경에서 상세 에러 메시지 표시

### 코드 변경 사항
- `lib/api-error-handler.ts`: 공통 에러 핸들링 함수 (신규)
- `app/api/**/*.ts`: 모든 API 라우트에 적용

## 🧪 테스트 방법

### 테스트 시나리오
1. 각 API 엔드포인트에서 에러 발생 시나리오 테스트
2. 에러 응답 형식이 일관된지 확인
3. 개발 환경에서 상세 에러 메시지 표시 확인

## ✅ 체크리스트
- [x] 기능 변경 없음 (리팩토링만)
- [x] 모든 API 라우트에 적용
- [x] 기존 기능 정상 동작 확인
- [x] 에러 응답 형식 일관성 확인

## 🔗 관련 이슈
Refs #101
```

---

## 📊 워크플로우 요약

### 일반적인 워크플로우

```
[이슈 생성] (#123)
    ↓
[브랜치 생성] (feature/fix/refactor)
    ↓
[작업 및 커밋] (커밋 컨벤션 준수, Refs #123)
    ↓
[PR 생성] (이슈 연결, Closes #123)
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

### 커밋 메시지 패턴

```bash
# 이슈 참조 (종료하지 않음)
git commit -m "feat: 기능 추가

Refs #123"

# 이슈 종료
git commit -m "fix: 버그 수정

Fixes #123"

# 여러 이슈 참조
git commit -m "feat: 기능 추가

Closes #123
Refs #456"
```

### PR 설명 패턴

```markdown
## 🔗 관련 이슈
Closes #123        # 이슈를 종료
Fixes #456         # 버그 이슈 종료
Refs #789          # 관련 이슈 참조 (종료하지 않음)
```

---

이 가이드를 따라하면 현업 수준의 GitHub 워크플로우를 유지할 수 있습니다! 🚀

