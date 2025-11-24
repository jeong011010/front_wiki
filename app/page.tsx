import Link from 'next/link'
import AuthButton from '@/components/AuthButton'
import FeaturedArticles from '@/components/FeaturedArticles'
import CategorySection from '@/components/CategorySection'
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
  // 서버 컴포넌트에서 직접 Prisma 사용
  let categoryList: Array<{ name: string; count: number }> = []
  
  try {
    const { prisma } = await import('@/lib/prisma')
    
    // published 상태인 글 중 카테고리가 있는 글만 조회
    const allArticles = await prisma.article.findMany({
      where: {
        status: 'published',
        categoryId: { not: null },
      },
      select: {
        categoryId: true,
      },
    })
    
    // 카테고리별 개수 계산
    const categoryCounts = new Map<string, number>()
    allArticles.forEach((article) => {
      if (article.categoryId) {
        categoryCounts.set(article.categoryId, (categoryCounts.get(article.categoryId) || 0) + 1)
      }
    })
    
    // categoryId를 카테고리 이름으로 변환
    const categoryIds = Array.from(categoryCounts.keys())
    if (categoryIds.length > 0) {
      const categories = await prisma.category.findMany({
        where: {
          id: { in: categoryIds },
        },
        select: {
          id: true,
          name: true,
        },
      })
      
      const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]))
      categoryList = Array.from(categoryCounts.entries())
        .map(([id, count]) => {
          const name = categoryMap.get(id)
          return name ? { name, count } : null
        })
        .filter((cat): cat is { name: string; count: number } => cat !== null)
        .sort((a, b) => b.count - a.count)
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }

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

        {/* 카테고리별 글 목록 */}
        {categoryList.length > 0 ? (
          <div className="space-y-12">
            {categoryList.map((category) => (
              <CategorySection key={category.name} category={category.name} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">아직 카테고리가 설정된 글이 없습니다.</p>
            <Link
              href="/articles/new"
              className="mt-4 inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              첫 글 작성하기
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
