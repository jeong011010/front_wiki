import Header from '@/components/Header'
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
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-20 md:pb-8">
        {/* 최상단 인기/최신 글 섹션 */}
        <section className="mb-6 md:mb-8">
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
