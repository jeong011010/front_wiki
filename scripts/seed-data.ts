import { PrismaClient } from '@prisma/client'
import { slugify } from '../lib/utils'

const prisma = new PrismaClient()

// 카테고리 데이터
const categories = [
  {
    name: '프론트엔드 기초',
    slug: 'frontend-basics',
    description: 'HTML, CSS, JavaScript 등 프론트엔드 개발의 기초 지식',
    order: 1,
  },
  {
    name: 'React',
    slug: 'react',
    description: 'React 라이브러리와 관련된 모든 내용',
    order: 2,
  },
  {
    name: 'Next.js',
    slug: 'nextjs',
    description: 'Next.js 프레임워크와 서버 사이드 렌더링',
    order: 3,
  },
  {
    name: 'TypeScript',
    slug: 'typescript',
    description: 'TypeScript 언어와 타입 시스템',
    order: 4,
  },
  {
    name: '상태 관리',
    slug: 'state-management',
    description: 'Redux, Zustand, Jotai 등 상태 관리 라이브러리',
    order: 5,
  },
  {
    name: '스타일링',
    slug: 'styling',
    description: 'CSS-in-JS, Tailwind CSS, Styled Components 등',
    order: 6,
  },
  {
    name: '성능 최적화',
    slug: 'performance',
    description: '번들 최적화, 코드 스플리팅, 렌더링 최적화',
    order: 7,
  },
  {
    name: '테스팅',
    slug: 'testing',
    description: 'Jest, React Testing Library, E2E 테스팅',
    order: 8,
  },
]

// 예시 글 데이터
const articles = [
  {
    title: 'React란 무엇인가?',
    content: `# React란 무엇인가?

React는 사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리입니다.

## 주요 특징

### 1. 컴포넌트 기반
React는 재사용 가능한 컴포넌트를 통해 UI를 구성합니다.

### 2. 가상 DOM
React는 가상 DOM을 사용하여 성능을 최적화합니다.

### 3. 단방향 데이터 흐름
데이터는 부모에서 자식으로 단방향으로 흐릅니다.

## 사용 예시

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}
\`\`\`

React를 사용하면 더 효율적이고 유지보수하기 쉬운 코드를 작성할 수 있습니다.`,
    categorySlug: 'react',
  },
  {
    title: 'Next.js의 장점',
    content: `# Next.js의 장점

Next.js는 React 기반의 풀스택 프레임워크입니다.

## 주요 기능

### 1. 서버 사이드 렌더링 (SSR)
초기 로딩 속도를 향상시키고 SEO를 개선합니다.

### 2. 정적 사이트 생성 (SSG)
빌드 타임에 페이지를 미리 생성할 수 있습니다.

### 3. API Routes
백엔드 API를 쉽게 만들 수 있습니다.

### 4. 파일 기반 라우팅
폴더 구조로 자동 라우팅이 설정됩니다.

## React와의 차이점

Next.js는 React를 기반으로 하되, 추가적인 기능들을 제공합니다.`,
    categorySlug: 'nextjs',
  },
  {
    title: 'TypeScript 기본 문법',
    content: `# TypeScript 기본 문법

TypeScript는 JavaScript에 타입을 추가한 언어입니다.

## 타입 선언

\`\`\`typescript
let name: string = "프론트위키";
let age: number = 2024;
let isActive: boolean = true;
\`\`\`

## 인터페이스

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}
\`\`\`

## 제네릭

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}
\`\`\`

TypeScript를 사용하면 런타임 에러를 줄이고 코드의 가독성을 높일 수 있습니다.`,
    categorySlug: 'typescript',
  },
  {
    title: 'CSS-in-JS vs Tailwind CSS',
    content: `# CSS-in-JS vs Tailwind CSS

스타일링을 위한 두 가지 주요 접근 방식입니다.

## CSS-in-JS

### 장점
- 컴포넌트와 스타일이 함께 위치
- 동적 스타일링이 쉬움
- 스타일 격리

### 단점
- 런타임 오버헤드
- 번들 크기 증가

## Tailwind CSS

### 장점
- 유틸리티 클래스로 빠른 개발
- 작은 번들 크기
- 일관된 디자인 시스템

### 단점
- HTML이 복잡해질 수 있음
- 학습 곡선

프로젝트의 요구사항에 따라 선택하는 것이 중요합니다.`,
    categorySlug: 'styling',
  },
  {
    title: 'React Hooks 완전 정복',
    content: `# React Hooks 완전 정복

React Hooks는 함수형 컴포넌트에서 상태와 생명주기를 관리할 수 있게 해줍니다.

## 주요 Hooks

### useState
상태를 관리합니다.

\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

### useEffect
사이드 이펙트를 처리합니다.

\`\`\`jsx
useEffect(() => {
  // 컴포넌트 마운트 시 실행
}, []);
\`\`\`

### useContext
컨텍스트를 사용합니다.

\`\`\`jsx
const value = useContext(MyContext);
\`\`\`

Hooks를 사용하면 클래스 컴포넌트 없이도 모든 기능을 사용할 수 있습니다.`,
    categorySlug: 'react',
  },
  {
    title: '웹 성능 최적화 기법',
    content: `# 웹 성능 최적화 기법

웹사이트의 성능을 향상시키는 다양한 방법들이 있습니다.

## 이미지 최적화

- WebP 포맷 사용
- 적절한 크기로 리사이징
- Lazy loading 적용

## 코드 스플리팅

\`\`\`javascript
const Component = lazy(() => import('./Component'));
\`\`\`

## 번들 최적화

- Tree shaking
- Minification
- 압축

## 캐싱 전략

- 브라우저 캐싱
- CDN 활용
- 서비스 워커

성능 최적화는 사용자 경험에 직접적인 영향을 미칩니다.`,
    categorySlug: 'performance',
  },
  {
    title: 'Redux vs Zustand',
    content: `# Redux vs Zustand

상태 관리 라이브러리 비교입니다.

## Redux

### 특징
- 예측 가능한 상태 관리
- 강력한 미들웨어 지원
- 시간 여행 디버깅

### 단점
- 보일러플레이트 코드가 많음
- 학습 곡선이 가파름

## Zustand

### 특징
- 간단한 API
- 작은 번들 크기
- TypeScript 지원

### 단점
- 생태계가 작음
- 복잡한 상태 관리에는 부적합

프로젝트 규모와 요구사항에 따라 선택하세요.`,
    categorySlug: 'state-management',
  },
  {
    title: 'Jest로 테스트하기',
    content: `# Jest로 테스트하기

Jest는 JavaScript 테스트 프레임워크입니다.

## 기본 사용법

\`\`\`javascript
test('두 수를 더한다', () => {
  expect(1 + 2).toBe(3);
});
\`\`\`

## React 컴포넌트 테스트

\`\`\`jsx
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('버튼이 렌더링된다', () => {
  render(<Button>클릭</Button>);
  expect(screen.getByText('클릭')).toBeInTheDocument();
});
\`\`\`

## Mock 사용

\`\`\`javascript
jest.mock('./api');
\`\`\`

테스트를 작성하면 버그를 줄이고 코드 품질을 향상시킬 수 있습니다.`,
    categorySlug: 'testing',
  },
]

async function main() {
  console.log('🌱 시드 데이터 생성 시작...')

  try {
    // 1. 카테고리 생성
    console.log('📁 카테고리 생성 중...')
    const createdCategories: Record<string, string> = {}
    
    for (const categoryData of categories) {
      const category = await prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: {},
        create: categoryData,
      })
      createdCategories[categoryData.slug] = category.id
      console.log(`  ✓ ${category.name} 생성 완료`)
    }

    // 2. 관리자 사용자 찾기 또는 생성
    console.log('\n👤 관리자 사용자 확인 중...')
    let adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
    })

    if (!adminUser) {
      console.log('  관리자가 없습니다. 첫 번째 사용자를 관리자로 설정합니다.')
      adminUser = await prisma.user.findFirst()
      if (adminUser) {
        adminUser = await prisma.user.update({
          where: { id: adminUser.id },
          data: { role: 'admin' },
        })
        console.log(`  ✓ ${adminUser.name}을(를) 관리자로 설정했습니다.`)
      } else {
        console.log('  ⚠️ 사용자가 없습니다. 먼저 사용자를 생성해주세요.')
        return
      }
    } else {
      console.log(`  ✓ 관리자: ${adminUser.name}`)
    }

    // 3. 글 생성
    console.log('\n📝 글 생성 중...')
    for (const articleData of articles) {
      const slug = slugify(articleData.title)
      
      // 중복 체크
      const existing = await prisma.article.findUnique({
        where: { slug },
      })

      if (existing) {
        console.log(`  ⏭️  "${articleData.title}" 이미 존재 (건너뜀)`)
        continue
      }

      const categoryId = createdCategories[articleData.categorySlug] || null

      const article = await prisma.article.create({
        data: {
          title: articleData.title,
          slug,
          content: articleData.content,
          status: 'published',
          authorId: adminUser.id,
          categoryId,
        },
      })

      console.log(`  ✓ "${article.title}" 생성 완료`)

      // 4. 카드 부여 (글 작성자에게)
      try {
        await prisma.userCard.upsert({
          where: {
            userId_articleId: {
              userId: adminUser.id,
              articleId: article.id,
            },
          },
          update: {},
          create: {
            userId: adminUser.id,
            articleId: article.id,
            obtainedBy: 'author',
          },
        })

        // 포인트 추가
        await prisma.userPoint.upsert({
          where: { userId: adminUser.id },
          update: {
            points: { increment: 50 },
            totalPoints: { increment: 50 },
          },
          create: {
            userId: adminUser.id,
            points: 50,
            totalPoints: 50,
          },
        })
      } catch (error) {
        console.warn(`  ⚠️  카드 부여 실패: ${error}`)
      }
    }

    // 5. 자동 링크 생성 (간단한 키워드 매칭)
    console.log('\n🔗 자동 링크 생성 중...')
    const allArticles = await prisma.article.findMany({
      where: { status: 'published' },
      select: { id: true, title: true, content: true },
    })

    for (const article of allArticles) {
      for (const otherArticle of allArticles) {
        if (article.id === otherArticle.id) continue

        // 제목이 내용에 포함되어 있는지 확인
        if (article.content.includes(otherArticle.title)) {
          try {
            await prisma.articleLink.upsert({
              where: {
                fromArticleId_toArticleId_keyword: {
                  fromArticleId: article.id,
                  toArticleId: otherArticle.id,
                  keyword: otherArticle.title,
                },
              },
              update: {},
              create: {
                keyword: otherArticle.title,
                fromArticleId: article.id,
                toArticleId: otherArticle.id,
                relationType: 'auto',
              },
            })
          } catch (error) {
            // 이미 존재하는 링크는 무시
          }
        }
      }
    }

    console.log('\n✅ 시드 데이터 생성 완료!')
    console.log(`\n📊 생성된 데이터:`)
    console.log(`  - 카테고리: ${categories.length}개`)
    console.log(`  - 글: ${articles.length}개`)
  } catch (error) {
    console.error('❌ 시드 데이터 생성 실패:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

