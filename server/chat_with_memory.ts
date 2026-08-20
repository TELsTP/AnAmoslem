import express from 'express';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const openai = new OpenAI({
  apiKey:
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

type ConversationRow = {
  id: string;
  session_id: string;
  persona?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

router.post('/chat-with-memory', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        error: 'Memory chat is unavailable because Supabase is not configured',
      });
    }

    const { userId, message, character } = req.body as {
      userId: string;
      message: string;
      character: 'nora' | 'hayah' | 'muslim';
    };

    if (!userId || !message || !character) {
      return res.status(400).json({
        error: 'userId, message, and character are required',
      });
    }

    const persona = character === 'hayah' ? 'hayat' : character === 'muslim' ? 'companion' : 'noura';

    const { data: session, error: sessionError } = await supabase
      .from('ana_moslem_sessions')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (sessionError) {
      console.error('Error fetching last session:', sessionError);
    }

    if (!session) {
      const { error: createError } = await supabase
        .from('ana_moslem_sessions')
        .insert([
          {
            id: userId,
          },
        ])

      if (createError) {
        console.error('Error creating new session:', createError);
        return res.status(500).json({ error: 'Failed to create session' });
      }
    }

    const { data: previousConversations } = await supabase
      .from('ana_moslem_conversations')
      .select('role, content')
      .eq('session_id', userId)
      .eq('persona', persona)
      .order('created_at', { ascending: false })
      .limit(12);

    const previousSessionContext = previousConversations?.length
      ? `\nسياق مختصر من الحوار السابق:\n${(previousConversations as ConversationRow[])
          .reverse()
          .map((conversation) => `${conversation.role === 'user' ? 'المستخدم' : 'المساعد'}: ${conversation.content}`)
          .join('\n')}\n`
      : '';

    const { error: convError } = await supabase
      .from('ana_moslem_conversations')
      .insert([
        {
          session_id: userId,
          persona,
          role: 'user',
          content: message,
        },
      ]);

    if (convError) {
      console.error('Error inserting user message:', convError);
    }

    const systemPrompt = `
أنت "${character}" داخل منظومة "أنا مسلم".

${previousSessionContext}

تعامل بلطف وحكمة، واستفد من المعلومات السابقة عن الجلسة إن كانت مفيدة،
لكن لا تفترض أشياء لم تُذكر صراحةً، ولا تربط أحداثاً شخصية إلا إن أشار المستخدم لها.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.4,
    });

    const assistantReply = completion.choices[0]?.message?.content ?? '';

    const { error: assistantConvError } = await supabase
      .from('ana_moslem_conversations')
      .insert([
        {
          session_id: userId,
          persona,
          role: 'assistant',
          content: assistantReply,
        },
      ]);

    if (assistantConvError) {
      console.error('Error inserting assistant message:', assistantConvError);
    }

    await supabase
      .from('ana_moslem_sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId);

    res.json({
      reply: assistantReply,
      sessionId: userId,
    });
  } catch (e) {
    console.error('Chat-with-memory route error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
