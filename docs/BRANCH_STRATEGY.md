# 브랜치 전략 가이드

프론트위키 프로젝트에서 사용하는 브랜치 전략을 상세히 설명합니다.

## 🌳 브랜치 구조

```
main (프로덕션 - 보호됨)
  │
  └── develop (개발 통합)
        │
        ├── feature/기능명 (기능 개발)
        ├── fix/버그명 (버그 수정)
        ├── refactor/리팩토링명 (코드 개선)
        ├── docs/문서명 (문서 수정)
        └── chore/작업명 (설정/빌드)
```

## 📍 브랜치별 상세 설명

### main 브랜치

**용도:**
- 프로덕션 배포 가능한 안정적인 코드
- 항상 배포 가능한 상태 유지

**보호 규칙:**
- ✅ 직접 푸시 금지 (PR 통해서만)
- ✅ 최소 1명의 승인 필요
- ✅ CI 통과 필수
- ✅ 최신 `develop`과의 충돌 없음 필수

**머지 규칙:**
- `develop`에서만 머지 가능
- 릴리스 준비가 완료된 경우만
- 태그를 통한 버전 관리

**예시:**
```bash
# main 브랜치로 직접 작업하지 않음
# develop에서 PR을 통해만 머지
```

### develop 브랜치

**용도:**
- 개발 중인 기능들이 통합되는 브랜치
- 다음 릴리스를 위한 통합 브랜치

**작업 흐름:**
1. 모든 기능 브랜치는 `develop`에서 생성
2. 완성된 기능은 `develop`으로 머지
3. 테스트 완료 후 `main`으로 머지

**예시:**
```bash
# develop 브랜치 생성 (처음 한 번만)
git checkout -b develop
git push -u origin develop

# 작업 시작 전 항상 최신화
git checkout develop
git pull origin develop
```

### feature/기능명 브랜치

**생성 시점:**
- 새로운 기능을 추가할 때
- 이슈가 생성되고 작업을 시작할 때
- 기능 제안이 승인된 후

**네이밍 규칙:**
```
feature/add-table-of-contents
feature/user-profile-page
feature/comment-system
feature/s3-image-upload
```

**생명주기:**
```bash
# 1. develop에서 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/add-table-of-contents

# 2. 작업 및 커밋
git commit -m "feat(article): 목차 기능 추가"

# 3. develop으로 PR 생성
git push origin feature/add-table-of-contents
# GitHub에서 PR 생성: feature/add-table-of-contents → develop

# 4. 머지 후 브랜치 삭제
# GitHub에서 머지 후 자동 삭제 또는
git branch -d feature/add-table-of-contents
```

**예시 시나리오:**
```bash
# 이슈 #123: "목차 기능 추가" 생성 후

git checkout develop
git pull origin develop
git checkout -b feature/add-table-of-contents

# 작업...
git add .
git commit -m "feat(article): 목차 기능 추가

Refs #123"

git push origin feature/add-table-of-contents
# PR 생성: feature/add-table-of-contents → develop
```

### fix/버그명 브랜치

**생성 시점:**
- 버그 이슈가 생성되고 수정을 시작할 때
- 긴급한 핫픽스가 필요할 때

**네이밍 규칙:**
```
fix/login-500-error
fix/article-slug-duplicate
fix/diagram-drag-issue
fix/register-validation
```

**생명주기:**
```bash
# 1. develop에서 브랜치 생성 (일반 버그)
git checkout develop
git pull origin develop
git checkout -b fix/login-500-error

# 또는 main에서 생성 (긴급 핫픽스)
git checkout main
git pull origin main
git checkout -b fix/critical-security-issue

# 2. 버그 수정 및 커밋
git commit -m "fix(auth): 로그인 500 에러 수정

Fixes #456"

# 3. 해당 브랜치로 PR 생성
git push origin fix/login-500-error
# GitHub에서 PR 생성: fix/login-500-error → develop (또는 main)
```

**예시 시나리오:**
```bash
# 이슈 #456: "로그인 시 500 에러" 생성 후

git checkout develop
git pull origin develop
git checkout -b fix/login-500-error

# 버그 수정...
git add .
git commit -m "fix(auth): 로그인 500 에러 수정

Prisma 클라이언트 로드 문제 해결

Fixes #456"

git push origin fix/login-500-error
# PR 생성: fix/login-500-error → develop
```

### refactor/리팩토링명 브랜치

**생성 시점:**
- 코드 개선이 필요할 때
- 성능 최적화
- 구조 개선
- 기능 변경 없이 코드만 개선

**네이밍 규칙:**
```
refactor/auth-module
refactor/api-error-handling
refactor/component-structure
refactor/database-queries
```

**예시:**
```bash
git checkout develop
git pull origin develop
git checkout -b refactor/api-error-handling

# 리팩토링 작업...
git commit -m "refactor(api): 에러 핸들링 통합

모든 API 라우트에서 일관된 에러 핸들링 적용

Refs #789"

git push origin refactor/api-error-handling
```

### docs/문서명 브랜치

**생성 시점:**
- README, 가이드 문서 수정 시
- API 문서 추가/수정 시

**네이밍 규칙:**
```
docs/update-installation-guide
docs/add-api-documentation
docs/update-contributing-guide
```

**예시:**
```bash
git checkout develop
git pull origin develop
git checkout -b docs/update-installation-guide

# 문서 수정...
git commit -m "docs(readme): 설치 가이드 업데이트

환경 변수 설정 방법을 더 자세히 설명"

git push origin docs/update-installation-guide
```

### chore/작업명 브랜치

**생성 시점:**
- 빌드 설정 변경
- 의존성 업데이트
- CI/CD 설정 변경

**네이밍 규칙:**
```
chore/update-dependencies
chore/setup-ci-cd
chore/update-gitignore
```

**예시:**
```bash
git checkout develop
git pull origin develop
git checkout -b chore/update-dependencies

# 의존성 업데이트...
git commit -m "chore: 의존성 업데이트

- Next.js 16.0.3 → 16.0.4
- React 19.2.0 → 19.2.1"

git push origin chore/update-dependencies
```

## 🔄 브랜치 작업 흐름

### 일반적인 워크플로우

```
1. 이슈 생성 (#123)
   ↓
2. develop에서 브랜치 생성
   git checkout -b feature/add-feature
   ↓
3. 작업 및 커밋
   git commit -m "feat: 기능 추가

   Refs #123"
   ↓
4. 푸시 및 PR 생성
   git push origin feature/add-feature
   PR: feature/add-feature → develop
   ↓
5. 코드 리뷰
   ↓
6. 머지
   ↓
7. 브랜치 삭제
   ↓
8. 이슈 종료 (Closes #123)
```

### 긴급 핫픽스 워크플로우

```
1. 버그 발견 및 이슈 생성 (#456)
   ↓
2. main에서 브랜치 생성 (긴급)
   git checkout main
   git checkout -b fix/critical-bug
   ↓
3. 버그 수정 및 커밋
   git commit -m "fix: 긴급 버그 수정

   Fixes #456"
   ↓
4. 푸시 및 PR 생성
   git push origin fix/critical-bug
   PR: fix/critical-bug → main
   ↓
5. 빠른 리뷰 및 머지
   ↓
6. develop에도 머지 (충돌 해결)
   git checkout develop
   git merge main
   ↓
7. 브랜치 삭제
   ↓
8. 이슈 종료
```

## 📝 브랜치 네이밍 체크리스트

- [ ] 브랜치 타입이 명확함 (`feature/`, `fix/`, `refactor/` 등)
- [ ] 브랜치 이름이 설명적임
- [ ] 소문자와 하이픈(-)만 사용
- [ ] 이슈 번호 포함 (선택사항)
- [ ] 너무 길지 않음 (50자 이내)

## 🚫 하지 말아야 할 것

### ❌ 나쁜 브랜치 이름
```bash
# 너무 모호함
git checkout -b update
git checkout -b fix
git checkout -b new-feature

# 대문자 사용
git checkout -b Feature/AddTable
git checkout -b FIX/Bug

# 언더스코어 사용 (하이픈 권장)
git checkout -b feature_add_table

# 너무 길음
git checkout -b feature/add-table-of-contents-to-article-detail-page-for-better-navigation
```

### ✅ 좋은 브랜치 이름
```bash
# 명확하고 설명적
git checkout -b feature/add-table-of-contents
git checkout -b fix/login-500-error
git checkout -b refactor/api-error-handling
git checkout -b docs/update-installation-guide
```

## 🔀 브랜치 머지 전략

### 1. Squash and Merge (권장)
- 여러 커밋을 하나로 합침
- 깔끔한 히스토리 유지
- 작은 기능/버그 수정에 적합

**사용 시점:**
- 기능 개발 완료
- 버그 수정 완료
- 작은 리팩토링

### 2. Merge Commit
- 모든 커밋 히스토리 보존
- 큰 기능 개발에 적합

**사용 시점:**
- 큰 기능 개발 (여러 단계)
- 중요한 변경사항

### 3. Rebase and Merge
- 선형 히스토리 유지
- 개인 프로젝트에 적합

**사용 시점:**
- 개인 프로젝트
- 작은 변경사항

## 🧹 브랜치 정리

### 로컬 브랜치 삭제
```bash
# 머지된 브랜치 삭제
git branch -d feature/add-table-of-contents

# 강제 삭제 (머지 안 된 경우)
git branch -D feature/add-table-of-contents
```

### 원격 브랜치 삭제
```bash
# 원격 브랜치 삭제
git push origin --delete feature/add-table-of-contents

# 또는
git push origin :feature/add-table-of-contents
```

### 모든 머지된 브랜치 정리
```bash
# 로컬에서 머지된 브랜치 삭제
git branch --merged | grep -v "\*\|main\|develop" | xargs -n 1 git branch -d

# 원격에서 삭제된 브랜치 추적 제거
git remote prune origin
```

---

이 가이드를 따라하면 체계적인 브랜치 관리가 가능합니다! 🌿

