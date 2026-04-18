'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Word } from '@/types'
import PronounceButton from '@/components/ui/PronounceButton'
import ConjugationFlipCard from '@/components/ui/ConjugationFlipCard'

interface Props {
  word: Word
  onResult: (correct: boolean) => void
}

type Tense = 'perfeito' | 'imperfeito'
const PRONOUNS = ['eu', 'ele/ela', 'nós', 'vocês'] as const
const PRONOUN_KEYS = ['eu', 'ele', 'nos', 'vcs'] as const

const ARC_CARD: Record<number, string> = {
  1: 'bg-blue-700',
  2: 'bg-teal-600',
  3: 'bg-orange-700',
  4: 'bg-amber-600',
  5: 'bg-green-700',
}

const TENSE_BADGE: Record<Tense, string> = {
  perfeito:  'bg-green-100 text-green-700',
  imperfeito: 'bg-purple-100 text-purple-700',
}

export default function ConjugateMode({ word, onResult }: Props) {
  const [tense, setTense] = useState<Tense>('perfeito')
  const [pronounIndex, setPronounIndex] = useState(0)
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    const t: Tense = Math.random() > 0.5 ? 'perfeito' : 'imperfeito'
    setTense(t)
    setPronounIndex(Math.floor(Math.random() * 4))
    setInput('')
    setSubmitted(false)
    setShowCard(false)
  }, [word])

  if (!word.conjugations) return null

  const pronoun = PRONOUNS[pronounIndex]
  const pronounKey = PRONOUN_KEYS[pronounIndex]
  const correct = word.conjugations[tense][pronounKey]

  const handleSubmit = () => {
    if (!input.trim()) return
    setSubmitted(true)
    const isCorrect = input.trim().toLowerCase() === correct.toLowerCase()
    if (!isCorrect) setShowCard(true)
    if (isCorrect) setTimeout(() => onResult(true), 800)
  }

  const tenseLabel = tense === 'perfeito'
    ? 'Pretérito Perfeito'
    : 'Pretérito Imperfeito'

  const cardBg = ARC_CARD[word.arc ?? 1] ?? 'bg-navy'
  const isCorrectAnswer = submitted && input.trim().toLowerCase() === correct.toLowerCase()

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto px-5">

      {/* Tense badge */}
      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${TENSE_BADGE[tense]}`}>
        {tenseLabel}
      </span>

      {/* Prompt card */}
      <motion.div
        key={`${word.id}-${tense}-${pronounIndex}`}
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-full ${cardBg} rounded-3xl p-7 text-center shadow-lg`}
      >
        <div className="flex justify-center items-center gap-2 mb-1">
          <span className="text-3xl font-extrabold text-white">{word.pt}</span>
          <PronounceButton text={word.pt} size="md" />
        </div>
        <p className="text-white/50 text-sm mb-4">{word.en}</p>
        <p className="text-white/80 text-base">
          Conjugate for{' '}
          <span className="font-bold text-white underline decoration-dotted underline-offset-4">
            {pronoun}
          </span>
        </p>
      </motion.div>

      {/* Input row */}
      <div className="w-full flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !submitted && handleSubmit()}
          disabled={submitted}
          placeholder={`${pronoun} ___`}
          className="flex-1 bg-white border-2 border-sand rounded-2xl px-4 py-3 text-center text-base font-semibold text-navy focus:outline-none focus:border-navy/40 disabled:bg-sand/50 transition"
          autoFocus
        />
        {!submitted && (
          <motion.button
            onClick={handleSubmit}
            whileTap={{ scale: 0.95 }}
            className="bg-navy text-cream rounded-2xl px-5 font-bold hover:bg-navy-light transition"
          >
            ✓
          </motion.button>
        )}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full rounded-2xl px-4 py-3 text-center font-semibold flex items-center justify-center gap-2 ${
              isCorrectAnswer
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}
          >
            <span>{isCorrectAnswer ? `✓ ${pronoun} ${correct}` : `✗  ${pronoun} ${correct}`}</span>
            <PronounceButton text={`${pronoun} ${correct}`} size="sm" variant="onLight" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full conjugation table + next button (wrong answers) */}
      <AnimatePresence>
        {showCard && word.conjugations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col gap-4"
          >
            <ConjugationFlipCard
              verb={word.pt}
              verbEn={word.en}
              conjugations={word.conjugations}
              highlight={tense}
            />
            <motion.button
              onClick={() => onResult(false)}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-navy text-cream font-bold py-4 rounded-2xl text-base shadow"
            >
              Got it — next →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
