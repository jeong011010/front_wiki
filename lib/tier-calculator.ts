import 'server-only'

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
  views?: number // 조회수
  likes?: number // 추천 수
  commentsCount?: number // 댓글 수
  referencedCount?: number // 이 글을 참조하는 글 개수
  createdAt?: Date | string // 작성일
}

/**
 * 티어 계산 가중치 설정
 * 환경 변수로 조정 가능하도록 설정 (선택사항)
 */
const TIER_WEIGHTS = {
  comments: 10,        // 댓글 수 가중치
  likes: 5,            // 추천 수 가중치
  views: 0.1,          // 조회수 가중치 (로그 스케일 적용)
  referencedCount: 20, // 참조 글 개수 가중치
  incomingLinks: 3,    // 다른 글에서 이 글을 참조하는 링크 수
  userCards: 4,        // 카드 보유자 수
  outgoingLinks: 0.5,  // 이 글이 다른 글을 참조하는 링크 수
}

/**
 * 티어 점수 기준
 */
const TIER_THRESHOLDS = {
  devops: 1000,   // 전설 (오렌지/레드)
  backend: 500,   // 레전드 (금색)
  cloud: 200,     // 에픽 (보라색)
  frontend: 50,   // 희귀 (파란색)
  general: 0,     // 일반 (회색)
}

export function calculateTier(stats: ArticleStats): 'general' | 'frontend' | 'cloud' | 'backend' | 'devops' {
  const {
    incomingLinksCount = 0,
    outgoingLinksCount = 0,
    userCardsCount = 0,
    views = 0,
    likes = 0,
    commentsCount = 0,
    referencedCount = 0,
    createdAt,
  } = stats

  // 점수 계산 (가중치 적용)
  let score = 0

  // 1. 댓글 수 - 가중치: 10
  score += commentsCount * TIER_WEIGHTS.comments

  // 2. 추천 수 - 가중치: 5
  score += likes * TIER_WEIGHTS.likes

  // 3. 조회수 - 가중치: 0.1 (로그 스케일 적용하여 과도한 조회수 영향 완화)
  if (views > 0) {
    score += Math.log10(views + 1) * 10
  }

  // 4. 참조 글 개수 - 가중치: 20 (가장 높은 가중치)
  score += referencedCount * TIER_WEIGHTS.referencedCount

  // 5. 다른 글에서 이 글을 참조하는 링크 수 - 가중치: 3
  score += incomingLinksCount * TIER_WEIGHTS.incomingLinks

  // 6. 카드 보유자 수 - 가중치: 4
  score += userCardsCount * TIER_WEIGHTS.userCards

  // 7. 이 글이 다른 글을 참조하는 링크 수 - 가중치: 0.5
  score += outgoingLinksCount * TIER_WEIGHTS.outgoingLinks

  // 8. 최신도 보너스 (최근 7일 이내 작성된 글은 +5점)
  if (createdAt) {
    const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
    const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceCreation <= 7) {
      score += 5
    } else if (daysSinceCreation <= 30) {
      score += 2 // 최근 30일 이내는 +2점
    }
  }

  // 티어 결정 (이슈 문서의 공식 기준 적용)
  if (score >= TIER_THRESHOLDS.devops) {
    return 'devops' // 전설 (오렌지/레드)
  } else if (score >= TIER_THRESHOLDS.backend) {
    return 'backend' // 레전드 (금색)
  } else if (score >= TIER_THRESHOLDS.cloud) {
    return 'cloud' // 에픽 (보라색)
  } else if (score >= TIER_THRESHOLDS.frontend) {
    return 'frontend' // 희귀 (파란색)
  } else {
    return 'general' // 일반 (회색)
  }
}

