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
    setTimeout(() => onResult(choice.toLowerCase() === word.pt.toLowerCase()), 900)
  }

  const cardBg = ARC_CARD[word.arc ?? 1] ?? 'bg-navy'

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto px-5">

      {/* English hint */}
      <div className="w-full bg-gold-light border border-gold/30 rounded-2xl px-4 py-3 text-center">
        <p className="text-navy/70 text-sm font-medium">{sentence.en}</p>
      </div>

      {/* Sentence with blank */}
      <motion.div
        key={word.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full ${cardBg} rounded-3xl p-6 text-center shadow-lg`}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <PronounceButton text={sentence.pt} size="sm" />
          <span className="text-white/50 text-xs">hear sentence</span>
        </div>
        <p className="text-white text-lg font-semibold leading-relaxed">{blanked}</p>
        <p className="text-white/40 text-xs mt-2 uppercase tracking-wider">Fill in the blank</p>
      </motion.div>

      {/* Translation hint */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-navy/40">Hint:</span>
        <span className="font-semibold text-navy">{word.en}</span>
        <PronounceButton text={word.pt} size="sm" variant="onLight" />
      </div>

      {/* Choices */}
      <div className="w-full grid grid-cols-2 gap-2.5">
        {choices.map(choice => {
          const isCorrect = choice.toLowerCase() === word.pt.toLowerCase()
          const isSelected = choice === selected

          let cls = 'bg-white border-2 border-sand text-navy font-semibold hover:border-navy/30 transition'
          if (selected && isCorrect) cls = 'bg-green-500 border-2 border-green-500 text-white font-semibold'
          if (selected && isSelected && !isCorrect) cls = 'bg-red-400 border-2 border-red-400 text-white font-semibold'

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
