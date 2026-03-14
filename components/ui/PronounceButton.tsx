'use client'

import { useState } from 'react'
import { speak } from '@/lib/tts'

interface Props {
  text: string
  slow?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function PronounceButton({ text, slow = false, size = 'md' }: Props) {
  const [speaking, setSpeaking] = useState(false)

  const handleSpeak = () => {
    setSpeaking(true)
    speak(text, slow)
    setTimeout(() => setSpeaking(false), 1200)
  }

  const sizeClasses = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-12 h-12 text-xl',
  }

  return (
    <button
      onClick={handleSpeak}
      className={`
        ${sizeClasses[size]}
        inline-flex items-center justify-center
        rounded-full
        bg-sky-100 hover:bg-sky-200
        text-sky-600 hover:text-sky-700
        transition-all duration-150
        ${speaking ? 'scale-110 bg-sky-200 animate-pulse' : ''}
        focus:outline-none focus:ring-2 focus:ring-sky-400
      `}
      title={`Pronounce "${text}"`}
      aria-label={`Pronounce ${text}`}
    >
      🔊
    </button>
  )
}
