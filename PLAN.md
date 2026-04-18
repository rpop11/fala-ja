# Fala Já — Development Plan

## Vision
Help the user achieve conversational Brazilian Portuguese fluency through the **2000 most common spoken BP words**, drawn from subtitle/spoken corpora (not formal written text). Inspired by Gabriel Wyner's Fluent Forever methodology: learn words in thematic story clusters, not semantic categories, to minimize interference and maximize retention.

---

## App Overview

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase · Zustand · Framer Motion

**Story structure:** 20 levels across 5 arcs, each with a Brazilian city/region vignette:
| Arc | Levels | Location |
|-----|--------|----------|
| 1 | 1–4 | São Paulo |
| 2 | 5–8 | Rio de Janeiro |
| 3 | 9–12 | Minas Gerais |
| 4 | 13–16 | Bahia |
| 5 | 17–20 | Amazônia |

**Word schema** (`data/words.json`):
```json
{
  "id": 221,
  "pt": "então",
  "en": "so / then",
  "pos": "adverb",
  "level": 5,
  "arc": 2,
  "sentences": [
    { "pt": "Então, o que você quer fazer hoje?", "en": "So, what do you want to do today?" },
    { "pt": "Estava cansado, então fui dormir cedo.", "en": "I was tired, so I went to sleep early." }
  ]
}
```
Verbs also include `conjugations` (presente / perfeito / imperfeito / futuro × eu/tu/ele/nos/vcs).

---

## Current Status (last updated: 2026-04-14)

### Word List
- **601 words total** in `data/words.json`
- Levels 1–4 (Arc 1, São Paulo): 220 words ✅
- Levels 5–8 (Arc 2, Rio de Janeiro): 155 words ✅
- Levels 9–12 (Arc 3, Minas Gerais): 93 words ✅
- Levels 13–16 (Arc 4, Bahia): 68 words ✅
- Levels 17–20 (Arc 5, Amazônia): 65 words ✅
- **All 20 levels populated — first pass complete**

### Game Modes
| Mode | Status |
|------|--------|
| `flash` | ✅ Built — `components/game/FlashCard.tsx` |
| `context` | ✅ Built — `components/game/ContextBlank.tsx` |
| `conjugate` | ✅ Built — `components/game/ConjugateMode.tsx` |
| `listen` | ⬜ Scaffolded — falls back to flash (`app/play/page.tsx` line 251) |
| `speak` | ⬜ Scaffolded — falls back to flash |
| `match` | ⬜ Scaffolded — falls back to flash |

### Infrastructure
- ✅ SRS (spaced repetition) — `lib/srs.ts`, strength 0–5, intervals 0h → 2 weeks
- ✅ TTS — `lib/tts.ts`, browser Web Speech API, pt-BR, 0.88x rate
- ✅ Session builder — `lib/session.ts`, assigns modes per word type
- ✅ Story vignettes — `data/story.json`, all 20 levels defined
- ✅ Auth — passphrase-based, no email required
- ✅ Progress sync — Supabase `word_progress` table

---

## Phase 1 — Complete the Word List (Priority: HIGH)

**Goal:** Reach 2000 words across levels 1–20.

**Remaining:** ~1625 words needed (levels 9–20).

**Generation pattern** — see `scripts/gen_words_5_8.py` as template.

Each level gets ~100–135 words. Theme words to the arc location:

### Arc 3 — Minas Gerais (Levels 9–12)
- Level 9 (Belo Horizonte - A Família): Family, household, daily routines
- Level 10 (Interior - O Interior): Countryside, nature, directions, distances
- Level 11 (Festa Junina - Tradições): Celebrations, food, traditions, seasons
- Level 12 (Partida - Raízes): Roots, identity, memory, time expressions

### Arc 4 — Bahia (Levels 13–16)
- Level 13 (Salvador - Axé): Music, religion, Afro-Brazilian culture, dance
- Level 14 (Raízes Africanas - Cultura e História): History, politics, society, inequality
- Level 15 (Capoeira - O Mar): Sports, competition, the body in motion, ocean
- Level 16 (Trio Elétrico - Carnaval): Celebrations, crowds, excitement, chaos

### Arc 5 — Amazônia (Levels 17–20)
- Level 17 (Manaus - O Rio Negro): Rivers, boats, city vs. nature, trade
- Level 18 (A Floresta Fala - Floresta): Nature, animals, environment, survival
- Level 19 (O Povo - Comunidade Ribeirinha): Community, cooperation, indigenous culture
- Level 20 (Fluente - O Fim e o Começo): Abstract nouns, advanced connectors, fluency vocabulary

**Word frequency source:** Wiktionary/OpenSubtitles Brazilian Portuguese list (subtitle corpus — best for conversational speech). Reference: https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/BrazilianPortuguese_wordlist

---

## Phase 2 — Listen Mode (Priority: HIGH)

**File to create:** `components/game/ListenMode.tsx`

**Behaviour:**
- On mount: auto-play the word via `speak()` from `lib/tts.ts`
- Show 4 multiple-choice English meanings (1 correct + 3 distractors from same level)
- Replay button (also slow replay at 0.7x)
- On answer: call `onResult(correct: boolean)` — same interface as FlashCard

**Wire up:** In `app/play/page.tsx`, replace the fallback on line ~251:
```tsx
{currentItem.mode === 'listen' && (
  <ListenMode word={currentItem.word} allWords={words} onResult={handleResult} />
)}
```

**Props interface:**
```tsx
interface ListenModeProps {
  word: Word
  allWords: Word[]   // for generating distractors
  onResult: (correct: boolean) => void
}
```

---

## Phase 3 — Match Mode (hear → type)

**File to create:** `components/game/MatchMode.tsx`

**Behaviour:**
- Play the word audio on mount
- Text input: user types what they heard in Portuguese
- Loose matching: strip accents, lowercase, trim before comparing
- Shows correct answer on wrong attempt

---

## Phase 4 — Dialogue / Story Mode

**Route:** `app/story/` (currently empty)

**Behaviour:**
- Each story chapter (`data/story.json`) unlocks a dialogue scene
- Use `sentences[]` from words in that level to build a simple back-and-forth
- Player fills in one side of a conversation
- Later: real-time conversation with Claude as a Brazilian interlocutor

---

## Phase 5 — Speaking Mode (ship last)

**File to create:** `components/game/SpeakMode.tsx`

**Behaviour:**
- Show the Portuguese word, user speaks it aloud
- Web Speech API (`SpeechRecognition`) records + transcribes
- Compare transcript to expected (loose match)
- Score and give pronunciation feedback

**Note:** Most browser-dependent feature — test across Chrome/Safari/Firefox before relying on it.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `data/words.json` | All vocabulary (601 words as of 2026-04-14, all 20 levels) |
| `data/story.json` | Story chapter vignettes (all 20 levels) |
| `lib/tts.ts` | Browser TTS — `speak(text, slow?)` |
| `lib/srs.ts` | Spaced repetition logic |
| `lib/session.ts` | Session builder + XP calc |
| `lib/supabase.ts` | Supabase client |
| `components/game/FlashCard.tsx` | Flash card mode |
| `components/game/ContextBlank.tsx` | Fill-in-the-blank mode |
| `components/game/ConjugateMode.tsx` | Conjugation drill mode |
| `app/play/page.tsx` | Main game loop — mode routing at line ~241 |
| `app/dashboard/page.tsx` | Player dashboard |
| `store/gameStore.ts` | Zustand game state |
| `scripts/gen_words_5_8.py` | Word generation template |

---

## How to Resume This Work

1. Read this file for context.
2. Check `data/words.json` — count words per level: `cat data/words.json | python3 -c "import json,sys; d=json.load(sys.stdin); from collections import Counter; [print(f'Level {l}: {c}') for l,c in sorted(Counter(w['level'] for w in d).items())]"`
3. Next task: build `components/game/ListenMode.tsx` (Phase 2 above).
4. After ListenMode: build MatchMode, then Dialogue mode.
