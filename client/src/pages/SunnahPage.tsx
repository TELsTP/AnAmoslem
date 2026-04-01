import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Search, Star, BookOpen, MessageCircle, Heart, ChevronDown, ChevronUp } from "lucide-react";

interface Hadith {
  id: number;
  arabic: string;
  narrator: string;
  source: string;
  topic: string;
  topicLabel: string;
  grade?: string;
}

interface Topic {
  key: string;
  label: string;
  icon: string;
}

const GRADE_COLORS: Record<string, string> = {
  "متفق عليه": "bg-green-100 text-green-700 border-green-200",
  "صحيح":      "bg-blue-100 text-blue-700 border-blue-200",
  "حسن":       "bg-amber-100 text-amber-700 border-amber-200",
  "ضعيف":      "bg-red-100 text-red-700 border-red-200",
};

function HadithCard({ hadith, expanded, onToggle, onAskCompanion }: {
  hadith: Hadith;
  expanded?: boolean;
  onToggle?: () => void;
  onAskCompanion?: (h: Hadith) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden transition-all">
      <div
        className="p-5 cursor-pointer select-none"
        onClick={onToggle}
        dir="rtl"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {hadith.topicLabel}
            </span>
            {hadith.grade && (
              <span className={`text-xs px-2 py-0.5 rounded-full border ${GRADE_COLORS[hadith.grade] ?? "bg-muted text-muted-foreground border-border"}`}>
                {hadith.grade}
              </span>
            )}
          </div>
          {onToggle && (
            expanded
              ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>

        <p
          className="text-foreground leading-relaxed mb-3"
          style={{ fontFamily: "'Amiri', serif", fontSize: "1.2rem", lineHeight: "2.2" }}
        >
          «{hadith.arabic}»
        </p>

        <div className="flex items-center justify-between gap-2 mt-3">
          <div className="text-xs text-muted-foreground text-left">{hadith.source}</div>
          <div className="text-sm font-medium text-muted-foreground">رواه: {hadith.narrator}</div>
        </div>
      </div>

      {expanded && onAskCompanion && (
        <div className="border-t border-border px-5 py-3 bg-muted/30 flex justify-end">
          <button
            onClick={() => onAskCompanion(hadith)}
            className="flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>اسأل رفيقي الروحي عن هذا الحديث</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function SunnahPage() {
  const [, navigate] = useLocation();
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/hadith/all").then(r => r.json()),
      fetch("/api/hadith/topics").then(r => r.json()),
      fetch("/api/hadith/daily").then(r => r.json()),
    ]).then(([allData, topicsData, dailyData]) => {
      setHadiths(allData.hadiths ?? []);
      setTopics(topicsData.topics ?? []);
      setDailyHadith(dailyData.hadith ?? null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredHadiths = hadiths.filter(h => {
    const topicMatch = selectedTopic === "all" || h.topic === selectedTopic;
    const searchMatch = !searchQuery.trim() ||
      h.arabic.includes(searchQuery) ||
      h.narrator.includes(searchQuery) ||
      h.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.topicLabel.includes(searchQuery);
    return topicMatch && searchMatch;
  });

  const handleAskCompanion = (hadith: Hadith) => {
    const msg = encodeURIComponent(`اشرح لي هذا الحديث وبيّن فقهه وتطبيقه في حياتنا: «${hadith.arabic}» — ${hadith.source}`);
    navigate(`/companion?q=${msg}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🌙</div>
          <p className="text-muted-foreground">جاري تحميل السنة النبوية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 to-background" dir="rtl">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-4 max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>رجوع</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary">سنة رسولي</h1>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white text-lg">
              🌙
            </div>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {dailyHadith && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold">حديث اليوم</h2>
            </div>
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg">
              <p
                className="leading-relaxed mb-4"
                style={{ fontFamily: "'Amiri', serif", fontSize: "1.25rem", lineHeight: "2.3" }}
              >
                «{dailyHadith.arabic}»
              </p>
              <div className="flex items-center justify-between text-rose-100 text-sm">
                <span className="text-left">{dailyHadith.source}</span>
                <span>رواه: {dailyHadith.narrator}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-rose-400/50 flex justify-start">
                <button
                  onClick={() => handleAskCompanion(dailyHadith)}
                  className="flex items-center gap-2 text-sm bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>اسأل رفيقي عن هذا الحديث</span>
                </button>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث في الأحاديث..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-border rounded-xl py-2.5 pr-9 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 shadow-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 flex-row-reverse">
            <button
              onClick={() => setSelectedTopic("all")}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border
                ${selectedTopic === "all"
                  ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                  : "bg-white text-muted-foreground border-border hover:border-rose-300"}`}
            >
              الكل ({hadiths.length})
            </button>
            {topics.map(t => {
              const count = hadiths.filter(h => h.topic === t.key).length;
              return (
                <button
                  key={t.key}
                  onClick={() => setSelectedTopic(t.key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border
                    ${selectedTopic === t.key
                      ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                      : "bg-white text-muted-foreground border-border hover:border-rose-300"}`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                  <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{filteredHadiths.length} حديث</span>
            <h2 className="text-lg font-bold">
              {selectedTopic === "all"
                ? "جميع الأحاديث"
                : topics.find(t => t.key === selectedTopic)?.label ?? "الأحاديث"}
            </h2>
          </div>

          {filteredHadiths.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>لا توجد أحاديث مطابقة للبحث</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHadiths.map(hadith => (
                <HadithCard
                  key={hadith.id}
                  hadith={hadith}
                  expanded={expandedId === hadith.id}
                  onToggle={() => setExpandedId(expandedId === hadith.id ? null : hadith.id)}
                  onAskCompanion={handleAskCompanion}
                />
              ))}
            </div>
          )}
        </section>

        <div className="pb-8" />
      </main>
    </div>
  );
}
