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
const PRONOUNS = ['eu', 'tu', 'ele/ela', 'nós', 'vocês'] as const
const PRONOUN_KEYS = ['eu', 'tu', 'ele', 'nos', 'vcs'] as const

export default function ConjugateMode({ word, onResult }: Props) {
  const [tense, setTense] = useState<Tense>('perfeito')
  const [pronounIndex, setPronounIndex] = useState(0)
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    const t: Tense = Math.random() > 0.5 ? 'perfeito' : 'imperfeito'
    setTense(t)
    setPronounIndex(Math.floor(Math.random() * 5))
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
    // Auto-advance only on correct — wrong answers wait for user to tap "Got it"
    if (isCorrect) setTimeout(() => onResult(true), 800)
  }

  const tenseLabel = tense === 'perfeito'
    ? 'Pretérito Perfeito (completed)'
    : 'Pretérito Imperfeito (ongoing/habitual)'

  const tenseColor = tense === 'perfeito' ? 'from-emerald-500 to-teal-600' : 'from-violet-500 to-purple-600'

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto px-4">
      {/* Tense badge */}
      <div className={`bg-gradient-to-r ${tenseColor} text-white text-xs font-bold px-4 py-1.5 rounded-full`}>
        {tenseLabel}
      </div>

      {/* Prompt card */}
      <motion.div
        key={`${word.id}-${tense}-${pronounIndex}`}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-full bg-gradient-to-br ${tenseColor} rounded-3xl p-7 text-center shadow-xl`}
      >
        <div className="flex justify-center items-center gap-2 mb-1">
          <span className="text-3xl font-bold text-white">{word.pt}</span>
          <PronounceButton text={word.pt} size="md" />
        </div>
        <p className="text-white/70 text-sm mb-4">{word.en}</p>
        <p className="text-white text-lg">
          Conjugate for <span className="font-bold underline decoration-dotted">{pronoun}</span>
        </p>
      </motion.div>

      {/* Input */}
      <div className="w-full flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !submitted && handleSubmit()}
          disabled={submitted}
          placeholder={`${pronoun} ___`}
          className="flex-1 border-2 border-indigo-200 rounded-2xl px-4 py-3 text-center text-lg font-semibold focus:outline-none focus:border-indigo-400 disabled:bg-gray-50"
          autoFocus
        />
        {!submitted && (
          <motion.button
            onClick={handleSubmit}
            whileTap={{ scale: 0.95 }}
            className="bg-indigo-500 text-white rounded-2xl px-5 font-bold hover:bg-indigo-600 transition-colors"
          >
            ✓
          </motion.button>
        )}
      </div>

      {/* Result feedback */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full rounded-2xl px-4 py-3 text-center font-semibold
              ${input.trim().toLowerCase() === correct.toLowerCase()
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'}`}
          >
            {input.trim().toLowerCase() === correct.toLowerCase()
              ? `✓ Correto! ${pronoun} ${correct}`
              : `✗ ${pronoun} ${correct}`}
            {' '}
            <PronounceButton text={`${pronoun} ${correct}`} size="sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full conjugation card + Got it button (shown on wrong answer) */}
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
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl text-lg shadow"
            >
              Got it → Next
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
