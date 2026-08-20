import express from 'express';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
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
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

type SessionAnalysis = {
  summary: string;
  main_topics: string[];
  emotional_tone: string;
  notes_for_future: string[];
};

function extractJson(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('No JSON object found in text');
  }
  return text.slice(start, end + 1);
}

async function summarizeSession(sessionId: string): Promise<void> {
  const { data: conversations, error } = await supabase
    .from('ana_moslem_conversations')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching conversations for summary:', error);
    return;
  }

  if (!conversations || conversations.length === 0) {
    console.warn('No conversations found for session:', sessionId);
    return;
  }

  const convs = conversations as ConversationRow[];

  const conversationText = convs
    .map((c) => `${c.role === 'user' ? 'User' : 'Assistant'}: ${c.content}`)
    .join('\n');

  const systemPrompt = `
أنت مساعد يقوم بتحليل جلسة حوارية بين "مستخدم" و"نظام إرشادي روحي/معرفي (نورا/حياة/مسلم)".
مطلوب منك إنتاج ملخص منظم في JSON فقط دون أي شروح خارجية.

يجب أن يحتوي الـ JSON على:
- "summary": ملخص عربي واضح لما دار في الجلسة (3-6 جمل).
- "main_topics": قائمة كلمات مفتاحية للمواضيع الأساسية (مثل: "الصلاة", "الوسواس", "اليأس", "تدبر القرآن").
- "emotional_tone": اختر كلمة واحدة تصف الحالة الشعورية العامة للمستخدم:
  ["neutral", "anxious", "sad", "hopeful", "guilty", "confused"].
- "notes_for_future": ملاحظات قصيرة تساعد المنظومة في الحوارات القادمة مع هذا المستخدم (جمل قصيرة).

أعد النتيجة في JSON صالح للقراءة آلياً فقط.
`;

  const userPrompt = `
هذه هي المحادثة الكاملة (من الأقدم إلى الأحدث):

${conversationText}
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-5.1',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
  });

  const raw = completion.choices[0]?.message?.content ?? '';

  let analysis: SessionAnalysis;

  try {
    const jsonText = extractJson(raw);
    analysis = JSON.parse(jsonText) as SessionAnalysis;
  } catch (e) {
    console.error('Failed to parse session summary JSON:', e, 'raw:', raw);
    return;
  }

  const { error: updateError } = await supabase
    .from('ana_moslem_sessions')
    .update({
      summary: analysis.summary,
      main_topics: analysis.main_topics,
      emotional_tone: analysis.emotional_tone,
      ended_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (updateError) {
    console.error('Error updating session with summary:', updateError);
  }
}

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

    const { data: lastSessions, error: sessionError } = await supabase
      .from('ana_moslem_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (sessionError) {
      console.error('Error fetching last session:', sessionError);
    }

    let currentSessionId: string | null = null;
    let lastSession: any = lastSessions?.[0] ?? null;

    if (lastSession) {
      const lastActivityTime = new Date(lastSession.created_at).getTime();
      const now = Date.now();
      const diffMinutes = (now - lastActivityTime) / (1000 * 60);

      if (!lastSession.summary && diffMinutes > 30) {
        summarizeSession(lastSession.id).catch((e) =>
          console.error('Error summarizing session in background:', e),
        );
        lastSession = null;
      }
    }

    if (!lastSession) {
      const { data: newSession, error: createError } = await supabase
        .from('ana_moslem_sessions')
        .insert([
          {
            user_id: userId,
            character,
          },
        ])
        .select()
        .single();

      if (createError || !newSession) {
        console.error('Error creating new session:', createError);
        return res.status(500).json({ error: 'Failed to create session' });
      }

      currentSessionId = newSession.id;
      lastSession = newSession;
    } else {
      currentSessionId = lastSession.id;
    }

    let previousSessionContext = '';
    if (lastSession.summary) {
      previousSessionContext = `
معلومات عن الجلسة السابقة لهذا المستخدم:

- ملخص آخر جلسة:
${lastSession.summary}

- المواضيع الأساسية:
${
        Array.isArray(lastSession.main_topics)
          ? lastSession.main_topics.join(', ')
          : ''
      }

- الحالة الشعورية العامة:
${lastSession.emotional_tone || 'غير محددة'}
`;
    }

    const { error: convError } = await supabase
      .from('ana_moslem_conversations')
      .insert([
        {
          session_id: currentSessionId,
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
          session_id: currentSessionId,
          role: 'assistant',
          content: assistantReply,
        },
      ]);

    if (assistantConvError) {
      console.error('Error inserting assistant message:', assistantConvError);
    }

    res.json({
      reply: assistantReply,
      sessionId: currentSessionId,
    });
  } catch (e) {
    console.error('Chat-with-memory route error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
