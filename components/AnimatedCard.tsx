'use client'

import { motion } from 'framer-motion'
import type { AnimatedCardProps } from '@/types'

export default function AnimatedCard({ children, delay = 0, className = '' }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className={`bg-surface rounded-2xl shadow-sm hover:shadow-lg transition-shadow ${className}`}
    >
      {children}
    </motion.div>
  )
}

