import { prisma } from '../lib/prisma'
import { detectKeywords } from '../lib/link-detector'

async function regenerateLinks() {
  console.log('링크 재생성 시작...')
  
  // 모든 글 가져오기
  const articles = await prisma.article.findMany({
    select: {
      id: true,
      title: true,
      content: true,
    },
  })
  
  console.log(`총 ${articles.length}개의 글을 처리합니다.`)
  
  // 기존 링크 모두 삭제
  await prisma.articleLink.deleteMany({})
  console.log('기존 링크 삭제 완료')
  
  // 각 글에 대해 링크 재생성
  for (const article of articles) {
    try {
      const detectedLinks = await detectKeywords(article.content)
      const validLinks = detectedLinks.filter(link => link.articleId !== article.id)
      
      if (validLinks.length > 0) {
        const linkPromises = validLinks.map((link) =>
          prisma.articleLink.create({
            data: {
              keyword: link.keyword,
              fromArticleId: article.id,
              toArticleId: link.articleId,
              relationType: 'auto',
            },
          }).catch((err) => {
            console.warn(`링크 생성 실패: ${article.title} -> ${link.title}`, err)
            return null
          })
        )
        
        await Promise.all(linkPromises)
        console.log(`✓ ${article.title}: ${validLinks.length}개의 링크 생성`)
      } else {
        console.log(`- ${article.title}: 링크 없음`)
      }
    } catch (error) {
      console.error(`오류: ${article.title}`, error)
    }
  }
  
  console.log('링크 재생성 완료!')
}

regenerateLinks()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

