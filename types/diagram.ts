/**
 * 다이어그램 노드 타입
 */
export type DiagramNode = {
  id: string
  label: string
  slug: string
}

/**
 * 다이어그램 엣지 타입
 */
export type DiagramEdge = {
  id: string
  source: string
  target: string
  label: string
  type?: string
}

/**
 * 다이어그램 데이터 타입
 */
export type DiagramData = {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

