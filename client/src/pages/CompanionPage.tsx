import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useLocation } from "wouter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function CompanionPage() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "السلام عليكم ورحمة الله وبركاته 🌙\n\nأنا رفيقك الروحي. أنا هنا لأساعدك على فهم القرآن الكريم وتطبيق سنة النبي ﷺ في حياتك اليومية.\n\nكيف حالك اليوم؟ هل تريد أن نتحدث عن آية معينة أو موضوع يشغل بالك؟",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      const decoded = decodeURIComponent(q);
      setInput(decoded);
      setTimeout(() => {
        const btn = document.getElementById("send-btn");
        if (btn) btn.click();
      }, 300);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("فشل الاتصال بالمساعد");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + data.content }
                    : m
                )
              );
            }
          } catch (e) {
            if (!(e instanceof SyntaxError)) throw e;
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-gradient-to-r from-pink-500/10 to-rose-600/10 py-4 sticky top-0 z-50 backdrop-blur">
        <div className="container flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← رجوع
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-lg">
              💝
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold text-primary">رفيقك الروحي</h1>
              <p className="text-xs text-muted-foreground">
                مدعوم بالذكاء الاصطناعي
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 flex flex-col max-h-[calc(100vh-73px)]">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading &&
            messages[messages.length - 1]?.content === "" && (
              <LoadingIndicator />
            )}
          <div ref={messagesEndRef} />
        </div>

        <Card className="p-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="اكتب سؤالك أو فكرتك..."
              className="flex-1 text-right"
              dir="rtl"
              disabled={isLoading}
            />
            <Button
              id="send-btn"
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  if (!message.content && !isUser) return null;

  return (
    <div className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} gap-3`}>
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
          isUser
            ? "bg-blue-500/20 text-blue-600"
            : "bg-gradient-to-br from-pink-500 to-rose-600 text-white"
        }`}
      >
        {isUser ? "أنت" : "💝"}
      </div>

      <div
        className={`max-w-[75%] rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-blue-500/10 border border-blue-500/20 text-foreground"
            : "bg-gradient-to-br from-pink-500/10 to-rose-600/10 border border-pink-500/20 text-foreground"
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

function LoadingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white flex-shrink-0">
        💝
      </div>
      <div className="flex items-center gap-2 bg-gradient-to-br from-pink-500/10 to-rose-600/10 border border-pink-500/20 rounded-lg px-4 py-3">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:150ms]" />
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:300ms]" />
        </div>
        <span className="text-sm text-muted-foreground">جاري التفكير...</span>
      </div>
    </div>
  );
}
