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
    const correct = choice === word.en
    setTimeout(() => onResult(correct), 900)
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto px-4">
      {/* Word card */}
      <motion.div
        key={word.id}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-center shadow-xl"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-4xl font-bold text-white">{word.pt}</span>
          <PronounceButton text={word.pt} size="lg" />
        </div>
        <span className="text-indigo-200 text-sm uppercase tracking-widest">{word.pos}</span>
      </motion.div>

      {/* Example sentence */}
      {word.sentences[0] && (
        <div className="w-full bg-indigo-50 rounded-2xl px-4 py-3 flex items-start gap-2">
          <PronounceButton text={word.sentences[0].pt} size="sm" />
          <div>
            <p className="text-indigo-800 text-sm font-medium">{word.sentences[0].pt}</p>
            <p className="text-gray-400 text-xs mt-0.5">{word.sentences[0].en}</p>
          </div>
        </div>
      )}

      {/* Choices */}
      <div className="w-full grid grid-cols-2 gap-3">
        {choices.map(choice => {
          const isCorrect = choice === word.en
          const isSelected = choice === selected
          let bg = 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-300'
          if (showResult && isCorrect) bg = 'bg-emerald-500 border-2 border-emerald-500 text-white'
          if (showResult && isSelected && !isCorrect) bg = 'bg-red-400 border-2 border-red-400 text-white'

          return (
            <motion.button
              key={choice}
              onClick={() => handleSelect(choice)}
              whileTap={{ scale: 0.96 }}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${bg} shadow-sm`}
            >
              {choice}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
