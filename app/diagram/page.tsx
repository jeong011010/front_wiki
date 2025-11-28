import KnowledgeGraph from '@/components/Diagram/KnowledgeGraph'
import Header from '@/components/Header'
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

export default function DiagramPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <KnowledgeGraph />
      </main>
    </div>
  )
}

