'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button, Input } from '@/components/ui'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('search') || '')
  const [isSearching, setIsSearching] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsSearching(true)
      router.push(`/articles?search=${encodeURIComponent(query.trim())}`)
      // 검색 후 로딩 상태 리셋
      setTimeout(() => setIsSearching(false), 500)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex gap-1.5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="검색..."
        className="min-w-[120px] sm:min-w-[150px] md:min-w-[180px] text-xs sm:text-sm py-1 sm:py-1.5 md:py-2"
      />
      <Button
        type="submit"
        disabled={isSearching || !query.trim()}
        size="sm"
        className="px-2 sm:px-3 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm whitespace-nowrap"
      >
        검색
      </Button>
    </motion.form>
  )
}

