import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ReviewArticleList from '@/components/Admin/ReviewArticleList'

export const dynamic = 'force-dynamic' // 쿠키 사용으로 인해 동적 렌더링 필요

export default async function ReviewPage() {
  const user = await getSessionUser()
  
  if (!user || user.role !== 'admin') {
    redirect('/')
  }
  
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-500 hover:text-primary-700 transition-colors">
              프론트위키
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/"
                className="px-4 py-2 bg-secondary-300 text-text-primary rounded-lg hover:bg-secondary-500 transition-all font-medium"
              >
                메인으로
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface rounded-2xl shadow-sm p-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-6 text-text-primary">글 검토</h1>
          <p className="text-text-secondary mb-8">
            회원이 작성한 글을 검토하고 승인 또는 거부할 수 있습니다.
          </p>
          <ReviewArticleList />
        </div>
      </main>
    </div>
  )
}

