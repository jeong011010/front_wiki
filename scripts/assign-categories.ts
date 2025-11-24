import { PrismaClient } from '@prisma/client'
import { slugify } from '../lib/utils'

const prisma = new PrismaClient()

/**
 * 기존 글들에 카테고리를 부여하는 스크립트
 * 제목과 내용을 분석하여 적절한 카테고리를 자동 할당
 */
async function assignCategories() {
  try {
    // 먼저 기본 카테고리 생성
    const categories = await createDefaultCategories()
    
    // 모든 글 가져오기
    const articles = await prisma.article.findMany({
      where: {
        categoryId: null,
      },
    })
    
    console.log(`총 ${articles.length}개의 글에 카테고리를 부여합니다...`)
    
    for (const article of articles) {
      const category = determineCategory(article.title, article.content, categories)
      
      if (category) {
        await prisma.article.update({
          where: { id: article.id },
          data: { categoryId: category.id },
        })
        console.log(`✓ "${article.title}" → ${category.name}`)
      } else {
        console.log(`✗ "${article.title}" → 카테고리를 찾을 수 없음`)
      }
    }
    
    console.log('\n카테고리 부여 완료!')
  } catch (error) {
    console.error('Error assigning categories:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * 기본 카테고리 생성
 */
async function createDefaultCategories() {
  const defaultCategories = [
    { name: '프론트엔드', slug: 'frontend', description: '프론트엔드 개발 관련', order: 1 },
    { name: 'React', slug: 'react', description: 'React 관련', order: 1, parent: '프론트엔드' },
    { name: 'Next.js', slug: 'nextjs', description: 'Next.js 관련', order: 2, parent: '프론트엔드' },
    { name: 'Vue', slug: 'vue', description: 'Vue.js 관련', order: 3, parent: '프론트엔드' },
    { name: '백엔드', slug: 'backend', description: '백엔드 개발 관련', order: 2 },
    { name: 'Node.js', slug: 'nodejs', description: 'Node.js 관련', order: 1, parent: '백엔드' },
    { name: '클라우드', slug: 'cloud', description: '클라우드 서비스 관련', order: 3 },
    { name: 'AWS', slug: 'aws', description: 'AWS 관련', order: 1, parent: '클라우드' },
    { name: 'DevOps', slug: 'devops', description: 'DevOps 관련', order: 4 },
    { name: '일반', slug: 'general', description: '일반적인 개발 지식', order: 5 },
  ]
  
  const createdCategories: Record<string, { id: string; name: string }> = {}
  
  for (const cat of defaultCategories) {
    const existing = await prisma.category.findUnique({
      where: { slug: cat.slug },
    })
    
    if (!existing) {
      const parentId = cat.parent ? createdCategories[cat.parent]?.id : null
      
      const created = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          parentId,
          order: cat.order,
        },
      })
      
      createdCategories[cat.name] = { id: created.id, name: created.name }
      console.log(`카테고리 생성: ${cat.name}`)
    } else {
      createdCategories[cat.name] = { id: existing.id, name: existing.name }
    }
  }
  
  return createdCategories
}

/**
 * 제목과 내용을 분석하여 카테고리 결정
 */
function determineCategory(
  title: string, 
  content: string, 
  categories: Record<string, { id: string; name: string }>
): { id: string; name: string } | null {
  const text = `${title} ${content}`.toLowerCase()
  
  // React 관련
  if (text.includes('react') || text.includes('리액트') || text.includes('jsx') || text.includes('component')) {
    return categories['React'] || null
  }
  
  // Next.js 관련
  if (text.includes('next.js') || text.includes('nextjs') || text.includes('app router') || text.includes('pages router')) {
    return categories['Next.js'] || null
  }
  
  // Vue 관련
  if (text.includes('vue') || text.includes('뷰')) {
    return categories['Vue'] || null
  }
  
  // Node.js 관련
  if (text.includes('node.js') || text.includes('nodejs') || text.includes('express') || text.includes('서버')) {
    return categories['Node.js'] || null
  }
  
  // AWS 관련
  if (text.includes('aws') || text.includes('s3') || text.includes('ec2') || text.includes('lambda')) {
    return categories['AWS'] || null
  }
  
  // 클라우드 관련
  if (text.includes('cloud') || text.includes('클라우드') || text.includes('docker') || text.includes('kubernetes')) {
    return categories['클라우드'] || null
  }
  
  // DevOps 관련
  if (text.includes('devops') || text.includes('ci/cd') || text.includes('deploy') || text.includes('배포')) {
    return categories['DevOps'] || null
  }
  
  // 프론트엔드 관련
  if (text.includes('frontend') || text.includes('프론트엔드') || text.includes('javascript') || text.includes('typescript') || text.includes('css') || text.includes('html')) {
    return categories['프론트엔드'] || null
  }
  
  // 백엔드 관련
  if (text.includes('backend') || text.includes('백엔드') || text.includes('api') || text.includes('database') || text.includes('db')) {
    return categories['백엔드'] || null
  }
  
  // 기본값
  return categories['일반'] || null
}

// 스크립트 실행
assignCategories()
  .then(() => {
    console.log('완료!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('오류 발생:', error)
    process.exit(1)
  })

