import { ArticleBasic } from './article'
import { RelationType } from './article'

/**
 * AutoLinkEditor Props 타입
 */
export type AutoLinkEditorProps = {
  initialTitle?: string
  initialContent?: string
  articleId?: string
}

/**
 * DeleteButton Props 타입
 */
export type DeleteButtonProps = {
  articleId: string
  articleSlug: string
}

/**
 * RelationTypeSelector Props 타입
 */
export type RelationTypeSelectorProps = {
  fromArticleId: string
  toArticleId: string
  keyword: string
  currentType: RelationType
}

/**
 * AnimatedCard Props 타입
 */
export type AnimatedCardProps = {
  children: React.ReactNode
  delay?: number
  className?: string
}

/**
 * SearchBar에서 사용하는 Keyword 타입
 */
export type Keyword = {
  id: string
  title: string
}

/**
 * 자동 링크 제안 타입
 */
export type LinkSuggestion = {
  keyword: string
  articles: Keyword[]
}

