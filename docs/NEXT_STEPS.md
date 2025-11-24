# 다음 단계 가이드

초기 커밋이 완료되었습니다! 이제 GitHub에 푸시하고 워크플로우를 시작할 수 있습니다.

## 📋 다음 단계

### 1. GitHub 저장소 생성

1. GitHub에 로그인
2. 우측 상단 "+" 버튼 클릭 → "New repository"
3. 저장소 정보 입력:
   - **Repository name**: `kimjazz_blog` (또는 원하는 이름)
   - **Description**: "프론트엔드와 클라우드 개발 지식 공유 위키 플랫폼"
   - **Visibility**: Public 또는 Private 선택
   - **⚠️ 중요**: "Initialize this repository with a README" 체크하지 않기 (이미 README가 있음)
4. "Create repository" 클릭

### 2. 원격 저장소 연결 및 푸시

GitHub에서 저장소를 생성하면 표시되는 URL을 사용합니다:

```bash
# 원격 저장소 추가 (yourusername을 실제 GitHub 사용자명으로 변경)
git remote add origin https://github.com/yourusername/kimjazz_blog.git

# 또는 SSH 사용 시
git remote add origin git@github.com:yourusername/kimjazz_blog.git

# main 브랜치 푸시
git push -u origin main
```

### 3. develop 브랜치 생성

```bash
# develop 브랜치 생성 및 전환
git checkout -b develop

# develop 브랜치 푸시
git push -u origin develop
```

### 4. 브랜치 보호 규칙 설정 (선택사항)

GitHub 저장소에서:
1. Settings → Branches
2. "Add rule" 클릭
3. Branch name pattern: `main`
4. 다음 옵션 체크:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1 (또는 0)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
5. "Create" 클릭

### 5. 첫 이슈 생성

이제 이슈 기반으로 작업을 시작할 수 있습니다!

**추천 첫 이슈들:**

1. **목차 기능 추가**
   - 제목: `[FEATURE] 글 상세 페이지에 목차 기능 추가`
   - 템플릿: Feature Request
   - 라벨: `feature`, `enhancement`

2. **S3 이미지 업로드 연동**
   - 제목: `[FEATURE] 이미지 업로드 S3 연동`
   - 템플릿: Feature Request
   - 라벨: `feature`, `enhancement`

3. **테스트 코드 추가**
   - 제목: `[FEATURE] 테스트 코드 추가`
   - 템플릿: Feature Request
   - 라벨: `feature`, `testing`

## 🎯 이슈 기반 작업 흐름

### 예시: "목차 기능 추가" 이슈 (#1)

```bash
# 1. 이슈 확인 (#1)
# 2. develop 브랜치에서 기능 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/add-table-of-contents

# 3. 작업 및 커밋
git add components/TableOfContents.tsx
git commit -m "feat(article): 목차 컴포넌트 추가

마크다운 헤딩을 기반으로 목차 생성

Refs #1"

# 4. 푸시 및 PR 생성
git push origin feature/add-table-of-contents
# GitHub에서 PR 생성: feature/add-table-of-contents → develop
# PR 설명에 "Closes #1" 포함
```

## ✅ 체크리스트

- [ ] GitHub 저장소 생성 완료
- [ ] 원격 저장소 연결 완료
- [ ] main 브랜치 푸시 완료
- [ ] develop 브랜치 생성 및 푸시 완료
- [ ] 브랜치 보호 규칙 설정 (선택사항)
- [ ] 첫 이슈 생성

## 📚 참고 문서

- [GitHub 워크플로우 가이드](GIT_WORKFLOW.md)
- [커밋 메시지 예시](COMMIT_EXAMPLES.md)
- [브랜치 전략 가이드](BRANCH_STRATEGY.md)
- [실전 예시](PRACTICAL_EXAMPLES.md)

---

**축하합니다!** 이제 현업 수준의 GitHub 워크플로우를 시작할 준비가 되었습니다! 🚀

