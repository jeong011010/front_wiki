import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // 공개된 글들 가져오기
  // 빌드 시 데이터베이스가 없을 수 있으므로 try-catch로 처리
  let articles: Array<{ slug: string; updatedAt: Date }> = []
  try {
    articles = await prisma.article.findMany({
      where: {
        status: 'published',
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
  } catch (error) {
    // 빌드 시 데이터베이스가 없으면 빈 배열 사용
    console.warn('Sitemap: Database not available during build, using empty articles list')
    articles = []
  }

  // 글 URL들
  const articleUrls: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/articles/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // 정적 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  return [...staticPages, ...articleUrls]
}

