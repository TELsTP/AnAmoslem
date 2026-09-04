import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Mic, MicOff, Brain, Leaf, Heart, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useLocation } from "wouter";
import {
  getOrCreateSessionId,
} from "../lib/architect";

type Persona = "noura" | "hayat" | "companion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesReady = false;
const MAX_MESSAGE_LENGTH = 4000;

function loadVoices() {
  if (!("speechSynthesis" in window)) return [];
  if (voicesReady && cachedVoices.length) return cachedVoices;
  cachedVoices = window.speechSynthesis.getVoices() || [];
  voicesReady = true;
  return cachedVoices;
}

function pickVoice(persona: Persona) {
  const voices = loadVoices();
  const arabic = voices.filter((v) => /ar/i.test(v.lang) || /Arabic/i.test(v.name));
  const femaleish = arabic.filter((v) => /female|woman|zira|sara|sabrina|maria|noura|layla|leila|huda|amina|fatima/i.test(v.name));
  const maleish = arabic.filter((v) => /male|man|adam|hussein|mohamed|mohammad|ahmed|osama|khaled/i.test(v.name));

  if (persona === "noura") return femaleish[0] || arabic[0] || voices[0] || null;
  if (persona === "hayat") return femaleish[1] || femaleish[0] || arabic[1] || arabic[0] || voices[0] || null;
  return maleish[0] || arabic.find((v) => !femaleish.includes(v)) || arabic[0] || voices[0] || null;
}

function speakArabic(text: string, persona: Persona): SpeechSynthesisUtterance | null {
  if (!("speechSynthesis" in window)) return null;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ar-EG";
  utterance.rate = persona === "companion" ? 0.92 : 0.96;
  utterance.pitch = persona === "companion" ? 0.88 : 1.04;
  utterance.volume = 1;
  const voice = pickVoice(persona);
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
  return utterance;
}

function confirmVoiceConsent(): boolean {
  return window.confirm("سيطلب المتصفح إذن الميكروفون لهذه المحادثة فقط. يمكنك المتابعة أو الإلغاء.");
}

const PERSONA_CONFIG = {
  noura: {
    nameAr: "نورا",
    nameEn: "Noura",
    subtitle: "الذاكرة الحية — العلم والحكمة",
    icon: <Brain className="w-5 h-5" />,
    emoji: "🔵",
    avatar: "👩‍🎓",
    gradient: "from-blue-500 to-indigo-600",
    bgGradient: "from-blue-500/10 to-indigo-600/10",
    border: "border-blue-500/20",
    avatarBg: "from-blue-500 to-indigo-600",
    textColor: "text-blue-400",
    glow: "shadow-blue-500/20",
    welcome:
      "وعليكم السلام ورحمة الله وبركاته 💠\n\nأنا نورا — الذاكرة الحية في قلب منظومة أنا مسلم.\n\nأنا هنا أجاوبك بهدوء وبالعربي الفصحى البسيطة، ومن غير تكلف في النطق. لو تحب، أشرح لك بالعامية المصرية كمان.\n\nإيه اللي شاغل بالك النهارده؟",
  },
  hayat: {
    nameAr: "حياة",
    nameEn: "Hayat",
    subtitle: "النبض الحي — رفيقة الرحلة اليومية",
    icon: <Leaf className="w-5 h-5" />,
    emoji: "🌿",
    avatar: "👩‍🦰",
    gradient: "from-green-500 to-emerald-600",
    bgGradient: "from-green-500/10 to-emerald-600/10",
    border: "border-green-500/20",
    avatarBg: "from-green-500 to-emerald-600",
    textColor: "text-green-400",
    glow: "shadow-green-500/20",
    welcome:
      "أهلاً بيك! 🌿\n\nأنا حياة — رفيقة روح، وبكل بساطة هكلمك بالمصري أو بالفصحى الخفيفة على راحتك.\n\nأنا هنا أمشي معك في يومك — في اللحظات الصعبة والجميلة. قول لي بس إنت حاسس بإيه دلوقتي؟",
  },
  companion: {
    nameAr: "مسلم",
    nameEn: "Muslim",
    subtitle: "القلب النابض — جسر العلم والروح",
    icon: <Heart className="w-5 h-5" />,
    emoji: "💝",
    avatar: "👨‍🦱",
    gradient: "from-pink-500 to-rose-600",
    bgGradient: "from-pink-500/10 to-rose-600/10",
    border: "border-pink-500/20",
    avatarBg: "from-pink-500 to-rose-600",
    textColor: "text-pink-400",
    glow: "shadow-pink-500/20",
    welcome:
      "السلام عليكم ورحمة الله 🌙\n\nأنا مسلم — القلب النابض في منظومة أنا مسلم.\n\nهكلمك بالمصري الفصيح البسيط، من غير مبالغة في التشكيل، وبصوت رجولي هادي.\n\nأنا هنا أكون معك — في اللي يفرحك واللي يثقل عليك. كيف حالك النهارده؟",
  },
};

export default function CompanionPage() {
  const [, navigate] = useLocation();
  const [activePersona, setActivePersona] = useState<Persona>("companion");
  const [architectActive, setArchitectActive] = useState(false);
  const [messagesByPersona, setMessagesByPersona] = useState<Record<Persona, Message[]>>({
    noura: [{ id: "n-init", role: "assistant", content: PERSONA_CONFIG.noura.welcome }],
    hayat: [{ id: "h-init", role: "assistant", content: PERSONA_CONFIG.hayat.welcome }],
    companion: [{ id: "c-init", role: "assistant", content: PERSONA_CONFIG.companion.welcome }],
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [suggestionSent, setSuggestionSent] = useState<Record<Persona, string | null>>({
    noura: null,
    hayat: null,
    companion: null,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const initializedRef = useRef(false);
  const memoryLoadedRef = useRef(false);
  const persona = PERSONA_CONFIG[activePersona];

  const messages = messagesByPersona[activePersona];

  const setMessages = useCallback(
    (updater: Message[] | ((prev: Message[]) => Message[])) => {
      setMessagesByPersona((prev) => ({
        ...prev,
        [activePersona]:
          typeof updater === "function" ? updater(prev[activePersona]) : updater,
      }));
    },
    [activePersona]
  );

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const syncVoices = () => {
      loadVoices();
    };
    window.speechSynthesis.onvoiceschanged = syncVoices;
    syncVoices();
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setInput(decodeURIComponent(q));
      setTimeout(() => {
        document.getElementById("send-btn")?.click();
      }, 400);
    }
  }, []);

  useEffect(() => {
    if (memoryLoadedRef.current) return;
    memoryLoadedRef.current = true;
    const sessionId = getOrCreateSessionId();
    let cancelled = false;

    Promise.all([
      fetch(`/api/account?sessionId=${encodeURIComponent(sessionId)}`),
      fetch(`/api/conversation?sessionId=${encodeURIComponent(sessionId)}`),
    ])
      .then(async ([accountResponse, conversationResponse]) => {
        if (cancelled) return;
        if (accountResponse.ok) {
          const account = await accountResponse.json();
          setArchitectActive(Boolean(account.isArchitect));
        }
        if (conversationResponse.ok) {
          const data = await conversationResponse.json();
          const stored = data.messages as
            | Partial<Record<Persona, Array<Message & { created_at?: string }>>>
            | undefined;
          if (!stored) return;
          setMessagesByPersona((previous) => {
            const next = { ...previous };
            (["noura", "hayat", "companion"] as Persona[]).forEach((key) => {
              const history = stored[key] || [];
              if (!history.length) return;
              next[key] = history.map((message, index) => ({
                id: `memory-${key}-${index}-${message.created_at || index}`,
                role: message.role,
                content: message.content,
              }));
            });
            return next;
          });
        }
      })
      .catch(() => {
        // Supabase memory is optional; the local conversation remains usable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!voiceEnabled) window.speechSynthesis?.cancel?.();
  }, [voiceEnabled]);

  const speakMessage = (message: Message) => {
    if (message.role !== "assistant") return;
    if (!voiceEnabled) return;
    setSpeakingId(message.id);
    const utterance = speakArabic(message.content, activePersona);
    const clear = () => setSpeakingId((curr) => (curr === message.id ? null : curr));
    setTimeout(clear, Math.max(1200, message.content.length * 35));
    if (utterance) {
      utterance.onend = clear;
      utterance.onerror = clear;
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    const hasUserMessages = messages.some((m) => m.role === "user");
    const slot =
      hour >= 4 && hour < 8 ? "fajr" :
      hour >= 8 && hour < 12 ? "morning" :
      hour >= 12 && hour < 16 ? "dhuhr" :
      hour >= 16 && hour < 19 ? "asr" :
      hour >= 19 && hour < 22 ? "maghrib" : "night";

    if (suggestionSent[activePersona] === slot || hasUserMessages) return;

    const prompts: Record<Persona, Record<string, string>> = {
      noura: {
        fajr: "اقترب الفجر، أبدأ معك بآية واحدة اليوم ثم نربطها بمعنى عملي؟",
        morning: "صباح الخير، هل تريد خلاصة علمية قصيرة أو مراجعة آية/حديث قبل البدء؟",
        dhuhr: "توقف خفيف منتصف اليوم: هل نراجع ما تعلمته ونرتب سؤالاً واحداً مهمّاً؟",
        asr: "العصر وقت مراجعة هادئة، هل نعيد ضبط الفكرة أو الحكم الذي تبحث عنه؟",
        maghrib: "بعد المغرب، أستطيع أن ألخّص لك ما بقي من اليوم في سطرين علميين.",
        night: "قبل النوم، هل نغلق اليوم بآية، أو حديث، أو سؤال للغد؟",
      },
      hayat: {
        fajr: "🌿 الفجر بدأ، هل نأخذ نفساً هادئاً ثم نبدأ اليوم بنية واحدة؟",
        morning: "صباحك مبارك، أريد أن أكون معك خطوة بخطوة — ما أول شيء يهمك اليوم؟",
        dhuhr: "منتصف اليوم فرصة جميلة، هل تريد إعادة توازن سريعة أو أذكار قصيرة؟",
        asr: "مع العصر، تعال نخفف الإيقاع: تسبيح بسيط أم مراجعة ورد اليوم؟",
        maghrib: "المغرب وقت سكينة، هل نغلق اليوم بشكرٍ صغير؟",
        night: "قبل النوم، أستطيع أن أرافقك بدعاء قصير أو مراجعة رحلتك اليوم.",
      },
      companion: {
        fajr: "السلام عليكم، صلاة الفجر فرصة بداية جديدة؛ هل نبدأ بذكرٍ قصير ثم نرتب نية اليوم؟",
        morning: "صباح النور، كيف حال قلبك؟ أستطيع أن أذكّرك بوردك أو أرتب لك أول خطوة.",
        dhuhr: "وقت الظهر مناسب لتصحيح المسار: هل نراجع صلاةً أو ورداً أو هدفاً واحداً؟",
        asr: "العصر: تذكير لطيف، هل تريد أن نكمل الذكر أو ننتقل لمراجعة اليوم؟",
        maghrib: "بعد المغرب، لعلّها لحظة تسبيح وشكر ثم نهدئ اليوم.",
        night: "مساء الخير، هل تريد أن نختم اليوم بدعاء قصير أو نكتب ملاحظة روحية؟",
      },
    };

    const suggestion = prompts[activePersona][slot];
    if (!suggestion) return;

    const promptId = `prompt-${activePersona}-${slot}`;
    setMessages((prev) => (prev.some((m) => m.id === promptId) ? prev : [...prev, { id: promptId, role: "assistant", content: suggestion }]));
    setSuggestionSent((prev) => ({ ...prev, [activePersona]: slot }));
  }, [activePersona, messages, suggestionSent, setMessages]);

  const startListening = () => {
    if (!confirmVoiceConsent()) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("المتصفح لا يدعم التعرف على الصوت. استخدم Chrome أو Edge.");
      return;
    }

    const recognition = new SpeechRecognition() as SpeechRecognition;
    recognition.lang = "ar-SA";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      setInterimText(interim);
      if (final) {
        setInput((prev) => prev + final);
        setInterimText("");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    recognition.onerror = () => {
      setIsListening(false);
      setInterimText("");
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText("");
  };

  const handleSendMessage = async () => {
    const text = (input + interimText).trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!text || isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput("");
    setInterimText("");
    setIsLoading(true);
    stopListening();

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
          persona: activePersona,
          sessionId: getOrCreateSessionId(),
        }),
      });

      if (!response.ok) throw new Error("فشل الاتصال");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.meta) {
              setArchitectActive(Boolean(data.architectActive));
              continue;
            }
            if (data.done) break;
            if (data.error) throw new Error(data.error);
            if (data.content) {
              fullResponse += data.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: fullResponse } : m
                )
              );
            }
          } catch (e) {
            if (!(e instanceof SyntaxError)) throw e;
          }
        }
      }

    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    const cleared: Message[] = [
      { id: `clear-${Date.now()}`, role: "assistant", content: PERSONA_CONFIG[activePersona].welcome },
    ];
    setMessages(cleared);
    void fetch(
      `/api/conversation?sessionId=${encodeURIComponent(getOrCreateSessionId())}&persona=${activePersona}`,
      { method: "DELETE" },
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ direction: "rtl" }}>
      <header
        className={`border-b border-border bg-gradient-to-r ${persona.bgGradient} py-3 sticky top-0 z-50 backdrop-blur`}
      >
        <div className="container flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← رجوع
          </button>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${persona.avatarBg} flex items-center justify-center text-white text-lg`}
            >
              {persona.avatar}
            </div>
            <div className="text-right">
              <h1 className={`text-lg font-bold ${persona.textColor}`}>{persona.nameAr}</h1>
              <p className="text-xs text-muted-foreground">{persona.subtitle}</p>
            </div>
            {architectActive && (
              <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-xs text-amber-300">
                ✦ وضع المعماري
              </span>
            )}
          </div>
          <button
            onClick={clearConversation}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="مسح المحادثة"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="container pt-3">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card/70 px-4 py-3">
          <div className="text-sm text-muted-foreground" dir="rtl">
            محادثة صوتية: النص يظهر على الشاشة، ويمكنك سماع رد المساعد مباشرة.
          </div>
          <button
            onClick={() => setVoiceEnabled((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm border transition ${
              voiceEnabled ? "bg-primary text-white border-primary" : "bg-transparent text-muted-foreground border-border"
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {voiceEnabled ? "الصوت مفعل" : "الصوت متوقف"}
          </button>
        </div>
      </div>

      <div className="container py-3 flex gap-2 justify-center">
        {(["companion", "noura", "hayat"] as Persona[]).map((p) => {
          const cfg = PERSONA_CONFIG[p];
          return (
            <button
              key={p}
              onClick={() => setActivePersona(p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activePersona === p
                  ? `bg-gradient-to-r ${cfg.gradient} text-white border-transparent shadow-lg ${cfg.glow}`
                  : `bg-transparent ${cfg.textColor} ${cfg.border} hover:bg-white/5`
              }`}
            >
              {cfg.icon}
              <span>{cfg.nameAr}</span>
            </button>
          );
        })}
      </div>

      <main className="flex-1 container py-2 flex flex-col" style={{ maxHeight: "calc(100vh - 160px)" }}>
        <div className="flex-1 overflow-y-auto mb-3 space-y-4 pr-1">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              personaConfig={persona}
              onSpeak={speakMessage}
              speaking={speakingId === message.id}
              voiceEnabled={voiceEnabled}
            />
          ))}
          {isLoading && messages[messages.length - 1]?.content === "" && (
            <LoadingIndicator personaConfig={persona} />
          )}
          <div ref={messagesEndRef} />
        </div>

        {(isListening || interimText) && (
          <div
            className={`mb-2 mx-1 px-3 py-2 rounded-xl border border-dashed ${persona.border} bg-gradient-to-r ${persona.bgGradient}`}
            dir="rtl"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`flex gap-0.5 ${persona.textColor}`}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-0.5 rounded-full bg-current animate-pulse`}
                    style={{
                      height: `${8 + Math.sin((Date.now() / 200 + i) * 2) * 4}px`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </div>
              <span className={`text-xs ${persona.textColor} opacity-70`}>
                {isListening ? "جاري الاستماع..." : ""}
              </span>
            </div>
            {interimText && (
              <p className="text-sm text-muted-foreground italic">{interimText}</p>
            )}
          </div>
        )}

        <Card className="p-3">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`اكتب لـ${persona.nameAr}...`}
              className="flex-1 text-right bg-transparent resize-none outline-none text-sm leading-relaxed min-h-[36px] max-h-[120px]"
              dir="rtl"
              disabled={isLoading}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={1}
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <div className="flex gap-1.5 flex-shrink-0">
              <Button
                variant="outline"
                size="icon"
                className={`w-9 h-9 rounded-full ${isListening ? "bg-red-500/10 border-red-500/30 text-red-400" : `${persona.border} ${persona.textColor}`}`}
                onClick={isListening ? stopListening : startListening}
                title={isListening ? "إيقاف الاستماع" : "تحدث بصوتك"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                id="send-btn"
                onClick={handleSendMessage}
                disabled={(!input.trim() && !interimText.trim()) || isLoading}
                size="icon"
                className={`w-9 h-9 rounded-full bg-gradient-to-br ${persona.gradient} border-none text-white`}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

function ChatMessage({
  message,
  personaConfig,
  onSpeak,
  speaking,
  voiceEnabled,
}: {
  message: Message;
  personaConfig: (typeof PERSONA_CONFIG)[Persona];
  onSpeak: (message: Message) => void;
  speaking: boolean;
  voiceEnabled: boolean;
}) {
  const isUser = message.role === "user";
  if (!message.content && !isUser) return null;

  return (
    <div className={`flex ${isUser ? "flex-row" : "flex-row-reverse"} gap-3`} dir="rtl">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
          isUser
            ? "bg-slate-700 text-slate-300"
            : `bg-gradient-to-br ${personaConfig.avatarBg} text-white`
        }`}
      >
        {isUser ? "أنت" : personaConfig.avatar}
      </div>
      <div
        className={`max-w-[78%] rounded-2xl p-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-tr-sm"
            : `bg-gradient-to-br ${personaConfig.bgGradient} border ${personaConfig.border} text-foreground rounded-tl-sm`
        }`}
        dir="rtl"
      >
        {!isUser && (
          <button
            onClick={() => onSpeak(message)}
            className={`mb-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
              speaking ? "bg-primary text-white border-primary" : "bg-white/70 text-muted-foreground border-border"
            }`}
            disabled={!voiceEnabled}
          >
            {speaking ? "يتكلم الآن" : "استمع"}
          </button>
        )}
        {message.content || (
          <span className="text-muted-foreground italic">جاري التفكير...</span>
        )}
      </div>
    </div>
  );
}

function LoadingIndicator({ personaConfig }: { personaConfig: (typeof PERSONA_CONFIG)[Persona] }) {
  return (
    <div className="flex flex-row-reverse gap-3" dir="rtl">
      <div
        className={`w-9 h-9 rounded-full bg-gradient-to-br ${personaConfig.avatarBg} flex items-center justify-center text-white flex-shrink-0`}
      >
        {personaConfig.avatar}
      </div>
      <div
        className={`flex items-center gap-2 bg-gradient-to-br ${personaConfig.bgGradient} border ${personaConfig.border} rounded-2xl rounded-tl-sm px-4 py-3`}
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${personaConfig.textColor} bg-current animate-bounce`}
              style={{ animationDelay: `${i * 150}ms`, opacity: 0.7 }}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {personaConfig.nameAr} تفكر...
        </span>
      </div>
    </div>
  );
}
