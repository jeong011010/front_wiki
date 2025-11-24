import Link from 'next/link'
import AuthButton from '@/components/AuthButton'
import FeaturedArticles from '@/components/FeaturedArticles'
import FilteredArticles from '@/components/FilteredArticles'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '프론트위키 - 프론트엔드와 클라우드 개발 지식',
  description: '프론트엔드와 클라우드 개발 지식을 체계적으로 정리한 지식 위키',
  openGraph: {
    title: '프론트위키 - 프론트엔드와 클라우드 개발 지식',
    description: '프론트엔드와 클라우드 개발 지식을 체계적으로 정리한 지식 위키',
    type: 'website',
  },
}

export default async function Home() {

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-500 hover:text-primary-700 transition-colors">
              프론트위키
            </Link>
            <nav className="flex gap-4 items-center">
              <Link
                href="/diagram"
                className="px-4 py-2 bg-secondary-300 text-text-primary rounded-lg hover:bg-secondary-500 transition-all font-medium"
              >
                지식 그래프
              </Link>
              <Link
                href="/articles"
                className="px-4 py-2 bg-secondary-300 text-text-primary rounded-lg hover:bg-secondary-500 transition-all font-medium"
              >
                글 목록
              </Link>
              <AuthButton />
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 최상단 인기/최신 글 섹션 */}
        <section className="mb-12">
          <FeaturedArticles />
        </section>

        {/* 필터 및 글 목록 */}
        <section>
          <FilteredArticles />
        </section>
      </main>
    </div>
  )
}
