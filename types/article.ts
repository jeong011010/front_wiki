import { Article, ArticleLink } from '@prisma/client'

/**
 * 관계 유형
 */
export type RelationType = 'auto' | 'parent-child' | 'related' | 'reference'

/**
 * Article 기본 타입 (Prisma에서 생성)
 */
export type { Article }

/**
 * ArticleLink 기본 타입 (Prisma에서 생성)
 */
export type { ArticleLink }

/**
 * Article의 기본 정보만 포함하는 타입
 */
export type ArticleBasic = Pick<Article, 'id' | 'title' | 'slug' | 'createdAt' | 'updatedAt'>

/**
 * Article의 목록 조회용 타입 (내용 선택적)
 */
export type ArticleListItem = ArticleBasic & {
  content?: string // content는 선택적으로 포함 가능
  status?: string
}

/**
 * Article의 상세 조회용 타입
 */
export type ArticleDetail = Article & {
  status: string
  authorId: string | null
  outgoingLinks: ArticleLinkWithToArticle[]
  incomingLinks: ArticleLinkWithFromArticle[]
}

/**
 * ArticleLink와 연결된 toArticle 정보를 포함하는 타입
 */
export type ArticleLinkWithToArticle = Omit<ArticleLink, 'toArticle'> & {
  relationType: string
  toArticle: {
    id: string
    title: string
    slug: string
  }
}

/**
 * ArticleLink와 연결된 fromArticle 정보를 포함하는 타입
 */
export type ArticleLinkWithFromArticle = Omit<ArticleLink, 'fromArticle'> & {
  relationType: string
  fromArticle: {
    id: string
    title: string
    slug: string
  }
}

/**
 * 링크 감지 결과 타입
 */
export type DetectedLink = {
  keyword: string
  articleId: string
  title: string
  slug: string
}

/**
 * 글 생성/수정 요청 타입
 */
export type ArticleCreateInput = {
  title: string
  content: string
}

export type ArticleUpdateInput = {
  title?: string
  content?: string
}

/**
 * 링크 생성/수정 요청 타입
 */
export type LinkCreateInput = {
  toArticleId: string
  keyword: string
  relationType: RelationType
}

