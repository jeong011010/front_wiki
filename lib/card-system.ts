import { prisma } from './prisma'

/**
 * 사용자가 글을 작성했을 때 자동으로 카드 획득
 */
export async function obtainCardByAuthor(userId: string, articleId: string) {
  try {
    // 이미 보유한 카드인지 확인
    const existingCard = await prisma.userCard.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    })

    if (existingCard) {
      return existingCard // 이미 보유 중
    }

    // 카드 획득
    const userCard = await prisma.userCard.create({
      data: {
        userId,
        articleId,
        obtainedBy: 'author',
      },
    })

    // 포인트 추가 (글 작성 시 +50 포인트)
    await addPoints(userId, 50, 'article_created')

    return userCard
  } catch (error) {
    console.error('Error obtaining card by author:', error)
    throw error
  }
}

/**
 * 포인트 추가
 */
export async function addPoints(
  userId: string,
  points: number,
  reason: string
) {
  try {
    // 사용자 포인트 레코드 가져오기 또는 생성
    const userPoint = await prisma.userPoint.upsert({
      where: { userId },
      create: {
        userId,
        points,
        totalPoints: points,
      },
      update: {
        points: {
          increment: points,
        },
        totalPoints: {
          increment: points,
        },
      },
    })

    return userPoint
  } catch (error) {
    console.error('Error adding points:', error)
    throw error
  }
}

/**
 * 포인트 사용 (카드 뽑기 등)
 */
export async function usePoints(userId: string, points: number) {
  try {
    const userPoint = await prisma.userPoint.findUnique({
      where: { userId },
    })

    if (!userPoint || userPoint.points < points) {
      throw new Error('포인트가 부족합니다.')
    }

    const updated = await prisma.userPoint.update({
      where: { userId },
      data: {
        points: {
          decrement: points,
        },
      },
    })

    return updated
  } catch (error) {
    console.error('Error using points:', error)
    throw error
  }
}

/**
 * 랜덤 카드 뽑기
 */
export async function drawRandomCard(
  userId: string,
  drawType: 'normal' | 'premium' = 'normal'
) {
  try {
    // 뽑기 비용 확인
    const cost = drawType === 'premium' ? 500 : 100

    // 포인트 차감
    await usePoints(userId, cost)

    // 랜덤으로 공개된 글 중 하나 선택 (이미 보유한 카드 제외)
    const userCards = await prisma.userCard.findMany({
      where: { userId },
      select: { articleId: true },
    })

    const ownedArticleIds = userCards.map((card) => card.articleId)

    const availableArticles = await prisma.article.findMany({
      where: {
        status: 'published',
        id: {
          notIn: ownedArticleIds.length > 0 ? ownedArticleIds : undefined,
        },
      },
      select: {
        id: true,
      },
    })

    // 꽝 확률 (10%)
    const isMiss = Math.random() < 0.1

    let articleId: string | null = null
    if (!isMiss && availableArticles.length > 0) {
      // 랜덤 선택
      const randomIndex = Math.floor(Math.random() * availableArticles.length)
      articleId = availableArticles[randomIndex].id

      // 카드 획득
      await prisma.userCard.create({
        data: {
          userId,
          articleId,
          obtainedBy: 'draw',
        },
      })
    }

    // 뽑기 기록 저장
    const drawRecord = await prisma.cardDraw.create({
      data: {
        userId,
        articleId,
        cost,
        drawType,
      },
    })

    return {
      success: !isMiss && articleId !== null,
      articleId,
      drawRecord,
    }
  } catch (error) {
    console.error('Error drawing random card:', error)
    throw error
  }
}

