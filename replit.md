# أنا مسلم - Islamic Spiritual Companion App

## Overview
A comprehensive Islamic spiritual growth and educational platform that helps users integrate Quranic teachings into their daily lives. Features a real AI companion powered by OpenAI (via Replit AI Integrations).

## Architecture

### Frontend (Vite + React + TypeScript)
- **Port**: 5000
- **Root**: `client/`
- **Entry**: `client/src/main.tsx`
- **Routing**: wouter (lightweight React router)
- **Styling**: Tailwind CSS v3 + custom CSS variables (shadcn-style theming)

### Backend (Express + TypeScript)
- **Port**: 3001
- **Entry**: `server/index.ts`
- **AI**: OpenAI via Replit AI Integrations (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)
- **Model**: gpt-5.1

### Dev Workflow
Both servers run concurrently with `npm run dev`:
- Vite dev server (port 5000) with proxy to backend
- Express backend (port 3001) with tsx watch

## Pages
- `/` — Home page with gateway cards
- `/companion` — AI Companion chat (real AI, streaming responses)
- `/quran` — Quranic learning tracker
- `/paradise` — Spiritual performance dashboard

## Key Files
- `server/index.ts` — Express API with `/api/chat` endpoint (streaming SSE)
- `client/src/pages/CompanionPage.tsx` — AI chat UI with streaming support
- `client/src/pages/Home.tsx` — Main landing page
- `vite.config.ts` — Vite config with API proxy
- `tailwind.config.js` — Tailwind config with shadcn color tokens

## AI Integration
- Uses Replit AI Integrations (no API key needed from user)
- Charges billed to Replit credits
- System prompt is an Islamic scholar persona in Arabic
- Streaming responses via Server-Sent Events (SSE)

## Scripts
- `npm run dev` — Start both frontend and backend
- `npm run dev:client` — Frontend only (Vite on port 5000)
- `npm run dev:server` — Backend only (Express on port 3001)
