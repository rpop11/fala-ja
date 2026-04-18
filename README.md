<div align="center">

# Fala Já 🇧🇷

### A Brazilian Portuguese vocabulary app built for real conversational fluency

*Travel from São Paulo to the Amazon — one word at a time*

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## The Idea

Most language apps teach you words in categories — all the colors, then all the fruits, then all the body parts. Research shows this actually makes words *harder* to remember, because similar words compete in your memory and blur together.

**Fala Já takes a different approach.**

The word list is pulled from Brazilian Portuguese subtitle corpora — the words Brazilians actually *say* in real life, not textbook vocabulary. Words are grouped into story-driven clusters set across five real regions of Brazil. You learn *related* words, not *similar* ones, so they reinforce each other instead of interfering.

The result: vocabulary that sticks, ordered by real-world frequency, wrapped in a journey you actually want to finish.

---

## How It Works

```
Login with a passphrase  →  Unlock a story chapter  →  Play a 20-card session
        ↓                                                         ↓
  Progress synced                                    Words scheduled for review
  to Supabase                                        via spaced repetition
```

Each session mixes:
- **New words** from your current level
- **Due reviews** — words whose interval has expired
- **Weak words** — ones you've gotten wrong recently

Three game modes rotate based on word type:

| Mode | How it works |
|------|-------------|
| **Flashcard** | See the Portuguese word, recall the meaning |
| **Fill in the blank** | Complete a sentence using the word in context |
| **Conjugation drill** | Choose the correct verb form for a given subject |

---

## The Journey

20 levels. 5 arcs. One trip across Brazil.

| Arc | Region | Levels | Theme |
|-----|--------|--------|-------|
| 1 | São Paulo | 1–4 | Arrival, city life, the metro, the market |
| 2 | Rio de Janeiro | 5–8 | The beach, social life, the boteco, saudade |
| 3 | Minas Gerais | 9–12 | Family, the countryside, Festa Junina, roots |
| 4 | Bahia | 13–16 | Afro-Brazilian culture, capoeira, carnaval |
| 5 | Amazônia | 17–20 | The river, the forest, indigenous community, fluency |

Each level unlocks with a short story vignette written in Brazilian Portuguese — you read about the place before you learn its words.

---

## Features

- **Story-first learning** — narrative context before vocabulary
- **Spaced repetition** — custom SRS with 5 strength levels (4h → 1 day → 3 days → 1 week → 2 weeks)
- **Native TTS** — every word spoken aloud in Brazilian Portuguese via Web Speech API
- **XP & streaks** — consecutive-answer bonuses keep sessions engaging
- **No account needed** — passphrase-based identity, no email, no OAuth
- **Guest mode** — try it without signing up

**Coming next:**
- Listen mode — hear a word, pick the meaning
- Match mode — hear a word, type what you heard
- Dialogue mode — full conversation practice from sentence pairs
- Speaking mode — say the word, get scored on pronunciation

---

## Under the Hood

### Passphrase Auth
No emails, no OAuth. Users create a memorable passphrase (e.g. `mango-rio-fala`). It's hashed client-side with `crypto.subtle` before touching the network — Supabase only ever sees the hash, never the passphrase itself.

### Spaced Repetition
Each word has a `strength` (0–5) and a `next_review` timestamp. Get it right → strength goes up, next review pushed further out. Get it wrong → strength drops by 2. The session builder fills 20 slots by prioritising due reviews, then new words, then weak words.

### Word Data
Every word in `data/words.json` includes:
- Portuguese + English + part of speech
- Level (1–20) and arc (1–5) for story gating
- Two natural example sentences in both languages
- Full conjugation tables for verbs — 4 tenses × 5 persons

### Word List Source
Vocabulary is drawn from the **OpenSubtitles / SUBTLEX-PT-BR subtitle corpus** — 61 million words of spoken Brazilian Portuguese from film and TV. Subtitle corpora mirror conversational speech far better than written text corpora, so learners build fluency for real conversation, not written exams.

---

## Tech Stack

| | |
|--|--|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Animation** | Framer Motion |
| **State** | Zustand |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Custom passphrase hashing — no OAuth |
| **TTS** | Web Speech API (`pt-BR`) |

---

## Getting Started

**Prerequisites:** Node.js 18+ and a free [Supabase](https://supabase.com) project.

```bash
git clone https://github.com/rpop11/fala-ja.git
cd fala-ja
npm install
cp .env.local.example .env.local
```

Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Run the schema in your Supabase SQL editor (copy from `supabase-schema.sql`), then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — create a passphrase and start learning.

---

## Word List Progress

Target: **2,000 most common spoken Brazilian Portuguese words**

| Arc | Region | Words | Status |
|-----|--------|-------|--------|
| 1 — São Paulo | Levels 1–4 | 220 | ✅ |
| 2 — Rio de Janeiro | Levels 5–8 | 155 | ✅ |
| 3 — Minas Gerais | Levels 9–12 | 93 | ✅ |
| 4 — Bahia | Levels 13–16 | 68 | ✅ |
| 5 — Amazônia | Levels 17–20 | — | 🔄 |
| **Total** | | **536 / 2,000** | |

---

## Roadmap

- [x] Spaced repetition engine
- [x] Flashcard, fill-in-blank, and conjugation modes
- [x] Story vignette system (all 20 chapters written)
- [x] Passphrase auth + Supabase sync
- [x] Word list: levels 1–16 (536 words)
- [ ] Word list: complete levels 17–20 → 2,000 words
- [ ] Listen mode
- [ ] Match mode
- [ ] Dialogue / conversation mode
- [ ] Speaking mode with speech recognition

---

## Project Structure

```
fala-ja/
├── app/                 # Pages (App Router)
│   ├── page.tsx         # Landing + login
│   ├── dashboard/       # Progress overview
│   ├── play/            # Game loop
│   ├── progress/        # Word-level stats
│   └── settings/        # Preferences
├── components/game/     # FlashCard, ContextBlank, ConjugateMode
├── data/
│   ├── words.json       # 536 words with sentences + conjugations
│   └── story.json       # 20 story chapter vignettes
├── lib/
│   ├── srs.ts           # Spaced repetition
│   ├── session.ts       # Session builder + XP
│   ├── tts.ts           # Text-to-speech
│   └── passphrase.ts    # Auth hashing
├── store/gameStore.ts   # Zustand state
└── supabase-schema.sql  # Database setup
```

---

## License

MIT
