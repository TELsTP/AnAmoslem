import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Heart, Sparkles } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "companion";
  content: string;
  timestamp: Date;
}

export default function CompanionPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "companion",
      content:
        "السلام عليكم ورحمة الله وبركاته 🌙\n\nأنا رفيقك في هذه الرحلة المباركة. أنا هنا لأساعدك على فهم القرآن الكريم وتطبيق سنة النبي ﷺ في حياتك اليومية.\n\nكيف حالك اليوم؟ هل تريد أن نتحدث عن آية معينة أو موضوع يشغل بالك؟",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (in real app, this would call the backend)
    setTimeout(() => {
      const companionMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "companion",
        content: generateCompanionResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, companionMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const generateCompanionResponse = (userInput: string): string => {
    const responses: { [key: string]: string } = {
      السلام: "وعليكم السلام ورحمة الله وبركاته 🌙\n\nكيف حالك؟ أتمنى أن تكون بخير.",
      قرآن:
        "القرآن الكريم هو كلام الله العظيم. كل آية فيه تحمل حكمة وهداية.\n\nهل تريد أن نتدبر آية معينة معاً؟",
      حفظ:
        "الحفظ عمل عظيم يقربك من كتاب الله. ابدأ بالقليل والمداومة أهم من الكثرة.\n\nكم آية تريد أن تحفظ اليوم؟",
      دعاء:
        "الدعاء هو مخ العبادة. لا تتردد في الدعاء فالله يسمع ويستجيب.\n\nما الذي تريد أن تدعو الله به؟",
      default:
        "شكراً على سؤالك. هذا موضوع مهم جداً.\n\nدعني أساعدك في فهمه بشكل أفضل. هل تريد أن نبدأ من الأساسيات؟",
    };

    for (const [key, response] of Object.entries(responses)) {
      if (userInput.includes(key)) {
        return response;
      }
    }

    return responses.default;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-gradient-to-r from-pink-500/10 to-rose-600/10 py-6">
        <div className="container">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-xl">
              💝
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">رفيقك الروحي</h1>
              <p className="text-muted-foreground">
                دليلك نحو حياة إسلامية قويمة
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 container py-6 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <Card className="p-4">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder="اكتب سؤالك أو فكرتك..."
              className="flex-1"
              dir="rtl"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              إرسال
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === "user";

  return (
    <div className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} gap-3`}>
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-blue-500/20 text-blue-600"
            : "bg-gradient-to-br from-pink-500 to-rose-600 text-white"
        }`}
      >
        {isUser ? "أنت" : "💝"}
      </div>

      {/* Message Content */}
      <div
        className={`max-w-md ${
          isUser ? "text-left" : "text-right"
        } flex flex-col gap-1`}
      >
        <div
          className={`rounded-lg p-4 ${
            isUser
              ? "bg-blue-500/10 border border-blue-500/20 text-foreground"
              : "bg-gradient-to-br from-pink-500/10 to-rose-600/10 border border-pink-500/20 text-foreground"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString("ar-SA", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white flex-shrink-0">
        💝
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
        </div>
        <span className="text-sm text-muted-foreground">جاري التفكير...</span>
      </div>
    </div>
  );
}
