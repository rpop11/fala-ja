import { Word, WordProgress, SessionWord, GameMode } from '@/types'
import { isDue } from './srs'

const MODES_FOR_VERB: GameMode[] = ['flash', 'context', 'conjugate', 'conjugate']
const MODES_FOR_WORD: GameMode[] = ['flash', 'flash', 'context', 'listen']

function pickMode(word: Word): GameMode {
  const pool = word.pos === 'verb' ? MODES_FOR_VERB : MODES_FOR_WORD
  return pool[Math.floor(Math.random() * pool.length)]
}

export function buildSession(
  words: Word[],
  allProgress: WordProgress[],
  currentLevel: number,
  maxReps = 20
): SessionWord[] {
  const progressMap = new Map(allProgress.map(p => [p.word_id, p]))

  const levelWords = words.filter(w => w.level <= currentLevel)

  // 1. Due reviews
  const dueReviews: SessionWord[] = levelWords
    .filter(w => {
      const p = progressMap.get(w.id)
      return p && isDue(p) && p.strength < 5
    })
    .slice(0, 12)
    .map(w => ({ word: w, mode: pickMode(w), progress: progressMap.get(w.id) }))

  // 2. New words (never seen)
  const newWords: SessionWord[] = levelWords
    .filter(w => !progressMap.has(w.id))
    .slice(0, Math.max(0, maxReps - dueReviews.length - 3))
    .map(w => ({ word: w, mode: 'flash' as GameMode }))

  // 3. Fill remaining slots with weak words
  const needed = maxReps - dueReviews.length - newWords.length
  const weakWords: SessionWord[] = needed > 0
    ? levelWords
        .filter(w => {
          const p = progressMap.get(w.id)
          return p && p.strength <= 2 && !isDue(p)
        })
        .slice(0, needed)
        .map(w => ({ word: w, mode: pickMode(w), progress: progressMap.get(w.id) }))
    : []

  const session = [...dueReviews, ...newWords, ...weakWords]

  // Shuffle
  for (let i = session.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[session[i], session[j]] = [session[j], session[i]]
  }

  return session.slice(0, maxReps)
}

export function calcXpGain(correct: boolean, streak: number): number {
  if (!correct) return 0
  const base = 10
  const streakBonus = Math.min(streak, 5) * 2
  return base + streakBonus
}
