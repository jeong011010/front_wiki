import { prisma } from '@/lib/prisma'
import { detectKeywords, insertLinks } from '@/lib/link-detector'
import { getSessionUser } from '@/lib/auth'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { marked } from 'marked'
import { addHeadingIds } from '@/lib/markdown-utils'
import RelationTypeSelector from '@/components/RelationTypeSelector'
import DeleteButton from '@/components/DeleteButton'
import AuthButton from '@/components/AuthButton'
import TableOfContents from '@/components/TableOfContents'
import type { ArticleDetail, ArticleLinkWithToArticle, ArticleLinkWithFromArticle, RelationType } from '@/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = slug.includes('%') ? decodeURIComponent(slug) : slug
  
  const article = await prisma.article.findUnique({
    where: { slug: decodedSlug },
    select: {
      title: true,
      content: true,
      status: true,
      author: {
        select: {
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!article || article.status !== 'published') {
    return {
      title: '글을 찾을 수 없습니다 - 프론트위키',
      description: '요청하신 글을 찾을 수 없습니다.',
    }
  }

  // 내용에서 HTML 태그 제거하고 미리보기 생성
  const contentPreview = article.content
    .replace(/<[^>]*>/g, '') // HTML 태그 제거
    .replace(/\n/g, ' ') // 줄바꿈 제거
    .substring(0, 160) // 160자로 제한
    .trim()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const articleUrl = `${siteUrl}/articles/${decodedSlug}`
  const description = contentPreview || `${article.title} - 프론트엔드 개발 지식 위키`

  return {
    title: `${article.title} - 프론트위키`,
    description,
    openGraph: {
      title: article.title,
      description,
      url: articleUrl,
      siteName: '프론트위키',
      type: 'article',
      publishedTime: article.createdAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: article.author ? [article.author.name] : undefined,
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
    },
    alternates: {
      canonical: articleUrl,
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  // Next.js는 이미 URL 파라미터를 디코딩하므로 slug는 이미 "디버깅" 형태
  // 하지만 혹시 인코딩된 경우를 대비해 처리
  const decodedSlug = slug.includes('%') ? decodeURIComponent(slug) : slug
  
  const user = await getSessionUser()
  
  const article = await prisma.article.findUnique({
    where: { slug: decodedSlug },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      status: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
      outgoingLinks: {
        include: {
          toArticle: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          relationType: 'asc', // parent-child가 먼저 오도록
        },
      },
      incomingLinks: {
        include: {
          fromArticle: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          relationType: 'asc',
        },
      },
    },
  }) as ArticleDetail | null

  if (!article) {
    notFound()
  }
  
  // 비공개 글 체크 (관리자 또는 작성자만 볼 수 있음)
  if (article.status !== 'published') {
    if (!user) {
      notFound() // 비회원은 404
    }
    if (user.role !== 'admin' && article.authorId !== user.id) {
      notFound() // 작성자나 관리자가 아니면 404
    }
  }

  // 먼저 마크다운을 HTML로 변환
  let htmlContent = marked(article.content, {
    breaks: true,
    gfm: true,
  }) as string
  
  // 자동 링크 삽입 (자기 자신 제외)
  const detectedLinks = (await detectKeywords(article.content)).filter(
    (link) => link.articleId !== article.id
  )
  
  // HTML에서 텍스트 노드만 찾아서 링크 삽입
  // HTML 태그 안이 아닌 텍스트만 매칭
  for (const link of detectedLinks) {
    const keyword = link.keyword
    const slug = link.slug || link.articleId
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    
    // HTML 태그 안이 아닌 텍스트만 매칭하는 정규식
    // >(텍스트)< 패턴에서 텍스트 부분만 매칭
    const regex = new RegExp(`(>)([^<]*?)(${escapedKeyword})([^<]*?)(<)`, 'gi')
    
    htmlContent = htmlContent.replace(regex, (match, before, prefix, keywordMatch, suffix, after) => {
      // 이미 링크 태그 안에 있는지 확인
      const beforeText = match.substring(0, match.indexOf(keywordMatch))
      if (beforeText.includes('<a')) {
        return match // 이미 링크가 있으면 그대로
      }
      return `${before}${prefix}<a href="/articles/${slug}" class="text-link hover:text-link-hover underline font-medium">${keywordMatch}</a>${suffix}${after}`
    })
  }
  
  // 헤딩에 ID 추가
  htmlContent = addHeadingIds(htmlContent, article.content)

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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* 목차 컴포넌트 */}
        <TableOfContents content={article.content} />
        
        <div className="bg-surface rounded-2xl shadow-sm p-8 animate-fade-in">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-4xl font-bold text-text-primary">{article.title}</h1>
            {user && (user.role === 'admin' || article.authorId === user.id) && (
              <div className="flex gap-2">
                <Link
                  href={`/articles/${article.slug}/edit`}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-all text-sm font-medium hover:shadow-md"
                >
                  수정
                </Link>
                <DeleteButton articleId={article.id} articleSlug={article.slug} />
              </div>
            )}
          </div>
          <div className="text-sm mb-8 text-text-secondary">
            작성일: {new Date(article.createdAt).toLocaleDateString('ko-KR')}
            {article.updatedAt !== article.createdAt && (
              <span className="ml-4">
                수정일: {new Date(article.updatedAt).toLocaleDateString('ko-KR')}
              </span>
            )}
          </div>

          <div
            className="prose prose-lg max-w-none text-text-primary"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* 관련 링크 섹션 */}
          <div className="mt-12 pt-8 border-t border-divider">
            {(article.outgoingLinks.length > 0 || article.incomingLinks.length > 0) ? (
              <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-text-primary">관련 글</h2>
                <p className="text-sm text-text-secondary">
                  💡 배지를 클릭하여 관계 유형을 변경할 수 있습니다. "부모-자식"으로 설정하면 다이어그램에 연결선이 표시됩니다.
                </p>
              </div>
              
              {article.outgoingLinks.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-text-primary">
                    이 글에서 참조하는 글:
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    {article.outgoingLinks.map((link: ArticleLinkWithToArticle) => (
                      <li key={link.id} className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/articles/${link.toArticle.slug}`}
                          className="text-link hover:text-link-hover underline transition-colors font-medium"
                        >
                          {link.toArticle.title}
                        </Link>
                        <span className="text-sm text-text-secondary">
                          ({link.keyword})
                        </span>
                                <RelationTypeSelector
                                  fromArticleId={article.id}
                                  toArticleId={link.toArticle.id}
                                  keyword={link.keyword}
                                  currentType={link.relationType as RelationType}
                                />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {article.incomingLinks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-text-primary">
                    이 글을 참조하는 글:
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {article.incomingLinks.map((link: ArticleLinkWithFromArticle) => (
                      <li key={link.id} className="flex items-center gap-2">
                        <Link
                          href={`/articles/${link.fromArticle.slug}`}
                          className="text-link hover:text-link-hover underline transition-colors font-medium"
                        >
                          {link.fromArticle.title}
                        </Link>
                        <span className="text-sm text-text-secondary">
                          ({link.keyword})
                        </span>
                        {link.relationType === 'parent-child' && (
                          <span className="px-2 py-0.5 bg-badge-primary-bg text-badge-primary-text text-xs rounded-full font-medium">
                            부모-자식
                          </span>
                        )}
                        {link.relationType === 'related' && (
                          <span className="px-2 py-0.5 bg-badge-secondary-bg text-badge-secondary-text text-xs rounded-full font-medium">
                            관련
                          </span>
                        )}
                        {link.relationType === 'auto' && (
                          <span className="px-2 py-0.5 bg-badge-auto-bg text-badge-auto-text text-xs rounded-full font-medium">
                            자동
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="mb-2 text-text-secondary">
                  아직 관련된 글이 없습니다.
                </p>
                <p className="text-sm text-text-tertiary">
                  다른 글의 제목을 이 글의 내용에 언급하면 자동으로 링크가 생성됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

