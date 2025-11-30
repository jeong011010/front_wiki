import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { insertLinksInTitle } from '@/lib/link-detector'

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

    // 보유 카드 조회
    const [userCards, total] = await Promise.all([
      prisma.userCard.findMany({
        where: { userId: user.id },
        include: {
          article: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
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
      }),
      prisma.userCard.count({
        where: { userId: user.id },
      }),
    ])

    // 카드 데이터 포맷팅 및 제목에 링크 삽입
    const cards = await Promise.all(userCards.map(async (userCard) => {
      // 제목에 링크 삽입 (자기 자신 제외)
      const titleWithLinks = await insertLinksInTitle(userCard.article.title, userCard.article.id)
      
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

