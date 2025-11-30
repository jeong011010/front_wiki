import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtainCardByAuthor } from '@/lib/card-system'

/**
 * 임시 마이그레이션 API
 * 기존 글 작성자들에게 카드 부여
 * ⚠️ 프로덕션에서는 사용하지 마세요
 */
export async function POST(request: NextRequest) {
  // 개발 환경에서만 실행 가능
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  // 보안: 특정 시크릿 키 필요
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET || 'dev-only'}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // 모든 공개된 글 조회 (작성자가 있는 글만)
    const articles = await prisma.article.findMany({
      where: {
        status: 'published',
        authorId: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        authorId: true,
      },
    })

    console.log(`[카드 부여] 총 ${articles.length}개의 글 발견`)

    const results = {
      total: articles.length,
      success: 0,
      skipped: 0,
      errors: [] as string[],
    }

    // 각 글에 대해 카드 부여
    for (const article of articles) {
      if (!article.authorId) {
        results.skipped++
        continue
      }

      try {
        // 이미 카드를 보유하고 있는지 확인
        const existingCard = await prisma.userCard.findUnique({
          where: {
            userId_articleId: {
              userId: article.authorId,
              articleId: article.id,
            },
          },
        })

        if (existingCard) {
          console.log(`[카드 부여] 이미 보유: ${article.title} (${article.id})`)
          results.skipped++
          continue
        }

        // 카드 부여
        await obtainCardByAuthor(article.authorId, article.id)
        console.log(`[카드 부여] 성공: ${article.title} (${article.id})`)
        results.success++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`[카드 부여] 실패: ${article.title} (${article.id}) - ${errorMessage}`)
        results.errors.push(`${article.title}: ${errorMessage}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: '카드 부여 완료',
      results,
    })
  } catch (error) {
    console.error('Migration error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}

