import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import AutoLinkEditor from '@/components/Editor/AutoLinkEditor'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function EditArticlePage({ params }: PageProps) {
  const { slug } = await params
  const user = await getSessionUser()
  
  if (!user) {
    redirect(`/auth/login?redirect=/articles/${slug}/edit`)
  }
  
  // Next.js는 이미 URL 파라미터를 디코딩하므로 slug는 이미 "디버깅" 형태
  // 하지만 혹시 인코딩된 경우를 대비해 처리
  const decodedSlug = slug.includes('%') ? decodeURIComponent(slug) : slug
  
  const article = await prisma.article.findUnique({
    where: { slug: decodedSlug },
    select: {
      id: true,
      title: true,
      content: true,
      slug: true,
      authorId: true,
    },
  })

  if (!article) {
    notFound()
  }
  
  // 권한 체크 (작성자 또는 관리자만 수정 가능)
  if (user.role !== 'admin' && article.authorId !== user.id) {
    notFound()
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
                href={`/articles/${article.slug}`}
                className="px-4 py-2 bg-secondary-300 text-text-primary rounded-lg hover:bg-secondary-500 transition-all font-medium"
              >
                ← 취소
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface rounded-2xl shadow-sm p-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-6 text-text-primary">글 수정</h1>
          <AutoLinkEditor
            initialTitle={article.title}
            initialContent={article.content}
            articleId={article.id}
          />
        </div>
      </main>
    </div>
  )
}

