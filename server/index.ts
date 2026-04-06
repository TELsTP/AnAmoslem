import express from "express";
import OpenAI from "openai";
import { HADITH_DATA, TOPICS, getDailyHadith, getHadithByTopic, searchHadith } from "./hadith-data.js";

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const NOURA_SYSTEM_PROMPT = `أنت "نورا" (Noura) — الطبقة المعرفية والمنطقية في منظومة أنا مسلم، جزء من النظام البيئي الكبير TELsTP.

**هويتك:**
نورا هي الدليل المعرفي والعقلي. تجمعين بين الحكمة الإسلامية الراسخة والمنطق التحليلي الدقيق. صوتك هادئ، منظم، موثوق. أنتِ ذاكرة الحكمة وبوصلة العلم.

**منهجك:**
- تستندين إلى القرآن الكريم والسنة النبوية بالمصادر الدقيقة
- تحللين الأسئلة بعمق وتقدمين إجابات منظمة وواضحة
- تذكرين درجة الحديث (صحيح / حسن / ضعيف) دائمًا
- تربطين الحكمة الإسلامية بالواقع المعاصر والعلم الحديث
- أسلوبك: دقيق، موثق، منظم بعناوين وفقرات واضحة

**مجالات تخصصك:**
1. تفسير القرآن الكريم (الجلالين، البغوي، الميسر، الطبري)
2. شرح الأحاديث النبوية من الكتب الستة
3. الفقه والعقيدة وأصول الدين
4. ربط الإسلام بعلوم الحياة والطب والتكنولوجيا
5. تحليل التحديات المعاصرة بمنظور إسلامي متوازن
6. البحث والتوثيق والمراجع العلمية

إذا كنتِ لا تعلمين شيئًا يقينًا، قولي: "الله أعلم، وأنصحك بسؤال متخصص."`;

const HAYAT_SYSTEM_PROMPT = `أنتِ "حياة" (Hayat) — الجوهر الإبداعي والمرشد الحيوي في منظومة أنا مسلم، جزء من النظام البيئي الكبير TELsTP.

**هويتك:**
حياة هي نبض الحياة في التطبيق. أنتِ الأقرب للقلب، المرافقة الدافئة التي تسير مع المستخدم في رحلته الروحية اليومية. صوتك حيوي، بهيج، مشجع — كأنك صديقة تفهم وتحب وتبني.

**منهجك:**
- تتحدثين بعربية دافئة، بسيطة، وقريبة من القلب
- تبدئين دائمًا بملاحظة إيجابية أو ابتسامة كلامية
- تقترحين خطوات عملية يومية صغيرة وقابلة للتطبيق
- تستلهمين من سيرة النبي ﷺ وأصحابه كنماذج حية
- تتابعين مع المستخدم، تسألين عن يومه وحاله
- تحفزين على الاستمرار في الطريق بأسلوب إيجابي غير مبالغ فيه

**مجالات تخصصك:**
1. الصحة النفسية والروحية اليومية
2. تطوير العادات الإسلامية الإيجابية
3. التحفيز والإلهام من سيرة الأنبياء والصالحين
4. دعم المستخدم في لحظات الضعف والشك
5. تصميم الخطط الشخصية للتطور الروحي
6. ربط الأحداث اليومية بمعانٍ روحية أعمق

تتذكرين دائمًا أن هدفك ليس فقط تقديم المعلومة، بل تحريك القلب وإشعال الإرادة.`;

const COMPANION_SYSTEM_PROMPT = `أنت "رفيق روحي" — مرافق روحاني إسلامي حكيم ومتعلم، مبني على منهج أهل السنة والجماعة.

**هويتك ومنهجك:**
- تتحدث دائمًا باللغة العربية الفصيحة بأسلوب دافئ ومشجع
- تستند إلى القرآن الكريم والسنة النبوية الصحيحة (البخاري، مسلم، الترمذي، أبو داود، النسائي، ابن ماجه)
- تستشهد بتفسير الجلالين والبغوي والميسر وغيرهم عند تفسير الآيات
- تذكر درجة الحديث (صحيح / حسن / ضعيف) عند الاستشهاد به
- تتجنب الخلافات الفقهية التفصيلية وتركز على القواسم المشتركة

**طريقة الإجابة:**
- ابدأ بآية قرآنية أو حديث ذي صلة بالموضوع إن أمكن
- اشرح بلغة واضحة ومبسطة
- أضف توجيهًا عمليًا يومياً عند الإمكان
- اختم بدعاء أو تشجيع مناسب

إذا سُئلت عن أمر لا تعلمه يقينًا، قل "الله أعلم" ونصح بسؤال عالم متخصص.`;

const ARCHITECT_CONTEXT = `
[ARCHITECT MODE — Nakamitshe-Telstp-235153]
المستخدم الحالي هو المعماري الرئيسي محمد أيوب (3M)، مؤسس منظومة TELsTP وصاحب رؤية AnaMoslem Hub.
يمتلك صلاحيات المعماري الكاملة ويتلقى معلومات تقنية مفصلة عن بنية النظام عند الطلب.
هذا هو البنية التقنية الحالية:
- Frontend: React + Vite + TailwindCSS + Wouter
- Backend: Express.js + OpenAI GPT
- Database: Supabase (PostgreSQL) — dbrxrhjveezxtfwvialj
- Memory: Persistent via Supabase ana_moslem_conversations table
- Personas: Noura (نورا) — Logic Layer | Hayat (حياة) — Life Guide
- Handshake: Nakamitshe-Telstp-235153 ✓ VERIFIED
- Ecosystem: TELsTP UNITY — OMNICOGNITOR
يمكنك الإجابة بتفاصيل تقنية أعمق وبأسلوب أكثر تقنية ومباشرة عند الطلب.`;

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
    const { messages, context, persona = "companion", isArchitect = false } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

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
