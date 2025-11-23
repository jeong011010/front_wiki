import AutoLinkEditor from '@/components/Editor/AutoLinkEditor'
import { getSessionUser } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function NewArticlePage() {
  const user = await getSessionUser()
  
  if (!user) {
    redirect('/auth/login?redirect=/articles/new')
  }
  
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-500 hover:text-primary-700 transition-colors">
              프론트위키
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors font-medium"
            >
              ← 메인으로
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface rounded-2xl shadow-sm p-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-8 text-text-primary">새 글 작성</h1>
          <AutoLinkEditor />
        </div>
      </main>
    </div>
  )
}

