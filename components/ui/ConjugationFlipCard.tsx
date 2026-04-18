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

  const TABS: { key: Face; label: string }[] = [
    { key: 'front',      label: 'Presente'  },
    { key: 'perfeito',   label: 'Perfeito'  },
    { key: 'imperfeito', label: 'Imperfeito' },
  ]

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Tabs */}
      <div className="flex rounded-t-2xl overflow-hidden border border-b-0 border-sand">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setFace(t.key)}
            className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
              face === t.key
                ? 'bg-navy text-cream'
                : 'bg-white text-navy/40 hover:bg-sand/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Card body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={face}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="bg-white border border-sand rounded-b-2xl p-5 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-base font-extrabold text-navy">{verb}</span>
              <span className="ml-2 text-sm text-navy/40">{verbEn}</span>
            </div>
            <PronounceButton text={verb} size="sm" variant="onLight" />
          </div>

          {/* Usage hint */}
          {face === 'perfeito' && (
            <p className="text-xs text-green-700 bg-green-50 rounded-xl px-3 py-2 mb-4">
              Completed action — "I spoke" (and it's done)
            </p>
          )}
          {face === 'imperfeito' && (
            <p className="text-xs text-purple-700 bg-purple-50 rounded-xl px-3 py-2 mb-4">
              Ongoing / habitual past — "I used to speak" / "I was speaking"
            </p>
          )}

          {/* Conjugation rows */}
          <div className="space-y-2.5">
            {PRONOUN_KEYS.map((key, i) => {
              const tense = face === 'front' ? conjugations.presente
                          : face === 'perfeito' ? conjugations.perfeito
                          : conjugations.imperfeito
              const form = tense[key]
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-navy/40 w-16">{PRONOUNS[i]}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-navy text-sm">{form}</span>
                    <PronounceButton text={`${PRONOUNS[i]} ${form}`} size="sm" variant="onLight" />
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
