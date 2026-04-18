'use client'

import { useState } from 'react'
import { speak } from '@/lib/tts'

interface Props {
  text: string
  slow?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'onDark' | 'onLight'
}

export default function PronounceButton({ text, slow = false, size = 'md', variant = 'onDark' }: Props) {
  const [speaking, setSpeaking] = useState(false)

  const handleSpeak = () => {
    setSpeaking(true)
    speak(text, slow)
    setTimeout(() => setSpeaking(false), 1200)
  }

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-11 h-11 text-base',
  }

  const variantClasses = variant === 'onDark'
    ? 'bg-white/20 hover:bg-white/30 text-white'
    : 'bg-sand hover:bg-sand/70 text-navy/60'

  return (
    <button
      onClick={handleSpeak}
      className={`
        ${sizeClasses[size]}
        ${variantClasses}
        inline-flex items-center justify-center
        rounded-full transition duration-150 flex-shrink-0
        ${speaking ? 'scale-110 animate-pulse' : ''}
        focus:outline-none
      `}
      title={`Pronounce "${text}"`}
      aria-label={`Pronounce ${text}`}
    >
      🔊
    </button>
  )
}
