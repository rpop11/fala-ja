'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Word } from '@/types'
import PronounceButton from '@/components/ui/PronounceButton'
import wordsData from '@/data/words.json'

interface Props {
  word: Word
  onResult: (correct: boolean) => void
}

// Arc-coded card backgrounds
const ARC_CARD: Record<number, string> = {
  1: 'bg-blue-700',
  2: 'bg-teal-600',
  3: 'bg-orange-700',
  4: 'bg-amber-600',
  5: 'bg-green-700',
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function getDistractors(word: Word, count = 3): string[] {
  const all = (wordsData as Word[]).filter(w => w.id !== word.id && w.pos === word.pos)
  const pool = all.length >= count ? all : (wordsData as Word[]).filter(w => w.id !== word.id)
  return shuffle(pool).slice(0, count).map(w => w.en)
}

export default function FlashCard({ word, onResult }: Props) {
  const [choices, setChoices] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    const distractors = getDistractors(word)
    setChoices(shuffle([word.en, ...distractors]))
    setSelected(null)
    setShowResult(false)
  }, [word])

  const handleSelect = (choice: string) => {
    if (selected) return
    setSelected(choice)
    setShowResult(true)
    setTimeout(() => onResult(choice === word.en), 900)
  }

  const cardBg = ARC_CARD[word.arc ?? 1] ?? 'bg-navy'

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto px-5">

      {/* Word card */}
      <motion.div
        key={word.id}
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={`w-full ${cardBg} rounded-3xl p-8 text-center shadow-lg`}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-4xl font-extrabold text-white tracking-tight">{word.pt}</span>
          <PronounceButton text={word.pt} size="lg" />
        </div>
        <span className="inline-block bg-white/15 text-white/70 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
          {word.pos}
        </span>
      </motion.div>

      {/* Example sentence */}
      {word.sentences[0] && (
        <div className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-start gap-3 shadow-sm border border-sand">
          <PronounceButton text={word.sentences[0].pt} size="sm" variant="onLight" />
          <div>
            <p className="text-navy text-sm font-medium leading-snug">{word.sentences[0].pt}</p>
            <p className="text-navy/40 text-xs mt-0.5">{word.sentences[0].en}</p>
          </div>
        </div>
      )}

      {/* Answer choices */}
      <div className="w-full grid grid-cols-2 gap-2.5">
        {choices.map(choice => {
          const isCorrect = choice === word.en
          const isSelected = choice === selected

          let cls = 'bg-white border-2 border-sand text-navy font-semibold hover:border-navy/30 transition'
          if (showResult && isCorrect) cls = 'bg-green-500 border-2 border-green-500 text-white font-semibold'
          if (showResult && isSelected && !isCorrect) cls = 'bg-red-400 border-2 border-red-400 text-white font-semibold'

          return (
            <motion.button
              key={choice}
              onClick={() => handleSelect(choice)}
              whileTap={{ scale: 0.96 }}
              className={`rounded-2xl px-4 py-3.5 text-sm ${cls} shadow-sm`}
            >
              {choice}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
