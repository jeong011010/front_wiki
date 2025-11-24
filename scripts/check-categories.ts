import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCategories() {
  try {
    // 모든 글 조회
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        categoryId: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    })
    
    console.log(`\n총 ${articles.length}개의 글:\n`)
    articles.forEach((article) => {
      console.log(`- "${article.title}" (${article.status}) → ${article.category?.name || '카테고리 없음'}`)
    })
    
    // 카테고리별 개수
    const categoryCounts = new Map<string, number>()
    articles.forEach((article) => {
      if (article.category) {
        const count = categoryCounts.get(article.category.name) || 0
        categoryCounts.set(article.category.name, count + 1)
      }
    })
    
    console.log(`\n카테고리별 개수:`)
    categoryCounts.forEach((count, name) => {
      console.log(`- ${name}: ${count}개`)
    })
    
    // published 상태인 글 중 카테고리가 있는 글
    const publishedWithCategory = articles.filter(
      (a) => a.status === 'published' && a.categoryId !== null
    )
    console.log(`\nPublished 상태이면서 카테고리가 있는 글: ${publishedWithCategory.length}개`)
    
  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkCategories()
  .then(() => {
    console.log('\n완료!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('오류 발생:', error)
    process.exit(1)
  })

