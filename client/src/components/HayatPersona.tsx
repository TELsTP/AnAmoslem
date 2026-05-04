import { useState, useEffect, useRef } from "react";
import { Send, X, Mic, MicOff, Sparkles, Volume2, VolumeX } from "lucide-react";
import { getOrCreateSessionId, isArchitectSession, detectHandshake, activateArchitectMode } from "../lib/session";
import { saveMessage, loadConversation } from "../lib/supabase";
import type { ConversationMessage } from "../lib/supabase";

interface MiniMessage {
  role: "user" | "assistant";
  content: string;
}

export default function HayatPersona() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<MiniMessage[]>([
    {
      role: "assistant",
      content: "مرحباً! أنا حياة 🌿 رفيقتك الروحية. كيف حالك اليوم؟",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [isArchitect, setIsArchitect] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [position, setPosition] = useState({ bottom: 24, right: 24 });
  const [promptSentAt, setPromptSentAt] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const sessionId = getOrCreateSessionId();
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsArchitect(isArchitectSession());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!voiceEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [voiceEnabled]);

  useEffect(() => {
    if (!isOpen || messages.length > 1) return;
    const hour = new Date().getHours();
    const slot =
      hour < 6 ? "fajr" :
      hour < 12 ? "morning" :
      hour < 16 ? "dhuhr" :
      hour < 19 ? "asr" :
      hour < 22 ? "maghrib" : "night";
    if (promptSentAt === slot) return;
    const prompts = {
      fajr: "🌿 الفجر نادانا… هل نبدأ بذكرٍ قصير ثم نرتّب نية اليوم؟",
      morning: "صباح الخير، أنا هنا معك. هل تريد أن أذكّرك بوردك أو نبدأ بخطوة واحدة؟",
      dhuhr: "منتصف اليوم، هل تحب أن نأخذ نفساً هادئاً ثم نرجع للمسار؟",
      asr: "العصر وقت توازن. أستطيع أن أرافقك بتسبيح قصير أو مراجعة صغيرة.",
      maghrib: "المغرب وقت سكينة، هل نختم اليوم بشكرٍ ودعاء قصير؟",
      night: "قبل النوم، هل تريد أن نغلق اليوم بآية أو دعاء؟",
    } as const;
    setMessages((prev) => [...prev, { role: "assistant", content: prompts[slot] }]);
    setPromptSentAt(slot);
  }, [isOpen, messages.length, promptSentAt]);

  useEffect(() => {
    if (isOpen && messages.length === 1) {
      loadConversation(sessionId, "hayat", 20).then((saved) => {
        if (saved.length > 0) {
          setMessages(saved.map((m) => ({ role: m.role, content: m.content })));
        }
      });
    }
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
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

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const speakText = (text: string) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.rate = 1.02;
    utterance.pitch = 1.04;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText("");
  };

  const sendMessage = async () => {
    const text = (input + interimText).trim();
    if (!text || isLoading) return;

    if (detectHandshake(text)) {
      activateArchitectMode();
      setIsArchitect(true);
    }

    const userMsg: MiniMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setInterimText("");
    setIsLoading(true);
    stopListening();

    await saveMessage({
      session_id: sessionId,
      persona: "hayat",
      role: "user",
      content: text,
      is_architect_context: isArchitect,
    } as ConversationMessage);

    const assistantPlaceholder: MiniMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantPlaceholder]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          persona: "hayat",
          isArchitect,
        }),
      });

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
            if (data.content) {
              fullResponse += data.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: fullResponse };
                return updated;
              });
            }
          } catch {}
        }
      }

      if (fullResponse) {
        await saveMessage({
          session_id: sessionId,
          persona: "hayat",
          role: "assistant",
          content: fullResponse,
          is_architect_context: isArchitect,
        } as ConversationMessage);
      }
    } catch (e) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "عذراً، حدث خطأ. حاولي مرة أخرى 🌿" };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".hayat-chat-area")) return;
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - (window.innerWidth - position.right - 60),
      y: e.clientY - (window.innerHeight - position.bottom - 60),
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newRight = window.innerWidth - e.clientX + dragOffset.current.x - 60;
      const newBottom = window.innerHeight - e.clientY + dragOffset.current.y - 60;
      setPosition({
        right: Math.max(8, Math.min(newRight, window.innerWidth - 80)),
        bottom: Math.max(8, Math.min(newBottom, window.innerHeight - 80)),
      });
    };
    const handleMouseUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [position]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: position.bottom,
        right: position.right,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 12,
        userSelect: "none",
      }}
    >
      {isOpen && !isMinimized && (
        <div
          className="hayat-chat-area"
          style={{
            width: 320,
            maxHeight: 460,
            background: "linear-gradient(135deg, #0f1e15 0%, #0d1a12 100%)",
            border: "1px solid rgba(134,239,172,0.25)",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(134,239,172,0.08)",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              background: "linear-gradient(90deg, rgba(134,239,172,0.12) 0%, rgba(74,222,128,0.08) 100%)",
              borderBottom: "1px solid rgba(134,239,172,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4ade80, #16a34a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                🌿
              </div>
              <div>
                <div style={{ color: "#4ade80", fontWeight: 700, fontSize: 14, direction: "rtl" }}>
                  حياة {isArchitect && <span style={{ color: "#fbbf24", fontSize: 10 }}>✦ مهندس</span>}
                </div>
                <div style={{ color: "rgba(134,239,172,0.5)", fontSize: 10 }}>المرافقة الروحية</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setVoiceEnabled((v) => !v)}
                style={{ background: "none", border: "none", color: "rgba(134,239,172,0.7)", cursor: "pointer" }}
                title={voiceEnabled ? "إيقاف الصوت" : "تشغيل الصوت"}
              >
                {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                style={{ background: "none", border: "none", color: "rgba(134,239,172,0.5)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}
              >
                −
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: "none", border: "none", color: "rgba(134,239,172,0.5)", cursor: "pointer" }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 12px 0",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 280,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-start" : "flex-end",
                  direction: "rtl",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "8px 12px",
                    borderRadius: msg.role === "user" ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                    background: msg.role === "user"
                      ? "rgba(74,222,128,0.12)"
                      : "rgba(134,239,172,0.07)",
                    border: msg.role === "user"
                      ? "1px solid rgba(74,222,128,0.2)"
                      : "1px solid rgba(134,239,172,0.12)",
                    color: msg.role === "user" ? "#86efac" : "rgba(255,255,255,0.85)",
                    fontSize: 12,
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    direction: "rtl",
                    textAlign: "right",
                  }}
                >
                  {!msg.role && null}
                  {msg.content || (
                    <span style={{ color: "rgba(134,239,172,0.4)", fontStyle: "italic" }}>
                      تفكر...
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {(interimText || isListening) && (
            <div
              style={{
                margin: "6px 12px 0",
                padding: "6px 10px",
                borderRadius: 8,
                background: "rgba(74,222,128,0.06)",
                border: "1px dashed rgba(74,222,128,0.2)",
                color: "rgba(134,239,172,0.5)",
                fontSize: 11,
                direction: "rtl",
                fontStyle: "italic",
              }}
            >
              {interimText || "🎙️ جاري الاستماع..."}
            </div>
          )}

          {messages[messages.length - 1]?.role === "assistant" && (
            <div
              style={{
                margin: "0 12px 8px",
                padding: "8px 10px",
                borderRadius: 10,
                background: "rgba(74,222,128,0.06)",
                border: "1px solid rgba(74,222,128,0.12)",
                color: "#d1fae5",
                fontSize: 11,
                direction: "rtl",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span>الرد ظاهر هنا ومتاح قراءته صوتياً.</span>
              <button
                onClick={() => speakText(messages[messages.length - 1].content)}
                disabled={!voiceEnabled || speaking}
                style={{
                  border: "none",
                  borderRadius: 999,
                  padding: "4px 10px",
                  background: speaking ? "rgba(74,222,128,0.25)" : "rgba(74,222,128,0.12)",
                  color: "#4ade80",
                  cursor: "pointer",
                  fontSize: 11,
                }}
              >
                {speaking ? "يتكلم الآن" : "استمع"}
              </button>
            </div>
          )}

          <div
            style={{
              padding: 10,
              borderTop: "1px solid rgba(134,239,172,0.1)",
              display: "flex",
              gap: 6,
              alignItems: "center",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="اكتبي لحياة..."
              dir="rtl"
              disabled={isLoading}
              style={{
                flex: 1,
                background: "rgba(134,239,172,0.07)",
                border: "1px solid rgba(134,239,172,0.15)",
                borderRadius: 10,
                padding: "6px 10px",
                color: "#e2e8f0",
                fontSize: 12,
                outline: "none",
                direction: "rtl",
              }}
            />
            <button
              onClick={isListening ? stopListening : startListening}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: isListening ? "rgba(239,68,68,0.2)" : "rgba(74,222,128,0.12)",
                border: `1px solid ${isListening ? "rgba(239,68,68,0.3)" : "rgba(74,222,128,0.2)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: isListening ? "#f87171" : "#4ade80",
                flexShrink: 0,
              }}
            >
              {isListening ? <MicOff size={12} /> : <Mic size={12} />}
            </button>
            <button
              onClick={sendMessage}
              disabled={(!input.trim() && !interimText.trim()) || isLoading}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4ade80, #16a34a)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#fff",
                flexShrink: 0,
                opacity: (!input.trim() && !interimText.trim()) || isLoading ? 0.5 : 1,
              }}
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      )}

      {isOpen && isMinimized && (
        <div
          onClick={() => setIsMinimized(false)}
          style={{
            padding: "6px 14px",
            background: "rgba(15,30,21,0.95)",
            border: "1px solid rgba(74,222,128,0.3)",
            borderRadius: 20,
            color: "#4ade80",
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            direction: "rtl",
          }}
        >
          <Sparkles size={12} />
          حياة — انقري للفتح
        </div>
      )}

      <button
        onClick={() => {
          setIsOpen((o) => !o);
          setIsMinimized(false);
        }}
        onMouseDown={handleMouseDown}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: isOpen
            ? "linear-gradient(135deg, #16a34a, #4ade80)"
            : "linear-gradient(135deg, #4ade80, #86efac)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 24,
          boxShadow: pulse
            ? "0 0 0 12px rgba(74,222,128,0.12), 0 0 0 24px rgba(74,222,128,0.05), 0 8px 32px rgba(0,0,0,0.4)"
            : "0 0 0 4px rgba(74,222,128,0.2), 0 8px 32px rgba(0,0,0,0.4)",
          transition: "box-shadow 1.5s ease, transform 0.2s ease",
          transform: isOpen ? "scale(0.9)" : "scale(1)",
          position: "relative",
        }}
        title="حياة — المرافقة الروحية"
      >
        🌿
        {isArchitect && (
          <span
            style={{
              position: "absolute",
              top: -2,
              left: -2,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#fbbf24",
              border: "2px solid #0f1e15",
              fontSize: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#000",
              fontWeight: 700,
            }}
          >
            ✦
          </span>
        )}
      </button>
    </div>
  );
}
