'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { hashPassphrase, validatePassphrase } from '@/lib/passphrase'
import { useGameStore } from '@/store/gameStore'
import { Player, WordProgress } from '@/types'

const ARCS = [
  { emoji: '🏙️', city: 'São Paulo'  },
  { emoji: '🏖️', city: 'Rio'        },
  { emoji: '⛰️', city: 'Minas'      },
  { emoji: '🥁', city: 'Bahia'      },
  { emoji: '🌿', city: 'Amazônia'   },
]

export default function Home() {
  const router = useRouter()
  const { setPlayer, setWordProgress } = useGameStore()

  const [mode, setMode] = useState<'landing' | 'login'>('landing')
  const [passphrase, setPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    const validationError = validatePassphrase(passphrase)
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')

    try {
      const hash = await hashPassphrase(passphrase)

      const { data: existing } = await supabase
        .from('players')
        .select('*')
        .eq('passphrase_hash', hash)
        .single()

      let player: Player

      if (existing) {
        const today = new Date().toISOString().split('T')[0]
        const daysDiff = Math.floor(
          (new Date(today).getTime() - new Date(existing.last_active).getTime()) / 86400000
        )
        const newStreak = daysDiff === 1 ? existing.streak + 1
                        : daysDiff === 0 ? existing.streak
                        : 1

        const { data: updated } = await supabase
          .from('players')
          .update({ streak: newStreak, last_active: today })
          .eq('id', existing.id)
          .select()
          .single()

        player = updated ?? existing
      } else {
        const today = new Date().toISOString().split('T')[0]
        const { data: created, error: createError } = await supabase
          .from('players')
          .insert({
            passphrase_hash: hash,
            xp: 0,
            streak: 1,
            last_active: today,
            current_level: 1,
            preferred_voice: 'browser',
          })
          .select()
          .single()

        if (createError) throw createError
        player = created
      }

      const { data: progress } = await supabase
        .from('word_progress')
        .select('*')
        .eq('player_id', player.id)

      setPlayer(player)
      setWordProgress((progress as WordProgress[]) ?? [])
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-navy flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {mode === 'landing' && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            {/* Logo mark */}
            <div className="mb-10">
              <div className="text-6xl mb-4">🇧🇷</div>
              <h1 className="text-6xl font-extrabold text-white tracking-tight leading-none">
                Fala Já
              </h1>
              <p className="text-white/60 mt-3 text-base font-medium">
                2,000 Brazilian Portuguese words
              </p>
              <p className="text-white/40 text-sm mt-1">
                through a journey across Brazil
              </p>
            </div>

            {/* Arc preview strip */}
            <div className="flex items-center justify-between mb-8 w-full">
              {ARCS.map((arc, i) => (
                <div key={arc.city} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-base">
                      {arc.emoji}
                    </div>
                    <span className="text-white/35 text-[10px] font-medium">{arc.city}</span>
                  </div>
                  {i < ARCS.length - 1 && (
                    <div className="w-4 h-px bg-white/15 mb-3.5 mx-0.5" />
                  )}
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-3">
              <motion.button
                onClick={() => setMode('login')}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-gold text-navy font-bold py-4 rounded-2xl text-base shadow-lg hover:brightness-105 transition"
              >
                Start my journey
              </motion.button>
              <motion.button
                onClick={() => router.push('/intro')}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-white/10 text-white/80 font-semibold py-4 rounded-2xl text-base border border-white/20 hover:bg-white/15 transition"
              >
                Try as guest
              </motion.button>
            </div>

            <p className="text-white/30 text-xs mt-6">
              Guest progress is not saved between sessions
            </p>
          </motion.div>
        )}

        {mode === 'login' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setMode('landing')}
              className="text-white/40 text-sm mb-8 hover:text-white/70 transition flex items-center gap-1"
            >
              ← Back
            </button>

            <h2 className="text-3xl font-extrabold text-white mb-1">My Journey</h2>
            <p className="text-white/50 text-sm mb-8">
              Enter your passphrase to load your progress — or create a new one to start fresh.
            </p>

            <div className="relative mb-3">
              <input
                type={showPassphrase ? 'text' : 'password'}
                value={passphrase}
                onChange={e => { setPassphrase(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="e.g. mango-rio-fala"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 pr-12 text-center text-base text-white placeholder-white/30 focus:outline-none focus:border-gold focus:bg-white/15 transition"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassphrase(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition text-lg"
                aria-label={showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
              >
                {showPassphrase ? '🙈' : '👁️'}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center mb-3">{error}</p>
            )}

            <motion.button
              onClick={handleLogin}
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-gold text-navy font-bold py-4 rounded-2xl hover:brightness-105 transition disabled:opacity-50 text-base"
            >
              {loading ? 'Loading...' : 'Continue →'}
            </motion.button>

            <p className="text-white/30 text-xs text-center mt-5">
              New passphrase = new account · Same passphrase = load your progress
            </p>
          </motion.div>
        )}

      </div>
    </main>
  )
}
