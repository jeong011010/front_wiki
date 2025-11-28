import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'
import Link from 'next/link'
import Header from '@/components/Header'
import SearchBar from '@/components/SearchBar'
import AnimatedCard from '@/components/AnimatedCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '모든 글',
  description: '프론트위키의 모든 글을 확인하세요',
  openGraph: {
    title: '모든 글 - 프론트위키',
    description: '프론트위키의 모든 글을 확인하세요',
    type: 'website',
  },
}

interface ArticlesPageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = await searchParams
  const searchQuery = params.search
  const user = await getSessionUser()

  // 비회원 또는 일반 회원은 공개된 글만, 관리자는 모든 글
  const statusFilter = user?.role === 'admin' ? {} : { status: 'published' }

  let articles
  if (searchQuery) {
    // 검색 쿼리가 있으면 검색 결과 반환
    // 제목에 검색어가 포함된 글과 내용에 검색어가 포함된 글을 분리
    const titleMatches = await prisma.article.findMany({
      where: {
        ...statusFilter,
        title: {
          contains: searchQuery,
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const contentMatches = await prisma.article.findMany({
      where: {
        ...statusFilter,
        AND: [
          {
            content: {
              contains: searchQuery,
            },
          },
          {
            title: {
              not: {
                contains: searchQuery,
              },
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // 제목 매칭 글 먼저, 그 다음 내용 매칭 글
    articles = [...titleMatches, ...contentMatches]
  } else {
    // 검색 쿼리가 없으면 모든 글 반환
    articles = await prisma.article.findMany({
      where: statusFilter,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-text-primary">
              {searchQuery ? `"${searchQuery}" 검색 결과` : '모든 글'}
            </h1>
            <p className="text-text-secondary">
              {searchQuery ? `${articles.length}개의 검색 결과` : `총 ${articles.length}개의 글이 있습니다.`}
            </p>
          </div>
          <SearchBar />
        </div>

        {articles.length === 0 ? (
          <AnimatedCard className="p-12 text-center bg-surface">
            <p className="text-lg mb-6 text-text-secondary">아직 작성된 글이 없습니다.</p>
            <Link
              href="/articles/new"
              className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-all hover:shadow-md font-medium"
            >
              첫 글 작성하기
            </Link>
          </AnimatedCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => {
              // 내용 미리보기 (처음 150자)
              const preview = article.content
                .replace(/\n/g, ' ')
                .substring(0, 150)
                .trim()
              const hasMore = article.content.length > 150

              return (
                <AnimatedCard key={article.id} delay={index * 0.1} className="bg-surface">
                  <Link
                    href={`/articles/${article.slug}`}
                    className="block p-6"
                  >
                    <h2 className="text-xl font-semibold mb-3 line-clamp-2 text-text-primary">
                      {article.title}
                    </h2>
                    <p className="text-sm mb-4 line-clamp-3 leading-relaxed text-text-secondary">
                      {preview}
                      {hasMore && '...'}
                    </p>
                    <div className="text-xs text-text-tertiary">
                      {new Date(article.createdAt).toLocaleDateString('ko-KR')}
                      {article.updatedAt !== article.createdAt && (
                        <span className="ml-2">
                          (수정: {new Date(article.updatedAt).toLocaleDateString('ko-KR')})
                        </span>
                      )}
                    </div>
                  </Link>
                </AnimatedCard>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
