'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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

export default function ContextBlank({ word, onResult }: Props) {
  const [choices, setChoices] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const sentence = word.sentences[0]

  useEffect(() => {
    const pool = (wordsData as Word[]).filter(w => w.id !== word.id)
    const distractors = shuffle(pool).slice(0, 3).map(w => w.pt)
    setChoices(shuffle([word.pt, ...distractors]))
    setSelected(null)
  }, [word])

  if (!sentence) return null

  const blanked = sentence.pt.replace(
    new RegExp(`\\b${word.pt}\\b`, 'i'),
    '______'
  )

  const handleSelect = (choice: string) => {
    if (selected) return
    setSelected(choice)
    const correct = choice.toLowerCase() === word.pt.toLowerCase()
    setTimeout(() => onResult(correct), 900)
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto px-4">
      {/* English hint */}
      <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center">
        <p className="text-amber-700 text-sm font-medium">{sentence.en}</p>
      </div>

      {/* Sentence with blank */}
      <motion.div
        key={word.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl p-6 text-center shadow-xl"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <PronounceButton text={sentence.pt} size="sm" />
          <span className="text-white/70 text-xs">hear full sentence</span>
        </div>
        <p className="text-white text-lg font-semibold leading-relaxed">{blanked}</p>
        <p className="text-violet-200 text-xs mt-2">Fill in the blank</p>
      </motion.div>

      {/* Word hint */}
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <span>Translation hint:</span>
        <span className="font-semibold text-indigo-600">{word.en}</span>
        <PronounceButton text={word.pt} size="sm" />
      </div>

      {/* Choices */}
      <div className="w-full grid grid-cols-2 gap-3">
        {choices.map(choice => {
          const isCorrect = choice.toLowerCase() === word.pt.toLowerCase()
          const isSelected = choice === selected
          let bg = 'bg-white border-2 border-gray-200 text-gray-700 hover:border-violet-300'
          if (selected && isCorrect) bg = 'bg-emerald-500 border-2 border-emerald-500 text-white'
          if (selected && isSelected && !isCorrect) bg = 'bg-red-400 border-2 border-red-400 text-white'

          return (
            <motion.button
              key={choice}
              onClick={() => handleSelect(choice)}
              whileTap={{ scale: 0.96 }}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${bg} shadow-sm`}
            >
              {choice}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
