'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { buildSession, calcXpGain } from '@/lib/session'
import { updateStrength, getNextReview, levelMasteryPercent } from '@/lib/srs'
import { supabase } from '@/lib/supabase'
import { Word, WordProgress, SessionWord } from '@/types'
import FlashCard from '@/components/game/FlashCard'
import ContextBlank from '@/components/game/ContextBlank'
import ConjugateMode from '@/components/game/ConjugateMode'
import storyData from '@/data/story.json'
import wordsData from '@/data/words.json'
import { StoryChapter } from '@/types'

const words = wordsData as Word[]
const story = storyData as StoryChapter[]

const ARC_BAR_COLORS = [
  'bg-blue-600',
  'bg-teal-500',
  'bg-orange-600',
  'bg-amber-500',
  'bg-green-600',
]

export default function PlayPage() {
  const router = useRouter()
  const {
    player, wordProgress,
    sessionQueue, sessionIndex,
    sessionXP,
    setPlayer, setSession, advanceSession,
    addSessionXP, updateWordProgress,
    incrementConsecutive, resetConsecutive,
    consecutiveCorrect,
  } = useGameStore()

  const [storyChapter, setStoryChapter] = useState<StoryChapter | null>(null)
  const [showStory, setShowStory] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const level = player?.current_level ?? 1

    if (player) {
      const chapter = story.find(s => s.level === level)
      const hasSeenThisLevel = wordProgress.some(
        p => words.find(w => w.id === p.word_id)?.level === level
      )
      if (chapter && !hasSeenThisLevel) {
        setStoryChapter(chapter)
        setShowStory(true)
      }
    }

    const queue = buildSession(words, wordProgress, level)
    if (queue.length === 0) {
      setFinished(true)
      return
    }
    setSession(queue)
  }, [])

  const currentItem: SessionWord | undefined = sessionQueue[sessionIndex]

  const handleResult = async (correct: boolean) => {
    const word = currentItem.word

    const streak = correct ? consecutiveCorrect + 1 : 0
    const xp = calcXpGain(correct, streak)
    addSessionXP(xp)
    if (correct) incrementConsecutive()
    else resetConsecutive()

    const existing = wordProgress.find(p => p.word_id === word.id)
    const newStrength = updateStrength(existing?.strength ?? 0, correct)
    const nextReview = getNextReview(newStrength)

    const updated: WordProgress = {
      id: existing?.id ?? crypto.randomUUID(),
      player_id: player?.id ?? 'guest',
      word_id: word.id,
      strength: newStrength,
      next_review: nextReview.toISOString(),
      attempts: (existing?.attempts ?? 0) + 1,
      correct: (existing?.correct ?? 0) + (correct ? 1 : 0),
    }

    updateWordProgress(updated)

    if (player) {
      await supabase.from('word_progress').upsert({
        ...updated,
        player_id: player.id,
      })

      const latestProgress = [
        ...wordProgress.filter(p => p.word_id !== updated.word_id),
        updated,
      ]
      const levelWords = words.filter(w => w.level === player.current_level)
      const mastery = levelMasteryPercent(latestProgress, levelWords.map(w => w.id))
      const newLevel = mastery >= 75 && player.current_level < 20
        ? player.current_level + 1
        : player.current_level

      await supabase.from('players')
        .update({ xp: player.xp + xp, current_level: newLevel })
        .eq('id', player.id)

      if (newLevel !== player.current_level) {
        setPlayer({ ...player, current_level: newLevel, xp: player.xp + xp })
      } else {
        setPlayer({ ...player, xp: player.xp + xp })
      }
    }

    if (sessionIndex + 1 >= sessionQueue.length) {
      setFinished(true)
    } else {
      advanceSession()
    }
  }

  // Story vignette screen
  if (showStory && storyChapter) {
    const arc = storyChapter.arc ?? 1
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center p-5">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cream rounded-3xl p-7 max-w-sm w-full shadow-2xl"
        >
          <div className="text-5xl text-center mb-4">{storyChapter.image_emoji}</div>
          <p className="text-xs font-bold text-navy/40 uppercase tracking-widest text-center mb-1">
            Level {storyChapter.level} · {storyChapter.location}
          </p>
          <h2 className="text-xl font-extrabold text-navy text-center mb-5">
            {storyChapter.title}
          </h2>
          <p className="text-navy/80 leading-relaxed text-sm mb-3">
            {storyChapter.vignette}
          </p>
          <p className="text-navy/40 text-xs leading-relaxed italic mb-6">
            {storyChapter.vignette_en}
          </p>
          <motion.button
            onClick={() => setShowStory(false)}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-navy text-cream font-bold py-3.5 rounded-2xl"
          >
            Start learning →
          </motion.button>
        </motion.div>
      </main>
    )
  }

  // Session complete screen
  if (finished) {
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center p-5">
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="bg-cream rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
        >
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-extrabold text-navy mb-1">Session complete</h2>
          <p className="text-navy/50 text-sm mb-5">Great work — keep it up</p>
          <div className="bg-gold-light rounded-2xl py-4 px-6 mb-6">
            <span className="text-3xl font-extrabold text-navy">+{sessionXP}</span>
            <span className="text-navy/60 font-semibold ml-2">XP</span>
          </div>
          <div className="flex flex-col gap-3">
            {player ? (
              <motion.button
                onClick={() => router.push('/dashboard')}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-navy text-cream font-bold py-3.5 rounded-2xl"
              >
                Back to journey
              </motion.button>
            ) : (
              <motion.button
                onClick={() => router.push('/')}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-navy text-cream font-bold py-3.5 rounded-2xl"
              >
                Save your progress →
              </motion.button>
            )}
            <motion.button
              onClick={() => {
                const queue = buildSession(words, wordProgress, player?.current_level ?? 1)
                setSession(queue)
                setFinished(false)
              }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-sand text-navy/70 font-semibold py-3.5 rounded-2xl"
            >
              Practice again
            </motion.button>
          </div>
        </motion.div>
      </main>
    )
  }

  if (!currentItem) return null

  const progress = (sessionIndex / sessionQueue.length) * 100
  const currentArc = currentItem.word.arc ?? 1
  const barColor = ARC_BAR_COLORS[currentArc - 1]

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      {/* Progress bar */}
      <div className="h-1.5 bg-sand">
        <motion.div
          className={`h-full ${barColor} rounded-r-full`}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      {/* Session header */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <button
          onClick={() => player ? router.push('/dashboard') : router.push('/')}
          className="text-navy/30 hover:text-navy/60 transition text-xl leading-none"
        >
          ✕
        </button>
        <span className="text-navy/40 text-sm font-semibold tabular-nums">
          {sessionIndex + 1} / {sessionQueue.length}
        </span>
        <span className="text-gold font-bold text-sm tabular-nums">
          +{sessionXP} XP
        </span>
      </div>

      {/* Game area */}
      <div className="flex-1 flex items-center justify-center py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentItem.word.id}-${sessionIndex}`}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.18 }}
            className="w-full"
          >
            {currentItem.mode === 'flash' && (
              <FlashCard word={currentItem.word} onResult={handleResult} />
            )}
            {currentItem.mode === 'context' && (
              <ContextBlank word={currentItem.word} onResult={handleResult} />
            )}
            {currentItem.mode === 'conjugate' && currentItem.word.conjugations && (
              <ConjugateMode word={currentItem.word} onResult={handleResult} />
            )}
            {(currentItem.mode === 'listen' || currentItem.mode === 'speak' || currentItem.mode === 'match') && (
              <FlashCard word={currentItem.word} onResult={handleResult} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}
