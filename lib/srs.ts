import { WordProgress } from '@/types'

// Interval in hours for each strength level
const INTERVALS: Record<number, number> = {
  0: 0,      // show immediately
  1: 4,      // 4 hours
  2: 24,     // 1 day
  3: 72,     // 3 days
  4: 168,    // 1 week
  5: 336,    // 2 weeks (mastered)
}

export function getNextReview(strength: number): Date {
  const hours = INTERVALS[strength] ?? 336
  const next = new Date()
  next.setHours(next.getHours() + hours)
  return next
}

export function updateStrength(
  current: number,
  correct: boolean
): number {
  if (correct) {
    return Math.min(5, current + 1)
  } else {
    return Math.max(0, current - 2)
  }
}

export function isDue(progress: WordProgress): boolean {
  return new Date(progress.next_review) <= new Date()
}

export function masteryPercent(progressList: WordProgress[]): number {
  if (progressList.length === 0) return 0
  const mastered = progressList.filter(p => p.strength >= 5).length
  return Math.round((mastered / progressList.length) * 100)
}

export function levelMasteryPercent(
  progressList: WordProgress[],
  wordIdsForLevel: number[]
): number {
  if (wordIdsForLevel.length === 0) return 0
  const levelProgress = progressList.filter(p =>
    wordIdsForLevel.includes(p.word_id)
  )
  const mastered = levelProgress.filter(p => p.strength >= 4).length
  return Math.round((mastered / wordIdsForLevel.length) * 100)
}
