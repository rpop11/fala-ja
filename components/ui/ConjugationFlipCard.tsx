'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VerbConjugations } from '@/types'
import PronounceButton from './PronounceButton'

interface Props {
  verb: string
  verbEn: string
  conjugations: VerbConjugations
  highlight?: 'perfeito' | 'imperfeito'
}

type Face = 'front' | 'perfeito' | 'imperfeito'

const PRONOUNS = ['eu', 'ele/ela', 'nós', 'vocês'] as const
const PRONOUN_KEYS = ['eu', 'ele', 'nos', 'vcs'] as const

export default function ConjugationFlipCard({ verb, verbEn, conjugations, highlight }: Props) {
  const [face, setFace] = useState<Face>(highlight ?? 'front')

  const faces: Face[] = ['front', 'perfeito', 'imperfeito']
  const next = () => {
    const i = faces.indexOf(face)
    setFace(faces[(i + 1) % faces.length])
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Tab buttons */}
      <div className="flex rounded-t-xl overflow-hidden border border-b-0 border-indigo-200">
        {(['front', 'perfeito', 'imperfeito'] as Face[]).map(f => (
          <button
            key={f}
            onClick={() => setFace(f)}
            className={`flex-1 py-2 text-xs font-semibold transition-colors
              ${face === f
                ? 'bg-indigo-500 text-white'
                : 'bg-white text-indigo-400 hover:bg-indigo-50'
              }`}
          >
            {f === 'front' ? 'Presente' : f === 'perfeito' ? 'Perfeito ✓' : 'Imperfeito ~'}
          </button>
        ))}
      </div>

      {/* Card body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={face}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="bg-white border border-indigo-200 rounded-b-xl p-4 shadow-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-bold text-indigo-700">{verb}</span>
              <span className="ml-2 text-sm text-gray-400">{verbEn}</span>
            </div>
            <PronounceButton text={verb} size="sm" />
          </div>

          {/* Usage hint */}
          {face === 'perfeito' && (
            <p className="text-xs text-emerald-600 bg-emerald-50 rounded px-2 py-1 mb-3">
              💡 Action completed at a specific time — "I spoke" (and it's done)
            </p>
          )}
          {face === 'imperfeito' && (
            <p className="text-xs text-violet-600 bg-violet-50 rounded px-2 py-1 mb-3">
              💡 Ongoing / habitual past — "I used to speak" / "I was speaking"
            </p>
          )}

          {/* Conjugation table */}
          <div className="space-y-2">
            {PRONOUN_KEYS.map((key, i) => {
              const tense = face === 'front' ? conjugations.presente
                         : face === 'perfeito' ? conjugations.perfeito
                         : conjugations.imperfeito
              const form = tense[key]
              return (
                <div key={key} className="flex items-center justify-between group">
                  <span className="text-xs text-gray-400 w-16">{PRONOUNS[i]}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{form}</span>
                    <PronounceButton text={`${PRONOUNS[i]} ${form}`} size="sm" />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
