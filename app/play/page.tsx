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

  // Build session on mount
  useEffect(() => {
    const level = player?.current_level ?? 1

    // Check if new level unlocked (show story vignette)
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

    // Update XP
    const streak = correct ? consecutiveCorrect + 1 : 0
    const xp = calcXpGain(correct, streak)
    addSessionXP(xp)
    if (correct) incrementConsecutive()
    else resetConsecutive()

    // Update word progress
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

    // Save to DB if logged in
    if (player) {
      await supabase.from('word_progress').upsert({
        ...updated,
        player_id: player.id,
      })

      // Check if current level is now mastered → unlock next level
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

    // Advance or finish
    if (sessionIndex + 1 >= sessionQueue.length) {
      setFinished(true)
    } else {
      advanceSession()
    }
  }

  if (showStory && storyChapter) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
        >
          <div className="text-5xl text-center mb-3">{storyChapter.image_emoji}</div>
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest text-center mb-1">
            Level {storyChapter.level} · {storyChapter.location}
          </p>
          <h2 className="text-xl font-black text-gray-800 text-center mb-4">{storyChapter.title}</h2>
          <p className="text-gray-700 leading-relaxed text-sm mb-3">{storyChapter.vignette}</p>
          <p className="text-gray-400 text-xs leading-relaxed italic mb-5">{storyChapter.vignette_en}</p>
          <motion.button
            onClick={() => setShowStory(false)}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-2xl"
          >
            Start Learning →
          </motion.button>
        </motion.div>
      </main>
    )
  }

  if (finished) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
        >
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Session Complete!</h2>
          <p className="text-gray-500 mb-4">You earned</p>
          <div className="text-5xl font-black text-emerald-600 mb-6">+{sessionXP} XP</div>
          <div className="flex flex-col gap-3">
            {player ? (
              <motion.button
                onClick={() => router.push('/dashboard')}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-2xl"
              >
                Back to Journey
              </motion.button>
            ) : (
              <motion.button
                onClick={() => router.push('/')}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-2xl"
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
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3.5 rounded-2xl"
            >
              Practice Again
            </motion.button>
          </div>
        </motion.div>
      </main>
    )
  }

  if (!currentItem) return null

  const progress = ((sessionIndex) / sessionQueue.length) * 100

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress bar */}
      <div className="h-2 bg-gray-200">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => player ? router.push('/dashboard') : router.push('/')}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ✕
        </button>
        <span className="text-gray-400 text-sm font-medium">
          {sessionIndex + 1} / {sessionQueue.length}
        </span>
        <span className="text-amber-500 font-bold text-sm">+{sessionXP} XP</span>
      </div>

      {/* Game area */}
      <div className="flex-1 flex items-center justify-center py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentItem.word.id}-${sessionIndex}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
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
            {/* Fallback to flash if mode not yet implemented */}
            {(currentItem.mode === 'listen' || currentItem.mode === 'speak' || currentItem.mode === 'match') && (
              <FlashCard word={currentItem.word} onResult={handleResult} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}
