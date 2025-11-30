'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function BottomNav() {
  const pathname = usePathname()

  // 기본 네비게이션 항목 (3개만)
  const navItems = [
    { href: '/diagram', label: '지식 그래프', icon: '📊' },
    { href: '/articles', label: '글 목록', icon: '📝' },
    { href: '/mypage', label: '마이페이지', icon: '👤' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-around py-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center px-2 py-2 min-w-0 flex-1 transition-colors ${
                  isActive
                    ? 'text-primary-500'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className="text-xl mb-0.5">{item.icon}</span>
                <span className="text-xs font-medium truncate w-full text-center">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

