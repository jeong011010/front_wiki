'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/articles?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex gap-2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="글 검색..."
        className="px-4 py-2.5 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[250px] text-text-primary placeholder:text-text-tertiary transition-all"
      />
      <motion.button
        type="submit"
        disabled={isSearching || !query.trim()}
        className="px-5 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:shadow-md"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        검색
      </motion.button>
    </motion.form>
  )
}

