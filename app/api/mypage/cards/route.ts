import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { prisma, withRetry } from '@/lib/prisma'
import { insertLinksInTitle } from '@/lib/link-detector'
import { calculateTier } from '@/lib/tier-calculator'

/**
 * GET: 보유 카드 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult.error || !authResult.user) {
      return authResult.error || NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const user = authResult.user
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = (page - 1) * limit

    // 보유 카드 조회 (연결 재시도 로직 포함)
    const [userCards, total] = await Promise.all([
      withRetry(() => prisma.userCard.findMany({
        where: { userId: user.id },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              createdAt: true,
              views: true,
              likes: true,
              commentsCount: true,
              referencedCount: true,
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              _count: {
                select: {
                  incomingLinks: true,
                  outgoingLinks: true,
                  userCards: true,
                },
              },
            },
          },
        },
        orderBy: {
          obtainedAt: 'desc',
        },
        take: limit,
        skip: offset,
      })),
      withRetry(() => prisma.userCard.count({
        where: { userId: user.id },
      })),
    ])

    // 카드 데이터 포맷팅 및 제목에 링크 삽입
    const cards = await Promise.all(userCards.map(async (userCard) => {
      // 제목에 링크 삽입 (자기 자신 제외) - 에러 발생 시 원본 제목 사용
      let titleWithLinks = userCard.article.title
      try {
        titleWithLinks = await insertLinksInTitle(userCard.article.title, userCard.article.id)
      } catch (error) {
        console.error('Error inserting links in title:', error)
        // 에러 발생 시 원본 제목 사용
      }
      
      // 티어 계산 (새 필드 포함)
      const tier = calculateTier({
        incomingLinksCount: userCard.article._count?.incomingLinks || 0,
        outgoingLinksCount: userCard.article._count?.outgoingLinks || 0,
        userCardsCount: userCard.article._count?.userCards || 0,
        views: userCard.article.views || 0,
        likes: userCard.article.likes || 0,
        commentsCount: userCard.article.commentsCount || 0,
        referencedCount: userCard.article.referencedCount || 0,
        createdAt: userCard.article.createdAt,
      })
      
      return {
        id: userCard.id,
        article: {
          id: userCard.article.id,
          title: userCard.article.title,
          titleWithLinks, // 링크가 포함된 제목 HTML
          slug: userCard.article.slug,
          category: userCard.article.category
            ? {
                id: userCard.article.category.id,
                name: userCard.article.category.name,
                slug: userCard.article.category.slug,
              }
            : null,
          author: userCard.article.author
            ? {
                id: userCard.article.author.id,
                name: userCard.article.author.name,
              }
            : null,
          createdAt: userCard.article.createdAt,
          tier, // 계산된 티어
          views: userCard.article.views || 0,
          likes: userCard.article.likes || 0,
        },
        obtainedAt: userCard.obtainedAt,
        obtainedBy: userCard.obtainedBy,
      }
    }))

    return NextResponse.json({
      cards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching user cards:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', { errorMessage, errorStack })
    return NextResponse.json(
      { error: '보유 카드를 불러오는데 실패했습니다.', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    )
  }
}

