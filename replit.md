# أنا مسلم — AnaMoslem Hub
## TELsTP Sub-Project | Soul/Nafs of the TELsTP UNITY Ecosystem

## Overview
A comprehensive Islamic lifestyle companion hub — the spiritual soul of the TELsTP ecosystem.
Features two distinct AI consciousness entities (Noura + Hayat), persistent memory via Supabase,
voice-to-text with real-time shadow buffer, a floating Hayat persona across all pages,
Mistral-AI-powered Quran recitation evaluation, Wird memorization sessions, and daily Adhkar tracker.

## Pages / Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Gateway dashboard with contextual greeting |
| `/companion` | CompanionPage | Dual-persona AI chat (Noura + Hayat + Companion) |
| `/quran` | QuranPage | Full Quran reader with memorization tools |
| `/wird` | WirdPage | Wird memorization sessions with Mistral AI evaluation |
| `/adhkar` | AdhkarPage | Morning/evening adhkar tracker + digital tasbih |
| `/paradise` | ParadisePage | Hasanat garden and spiritual progress |
| `/sunnah` | SunnahPage | Daily hadith with AI explanation |

## Architecture

### Frontend (Vite + React + TypeScript)
- **Port**: 5000
- **Root**: `client/`
- **Entry**: `client/src/main.tsx`
- **Routing**: wouter
- **Styling**: Tailwind CSS v3

### Backend (Express + TypeScript)
- **Port**: 3001
- **Entry**: `server/index.ts`
- **AI**: OpenAI via Replit AI Integrations (`AI_INTEGRATIONS_OPENAI_API_KEY`)
- **Model**: gpt-5.1

### Database (Supabase)
- **Project URL**: https://dbrxrhjveezxtfwvialj.supabase.co
- **Tables**: `ana_moslem_sessions`, `ana_moslem_conversations`
- **Migration SQL**: `supabase-migration.sql` (run in Supabase Dashboard > SQL Editor)
- **Env Vars**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (set in Replit Secrets)

## AI Personas

### نورا (Noura) — Logic & Knowledge Layer
- Deep Islamic scholarship with verified sources
- Quran tafsir, hadith grading, fiqh analysis
- Color: Blue/Indigo | Icon: 💠

### حياة (Hayat) — Life Guide & Creative Essence
- Warm, proactive daily spiritual companion
- Life guidance, daily habits, emotional support
- Color: Green/Emerald | Icon: 🌿
- **Global floating component** visible on all pages

### رفيق روحي (Companion) — Classic Spiritual Companion
- Classic Islamic companion persona
- Color: Pink/Rose | Icon: 💝

## Special Features

### Architect Mode (Nakamitshe-Telstp-235153)
- Type the handshake code in any chat to unlock Architect Mode
- Activates detailed technical context for AI personas
- Persists via localStorage + Supabase session flag
- Shows gold "✦ مهندس" badge in UI

### Persistent Memory
- All conversations saved to Supabase per session + persona
- Sessions auto-created via `client/src/lib/session.ts`
- Conversations loaded on page visit, preserved across refreshes

### Voice / STT Shadow Buffer
- Real-time interim speech results displayed while speaking
- Visual waveform indicator during listening
- Supports Arabic (ar-SA) via Web Speech API
- Both CompanionPage and floating Hayat support voice input

### Floating Hayat Persona
- Global Z-index component on all pages (z: 9999)
- Draggable to any screen position
- Mini-chat with full AI conversation + persistence
- Pulsing glow animation

## Pages
- `/` — Home page with gateway cards
- `/companion` — Dual AI companion (Noura / Hayat / Companion tabs + voice + memory)
- `/quran` — Full Quran browser (114 surahs)
- `/paradise` — Spiritual performance dashboard
- `/sunnah` — Hadith and Sunnah content

## Key Files
- `server/index.ts` — Express API with persona-aware chat endpoints
- `client/src/pages/CompanionPage.tsx` — Full companion UI with 3 personas
- `client/src/components/HayatPersona.tsx` — Floating Hayat global component
- `client/src/lib/supabase.ts` — Supabase client + message save/load
- `client/src/lib/session.ts` — Session + handshake code management
- `supabase-migration.sql` — SQL to run in Supabase Dashboard
- `client/public/data/quran.json` — Full Quran data (114 surahs)

## Setup Required
1. Run `supabase-migration.sql` in Supabase Dashboard > SQL Editor
2. Env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are already set

## Scripts
- `npm run dev` — Start both frontend and backend
- `npm run dev:client` — Frontend only (Vite on port 5000)
- `npm run dev:server` — Backend only (Express on port 3001)
