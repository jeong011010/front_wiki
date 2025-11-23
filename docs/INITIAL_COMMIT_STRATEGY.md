# 초기 커밋 전략

현재 프로젝트 상태를 현업 방식에 맞춰 단계별로 커밋하는 전략입니다.

## 🎯 전략

### 옵션 1: 초기 커밋 + 이후 이슈 기반 (권장)
**장점**: 실용적이고 빠름  
**단점**: 초기 커밋이 큼

1. **초기 커밋**: 프로젝트 기본 설정만
   - Next.js 프로젝트 셋업
   - 기본 의존성 설치
   - 기본 폴더 구조

2. **이후부터**: 이슈 기반으로 작업
   - 각 기능별로 이슈 생성
   - PR로 머지

### 옵션 2: 논리적 단위로 분리 (가장 현업스럽지만 복잡)
**장점**: 가장 현업스럽고 히스토리가 깔끔함  
**단점**: 시간이 오래 걸림

1. **프로젝트 셋업** (이슈 #1)
2. **데이터베이스 스키마** (이슈 #2)
3. **기본 UI 컴포넌트** (이슈 #3)
4. **글 CRUD API** (이슈 #4)
5. **자동 하이퍼링크 기능** (이슈 #5)
6. **지식 그래프 다이어그램** (이슈 #6)
7. **마크다운 에디터** (이슈 #7)
8. **회원 시스템** (이슈 #8)
9. **SEO 최적화** (이슈 #9)
10. **검색 기능** (이슈 #10)
11. **GitHub 워크플로우 문서** (이슈 #11)

## 💡 추천 방법

**옵션 1을 추천합니다.** 이유:
- 이미 많은 기능이 구현되어 있음
- 초기 커밋을 너무 세분화하면 오히려 복잡함
- 이후부터 이슈 기반으로 작업하면 충분히 현업스러움

## 📋 실행 계획 (옵션 1)

### 1단계: 초기 커밋
```bash
# 프로젝트 기본 설정만 커밋
git add package.json package-lock.json
git add next.config.ts tsconfig.json
git add .gitignore
git add eslint.config.mjs postcss.config.mjs
git commit -m "chore: 프로젝트 초기 설정

- Next.js 16 프로젝트 셋업
- TypeScript 설정
- ESLint, PostCSS 설정
- 기본 의존성 설치"
```

### 2단계: 데이터베이스 스키마
```bash
git add prisma/
git commit -m "feat(db): 데이터베이스 스키마 정의

- Prisma 스키마 설정
- User, Article, ArticleLink 모델 정의
- 초기 마이그레이션"
```

### 3단계: 기본 UI 구조
```bash
git add app/layout.tsx
git add app/globals.css
git add app/page.tsx
git add components/
git commit -m "feat(ui): 기본 UI 구조 및 스타일 설정

- 글로벌 레이아웃 및 스타일
- 메인 페이지 구조
- 기본 컴포넌트"
```

### 4단계: 이후부터는 이슈 기반
각 기능별로 이슈 생성하고 PR로 처리

## 🚀 빠른 시작 (옵션 1)

```bash
# 1. 초기 커밋
git add package.json package-lock.json next.config.ts tsconfig.json .gitignore eslint.config.mjs postcss.config.mjs
git commit -m "chore: 프로젝트 초기 설정"

# 2. 나머지 한 번에 커밋 (초기 설정)
git add .
git commit -m "feat: 프론트위키 초기 구현

- 데이터베이스 스키마 및 마이그레이션
- 기본 UI 구조 및 스타일
- 글 CRUD 기능
- 자동 하이퍼링크 기능
- 지식 그래프 다이어그램
- 마크다운 에디터
- 회원 시스템 및 인증
- SEO 최적화
- 검색 기능
- GitHub 워크플로우 문서"

# 3. GitHub 저장소 생성 후 푸시
git remote add origin https://github.com/yourusername/kimjazz_blog.git
git push -u origin main

# 4. develop 브랜치 생성
git checkout -b develop
git push -u origin develop

# 5. 이후부터는 이슈 기반으로 작업
```

