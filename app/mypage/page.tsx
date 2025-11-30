'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import ArticleCard from '@/components/ArticleCard'
import { Button } from '@/components/ui'
import { apiGet, apiPost } from '@/lib/http'
import { getCurrentUser, logout } from '@/lib/auth-client'
import type { User } from '@/lib/auth-client'

interface UserStats {
  cardCount: number
  points: number
  totalPoints: number
  articleCount: number
}

interface UserCard {
  id: string
  article: {
    id: string
    title: string
    slug: string
    category: {
      id: string
      name: string
      slug: string
    } | null
    author: {
      id: string
      name: string
    } | null
    createdAt: string
  }
  obtainedAt: string
  obtainedBy: 'author' | 'contribution' | 'draw'
}

export default function MyPage() {
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [cards, setCards] = useState<UserCard[]>([])
  const [loading, setLoading] = useState(true)
  const [drawing, setDrawing] = useState(false)
  const [drawResult, setDrawResult] = useState<{ success: boolean; message: string } | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [filterBy, setFilterBy] = useState<'all' | 'author' | 'draw' | 'contribution'>('all')
  
  // 필터링된 카드
  const filteredCards = filterBy === 'all' 
    ? cards 
    : cards.filter(card => card.obtainedBy === filterBy)

  useEffect(() => {
    const init = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login?redirect=/mypage')
        return
      }
      setUser(currentUser)
      fetchStats()
      fetchCards()
    }
    init()
  }, [router])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiGet<UserStats>('/api/mypage/stats')
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // 401 에러 시 로그인 페이지로 리다이렉트
      if (error instanceof Error && error.message.includes('401')) {
        router.push('/auth/login?redirect=/mypage')
      }
    }
  }

  const fetchCards = async () => {
    try {
      setLoading(true)
      const data = await apiGet<{ cards: UserCard[] }>('/api/mypage/cards')
      setCards(data.cards || [])
    } catch (error) {
      console.error('Failed to fetch cards:', error)
      // 401 에러 시 로그인 페이지로 리다이렉트
      if (error instanceof Error && error.message.includes('401')) {
        router.push('/auth/login?redirect=/mypage')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDraw = async (drawType: 'normal' | 'premium' = 'normal') => {
    try {
      setDrawing(true)
      setDrawResult(null)
      
      const data = await apiPost<{ success: boolean; message: string; articleId?: string }>(
        '/api/mypage/draw',
        { drawType }
      )
      
      setDrawResult({
        success: data.success,
        message: data.message,
      })
      
      // 통계 및 카드 목록 새로고침
      if (data.success) {
        await Promise.all([fetchStats(), fetchCards()])
      }
    } catch (error) {
      console.error('Failed to draw card:', error)
      const errorMessage = error instanceof Error ? error.message : '카드 뽑기에 실패했습니다.'
      setDrawResult({
        success: false,
        message: errorMessage,
      })
    } finally {
      setDrawing(false)
    }
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-secondary">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-20 md:pb-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary">마이페이지</h1>
            <div className="flex gap-2">
              {user?.role === 'admin' && (
                <Link
                  href="/admin/review"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium"
                >
                  검토
                </Link>
              )}
              <Button
                onClick={handleLogout}
                variant="secondary"
                className="px-4 py-2"
              >
                로그아웃
              </Button>
            </div>
          </div>
          
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="text-sm text-text-secondary mb-1">보유 카드</div>
              <div className="text-2xl font-bold text-text-primary">{stats.cardCount}</div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="text-sm text-text-secondary mb-1">포인트</div>
              <div className="text-2xl font-bold text-primary-500">{stats.points.toLocaleString()}</div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="text-sm text-text-secondary mb-1">누적 포인트</div>
              <div className="text-2xl font-bold text-text-primary">{stats.totalPoints.toLocaleString()}</div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="text-sm text-text-secondary mb-1">작성한 글</div>
              <div className="text-2xl font-bold text-text-primary">{stats.articleCount}</div>
            </div>
          </div>

          {/* 카드 뽑기 섹션 */}
          <div className="bg-surface border border-border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">카드 뽑기</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="text-sm text-text-secondary mb-2">일반 뽑기 (100 포인트)</div>
                <Button
                  onClick={() => handleDraw('normal')}
                  disabled={drawing || stats.points < 100}
                  className="w-full"
                >
                  {drawing ? '뽑는 중...' : '일반 뽑기'}
                </Button>
              </div>
              <div className="flex-1">
                <div className="text-sm text-text-secondary mb-2">프리미엄 뽑기 (500 포인트)</div>
                <Button
                  onClick={() => handleDraw('premium')}
                  disabled={drawing || stats.points < 500}
                  className="w-full"
                  variant="secondary"
                >
                  {drawing ? '뽑는 중...' : '프리미엄 뽑기'}
                </Button>
              </div>
            </div>
            {drawResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                drawResult.success 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              }`}>
                {drawResult.message}
              </div>
            )}
          </div>
        </div>

        {/* 보유 카드 목록 */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-1">보유 카드</h2>
              <p className="text-sm text-text-secondary">총 {cards.length}장의 카드를 보유하고 있습니다</p>
            </div>
            {/* 필터 버튼 */}
            {cards.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterBy('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filterBy === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setFilterBy('author')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filterBy === 'author'
                      ? 'bg-blue-500 text-white'
                      : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  작성 ({cards.filter(c => c.obtainedBy === 'author').length})
                </button>
                <button
                  onClick={() => setFilterBy('draw')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filterBy === 'draw'
                      ? 'bg-purple-500 text-white'
                      : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  뽑기 ({cards.filter(c => c.obtainedBy === 'draw').length})
                </button>
                <button
                  onClick={() => setFilterBy('contribution')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filterBy === 'contribution'
                      ? 'bg-green-500 text-white'
                      : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  기여 ({cards.filter(c => c.obtainedBy === 'contribution').length})
                </button>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="text-text-secondary text-center py-12">로딩 중...</div>
          ) : filteredCards.length === 0 ? (
            <div className="bg-surface border border-border rounded-lg p-12 text-center">
              {cards.length === 0 ? (
                <>
                  <div className="text-6xl mb-4">🎴</div>
                  <p className="text-text-secondary mb-2 text-lg font-semibold">아직 보유한 카드가 없습니다</p>
                  <p className="text-sm text-text-tertiary mb-6">글을 작성하거나 카드를 뽑아보세요!</p>
                  <div className="flex gap-2 justify-center">
                    <Link
                      href="/articles/new"
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                    >
                      글 작성하기
                    </Link>
                    <button
                      onClick={() => handleDraw('normal')}
                      disabled={stats.points < 100}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      카드 뽑기
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-text-secondary">선택한 필터에 해당하는 카드가 없습니다</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredCards.map((userCard) => (
                <div key={userCard.id} className="relative group">
                  <div className="relative transform transition-transform hover:scale-105 duration-200">
                    <ArticleCard
                      article={{
                        id: userCard.article.id,
                        title: userCard.article.title,
                        titleWithLinks: 'titleWithLinks' in userCard.article 
                          ? (userCard.article as { titleWithLinks?: string }).titleWithLinks 
                          : undefined,
                        slug: userCard.article.slug,
                        category: userCard.article.category?.name || null,
                        categorySlug: userCard.article.category?.slug || null,
                        createdAt: userCard.article.createdAt,
                        updatedAt: userCard.article.createdAt,
                        tier: 'tier' in userCard.article 
                          ? (userCard.article as { tier?: 'general' | 'frontend' | 'cloud' | 'backend' | 'devops' }).tier 
                          : undefined,
                        views: 'views' in userCard.article 
                          ? (userCard.article as { views?: number }).views || 0
                          : 0,
                        likes: 'likes' in userCard.article 
                          ? (userCard.article as { likes?: number }).likes || 0
                          : 0,
                        author: userCard.article.author ? {
                          name: userCard.article.author.name,
                          email: '',
                        } : null,
                      }}
                    />
                    {/* 획득 방법 배지 - 더 세련되게 */}
                    <div className="absolute top-2 right-2 z-50 opacity-90 group-hover:opacity-100 transition-opacity">
                      <div className={`px-2 py-1 text-[10px] font-bold rounded-lg shadow-lg backdrop-blur-sm ${
                        userCard.obtainedBy === 'author'
                          ? 'bg-blue-500/90 text-white'
                          : userCard.obtainedBy === 'draw'
                          ? 'bg-purple-500/90 text-white'
                          : 'bg-green-500/90 text-white'
                      }`}>
                        {userCard.obtainedBy === 'author' ? '✍️ 작성' : userCard.obtainedBy === 'draw' ? '🎲 뽑기' : '🤝 기여'}
                      </div>
                    </div>
                    {/* 획득 날짜 툴팁 */}
                    <div className="absolute bottom-2 left-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-black/80 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                        {new Date(userCard.obtainedAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

