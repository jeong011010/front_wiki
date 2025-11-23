import KnowledgeGraph from '@/components/Diagram/KnowledgeGraph'
import Link from 'next/link'
import AuthButton from '@/components/AuthButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '프론트위키 - 지식 그래프',
  description: '프론트엔드와 클라우드 개발 지식을 시각화한 지식 그래프',
  openGraph: {
    title: '프론트위키 - 지식 그래프',
    description: '프론트엔드와 클라우드 개발 지식을 시각화한 지식 그래프',
    type: 'website',
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-500 hover:text-primary-700 transition-colors">
              프론트위키
            </Link>
            <nav className="flex gap-4 items-center">
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
      <main>
        <KnowledgeGraph />
      </main>
    </div>
  )
}
