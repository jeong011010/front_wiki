# Next.js 16 완전 가이드

Next.js는 React 기반의 풀스택 웹 프레임워크로, 서버 사이드 렌더링(SSR), 정적 사이트 생성(SSG), 그리고 최근에는 서버 컴포넌트까지 지원하는 강력한 도구입니다. 이 가이드에서는 Next.js 16의 주요 기능과 사용법을 상세히 다룹니다.

## Next.js란?

Next.js는 Vercel에서 개발한 React 프레임워크로, 프로덕션 환경에서 사용할 수 있는 다양한 기능을 제공합니다. 기본적으로 서버 사이드 렌더링과 정적 사이트 생성을 지원하며, 최적화된 성능과 개발자 경험을 제공합니다.

### 주요 특징

Next.js의 주요 특징은 다음과 같습니다:

- **서버 사이드 렌더링(SSR)**: 초기 로딩 속도 향상
- **정적 사이트 생성(SSG)**: 빌드 타임에 HTML 생성
- **자동 코드 스플리팅**: 페이지별로 코드 분리
- **이미지 최적화**: 자동 이미지 최적화 및 lazy loading
- **API Routes**: 백엔드 API를 Next.js 앱 내에서 구현

## App Router vs Pages Router

Next.js 13부터 도입된 App Router는 기존 Pages Router의 개선된 버전입니다. App Router는 React Server Components를 활용하여 더 나은 성능과 개발자 경험을 제공합니다.

### App Router의 장점

App Router를 사용하면 다음과 같은 이점이 있습니다:

1. **서버 컴포넌트 기본 지원**: 클라이언트 번들 크기 감소
2. **레이아웃 시스템**: 중첩 레이아웃 지원
3. **로딩 및 에러 처리**: 로딩 상태와 에러 경계 자동 처리
4. **스트리밍**: 점진적 렌더링 지원

### Pages Router와의 차이점

Pages Router는 파일 기반 라우팅을 사용하며, `pages` 디렉토리에 파일을 생성하면 자동으로 라우트가 생성됩니다. 반면 App Router는 `app` 디렉토리를 사용하며, 더 유연한 라우팅 시스템을 제공합니다.

## 서버 컴포넌트와 클라이언트 컴포넌트

Next.js 13+에서는 서버 컴포넌트와 클라이언트 컴포넌트를 구분합니다. 이는 성능 최적화와 개발자 경험 개선을 위한 중요한 개념입니다.

### 서버 컴포넌트

서버 컴포넌트는 서버에서만 실행되며, 클라이언트로 전송되지 않습니다. 이를 통해 다음과 같은 이점을 얻을 수 있습니다:

- **번들 크기 감소**: 서버 컴포넌트는 클라이언트 번들에 포함되지 않음
- **데이터베이스 직접 접근**: 서버에서 직접 데이터베이스 쿼리 가능
- **보안**: API 키나 민감한 정보를 서버에서만 처리

### 클라이언트 컴포넌트

클라이언트 컴포넌트는 `'use client'` 지시어를 사용하여 명시적으로 선언합니다. 다음과 같은 경우에 사용합니다:

- **인터랙티브 기능**: 버튼 클릭, 폼 입력 등
- **브라우저 API 사용**: `window`, `localStorage` 등
- **상태 관리**: `useState`, `useEffect` 등 React 훅 사용

## 데이터 페칭 방법

Next.js에서는 다양한 방법으로 데이터를 가져올 수 있습니다. 각 방법은 사용 사례에 따라 선택해야 합니다.

### 서버 컴포넌트에서 데이터 페칭

서버 컴포넌트에서는 직접 데이터베이스나 API를 호출할 수 있습니다:

```typescript
async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({
    where: { id: params.id }
  })
  
  return <div>{article.title}</div>
}
```

### 클라이언트 컴포넌트에서 데이터 페칭

클라이언트 컴포넌트에서는 `useEffect`나 데이터 페칭 라이브러리를 사용합니다:

```typescript
'use client'

import { useEffect, useState } from 'react'

export function ArticleList() {
  const [articles, setArticles] = useState([])
  
  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => setArticles(data))
  }, [])
  
  return <div>{/* ... */}</div>
}
```

## 라우팅 시스템

Next.js의 라우팅 시스템은 파일 시스템 기반으로 작동합니다. 파일과 폴더 구조가 URL 구조를 결정합니다.

### 동적 라우팅

동적 라우트는 대괄호를 사용하여 생성합니다:

- `app/articles/[id]/page.tsx` → `/articles/123`
- `app/articles/[slug]/page.tsx` → `/articles/my-article`

### 중첩 라우팅

폴더 구조를 통해 중첩 라우트를 만들 수 있습니다:

```
app/
  articles/
    [slug]/
      page.tsx
      edit/
        page.tsx
```

## 이미지 최적화

Next.js는 `next/image` 컴포넌트를 통해 자동 이미지 최적화를 제공합니다.

### 기본 사용법

```typescript
import Image from 'next/image'

export function ArticleImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      priority
    />
  )
}
```

### 이미지 최적화 기능

- **자동 포맷 변환**: WebP, AVIF 등 최적 포맷으로 변환
- **Lazy Loading**: 뷰포트에 들어올 때만 로드
- **반응형 이미지**: 다양한 화면 크기에 맞춰 최적 크기 제공

## API Routes

Next.js는 API Routes를 통해 백엔드 API를 구현할 수 있습니다. `app/api` 디렉토리에 파일을 생성하면 자동으로 API 엔드포인트가 생성됩니다.

### 기본 API Route

```typescript
// app/api/articles/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const articles = await prisma.article.findMany()
  return NextResponse.json(articles)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const article = await prisma.article.create({ data: body })
  return NextResponse.json(article)
}
```

## 배포 및 최적화

Next.js 앱을 배포하고 최적화하는 방법을 알아봅시다.

### 빌드 최적화

Next.js는 자동으로 다음과 같은 최적화를 수행합니다:

- **코드 스플리팅**: 페이지별로 코드 분리
- **트리 쉐이킹**: 사용하지 않는 코드 제거
- **압축**: Gzip, Brotli 압축 지원

### 배포 옵션

Next.js는 다양한 배포 옵션을 제공합니다:

- **Vercel**: Next.js 개발사에서 제공하는 호스팅 플랫폼
- **자체 서버**: Node.js 서버에서 실행
- **정적 내보내기**: 완전한 정적 사이트로 내보내기

## 결론

Next.js 16은 현대적인 웹 애플리케이션을 구축하기 위한 강력한 도구입니다. 서버 컴포넌트, App Router, 그리고 다양한 최적화 기능을 통해 뛰어난 성능과 개발자 경험을 제공합니다.

이 가이드를 통해 Next.js의 주요 개념과 사용법을 이해하셨기를 바랍니다. 더 자세한 내용은 [공식 문서](https://nextjs.org/docs)를 참고하세요.

