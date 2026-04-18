'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import StreakBadge from '@/components/ui/StreakBadge'
import XPBar from '@/components/ui/XPBar'
import wordsData from '@/data/words.json'
import storyData from '@/data/story.json'
import { Word, StoryChapter } from '@/types'
import { levelMasteryPercent } from '@/lib/srs'

const words = wordsData as Word[]
const story = storyData as StoryChapter[]

// Region-coded arc styles
const ARC_META = [
  { name: 'São Paulo',      color: 'bg-blue-700',   text: 'text-blue-700',   border: 'border-blue-200',   activeBg: 'bg-blue-700'   },
  { name: 'Rio de Janeiro', color: 'bg-teal-600',   text: 'text-teal-600',   border: 'border-teal-200',   activeBg: 'bg-teal-600'   },
  { name: 'Minas Gerais',   color: 'bg-orange-700', text: 'text-orange-700', border: 'border-orange-200', activeBg: 'bg-orange-700' },
  { name: 'Bahia',          color: 'bg-amber-600',  text: 'text-amber-600',  border: 'border-amber-200',  activeBg: 'bg-amber-600'  },
  { name: 'Amazônia',       color: 'bg-green-700',  text: 'text-green-700',  border: 'border-green-200',  activeBg: 'bg-green-700'  },
]

export default function Dashboard() {
  const router = useRouter()
  const { player, wordProgress } = useGameStore()

  useEffect(() => {
    if (!player) router.replace('/')
  }, [player, router])

  if (!player) return null

  const totalMastered = wordProgress.filter(p => p.strength >= 5).length

  const chapters = Array.from({ length: 20 }, (_, i) => {
    const level = i + 1
    const chapter = story.find(s => s.level === level)
    const levelWords = words.filter(w => w.level === level)
    const mastery = levelMasteryPercent(wordProgress, levelWords.map(w => w.id))
    const isUnlocked = level <= player.current_level
    const isCurrent = level === player.current_level
    return { level, chapter, mastery, isUnlocked, isCurrent, arc: chapter?.arc ?? 1 }
  })

  return (
    <main className="min-h-screen bg-cream pb-24">

      {/* Header */}
      <div className="bg-navy px-5 pt-12 pb-7">
        <div className="max-w-md mx-auto">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">A Jornada</h1>
              <p className="text-white/50 text-sm mt-0.5">
                {totalMastered} / 2,000 words mastered
              </p>
            </div>
            <StreakBadge streak={player.streak} />
          </div>
          <XPBar xp={player.xp} level={player.current_level} />
        </div>
      </div>

      <div className="max-w-md mx-auto px-5">

        {/* Practice button */}
        <motion.button
          onClick={() => router.push('/play')}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-gold text-navy font-extrabold text-lg py-5 rounded-2xl shadow-md hover:brightness-105 transition mt-5"
        >
          Practice now
        </motion.button>

        {/* Journey map */}
        <h2 className="text-navy/40 font-bold text-xs uppercase tracking-widest mt-8 mb-4">
          Your journey
        </h2>

        {[1, 2, 3, 4, 5].map(arcNum => {
          const arc = ARC_META[arcNum - 1]
          const arcChapters = chapters.filter(c => c.arc === arcNum)

          return (
            <div key={arcNum} className="mb-7">
              {/* Arc label */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`${arc.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                  Arc {arcNum}
                </span>
                <span className="text-navy/50 text-sm font-semibold">{arc.name}</span>
              </div>

              {/* Level tiles */}
              <div className="grid grid-cols-4 gap-2.5">
                {arcChapters.map(({ level, chapter, mastery, isUnlocked, isCurrent }) => (
                  <motion.div
                    key={level}
                    whileTap={isUnlocked ? { scale: 0.94 } : {}}
                    onClick={() => isUnlocked && router.push('/play')}
                    className={[
                      'relative rounded-2xl p-3 text-center select-none',
                      isCurrent
                        ? `${arc.activeBg} shadow-md cursor-pointer`
                        : isUnlocked
                          ? `bg-white border-2 ${arc.border} hover:shadow-sm cursor-pointer transition`
                          : 'bg-sand/60 cursor-not-allowed',
                    ].join(' ')}
                  >
                    <div className="text-2xl mb-1">{chapter?.image_emoji ?? '📍'}</div>
                    <div className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-navy/60'}`}>
                      {level}
                    </div>

                    {/* Mastery bar */}
                    {isUnlocked && (
                      <div className="mt-1.5 h-1 bg-black/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white/70 rounded-full transition-all duration-500"
                          style={{ width: `${mastery}%` }}
                        />
                      </div>
                    )}
                    {!isUnlocked && (
                      <div className="text-navy/25 text-xs mt-0.5">🔒</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
