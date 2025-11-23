import { NextRequest, NextResponse } from 'next/server'
import { detectKeywords } from '@/lib/link-detector'
import { DetectedLink } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, excludeArticleId } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const detectedLinks = await detectKeywords(text)
    
    // 자기 자신 제외
    const validLinks = excludeArticleId
      ? detectedLinks.filter(link => link.articleId !== excludeArticleId)
      : detectedLinks

    return NextResponse.json<DetectedLink[]>(validLinks)
  } catch (error) {
    console.error('Link detection error:', error)
    return NextResponse.json({ error: 'Failed to detect links' }, { status: 500 })
  }
}

