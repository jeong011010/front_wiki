# React란?

React는 Facebook(현재 Meta)에서 개발한 JavaScript 라이브러리로, 사용자 인터페이스를 구축하기 위한 도구입니다. React는 컴포넌트 기반 아키텍처를 사용하여 재사용 가능하고 유지보수하기 쉬운 코드를 작성할 수 있게 해줍니다.

## React의 주요 특징

### 1. 컴포넌트 기반 아키텍처

React는 UI를 독립적인 컴포넌트로 나누어 구성합니다. 각 컴포넌트는 자체 상태(state)와 속성(props)을 가질 수 있으며, 이를 통해 복잡한 UI를 작은 단위로 분해할 수 있습니다.

```jsx
function Button({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}
```

### 2. 가상 DOM (Virtual DOM)

React는 실제 DOM을 직접 조작하는 대신, 메모리 내에 가상 DOM을 생성하고 변경사항을 효율적으로 비교합니다. 이를 통해 성능을 최적화하고 사용자 경험을 개선합니다.

### 3. 단방향 데이터 흐름

React는 부모 컴포넌트에서 자식 컴포넌트로 데이터가 흐르는 단방향 데이터 바인딩을 사용합니다. 이는 데이터 흐름을 예측 가능하게 만들고 디버깅을 쉽게 합니다.

## React Hooks

React 16.8부터 도입된 Hooks는 함수형 컴포넌트에서 상태 관리와 생명주기 메서드를 사용할 수 있게 해줍니다.

### 주요 Hooks

- **useState**: 컴포넌트의 상태를 관리
- **useEffect**: 사이드 이펙트를 처리
- **useContext**: Context API를 사용하여 전역 상태 관리
- **useReducer**: 복잡한 상태 로직을 관리

```jsx
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

## React의 장점

1. **재사용성**: 컴포넌트를 재사용하여 개발 시간을 단축
2. **성능**: Virtual DOM을 통한 효율적인 렌더링
3. **생태계**: 풍부한 라이브러리와 도구 지원
4. **커뮤니티**: 활발한 커뮤니티와 풍부한 학습 자료

## 결론

React는 현대적인 웹 애플리케이션 개발을 위한 강력한 도구입니다. 컴포넌트 기반 아키텍처와 Virtual DOM을 통해 효율적이고 유지보수하기 쉬운 코드를 작성할 수 있습니다.

---

# SSR (Server-Side Rendering)이란?

SSR(Server-Side Rendering)은 웹 페이지의 HTML을 서버에서 생성하여 클라이언트에 전송하는 렌더링 방식입니다. 이는 전통적인 웹 애플리케이션의 렌더링 방식으로, SEO와 초기 로딩 성능에 유리합니다.

## SSR의 작동 방식

SSR에서는 사용자가 페이지를 요청하면 서버가 다음과 같은 과정을 거칩니다:

1. 서버가 데이터베이스나 API에서 데이터를 가져옵니다
2. 서버가 HTML을 동적으로 생성합니다
3. 완성된 HTML을 클라이언트에 전송합니다
4. 클라이언트 브라우저가 HTML을 받아 즉시 렌더링합니다

## SSR의 장점

### 1. SEO 최적화

검색 엔진 크롤러가 완전히 렌더링된 HTML을 받을 수 있어 SEO에 유리합니다. JavaScript를 실행하지 않아도 콘텐츠를 인덱싱할 수 있습니다.

### 2. 빠른 초기 로딩

초기 HTML이 이미 완성된 상태로 전송되므로, 사용자는 JavaScript가 로드되기 전에도 콘텐츠를 볼 수 있습니다. 이는 특히 느린 네트워크 환경에서 유리합니다.

### 3. 메타데이터 관리

서버에서 HTML을 생성하므로, 각 페이지의 메타 태그를 동적으로 설정할 수 있습니다. 이는 소셜 미디어 공유 시 올바른 미리보기를 제공하는 데 중요합니다.

## SSR의 단점

### 1. 서버 부하

모든 요청마다 서버에서 HTML을 생성해야 하므로 서버 부하가 증가합니다. 트래픽이 많을수록 서버 리소스가 많이 필요합니다.

### 2. 느린 Time to Interactive (TTI)

HTML은 빠르게 표시되지만, JavaScript가 로드되고 하이드레이션(hydration)이 완료될 때까지 인터랙티브하지 않을 수 있습니다.

### 3. 복잡한 설정

SSR을 구현하려면 서버 설정과 클라이언트 설정을 모두 관리해야 하므로 복잡도가 증가합니다.

## SSR 구현 방법

### Next.js를 사용한 SSR

Next.js는 React 기반의 SSR 프레임워크로, 간단하게 SSR을 구현할 수 있습니다.

```typescript
// pages/article/[id].tsx
export async function getServerSideProps(context) {
  const { id } = context.params;
  const article = await fetchArticle(id);
  
  return {
    props: {
      article,
    },
  };
}

export default function ArticlePage({ article }) {
  return (
    <div>
      <h1>{article.title}</h1>
      <p>{article.content}</p>
    </div>
  );
}
```

## SSR vs CSR vs SSG

- **SSR**: 서버에서 매 요청마다 HTML 생성
- **CSR (Client-Side Rendering)**: 클라이언트에서 JavaScript로 HTML 생성
- **SSG (Static Site Generation)**: 빌드 타임에 HTML 생성

각 방식은 사용 사례에 따라 선택해야 합니다. SSR은 동적 콘텐츠가 많고 SEO가 중요한 경우에 적합합니다.

## 결론

SSR은 SEO와 초기 로딩 성능에 유리한 렌더링 방식입니다. 하지만 서버 부하와 복잡도 증가라는 트레이드오프가 있으므로, 프로젝트의 요구사항에 맞게 선택해야 합니다.

---

# SSG (Static Site Generation)이란?

SSG(Static Site Generation)는 빌드 타임에 모든 HTML 페이지를 미리 생성하여 정적 파일로 제공하는 렌더링 방식입니다. 이는 가장 빠른 웹사이트를 만들 수 있는 방법 중 하나입니다.

## SSG의 작동 방식

SSG는 다음과 같은 과정을 거칩니다:

1. **빌드 타임**: 개발자가 빌드 명령을 실행하면, 애플리케이션이 모든 페이지의 HTML을 미리 생성합니다
2. **정적 파일 생성**: 생성된 HTML 파일들이 정적 파일로 저장됩니다
3. **배포**: 정적 파일들이 CDN이나 정적 호스팅 서비스에 배포됩니다
4. **요청 처리**: 사용자가 페이지를 요청하면, 이미 생성된 HTML 파일이 즉시 전송됩니다

## SSG의 장점

### 1. 뛰어난 성능

HTML이 이미 생성되어 있으므로, 서버에서 추가 처리가 필요 없습니다. CDN을 통해 전 세계 어디서나 빠르게 콘텐츠를 제공할 수 있습니다.

### 2. 서버 비용 절감

정적 파일만 제공하면 되므로 서버 리소스가 거의 필요 없습니다. 이는 비용을 크게 절감할 수 있습니다.

### 3. 보안

서버 사이드 코드가 실행되지 않으므로, 보안 취약점이 줄어듭니다.

### 4. 확장성

트래픽이 증가해도 서버 부하가 거의 없으므로, 쉽게 확장할 수 있습니다.

## SSG의 단점

### 1. 동적 콘텐츠 제한

빌드 타임에 모든 페이지가 생성되므로, 사용자별로 다른 콘텐츠를 보여주기 어렵습니다. 실시간 데이터를 표시하기도 제한적입니다.

### 2. 빌드 시간

페이지가 많을수록 빌드 시간이 길어집니다. 수천 개의 페이지가 있다면 빌드에 상당한 시간이 소요될 수 있습니다.

### 3. 콘텐츠 업데이트

콘텐츠를 업데이트하려면 전체 사이트를 다시 빌드해야 합니다. 이는 자주 업데이트되는 사이트에는 부적합할 수 있습니다.

## SSG 구현 방법

### Next.js를 사용한 SSG

Next.js는 `getStaticProps`와 `getStaticPaths`를 사용하여 SSG를 구현합니다.

```typescript
// pages/articles/[slug].tsx
export async function getStaticPaths() {
  const articles = await getAllArticles();
  
  return {
    paths: articles.map((article) => ({
      params: { slug: article.slug },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const article = await getArticleBySlug(params.slug);
  
  return {
    props: {
      article,
    },
  };
}

export default function ArticlePage({ article }) {
  return (
    <div>
      <h1>{article.title}</h1>
      <p>{article.content}</p>
    </div>
  );
}
```

### Incremental Static Regeneration (ISR)

Next.js는 ISR을 통해 SSG의 한계를 보완합니다. ISR을 사용하면 빌드 타임에 모든 페이지를 생성하지 않고, 필요할 때 동적으로 생성할 수 있습니다.

```typescript
export async function getStaticProps({ params }) {
  const article = await getArticleBySlug(params.slug);
  
  return {
    props: {
      article,
    },
    revalidate: 60, // 60초마다 재생성
  };
}
```

## SSG가 적합한 경우

- 블로그나 문서 사이트
- 마케팅 랜딩 페이지
- 포트폴리오 사이트
- 전자상거래 제품 페이지 (가격 등은 클라이언트에서 업데이트)

## SSG vs SSR vs CSR

- **SSG**: 빌드 타임에 HTML 생성, 가장 빠름, 동적 콘텐츠 제한
- **SSR**: 요청마다 서버에서 HTML 생성, SEO 유리, 서버 부하
- **CSR**: 클라이언트에서 HTML 생성, 인터랙티브, 초기 로딩 느림

## 결론

SSG는 성능과 비용 측면에서 가장 효율적인 렌더링 방식입니다. 콘텐츠가 자주 변경되지 않고, SEO가 중요한 정적 사이트에 특히 적합합니다. Next.js의 ISR을 활용하면 SSG의 한계를 보완할 수 있습니다.

---

# App Router란?

App Router는 Next.js 13부터 도입된 새로운 라우팅 시스템으로, React Server Components를 활용하여 더 나은 성능과 개발자 경험을 제공합니다. 기존 Pages Router의 개선된 버전으로 볼 수 있습니다.

## App Router의 주요 특징

### 1. 파일 시스템 기반 라우팅

App Router는 `app` 디렉토리를 사용하여 라우트를 정의합니다. 폴더 구조가 URL 구조를 결정합니다.

```
app/
  page.tsx          → /
  about/
    page.tsx        → /about
  articles/
    [slug]/
      page.tsx      → /articles/[slug]
```

### 2. React Server Components

App Router는 기본적으로 React Server Components를 사용합니다. 이는 서버에서만 실행되는 컴포넌트로, 클라이언트 번들 크기를 줄이고 성능을 향상시킵니다.

```typescript
// app/articles/[slug]/page.tsx
// 기본적으로 Server Component
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  
  return (
    <div>
      <h1>{article.title}</h1>
      <p>{article.content}</p>
    </div>
  );
}
```

### 3. 레이아웃 시스템

App Router는 중첩 레이아웃을 지원합니다. `layout.tsx` 파일을 사용하여 공통 레이아웃을 정의할 수 있습니다.

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <header>프론트위키</header>
        {children}
        <footer>© 2024 프론트위키</footer>
      </body>
    </html>
  );
}
```

### 4. 로딩 및 에러 처리

App Router는 `loading.tsx`와 `error.tsx` 파일을 통해 로딩 상태와 에러를 자동으로 처리합니다.

```typescript
// app/articles/[slug]/loading.tsx
export default function Loading() {
  return <div>로딩 중...</div>;
}

// app/articles/[slug]/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>에러가 발생했습니다</h2>
      <button onClick={reset}>다시 시도</button>
    </div>
  );
}
```

## Server Components vs Client Components

### Server Components

- 서버에서만 실행
- 데이터베이스나 API에 직접 접근 가능
- 클라이언트 번들에 포함되지 않음
- 브라우저 API 사용 불가

```typescript
// Server Component (기본)
import { prisma } from '@/lib/prisma';

export default async function ArticleList() {
  const articles = await prisma.article.findMany();
  
  return (
    <ul>
      {articles.map((article) => (
        <li key={article.id}>{article.title}</li>
      ))}
    </ul>
  );
}
```

### Client Components

- 클라이언트에서 실행
- `'use client'` 지시어 필요
- 인터랙티브 기능 사용 가능
- 브라우저 API 사용 가능

```typescript
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

## 데이터 페칭

App Router에서는 Server Components에서 직접 데이터를 가져올 수 있습니다.

```typescript
// app/articles/page.tsx
export default async function ArticlesPage() {
  const articles = await fetch('https://api.example.com/articles')
    .then(res => res.json());
  
  return (
    <div>
      {articles.map((article) => (
        <article key={article.id}>
          <h2>{article.title}</h2>
          <p>{article.content}</p>
        </article>
      ))}
    </div>
  );
}
```

## 동적 라우팅

App Router는 동적 세그먼트를 대괄호로 표시합니다.

```
app/
  articles/
    [slug]/
      page.tsx      → /articles/[slug]
    [category]/
      [slug]/
        page.tsx    → /articles/[category]/[slug]
```

```typescript
// app/articles/[slug]/page.tsx
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  return (
    <div>
      <h1>{article.title}</h1>
      <p>{article.content}</p>
    </div>
  );
}
```

## 메타데이터

App Router는 `metadata` 객체나 `generateMetadata` 함수를 사용하여 메타데이터를 정의할 수 있습니다.

```typescript
// app/articles/[slug]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
    },
  };
}
```

## App Router의 장점

1. **성능**: Server Components로 클라이언트 번들 크기 감소
2. **개발자 경험**: 직관적인 파일 시스템 기반 라우팅
3. **유연성**: Server와 Client Components를 자유롭게 조합
4. **SEO**: 서버에서 렌더링된 HTML 제공

## App Router vs Pages Router

| 특징 | App Router | Pages Router |
|------|-----------|--------------|
| 디렉토리 | `app/` | `pages/` |
| 기본 컴포넌트 | Server Component | Client Component |
| 레이아웃 | 중첩 레이아웃 지원 | 단일 레이아웃 |
| 데이터 페칭 | 직접 async/await | `getServerSideProps` 등 |
| 스트리밍 | 지원 | 미지원 |

## 결론

App Router는 Next.js의 미래입니다. Server Components를 활용하여 더 나은 성능과 개발자 경험을 제공하며, 현대적인 웹 애플리케이션 개발에 최적화되어 있습니다. 새로운 프로젝트를 시작한다면 App Router를 사용하는 것을 강력히 권장합니다.

