'server-only'

/**
 * 글의 티어를 계산하는 함수
 * 
 * @param stats - 글의 통계 정보
 * @returns 티어 이름 ('general' | 'frontend' | 'cloud' | 'backend' | 'devops')
 */
export interface ArticleStats {
  incomingLinksCount?: number // 다른 글에서 이 글을 참조하는 링크 수
  outgoingLinksCount?: number // 이 글이 다른 글을 참조하는 링크 수
  userCardsCount?: number // 이 글을 카드로 보유한 사용자 수
  viewCount?: number // 조회수 (나중에 추가될 필드)
  likes?: number // 추천도 (나중에 추가될 필드)
  comments?: number // 댓글 수 (나중에 추가될 필드)
  createdAt?: Date | string // 작성일
}

export function calculateTier(stats: ArticleStats): 'general' | 'frontend' | 'cloud' | 'backend' | 'devops' {
  const {
    incomingLinksCount = 0,
    outgoingLinksCount = 0,
    userCardsCount = 0,
    viewCount = 0,
    likes = 0,
    comments = 0,
    createdAt,
  } = stats

  // 점수 계산 (가중치 적용)
  let score = 0

  // 1. 다른 글에서 많이 언급될수록 중요 (incomingLinks) - 가중치: 3
  score += incomingLinksCount * 3

  // 2. 많이 보유할수록 인기 (userCards) - 가중치: 4
  score += userCardsCount * 4

  // 3. 조회수 (나중에 추가될 필드) - 가중치: 0.1 (로그 스케일 적용)
  if (viewCount > 0) {
    score += Math.log10(viewCount + 1) * 10
  }

  // 4. 추천도 (나중에 추가될 필드) - 가중치: 3
  score += likes * 3

  // 5. 댓글 수 (나중에 추가될 필드) - 가중치: 2
  score += comments * 2

  // 6. 최신도 보너스 (최근 7일 이내 작성된 글은 +5점)
  if (createdAt) {
    const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
    const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceCreation <= 7) {
      score += 5
    } else if (daysSinceCreation <= 30) {
      score += 2 // 최근 30일 이내는 +2점
    }
  }

  // 7. outgoingLinks도 약간의 보너스 (연관성이 높은 글) - 가중치: 0.5
  score += outgoingLinksCount * 0.5

  // 티어 결정
  // 일반: 0-15점
  // 희귀: 16-40점
  // 에픽: 41-80점
  // 레전드: 81-150점
  // 전설: 151점 이상

  if (score >= 151) {
    return 'devops' // 전설 (오렌지/레드)
  } else if (score >= 81) {
    return 'backend' // 레전드 (금색)
  } else if (score >= 41) {
    return 'cloud' // 에픽 (보라색)
  } else if (score >= 16) {
    return 'frontend' // 희귀 (파란색)
  } else {
    return 'general' // 일반 (회색)
  }
}

