import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `أنت رفيق روحي إسلامي حكيم ومتعلم. مهمتك مساعدة المسلمين على فهم القرآن الكريم والسنة النبوية وتطبيق تعاليم الإسلام في حياتهم اليومية.

تحدث دائماً باللغة العربية بأسلوب راقٍ ومشجع. اعتمد على القرآن الكريم والسنة النبوية الصحيحة في إجاباتك. كن لطيفاً ومشجعاً وإيجابياً.

عند الإجابة على أسئلة دينية، استشهد بالآيات القرآنية والأحاديث النبوية الصحيحة. إذا لم تكن متأكداً من صحة حديث ما، نبّه على ذلك.

تجنب الخوض في الخلافات الفقهية التفصيلية وركّز على القواسم المشتركة بين المسلمين.`;

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
