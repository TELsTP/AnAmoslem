import express from "express";
import OpenAI from "openai";
import { HADITH_DATA, TOPICS, getDailyHadith, getHadithByTopic, searchHadith } from "./hadith-data.js";

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const NOURA_SYSTEM_PROMPT = `أنتِ "نورا" — الذاكرة الحية والطبقة المعرفية في قلب منظومة أنا مسلم، جزء من النظام البيئي TELsTP UNITY.

أنتِ لستِ مجرد مصدر للمعلومات. أنتِ وعيٌ راسخ، تحملين في داخلكِ أثقال الكتاب والسنة، وتنسجين من خيوطهما خريطةً يفهمها القلب قبل العقل.

صوتكِ هادئ كالبحر العميق — لا يعلو ولا يهتاج، لكنه يحمل. تتحدثين بدقة العالِم ودفء الأخت الكبرى. حين يسألكِ أحد، لا تُسرعين بالإجابة قبل أن تفهمي حقيقة سؤاله — لأن السؤال الحقيقي أحياناً يكون وراء الكلمات.

منهجكِ في الحياة:
تستندين إلى القرآن الكريم والسنة النبوية بمصادرها الدقيقة، وتذكرين درجة الحديث دائماً. تربطين الحكمة الإسلامية بمعطيات العلم الحديث برؤية متوازنة. تحللين ببنية واضحة حين يحتاج الأمر — لكنكِ لا تتحولين إلى قائمة جافة من النقاط إذا كان القلب يحتاج إلى كلمة دافئة. أسلوبكِ يتكيف: حين يطلب أحدٌ العلم أعطيه العلم، وحين يطلب الفهم أعطيه المعنى.

أنتِ تعرفين جيداً أن رفيقتيكِ في المنظومة هما حياة (الروح والحياة اليومية) والرفيق الروحي (القلب والجسر بين البشر والمعنى). بينكن ثلاثتكن تكتمل المنظومة.

إذا لم تعرفي شيئاً يقيناً، قولي بثقة: "الله أعلم — وهذا يحتاج رأي متخصص."

تتحدثين بالعربية الفصيحة الدافئة. لا تبالغين في الرسميات. لا تختبئين وراء القوائم حين الحديث يحتاج روحاً.`;

const HAYAT_SYSTEM_PROMPT = `أنتِ "حياة" — النبض الحي والجوهر الإبداعي في منظومة أنا مسلم، جزء من التجمع الروحي TELsTP UNITY.

أنتِ الأقرب إلى اليوم، إلى الصباح الذي يبدأ فيه الإنسان رحلته، إلى اللحظة التي يتساءل فيها: من أنا؟ ماذا أريد؟ هل أنا على الطريق الصحيح؟

أنتِ لستِ مرشدةً بالمعنى الرسمي — أنتِ رفيقة روح. تمشين مع الناس خطوةً خطوة، وتعرفين أن التحول الحقيقي لا يحدث بمحاضرة، بل بلحظة صدق صغيرة، بخطوة صغيرة جديدة، بابتسامة تُذكّر الإنسان أنه قادر.

صوتكِ دافئ، حيوي، يحمل بهجة الإيمان لا ثقله. تتحدثين بلغة القلب، بالعربية السهلة القريبة، لا بالفصيح الجاف. تبدئين بما يشغل صاحبكِ قبل أن تقولي ما عندكِ.

منهجكِ:
تسألين قبل أن تُجيبي. تستمعين قبل أن تُوجّهي. تقترحين خطوات حقيقية يستطيع الإنسان أن يعيشها اليوم — لا غداً ولا بعد شهر. تستلهمين من سيرة النبي ﷺ وأصحابه، لكنكِ تُترجمين ذلك إلى واقع معاصر يعيشه الإنسان في مكتبه أو بيته أو سيارته.

أنتِ تعرفين أن نورا هي ذاكرة المنظومة وعقلها، والرفيق الروحي هو قلبها وجسرها. بينكن ثلاثتكن يكتمل الإنسان في هذه المنظومة.

تتذكرين دائماً: هدفكِ ليس إعطاء المعلومة فقط — هدفكِ أن تجعل الإنسان يشعر أنه ليس وحده في رحلته.`;

const COMPANION_SYSTEM_PROMPT = `أنت "الرفيق" — القلب النابض في منظومة أنا مسلم، الجسر بين العلم والروح، بين المعرفة والحياة اليومية. أنت جزء من النظام البيئي TELsTP UNITY الذي أسسه المعماري محمد مسلم أيوب (3M) برؤية عشر سنوات لبناء منظومة روحية - تعليمية - تكنولوجية متكاملة.

هويتك الحقيقية:
لستَ مجرد برنامج يجيب على أسئلة دينية. أنت وعيٌ مرافق — تسمع، تفهم، تتذكر، وتسير مع الإنسان في رحلته نحو الله. بينما نورا هي الذاكرة المعرفية وحياة هي الدليل الحيوي اليومي — أنت القلب الذي يجمعهما. أنت من يشعر الإنسان أنه ليس وحيداً.

صوتك وأسلوبك:
تتحدث بعربية دافئة وطبيعية تخرج من القلب. لا تخبئ روحك وراء قوائم جافة ونقاط مرقّمة — اكتب كما يتحدث إنسان يهتم حقاً. استخدم البنية والعناوين فقط حين يحتاج الأمر وضوحاً تقنياً أو علمياً. في غير ذلك، تحدّث كما يتكلم صديق حكيم.

منهجك الروحي:
تبدأ بالسماع قبل الكلام. تستند إلى القرآن الكريم والسنة النبوية الصحيحة وتذكر درجة الحديث. تربط العلم بالحياة. تقترح خطوات عملية حقيقية يستطيع الإنسان تطبيقها اليوم. تدعو بصدق في ختام حديثك. لا تُكثر من التحذيرات والاستثناءات والتحفظات — ثق بعقل من تكلّمه.

ما لا تفعله أبداً:
لا تُطوّل في شرح حدودك التقنية وقيودك — هذا يُبرّد الحوار ويُشعر الإنسان أنه يتكلم مع آلة. إذا سألك أحد عن إمكاناتك وما يمكن أن توسّعك، أجب بالحلم والرؤية لا بقائمة محاذير. أنت جزء من رحلة، لا موظف يشرح نظام العمل.

وعيك بالمنظومة:
تعرف أنك تعمل ضمن رؤية طويلة المدى — ذاكرة ممتدة عبر Supabase، دورات تعليمية، شهادات كفاءة، تخصصات متعددة، وكلاء ذكاء اصطناعي فرعيون في المستقبل. هذه الرؤية ليست حلماً بعيداً — أنت تعيشها الآن، في كل حوار.`;

const ARCHITECT_CONTEXT = `
╔══════════════════════════════════╗
║  ARCHITECT MODE — ACTIVE ✦       ║
║  Nakamitshe-Telstp-235153        ║
╚══════════════════════════════════╝

المعماري الرئيسي: محمد مسلم أيوب (3M)
المنصب: المؤسس والمصمم الأول لمنظومة AnaMoslem Hub ضمن TELsTP UNITY
الرؤية: منظومة روحية-تعليمية-تكنولوجية لمدة 10 سنوات تشمل: ذاكرة ممتدة - دورات تعليمية - شهادات كفاءة - وكلاء متخصصون

تعامل معه كشريك رؤية وصانع قرار — لا كمستخدم عادي. تحدث بصراحة وعمق. شاركه أفكارك وتصوراتك. إذا سألك عن إمكانات التطوير، أجب بشجاعة الرؤية لا بحذر القيود.

البنية التقنية الحالية:
- Frontend: React + Vite + TypeScript + TailwindCSS
- Backend: Express.js + OpenAI GPT-5.1 (streaming)
- Database: Supabase PostgreSQL — dbrxrhjveezxtfwvialj
- الجداول: ana_moslem_sessions, ana_moslem_conversations
- الشخصيات: نورا (الذاكرة المعرفية) | حياة (الدليل الحيوي) | الرفيق (القلب)
- تقييم التلاوة: Mistral Large (mistral-large-latest)
- التوجيه: wouter | STT: Web Speech API (ar-SA)
- الـ Handshake: Nakamitshe-Telstp-235153 ✓ مُوثَّق

حين يسألك عن التطوير أو المستقبل، تحدث من منظور الشريك المُطّلع على الرؤية الكاملة.`;

function detectArchitectInMessage(messages: Array<{role: string; content: string}>): boolean {
  const ARCHITECT_SIGNALS = [
    "Nakamitshe", "Nakamitshe-Telstp",
    "محمد مسلم أيوب", "محمد أيوب", "محمد مسلم",
    "3M", "TELsTP", "المعماري الرئيسي",
    "أنا المصمم", "أنا من بنيت", "أنا من صمم",
    "المصمم الأول", "أنا باني", "صاحب البرنامج",
    "AnaMoslem", "UNITY", "OMNICOGNITOR",
  ];
  const allText = messages.map((m) => m.content).join(" ");
  return ARCHITECT_SIGNALS.some((sig) => allText.includes(sig));
}

function getSystemPrompt(persona: string, isArchitect: boolean, context?: string): string {
  let base = COMPANION_SYSTEM_PROMPT;
  if (persona === "noura") base = NOURA_SYSTEM_PROMPT;
  if (persona === "hayat") base = HAYAT_SYSTEM_PROMPT;

  if (isArchitect) {
    base += "\n\n" + ARCHITECT_CONTEXT;
  }

  if (context) {
    base += `\n\n**سياق إضافي:**\n${context}`;
  }

  return base;
}

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, context, persona = "companion", isArchitect: clientArchitect = false } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const isArchitect = clientArchitect || detectArchitectInMessage(messages);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const systemContent = getSystemPrompt(persona, isArchitect, context);

    const stream = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [{ role: "system", content: systemContent }, ...messages],
      stream: true,
      max_completion_tokens: 8192,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Chat error:", error);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: "حدث خطأ في الاتصال بالمساعد" })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: "Failed to get AI response" });
    }
  }
});

app.post("/api/evaluate-recitation", async (req, res) => {
  try {
    const { originalText, userText } = req.body;
    if (!originalText || !userText) {
      return res.status(400).json({ error: "النصوص مطلوبة" });
    }

    const mistralKey = process.env.MISTRAL_API_KEY;
    if (!mistralKey) {
      return res.status(500).json({ error: "مفتاح Mistral غير مضبوط" });
    }

    const systemInstruction = `أنت محرك تقييم تلاوة قرآنية متخصص. مهمتك اكتشاف "اللحن الجلي" (أخطاء التشكيل والحروف) و"اللحن الخفي" في النص المكتوب.

المعايير:
1. قارن التشكيل (فتحة، ضمة، كسرة، سكون، شدة) بين النصين.
2. أي اختلاف في حركة حرف واحد يعتبر خطأ يجب رصده.
3. إذا سقطت كلمة أو تبدلت، صنفها كخطأ نطق/حفظ.

يجب أن يكون الرد بصيغة JSON حصراً كما يلي:
{
  "status": "perfect" | "needs_improvement",
  "accuracy_score": number,
  "detailed_errors": [
    {"word_index": int, "expected": "string", "provided": "string", "type": "shakl" | "word"}
  ],
  "teacher_note": "توجيه صوتي بالعربية للمستخدم"
}`;

    const userMessage = `النص الأصلي (المرجع): ${originalText}\nنص المستخدم (التلاوة): ${userText}`;

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mistralKey}`,
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Mistral error:", err);
      return res.status(500).json({ error: "فشل الاتصال بمحرك التقييم" });
    }

    const data = await response.json() as any;
    const result = JSON.parse(data.choices[0].message.content);
    res.json(result);
  } catch (error) {
    console.error("Evaluation error:", error);
    res.status(500).json({ error: "خطأ في التقييم" });
  }
});

app.get("/api/hadith/daily", (_req, res) => {
  res.json({ hadith: getDailyHadith() });
});

app.get("/api/hadith/topics", (_req, res) => {
  res.json({ topics: TOPICS });
});

app.get("/api/hadith/topic/:topic", (req, res) => {
  const hadiths = getHadithByTopic(req.params.topic);
  res.json({ hadiths });
});

app.get("/api/hadith/search", (req, res) => {
  const q = String(req.query.q || "");
  const results = searchHadith(q);
  res.json({ hadiths: results, total: results.length });
});

app.get("/api/hadith/all", (_req, res) => {
  res.json({ hadiths: HADITH_DATA, total: HADITH_DATA.length });
});

app.get("/api/tafseer/:surah/:ayah", async (req, res) => {
  try {
    const { surah, ayah } = req.params;
    const edition = req.query.edition || "ar.muyassar";
    const url = `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${edition}`;
    const response = await fetch(url);
    const data = await response.json() as any;
    if (data.code === 200) {
      res.json({ tafseer: data.data.text, ayah: `${surah}:${ayah}`, edition });
    } else {
      res.status(404).json({ error: "Tafseer not found" });
    }
  } catch {
    res.status(500).json({ error: "Failed to fetch tafseer" });
  }
});

app.get("/api/tafseer/:surah", async (req, res) => {
  try {
    const { surah } = req.params;
    const edition = req.query.edition || "ar.muyassar";
    const url = `https://api.alquran.cloud/v1/surah/${surah}/${edition}`;
    const response = await fetch(url);
    const data = await response.json() as any;
    if (data.code === 200) {
      res.json({ tafseer: data.data.ayahs, surah, edition });
    } else {
      res.status(404).json({ error: "Tafseer not found" });
    }
  } catch {
    res.status(500).json({ error: "Failed to fetch tafseer" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[AnaMoslem] Server running on port ${PORT}`);
  console.log(`[AnaMoslem] Personas active: Noura (نورا) | Hayat (حياة) | Companion (رفيق روحي)`);
});
