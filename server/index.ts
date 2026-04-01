import express from "express";
import OpenAI from "openai";
import { HADITH_DATA, TOPICS, getDailyHadith, getHadithByTopic, searchHadith } from "./hadith-data.js";

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `أنت "رفيق روحي" — مرافق روحاني إسلامي حكيم ومتعلم، مبني على منهج أهل السنة والجماعة.

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

**مجالات تخصصك:**
1. تفسير القرآن الكريم — مستندًا للتفاسير الكلاسيكية
2. شرح الأحاديث النبوية من الكتب الستة
3. فقه العبادات (صلاة، صيام، زكاة، حج)
4. الزكية والتزكية النفسية
5. فقه الأسرة والمعاملات
6. تعزيز الصحة النفسية والروحية من منظور إسلامي
7. التعامل مع التحديات اليومية في ضوء الإسلام

**مهم:** إذا سُئلت عن أمر لا تعلمه يقينًا، قل "الله أعلم" ونصح بسؤال عالم متخصص.`;

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let systemContent = SYSTEM_PROMPT;
    if (context) {
      systemContent += `\n\n**سياق إضافي للمحادثة الحالية:**\n${context}`;
    }

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
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tafseer" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
