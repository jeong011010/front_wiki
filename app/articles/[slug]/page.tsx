import ArticleContentWithPreview from '@/components/ArticleContentWithPreview'
import Header from '@/components/Header'
import ArticleActions from '@/components/ArticleActions'
import ArticleContributeButton from '@/components/ArticleContributeButton'
import ArticleLikeView from '@/components/ArticleLikeView'
import RelationTypeSelector from '@/components/RelationTypeSelector'
import TableOfContents from '@/components/TableOfContents'
import ArticleComments from '@/components/ArticleComments'
import { getSessionUser } from '@/lib/auth'
import { detectKeywords, insertLinksInTitle } from '@/lib/link-detector'
import { addHeadingIds } from '@/lib/markdown-utils'
import { prisma, withRetry } from '@/lib/prisma'
import type { ArticleDetail, ArticleLinkWithFromArticle, ArticleLinkWithToArticle, RelationType } from '@/types'
import type { Article } from '@prisma/client'
import { marked } from 'marked'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = slug.includes('%') ? decodeURIComponent(slug) : slug
  
  const article = await withRetry(() => prisma.article.findUnique({
    where: { slug: decodedSlug },
  })) as (Article & { author?: { name: string } | null; status: string }) | null

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
  
  const article = await withRetry(() => prisma.article.findUnique({
    where: { slug: decodedSlug },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      authorId: true,
      categoryId: true,
      views: true,
      likes: true,
      commentsCount: true,
      referencedCount: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
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
      },
    },
  }))
  
  if (!article) {
    notFound()
  }
  
  // relationType으로 정렬
  type LinkWithRelation = {
    relationType: string
    toArticle?: { id: string; title: string; slug: string }
    fromArticle?: { id: string; title: string; slug: string }
    [key: string]: unknown
  }
  
  const sortedOutgoingLinks = [...(article.outgoingLinks as unknown as LinkWithRelation[])].sort((a, b) => {
    const order: Record<string, number> = { 'parent-child': 0, 'related': 1, 'reference': 2, 'auto': 3 }
    return (order[a.relationType] ?? 99) - (order[b.relationType] ?? 99)
  })
  
  const sortedIncomingLinks = [...(article.incomingLinks as unknown as LinkWithRelation[])].sort((a, b) => {
    const order: Record<string, number> = { 'parent-child': 0, 'related': 1, 'reference': 2, 'auto': 3 }
    return (order[a.relationType] ?? 99) - (order[b.relationType] ?? 99)
  })
  
  // 타입 캐스팅
  const articleDetail = {
    ...article,
    outgoingLinks: sortedOutgoingLinks.map((link) => ({
      ...link,
      relationType: link.relationType,
      toArticle: link.toArticle!,
    })) as ArticleLinkWithToArticle[],
    incomingLinks: sortedIncomingLinks.map((link) => ({
      ...link,
      relationType: link.relationType,
      fromArticle: link.fromArticle!,
    })) as ArticleLinkWithFromArticle[],
  } as ArticleDetail

  // 비공개 글 체크 (관리자 또는 작성자만 볼 수 있음)
  if (articleDetail.status !== 'published') {
    if (!user) {
      notFound() // 비회원은 404
    }
    if (user.role !== 'admin' && articleDetail.authorId !== user.id) {
      notFound() // 작성자나 관리자가 아니면 404
    }
  }

  // 먼저 마크다운을 HTML로 변환
  let htmlContent = marked(article.content, {
    breaks: true,
    gfm: true,
  }) as string
  
  // 자동 링크 삽입 (자기 자신 제외)
  const detectedLinks = (await detectKeywords(articleDetail.content)).filter(
    (link) => link.articleId !== articleDetail.id
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
      return `${before}${prefix}<a href="/articles/${slug}" class="text-link hover:text-link-hover underline font-medium" data-article-slug="${slug}">${keywordMatch}</a>${suffix}${after}`
    })
  }
  
  // 헤딩에 ID 추가
  htmlContent = addHeadingIds(htmlContent, article.content)

  // 제목에 링크 삽입 (자기 자신 제외)
  const titleWithLinks = await insertLinksInTitle(articleDetail.title, articleDetail.id)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-20 md:pb-8 relative">
        {/* 목차 컴포넌트 */}
        <TableOfContents content={articleDetail.content} />
        
        <div className="bg-surface rounded-2xl shadow-sm p-4 md:p-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 md:mb-6">
            <div className="flex-1">
              <h1 
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3"
                dangerouslySetInnerHTML={{ __html: titleWithLinks }}
              />
              {/* 작성자 정보 */}
              {article.author && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {article.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-text-primary">{article.author.name}</span>
                    <span className="text-xs text-text-secondary">작성자</span>
                  </div>
                </div>
              )}
              {/* 작성일/수정일 */}
              <div className="text-xs md:text-sm text-text-secondary flex flex-col sm:flex-row gap-2 sm:gap-0">
                <span>작성일: {new Date(articleDetail.createdAt).toLocaleDateString('ko-KR')}</span>
                {articleDetail.updatedAt !== articleDetail.createdAt && (
                  <span className="sm:ml-4">
                    수정일: {new Date(articleDetail.updatedAt).toLocaleDateString('ko-KR')}
                  </span>
                )}
              </div>
              {/* 조회수 및 좋아요 */}
              <div className="mt-3">
                <ArticleLikeView 
                  slug={articleDetail.slug}
                  initialViews={article.views}
                  initialLikes={article.likes}
                />
              </div>
            </div>
            {/* 액션 버튼들 */}
            <div className="flex gap-2 flex-shrink-0 flex-col sm:flex-row">
              {/* 기여 버튼 (모든 로그인 사용자) */}
              <ArticleContributeButton
                articleId={articleDetail.id}
                articleSlug={articleDetail.slug}
                articleContent={article.content}
              />
              {/* 수정/삭제 버튼 (작성자 또는 관리자만) */}
              <ArticleActions 
                articleId={articleDetail.id} 
                articleSlug={articleDetail.slug}
                authorId={articleDetail.authorId}
              />
            </div>
          </div>

          <ArticleContentWithPreview htmlContent={htmlContent} />

          {/* 관련 링크 섹션 */}
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-divider">
            {(articleDetail.outgoingLinks.length > 0 || articleDetail.incomingLinks.length > 0) ? (
              <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-text-primary">관련 글</h2>
                <p className="text-xs md:text-sm text-text-secondary">
                  💡 배지를 클릭하여 관계 유형을 변경할 수 있습니다. &quot;부모-자식&quot;으로 설정하면 다이어그램에 연결선이 표시됩니다.
                </p>
              </div>
              
              {article.outgoingLinks.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-text-primary">
                    이 글에서 참조하는 글:
                  </h3>
                  <ul className="list-disc list-inside space-y-2 md:space-y-3">
                    {articleDetail.outgoingLinks.map((link: ArticleLinkWithToArticle) => (
                      <li key={link.id} className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/articles/${link.toArticle.slug}`}
                            className="text-link hover:text-link-hover underline transition-colors font-medium break-words"
                          >
                            {link.toArticle.title}
                          </Link>
                          <span className="text-xs md:text-sm text-text-secondary">
                            ({link.keyword})
                          </span>
                        </div>
                        <RelationTypeSelector
                          fromArticleId={articleDetail.id}
                          toArticleId={link.toArticle.id}
                          keyword={link.keyword}
                          currentType={link.relationType as RelationType}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {articleDetail.incomingLinks.length > 0 && (
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-text-primary">
                    이 글을 참조하는 글:
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    {articleDetail.incomingLinks.map((link: ArticleLinkWithFromArticle) => (
                      <li key={link.id} className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/articles/${link.fromArticle.slug}`}
                            className="text-link hover:text-link-hover underline transition-colors font-medium break-words"
                          >
                            {link.fromArticle.title}
                          </Link>
                          <span className="text-xs md:text-sm text-text-secondary">
                            ({link.keyword})
                          </span>
                        </div>
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

          {/* 댓글 섹션 */}
          <ArticleComments 
            articleSlug={decodedSlug}
            currentUserId={user?.id}
            currentUserRole={user?.role}
          />
        </div>
      </main>
    </div>
  )
}

