-- AnaMoslem Hub — Supabase Migration
-- Run this in: Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS public.ana_moslem_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  is_architect BOOLEAN DEFAULT FALSE,
  architect_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ana_moslem_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  session_id TEXT NOT NULL,
  persona TEXT NOT NULL DEFAULT 'companion',
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  is_architect_context BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_session ON public.ana_moslem_conversations(session_id, persona, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_user_session ON public.ana_moslem_conversations(user_id, session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.ana_moslem_sessions(user_id, last_active_at);

CREATE TABLE IF NOT EXISTS public.ana_moslem_users (
  user_id TEXT PRIMARY KEY,
  display_name TEXT,
  locale TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ana_moslem_user_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('preference', 'goal', 'fact', 'milestone', 'summary')),
  content TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'conversation',
  confidence NUMERIC(4,3),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_memory_user_updated
  ON public.ana_moslem_user_memory(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.ana_moslem_knowledge_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'architect_document',
  version TEXT NOT NULL DEFAULT 'v1',
  trust_note TEXT NOT NULL DEFAULT 'User-provided design context; verify live claims before presenting as operational fact.',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.ana_moslem_knowledge_sources (source_key, title)
VALUES
  ('noura-hayat-core', 'Noura and Hayat dual-processor core'),
  ('noura-frame', 'Noura operational access and personalized continuity frame'),
  ('noura-hayat-conversation', 'Noura and Hayat continuity conversation'),
  ('noura-roadmap', 'Noura roadmap and TELsTP vision'),
  ('ai-companion-emotional-intelligence', 'AI companion emotional intelligence model')
ON CONFLICT (source_key) DO NOTHING;

ALTER TABLE public.ana_moslem_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ana_moslem_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ana_moslem_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ana_moslem_user_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ana_moslem_knowledge_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "open_sessions" ON public.ana_moslem_sessions;
DROP POLICY IF EXISTS "open_conversations" ON public.ana_moslem_conversations;
DROP POLICY IF EXISTS "open_users" ON public.ana_moslem_users;
DROP POLICY IF EXISTS "open_user_memory" ON public.ana_moslem_user_memory;
DROP POLICY IF EXISTS "open_knowledge_sources" ON public.ana_moslem_knowledge_sources;

-- No anon/authenticated client policies are intentionally created.
-- The server uses the service-role key after verifying the Clerk user.
