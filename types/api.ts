import { ArticleBasic, ArticleDetail, ArticleListItem } from './article'
import { DiagramNode, DiagramEdge } from './diagram'

/**
 * API 에러 응답 타입
 */
export type ApiErrorResponse = {
  error: string
  message?: string | unknown
}

/**
 * Articles API 응답 타입
 */
export type ArticlesListResponse = ArticleListItem[]

export type ArticleDetailResponse = ArticleDetail

export type ArticleCreateResponse = ArticleBasic

export type ArticleUpdateResponse = ArticleBasic

export type ArticleDeleteResponse = {
  success: boolean
}

/**
 * Diagram API 응답 타입
 */
export type DiagramResponse = {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
} | (ApiErrorResponse & {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
})

/**
 * Keywords API 응답 타입
 */
export type KeywordsResponse = Array<{
  id: string
  title: string
}>

/**
 * Link API 응답 타입
 */
export type LinkCreateResponse = {
  id: string
  keyword: string
  fromArticleId: string
  toArticleId: string
  relationType: string
  createdAt: Date
}

export type LinkDeleteResponse = {
  success: boolean
}

/**
 * Search API 응답 타입
 */
export type SearchResponse = {
  articles: ArticleListItem[]
}

