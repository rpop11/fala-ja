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

const ARC_COLORS = [
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-orange-400 to-amber-500',
  'from-pink-400 to-rose-500',
  'from-violet-400 to-purple-500',
]

const ARC_NAMES = ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Amazônia']

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
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-4 pt-10 pb-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black text-white">A Jornada</h1>
              <p className="text-indigo-200 text-sm">{totalMastered} / 2000 words mastered</p>
            </div>
            <StreakBadge streak={player.streak} />
          </div>
          <XPBar xp={player.xp} level={player.current_level} />
        </div>
      </div>

      {/* Play button */}
      <div className="max-w-md mx-auto px-4 mt-4">
        <motion.button
          onClick={() => router.push('/play')}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black text-xl py-5 rounded-3xl shadow-lg hover:shadow-xl transition-shadow"
        >
          ▶ Practice Now
        </motion.button>
      </div>

      {/* Journey Map — 20 levels */}
      <div className="max-w-md mx-auto px-4 mt-6">
        <h2 className="text-gray-700 font-bold text-sm uppercase tracking-widest mb-4">Your Journey</h2>

        {[1, 2, 3, 4, 5].map(arcNum => {
          const arcChapters = chapters.filter(c => c.arc === arcNum)
          const gradClass = ARC_COLORS[arcNum - 1]
          return (
            <div key={arcNum} className="mb-6">
              <div className={`bg-gradient-to-r ${gradClass} text-white text-xs font-bold px-4 py-1.5 rounded-full inline-block mb-3`}>
                Arc {arcNum} · {ARC_NAMES[arcNum - 1]}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {arcChapters.map(({ level, chapter, mastery, isUnlocked, isCurrent }) => (
                  <motion.div
                    key={level}
                    whileTap={isUnlocked ? { scale: 0.95 } : {}}
                    onClick={() => isUnlocked && router.push('/play')}
                    className={`
                      relative rounded-2xl p-3 text-center cursor-pointer
                      ${isCurrent ? `bg-gradient-to-br ${gradClass} shadow-lg` : ''}
                      ${isUnlocked && !isCurrent ? 'bg-white border-2 border-gray-200 hover:border-indigo-300' : ''}
                      ${!isUnlocked ? 'bg-gray-100 opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="text-2xl mb-1">{chapter?.image_emoji ?? '📍'}</div>
                    <div className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-gray-600'}`}>
                      {level}
                    </div>
                    {isUnlocked && (
                      <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${gradClass} rounded-full`}
                          style={{ width: `${mastery}%` }}
                        />
                      </div>
                    )}
                    {!isUnlocked && (
                      <div className="text-gray-400 text-xs">🔒</div>
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
