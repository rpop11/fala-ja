# Fala Já 🇧🇷

> **Learn 2,000 Brazilian Portuguese words** through an immersive journey across Brazil — São Paulo, Rio de Janeiro, Minas Gerais, Bahia, and the Amazon.

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

---

## What Is This?

Fala Já is a spaced-repetition vocabulary app built around a single idea: **the fastest path to conversational fluency is learning the right words, in the right order, the right way.**

The word list is drawn from Brazilian Portuguese subtitle corpora — the words people actually *say*, not the words that appear in textbooks. Each word is embedded in a story set in a real Brazilian location, so vocabulary sticks through narrative context rather than rote memorization.

This approach is grounded in [Gabriel Wyner's interference research](https://fluent-forever.com): learning thematically *related but not similar* words together builds stronger memory than learning semantic categories (all colors, all fruits) at once.

---

## Features

- **Story-driven learning** — 20 levels across 5 Brazilian regions, each unlocked with a narrative vignette
- **Multiple game modes** — Flashcard, fill-in-the-blank, and verb conjugation drills
- **Spaced repetition (SRS)** — Custom algorithm schedules reviews at optimal intervals (4h → 1 day → 3 days → 1 week → 2 weeks)
- **XP & streaks** — Gamified progress with consecutive-answer bonuses
- **No account required** — Passphrase-based identity: no email, no password, just a memorable phrase
- **Guest mode** — Try the app without saving progress
- **Native TTS** — Every word spoken aloud in Brazilian Portuguese via Web Speech API

### Coming soon
- **Listen mode** — Hear a word, identify its meaning
- **Match mode** — Hear a word, type what you hear
- **Dialogue mode** — Conversation practice using real sentence pairs
- **Speaking mode** — Speak the word, get scored on pronunciation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| State | Zustand |
| Database | Supabase (PostgreSQL) |
| Auth | Custom passphrase hashing (no OAuth) |
| TTS | Web Speech API (`pt-BR`) |

---

## Architecture Highlights

### Passphrase Auth
Users identify themselves with a memorable passphrase (e.g. `mango-rio-fala`). On login, the passphrase is hashed client-side using `crypto.subtle` and compared against a hash stored in Supabase — no plaintext secrets ever leave the browser.

### Spaced Repetition Engine
`lib/srs.ts` implements a simple but effective SRS: each word has a strength (0–5) and a `next_review` timestamp. Correct answers advance strength; wrong answers knock it back by 2. Session builder (`lib/session.ts`) prioritises due reviews, then new words, then weak words to fill 20-card sessions.

### Word Data
`data/words.json` contains structured vocabulary with:
- Portuguese word + English meaning + part of speech
- Level (1–20) and arc (1–5) for story progression
- 2 natural example sentences per word (pt + en)
- Full conjugation tables for all verbs (4 tenses × 5 persons)

### Story System
`data/story.json` defines 20 chapter vignettes — one per level — written in Brazilian Portuguese with English translation. New chapters unlock as players master each level's vocabulary (≥75% at strength 2+).

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works fine)

### Setup

```bash
git clone https://github.com/rpop11/fala-ja.git
cd fala-ja
npm install
```

Copy the environment file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the database schema in your Supabase SQL editor:

```bash
# Copy and run the contents of supabase-schema.sql in Supabase → SQL Editor
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
fala-ja/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing / login
│   ├── dashboard/          # Player progress overview
│   ├── play/               # Main game loop
│   ├── progress/           # Detailed word stats
│   └── settings/           # Preferences
├── components/
│   └── game/               # Game mode components
│       ├── FlashCard.tsx
│       ├── ContextBlank.tsx
│       └── ConjugateMode.tsx
├── data/
│   ├── words.json          # 375 words (levels 1–8), growing to 2,000
│   └── story.json          # 20 story chapter vignettes
├── lib/
│   ├── srs.ts              # Spaced repetition algorithm
│   ├── session.ts          # Session builder + XP calculation
│   ├── tts.ts              # Text-to-speech (Web Speech API)
│   ├── passphrase.ts       # Passphrase hashing + validation
│   └── supabase.ts         # Supabase client
├── store/
│   └── gameStore.ts        # Zustand global state
├── types/
│   └── index.ts            # TypeScript interfaces
├── supabase-schema.sql     # Database schema
└── scripts/
    └── gen_words_5_8.py    # Word list generation template
```

---

## Word List

The vocabulary targets the **2,000 most common spoken Brazilian Portuguese words**, sourced from subtitle corpora (OpenSubtitles/SUBTLEX-PT-BR) — optimised for conversational fluency, not written formality.

| Arc | Levels | Region | Words | Status |
|-----|--------|--------|-------|--------|
| 1 | 1–4 | São Paulo | 220 | ✅ Complete |
| 2 | 5–8 | Rio de Janeiro | 155 | ✅ Complete |
| 3 | 9–12 | Minas Gerais | — | 🔄 In progress |
| 4 | 13–16 | Bahia | — | ⬜ Planned |
| 5 | 17–20 | Amazônia | — | ⬜ Planned |

---

## Roadmap

See [PLAN.md](./PLAN.md) for the detailed technical roadmap.

- [x] Core SRS engine
- [x] Flashcard, fill-in-blank, conjugation modes
- [x] Story vignette system
- [x] Passphrase auth + Supabase sync
- [x] Word list: levels 1–8 (375 words)
- [ ] Word list: levels 9–20 (target: 2,000 words)
- [ ] Listen mode
- [ ] Match mode (hear → type)
- [ ] Dialogue / story conversation mode
- [ ] Speaking mode (speech recognition)

---

## License

MIT
