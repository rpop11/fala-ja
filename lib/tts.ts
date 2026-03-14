'use client'

let currentUtterance: SpeechSynthesisUtterance | null = null

export function speak(text: string, slow = false): void {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'pt-BR'
  utterance.rate = slow ? 0.7 : 0.88
  utterance.pitch = 1.0

  // Prefer a pt-BR voice if available
  const voices = window.speechSynthesis.getVoices()
  const ptBR = voices.find(v => v.lang === 'pt-BR') ||
                voices.find(v => v.lang.startsWith('pt'))
  if (ptBR) utterance.voice = ptBR

  currentUtterance = utterance
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()
  currentUtterance = null
}

// Voices load async on some browsers — call this once on mount
export function preloadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      resolve(voices)
      return
    }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices())
    }
  })
}
