'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const ARCS = [
  { num: 1, emoji: '🏙️', city: 'São Paulo',    theme: 'City life'    },
  { num: 2, emoji: '🏖️', city: 'Rio',           theme: 'The beach'    },
  { num: 3, emoji: '⛰️', city: 'Minas Gerais', theme: 'Countryside'  },
  { num: 4, emoji: '🥁', city: 'Bahia',         theme: 'Carnaval'     },
  { num: 5, emoji: '🌿', city: 'Amazônia',      theme: 'The forest'   },
]

const MODES = [
  { icon: '💡', label: 'Flashcard' },
  { icon: '✏️', label: 'Fill the blank' },
  { icon: '🔤', label: 'Conjugate' },
]

export default function IntroPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-navy flex flex-col items-center justify-between p-6 py-12">
      <div className="w-full max-w-sm flex flex-col gap-10">

        {/* Top — wordmark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <span className="text-white/40 text-sm font-semibold tracking-widest uppercase">Fala Já</span>
        </motion.div>

        {/* Journey path */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-xs font-bold uppercase tracking-widest text-center mb-6"
          >
            Your journey across Brazil
          </motion.p>

          {/* Arc nodes + connecting lines */}
          <div className="flex items-start justify-between w-full">
            {ARCS.map((arc, i) => (
              <div key={arc.num} className="flex items-start flex-1">
                {/* Node + label */}
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.4 + i * 0.12,
                      type: 'spring',
                      stiffness: 300,
                      damping: 18,
                    }}
                    className={`
                      w-11 h-11 rounded-full flex items-center justify-center text-xl
                      ${i === 0
                        ? 'bg-gold shadow-lg shadow-gold/30 ring-2 ring-gold/40'
                        : 'bg-white/10 border border-white/15'}
                    `}
                  >
                    {arc.emoji}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 + i * 0.12 }}
                    className="text-center"
                  >
                    <p className={`text-xs font-bold leading-tight ${i === 0 ? 'text-gold' : 'text-white/40'}`}>
                      {arc.city}
                    </p>
                    <p className="text-white/25 text-[10px] leading-tight mt-0.5 hidden sm:block">
                      {arc.theme}
                    </p>
                  </motion.div>
                </div>

                {/* Connector line between nodes */}
                {i < ARCS.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5 + i * 0.12, duration: 0.25, ease: 'easeOut' }}
                    style={{ originX: 0 }}
                    className="h-px bg-white/15 mt-5 w-full max-w-[20px] mx-[-4px] flex-shrink-0"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hook */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="text-center"
        >
          <h1 className="text-2xl font-extrabold text-white leading-snug mb-3">
            The words Brazilians<br />actually say
          </h1>
          <p className="text-white/45 text-sm leading-relaxed">
            Built from 61 million words of real Brazilian speech — film, TV, conversation.
            Not textbooks.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="flex justify-center gap-6"
        >
          {[
            { value: '2,000', label: 'words' },
            { value: '20',    label: 'levels' },
            { value: '5',     label: 'cities' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-extrabold text-white">{stat.value}</p>
              <p className="text-white/40 text-xs font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Game modes */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.45 }}
        >
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest text-center mb-3">
            How you'll learn
          </p>
          <div className="flex gap-2 justify-center">
            {MODES.map(m => (
              <div
                key={m.label}
                className="flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-xl px-3 py-2"
              >
                <span className="text-sm">{m.icon}</span>
                <span className="text-white/60 text-xs font-semibold">{m.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* CTA — pinned to bottom */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="w-full max-w-sm flex flex-col gap-3 mt-10"
      >
        <motion.button
          onClick={() => router.push('/play')}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-gold text-navy font-extrabold py-4 rounded-2xl text-base shadow-lg hover:brightness-105 transition"
        >
          Start in São Paulo →
        </motion.button>
        <button
          onClick={() => router.back()}
          className="text-white/30 text-sm text-center hover:text-white/50 transition"
        >
          ← Back
        </button>
      </motion.div>

    </main>
  )
}
