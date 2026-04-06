-- AnaMoslem Hub — Supabase Migration
-- Run this in: Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS public.ana_moslem_sessions (
  id TEXT PRIMARY KEY,
  is_architect BOOLEAN DEFAULT FALSE,
  architect_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ana_moslem_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  persona TEXT NOT NULL DEFAULT 'companion',
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  is_architect_context BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_session ON public.ana_moslem_conversations(session_id, persona, created_at);

ALTER TABLE public.ana_moslem_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ana_moslem_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "open_sessions" ON public.ana_moslem_sessions;
DROP POLICY IF EXISTS "open_conversations" ON public.ana_moslem_conversations;

CREATE POLICY "open_sessions" ON public.ana_moslem_sessions
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "open_conversations" ON public.ana_moslem_conversations
  FOR ALL USING (TRUE) WITH CHECK (TRUE);
