'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { hashPassphrase, validatePassphrase } from '@/lib/passphrase'
import { useGameStore } from '@/store/gameStore'
import { Player, WordProgress } from '@/types'

export default function Home() {
  const router = useRouter()
  const { setPlayer, setWordProgress } = useGameStore()

  const [mode, setMode] = useState<'landing' | 'login'>('landing')
  const [passphrase, setPassphrase] = useState('')
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
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {mode === 'landing' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-8">
              <div className="text-7xl mb-3">🇧🇷</div>
              <h1 className="text-5xl font-black text-white tracking-tight">Fala Já</h1>
              <p className="text-indigo-200 mt-2 text-lg">Learn 2000 Brazilian Portuguese words</p>
              <p className="text-indigo-300 text-sm mt-1 italic">through a journey across Brazil</p>
            </div>

            <div className="flex flex-col gap-3">
              <motion.button
                onClick={() => setMode('login')}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-white text-indigo-700 font-bold py-4 rounded-2xl text-lg shadow-lg hover:bg-indigo-50 transition-colors"
              >
                🗝️ My Journey
              </motion.button>
              <motion.button
                onClick={() => router.push('/play')}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-white/20 text-white font-semibold py-4 rounded-2xl text-lg border border-white/30 hover:bg-white/30 transition-colors"
              >
                👀 Try as Guest
              </motion.button>
            </div>

            <p className="text-indigo-300 text-xs mt-6">
              Guest progress is not saved between sessions
            </p>
          </motion.div>
        )}

        {mode === 'login' && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 shadow-2xl"
          >
            <button
              onClick={() => setMode('landing')}
              className="text-gray-400 text-sm mb-4 hover:text-gray-600"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-black text-gray-800 mb-1">My Journey</h2>
            <p className="text-gray-500 text-sm mb-6">
              Enter your passphrase to load your progress — or create one to start fresh.
            </p>

            <input
              type="password"
              value={passphrase}
              onChange={e => { setPassphrase(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="e.g. mango-rio-fala"
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-center text-lg focus:outline-none focus:border-indigo-400 mb-3"
              autoFocus
            />

            {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

            <motion.button
              onClick={handleLogin}
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Loading...' : 'Continue →'}
            </motion.button>

            <p className="text-gray-400 text-xs text-center mt-4">
              New passphrase = new account · Same passphrase = load your progress
            </p>
          </motion.div>
        )}
      </div>
    </main>
  )
}
