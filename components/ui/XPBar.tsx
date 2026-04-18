'use client'

import { motion } from 'framer-motion'

interface Props {
  xp: number
  level: number
}

function xpForLevel(level: number): number {
  return level * 500
}

export default function XPBar({ xp, level }: Props) {
  const threshold = xpForLevel(level)
  const prev = xpForLevel(level - 1)
  const progress = Math.min(((xp - prev) / (threshold - prev)) * 100, 100)

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-white/50 mb-1.5">
        <span>Level {level}</span>
        <span>{xp.toLocaleString()} XP</span>
      </div>
      <div className="h-2 bg-white/15 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gold rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
