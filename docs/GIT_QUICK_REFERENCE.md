# GitHub 워크플로우 빠른 참조

실무에서 자주 사용하는 명령어와 패턴을 빠르게 참조할 수 있는 가이드입니다.

## 🚀 빠른 시작

### 초기 설정

```bash
# develop 브랜치 생성 (처음 한 번만)
git checkout -b develop
git push -u origin develop
```

### 작업 시작

```bash
# 1. develop 최신화
git checkout develop
git pull origin develop

# 2. 브랜치 생성
git checkout -b feature/기능명
# 또는
git checkout -b fix/버그명
git checkout -b refactor/리팩토링명
```

## 📝 커밋 메시지 템플릿

### 기능 추가
```bash
git commit -m "feat(scope): 기능 설명

상세 설명 (선택사항)

Closes #123"
```

### 버그 수정
```bash
git commit -m "fix(scope): 버그 설명

수정 내용 설명

Fixes #123"
```

### 리팩토링
```bash
git commit -m "refactor(scope): 리팩토링 설명

개선 내용 설명

Refs #123"
```

## 🌿 브랜치 네이밍

| 타입 | 형식 | 예시 |
|------|------|------|
| 기능 | `feature/기능명` | `feature/add-table-of-contents` |
| 버그 | `fix/버그명` | `fix/login-500-error` |
| 리팩토링 | `refactor/리팩토링명` | `refactor/api-error-handling` |
| 문서 | `docs/문서명` | `docs/update-readme` |
| 설정 | `chore/작업명` | `chore/update-dependencies` |

## 🔄 일반적인 워크플로우

```bash
# 1. 이슈 확인 및 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/add-feature

# 2. 작업 및 커밋
git add .
git commit -m "feat: 기능 추가

Refs #123"

# 3. 푸시 및 PR 생성
git push origin feature/add-feature
# GitHub에서 PR 생성

# 4. 머지 후 정리
git checkout develop
git pull origin develop
git branch -d feature/add-feature
```

## 🐛 이슈 관리

### 이슈 생성 시점
- ✅ 버그 발견 시 즉시 생성
- ✅ 기능 제안 시 논의 전 생성
- ✅ 작업 시작 전 계획 수립

### 이슈 라벨
- `bug`: 버그
- `feature`: 새 기능
- `enhancement`: 개선
- `priority: critical/high/medium/low`: 우선순위

### 이슈 해결
- 커밋 메시지에 `Fixes #123` 또는 `Closes #123` 포함
- PR 설명에 `Closes #123` 포함
- 머지 시 자동 종료

## 🔀 Pull Request

### PR 생성 전
- [ ] 코드 스타일 준수
- [ ] 테스트 완료
- [ ] 문서 업데이트 (필요 시)
- [ ] 커밋 컨벤션 준수
- [ ] develop과 동기화
- [ ] 린트 통과
- [ ] 빌드 성공

### PR 제목 형식
```
<type>(<scope>): <subject>
```

### PR 설명 필수 항목
- 변경 사항 요약
- 변경 이유
- 테스트 방법
- 관련 이슈

## 📚 상세 가이드

- **[GitHub 워크플로우 완전 가이드](GIT_WORKFLOW.md)**: 전체 프로세스 상세 설명
- **[커밋 메시지 예시](COMMIT_EXAMPLES.md)**: 실제 사용 가능한 예시 모음
- **[브랜치 전략 가이드](BRANCH_STRATEGY.md)**: 브랜치 관리 전략
- **[실전 예시](PRACTICAL_EXAMPLES.md)**: 구체적인 시나리오 예시

---

**💡 팁**: 처음에는 가이드를 참고하면서 작업하고, 익숙해지면 이 빠른 참조만으로도 충분합니다!

