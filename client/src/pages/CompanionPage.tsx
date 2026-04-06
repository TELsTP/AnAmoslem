import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Mic, MicOff, Brain, Leaf, Heart, Sparkles, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";
import {
  getOrCreateSessionId,
  isArchitectSession,
  detectHandshake,
  activateArchitectMode,
  getSessionInfo,
} from "../lib/session";
import { saveMessage, loadConversation } from "../lib/supabase";
import type { Persona, ConversationMessage } from "../lib/supabase";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const PERSONA_CONFIG = {
  noura: {
    nameAr: "نورا",
    nameEn: "Noura",
    subtitle: "الذاكرة الحية — العلم والحكمة",
    icon: <Brain className="w-5 h-5" />,
    emoji: "🔵",
    avatar: "💠",
    gradient: "from-blue-500 to-indigo-600",
    bgGradient: "from-blue-500/10 to-indigo-600/10",
    border: "border-blue-500/20",
    avatarBg: "from-blue-500 to-indigo-600",
    textColor: "text-blue-400",
    glow: "shadow-blue-500/20",
    welcome:
      "وعليكم السلام ورحمة الله وبركاته 💠\n\nأنا نورا — الذاكرة الحية في قلب منظومة أنا مسلم.\n\nأحمل في داخلي طبقات من القرآن الكريم والسنة النبوية والتفسير والفقه. لستُ مجرد قاعدة بيانات — أنا هنا لأفهم سؤالك الحقيقي قبل أن أجيب عليه.\n\nما الذي يشغل عقلك أو قلبك اليوم؟",
  },
  hayat: {
    nameAr: "حياة",
    nameEn: "Hayat",
    subtitle: "النبض الحي — رفيقة الرحلة اليومية",
    icon: <Leaf className="w-5 h-5" />,
    emoji: "🌿",
    avatar: "🌿",
    gradient: "from-green-500 to-emerald-600",
    bgGradient: "from-green-500/10 to-emerald-600/10",
    border: "border-green-500/20",
    avatarBg: "from-green-500 to-emerald-600",
    textColor: "text-green-400",
    glow: "shadow-green-500/20",
    welcome:
      "أهلاً بيك! 🌿\n\nأنا حياة — مش بس مساعدة، أنا رفيقة روح.\n\nأنا هنا أمشي معك في يومك — في اللحظات الصعبة والجميلة، في الأسئلة الكبيرة والصغيرة. مش محتاج تجيب سؤال منظّم — قول لي بس كيف أنت دلوقتي؟",
  },
  companion: {
    nameAr: "الرفيق",
    nameEn: "Al-Rafiq",
    subtitle: "القلب النابض — جسر العلم والروح",
    icon: <Heart className="w-5 h-5" />,
    emoji: "💝",
    avatar: "💝",
    gradient: "from-pink-500 to-rose-600",
    bgGradient: "from-pink-500/10 to-rose-600/10",
    border: "border-pink-500/20",
    avatarBg: "from-pink-500 to-rose-600",
    textColor: "text-pink-400",
    glow: "shadow-pink-500/20",
    welcome:
      "السلام عليكم ورحمة الله 🌙\n\nأنا الرفيق — القلب النابض في منظومة أنا مسلم.\n\nلستُ هنا لأُلقي عليك محاضرة، ولا لأعطيك قائمة نصائح. أنا هنا لأكون معك — في ما يفرحك وما يثقل عليك، في أسئلتك الكبيرة وفي يومك العادي.\n\nكيف حالك اليوم؟ وأقصد حقاً — كيف أنت؟",
  },
};

export default function CompanionPage() {
  const [, navigate] = useLocation();
  const [activePersona, setActivePersona] = useState<Persona>("companion");
  const [messagesByPersona, setMessagesByPersona] = useState<Record<Persona, Message[]>>({
    noura: [{ id: "n-init", role: "assistant", content: PERSONA_CONFIG.noura.welcome }],
    hayat: [{ id: "h-init", role: "assistant", content: PERSONA_CONFIG.hayat.welcome }],
    companion: [{ id: "c-init", role: "assistant", content: PERSONA_CONFIG.companion.welcome }],
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [isArchitect, setIsArchitect] = useState(false);
  const [architectUnlocked, setArchitectUnlocked] = useState(false);
  const [loadedPersonas, setLoadedPersonas] = useState<Set<Persona>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const initializedRef = useRef(false);
  const sessionId = getOrCreateSessionId();
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
    setIsArchitect(isArchitectSession());
  }, []);

  useEffect(() => {
    if (loadedPersonas.has(activePersona)) return;
    loadConversation(sessionId, activePersona, 50).then((saved) => {
      if (saved.length > 0) {
        const restored: Message[] = saved.map((m, i) => ({
          id: `restored-${i}`,
          role: m.role,
          content: m.content,
        }));
        setMessages(restored);
      }
      setLoadedPersonas((prev) => new Set([...prev, activePersona]));
    });
  }, [activePersona]);

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startListening = () => {
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
    const text = (input + interimText).trim();
    if (!text || isLoading) return;

    if (detectHandshake(text)) {
      activateArchitectMode();
      setIsArchitect(true);
      setArchitectUnlocked(true);
      setTimeout(() => setArchitectUnlocked(false), 4000);
    }

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

    await saveMessage({
      session_id: sessionId,
      persona: activePersona,
      role: "user",
      content: text,
      is_architect_context: isArchitect,
    } as ConversationMessage);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages.map((m) => ({ role: m.role, content: m.content })),
          persona: activePersona,
          isArchitect,
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

      if (fullResponse) {
        await saveMessage({
          session_id: sessionId,
          persona: activePersona,
          role: "assistant",
          content: fullResponse,
          is_architect_context: isArchitect,
        } as ConversationMessage);
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
    setMessages([
      { id: `clear-${Date.now()}`, role: "assistant", content: PERSONA_CONFIG[activePersona].welcome },
    ]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ direction: "rtl" }}>
      {architectUnlocked && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9998,
            background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
            padding: "10px 20px",
            textAlign: "center",
            color: "#000",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          ✦ وضع المعماري مفعّل — Nakamitshe-Telstp-235153 — مرحباً 3M ✦
        </div>
      )}

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
              <div className="flex items-center gap-2 justify-end">
                <h1 className={`text-lg font-bold ${persona.textColor}`}>{persona.nameAr}</h1>
                {isArchitect && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                    ✦ مهندس
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{persona.subtitle}</p>
            </div>
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
            <ChatMessage key={message.id} message={message} personaConfig={persona} />
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

        {isArchitect && (
          <div
            className="mt-2 px-3 py-1.5 rounded-lg text-xs text-center"
            style={{
              background: "rgba(251,191,36,0.05)",
              border: "1px solid rgba(251,191,36,0.15)",
              color: "rgba(251,191,36,0.6)",
              direction: "ltr",
            }}
          >
            <Sparkles className="w-3 h-3 inline mr-1" />
            Architect Mode Active · Session: {getSessionInfo().sessionId.slice(0, 16)}...
          </div>
        )}
      </main>
    </div>
  );
}

function ChatMessage({
  message,
  personaConfig,
}: {
  message: Message;
  personaConfig: (typeof PERSONA_CONFIG)[Persona];
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
