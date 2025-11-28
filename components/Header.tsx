'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthButton from './AuthButton'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // 메뉴가 열려있을 때 스크롤 방지
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  // 경로 변경 시 메뉴 닫기
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { href: '/diagram', label: '지식 그래프' },
    { href: '/articles', label: '글 목록' },
  ]

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* 로고 */}
          <Link 
            href="/" 
            className="text-xl md:text-2xl font-bold text-primary-500 hover:text-primary-700 transition-colors"
          >
            프론트위키
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex gap-4 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  pathname === link.href
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-300 text-text-primary hover:bg-secondary-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <AuthButton />
          </nav>

          {/* 모바일 햄버거 버튼 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-text-primary hover:bg-secondary-300 transition-colors"
            aria-label="메뉴 열기"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <nav className="flex flex-col py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded-lg transition-all font-medium ${
                    pathname === link.href
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-300 text-text-primary hover:bg-secondary-500'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border">
                <AuthButton />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

