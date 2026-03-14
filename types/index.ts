export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'pronoun' | 'conjunction' | 'interjection' | 'article'

export interface Sentence {
  pt: string
  en: string
}

export interface ConjugationSet {
  eu: string
  tu: string
  ele: string
  nos: string
  vcs: string
}

export interface VerbConjugations {
  presente: ConjugationSet
  perfeito: ConjugationSet
  imperfeito: ConjugationSet
  futuro: ConjugationSet
}

export interface Word {
  id: number
  pt: string
  en: string
  pos: PartOfSpeech
  level: number
  arc: 1 | 2 | 3 | 4 | 5
  sentences: Sentence[]
  conjugations?: VerbConjugations
}

export interface StoryChapter {
  level: number
  arc: 1 | 2 | 3 | 4 | 5
  location: string
  title: string
  vignette: string        // Portuguese text
  vignette_en: string     // English translation
  image_emoji: string     // placeholder until we add real art
}

export type VoiceOption = 'browser'

export interface Player {
  id: string
  passphrase_hash: string
  xp: number
  streak: number
  last_active: string
  current_level: number
  preferred_voice: VoiceOption
  created_at: string
}

export interface WordProgress {
  id: string
  player_id: string
  word_id: number
  strength: number        // 0–5
  next_review: string     // ISO timestamp
  attempts: number
  correct: number
}

export type GameMode = 'flash' | 'context' | 'listen' | 'speak' | 'conjugate' | 'match'

export interface SessionWord {
  word: Word
  mode: GameMode
  progress?: WordProgress
}

export interface AnswerResult {
  correct: boolean
  word: Word
  given: string
  expected: string
}
