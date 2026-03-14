import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Player, WordProgress, SessionWord } from '@/types'

interface GameState {
  player: Player | null
  wordProgress: WordProgress[]
  sessionQueue: SessionWord[]
  sessionIndex: number
  sessionXP: number
  consecutiveCorrect: number

  // Actions
  setPlayer: (player: Player) => void
  setWordProgress: (progress: WordProgress[]) => void
  updateWordProgress: (updated: WordProgress) => void
  setSession: (queue: SessionWord[]) => void
  advanceSession: () => void
  addSessionXP: (xp: number) => void
  incrementConsecutive: () => void
  resetConsecutive: () => void
  logout: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      player: null,
      wordProgress: [],
      sessionQueue: [],
      sessionIndex: 0,
      sessionXP: 0,
      consecutiveCorrect: 0,

      setPlayer: (player) => set({ player }),

      setWordProgress: (progress) => set({ wordProgress: progress }),

      updateWordProgress: (updated) =>
        set(state => ({
          wordProgress: state.wordProgress.some(p => p.word_id === updated.word_id)
            ? state.wordProgress.map(p => p.word_id === updated.word_id ? updated : p)
            : [...state.wordProgress, updated],
        })),

      setSession: (queue) => set({ sessionQueue: queue, sessionIndex: 0, sessionXP: 0 }),

      advanceSession: () => set(state => ({ sessionIndex: state.sessionIndex + 1 })),

      addSessionXP: (xp) => set(state => ({ sessionXP: state.sessionXP + xp })),

      incrementConsecutive: () =>
        set(state => ({ consecutiveCorrect: state.consecutiveCorrect + 1 })),

      resetConsecutive: () => set({ consecutiveCorrect: 0 }),

      logout: () => set({
        player: null,
        wordProgress: [],
        sessionQueue: [],
        sessionIndex: 0,
        sessionXP: 0,
        consecutiveCorrect: 0,
      }),
    }),
    {
      name: 'fala-ja-game',
      partialize: (state) => ({
        player: state.player,
        wordProgress: state.wordProgress,
      }),
    }
  )
)
