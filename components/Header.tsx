'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthButton from './AuthButton'

export default function Header() {
  const pathname = usePathname()

  const navLinks = [
    { href: '/diagram', label: '지식 그래프' },
    { href: '/articles', label: '글 목록' },
    { href: '/mypage', label: '마이페이지' },
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
        </div>
      </div>
    </header>
  )
}

