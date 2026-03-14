'use client'

import { motion } from 'framer-motion'

interface Props {
  streak: number
  size?: 'sm' | 'md' | 'lg'
}

export default function StreakBadge({ streak, size = 'md' }: Props) {
  const sizeClasses = {
    sm: 'text-sm gap-1 px-2 py-1',
    md: 'text-base gap-1.5 px-3 py-1.5',
    lg: 'text-xl gap-2 px-4 py-2',
  }

  return (
    <motion.div
      className={`
        inline-flex items-center font-bold rounded-full
        ${streak > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}
        ${sizeClasses[size]}
      `}
      whileHover={{ scale: 1.05 }}
    >
      <span>{streak > 0 ? '🔥' : '💤'}</span>
      <span>{streak} day{streak !== 1 ? 's' : ''}</span>
    </motion.div>
  )
}
