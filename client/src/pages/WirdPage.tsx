import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Mic, MicOff, X, ChevronRight, ChevronLeft, CheckCircle, Eye, EyeOff, RotateCcw, Trophy } from "lucide-react";

interface Verse {
  number: number;
  text: string;
}
interface Surah {
  number: number;
  name: string;
  englishName: string;
  totalVerses: number;
  verses: Verse[];
}

interface EvaluationResult {
  status: "perfect" | "needs_improvement" | "unavailable";
  accuracy_score: number;
  detailed_errors: Array<{ word_index: number; expected: string; provided: string; type: "shakl" | "word" }>;
  teacher_note: string;
}

function toArabicNumeral(n: number) {
  return String(n).split("").map((c) => ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"][parseInt(c)] ?? c).join("");
}

const TASHKEEL_RE = /[\u064B-\u065F\u0670\u0610-\u061A\u06D6-\u06ED]/;

function GoldenVerseText({ text, dimmed = false }: { text: string; dimmed?: boolean }) {
  return (
    <span dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
      {[...text].map((char, i) =>
        TASHKEEL_RE.test(char) ? (
          <span key={i} style={{ color: dimmed ? '#c9a84c' : '#B5891A', opacity: dimmed ? 0.5 : 1 }}>{char}</span>
        ) : (
          <span key={i} style={{ color: dimmed ? '#9ca3af' : '#1a1a1a' }}>{char}</span>
        )
      )}
    </span>
  );
}

export default function WirdPage() {
  const [, navigate] = useLocation();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurahIdx, setSelectedSurahIdx] = useState(0);
  const [startAyah, setStartAyah] = useState(1);
  const [endAyah, setEndAyah] = useState(7);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionVerses, setSessionVerses] = useState<Verse[]>([]);
  const [currentVerseIdx, setCurrentVerseIdx] = useState(0);
  const [completedVerses, setCompletedVerses] = useState<number[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    fetch("/data/quran.json")
      .then((r) => r.json())
      .then((d) => {
        setSurahs(d.surahs || []);
      })
      .catch(() => {});
  }, []);

  const selectedSurah = surahs[selectedSurahIdx];
  const maxVerses = selectedSurah?.totalVerses || 1;

  useEffect(() => {
    if (selectedSurah) {
      setStartAyah(1);
      setEndAyah(Math.min(7, selectedSurah.totalVerses));
    }
  }, [selectedSurahIdx, selectedSurah]);

  const startSession = () => {
    if (!selectedSurah) return;
    const verses = selectedSurah.verses.filter(
      (v) => v.number >= startAyah && v.number <= endAyah
    );
    if (!verses.length) return;
    setSessionVerses(verses);
    setCurrentVerseIdx(0);
    setCompletedVerses([]);
    setFinalText("");
    setInterimText("");
    setResult(null);
    setShowOriginal(false);
    setSessionComplete(false);
    setSessionActive(true);
  };

  const stopSession = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setSessionActive(false);
    setInterimText("");
  }, []);

  const startListening = () => {
    if (!window.confirm("سيطلب المتصفح إذن الميكروفون لهذه الجلسة فقط. يمكنك المتابعة أو الإلغاء.")) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("المتصفح لا يدعم التعرف على الصوت. استخدم Chrome."); return; }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    const rec = new SR() as SpeechRecognition;
    rec.lang = "ar-SA";
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = finalText;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += (final ? " " : "") + t;
        else interim += t;
      }
      setFinalText(final);
      setInterimText(interim);
    };
    rec.onend = () => {
      if (isListening) {
        try {
          rec.start();
          return;
        } catch {
        }
      }
      setIsListening(false);
      setInterimText("");
    };
    rec.onerror = () => {
      setIsListening(false);
      setInterimText("");
    };
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  };

  const stopListening = () => {
    const rec = recognitionRef.current;
    if (rec) {
      rec.onend = null;
      rec.onerror = null;
      try {
        rec.stop();
      } catch {
        rec.abort();
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText("");
  };

  const checkRecitation = async () => {
    const userText = (finalText + " " + interimText).trim();
    if (!userText) return;
    stopListening();
    setResult({
      status: "unavailable",
      accuracy_score: 0,
      detailed_errors: [],
      teacher_note: "التقييم الذكي للتلاوة غير متاح حالياً. يمكنك متابعة التدريب المحلي أو الانتقال إلى الآية التالية.",
    });
  };

  const nextVerse = () => {
    setCompletedVerses((prev) => [...prev, currentVerseIdx]);
    const next = currentVerseIdx + 1;
    if (next >= sessionVerses.length) {
      setSessionComplete(true);
    } else {
      setCurrentVerseIdx(next);
      setFinalText("");
      setInterimText("");
      setResult(null);
      setShowOriginal(false);
    }
  };

  const resetVerse = () => {
    setFinalText("");
    setInterimText("");
    setResult(null);
    setShowOriginal(false);
  };

  const currentVerse = sessionVerses[currentVerseIdx];

  const renderColoredText = () => {
    if (!result || !currentVerse) return null;
    const words = currentVerse.text.split(" ");
    const errorMap = new Map((result.detailed_errors ?? []).map((e) => [e.word_index, e]));
    return (
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 leading-loose" dir="rtl" style={{ fontSize: '1.8rem' }}>
        {words.map((word, i) => {
          const err = errorMap.get(i);
          if (err) {
            return (
              <span key={i} className="relative group cursor-help inline-flex items-baseline gap-1">
                <span style={{ color: '#dc2626', textDecoration: 'line-through', fontFamily: "'Amiri', serif" }}>{err.provided}</span>
                <span style={{ color: '#B5891A', fontFamily: "'Amiri', serif" }}>({word})</span>
                <span className="absolute -top-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                  {err.type === "shakl" ? "خطأ تشكيل" : "خطأ كلمة"}
                </span>
              </span>
            );
          }
          return <GoldenVerseText key={i} text={word} />;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b border-border bg-gradient-to-r from-emerald-500/10 to-teal-600/10 py-3 sticky top-0 z-50 backdrop-blur">
        <div className="container flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground">← رجوع</button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg">🎙️</div>
            <div>
              <h1 className="text-lg font-bold text-emerald-500">الورد والتسميع</h1>
              <p className="text-xs text-muted-foreground">تدريب تلاوة محلي مع ميكروفون عند الطلب</p>
            </div>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="container py-8 max-w-2xl">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-emerald-500">اختر وردك اليومي</h2>
          <div className="grid grid-cols-1 gap-4 mb-8">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">السورة</label>
              <select
                value={selectedSurahIdx}
                onChange={(e) => setSelectedSurahIdx(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-background border border-border outline-none focus:border-emerald-500 transition text-foreground"
              >
                {surahs.map((s, i) => (
                  <option key={s.number} value={i}>
                    {toArabicNumeral(s.number)}. {s.name} ({s.totalVerses} آية)
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">من آية</label>
                <select
                  value={startAyah}
                  onChange={(e) => { const v = Number(e.target.value); setStartAyah(v); if (endAyah < v) setEndAyah(v); }}
                  className="w-full p-3 rounded-xl bg-background border border-border outline-none focus:border-emerald-500 transition text-foreground"
                >
                  {Array.from({ length: maxVerses }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{toArabicNumeral(n)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">إلى آية</label>
                <select
                  value={endAyah}
                  onChange={(e) => setEndAyah(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-background border border-border outline-none focus:border-emerald-500 transition text-foreground"
                >
                  {Array.from({ length: maxVerses }, (_, i) => i + 1).filter((n) => n >= startAyah).map((n) => (
                    <option key={n} value={n}>{toArabicNumeral(n)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {selectedSurah && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-muted-foreground">
                سيتم تسميع <strong className="text-emerald-500">{endAyah - startAyah + 1}</strong> آية من سورة <strong className="text-emerald-500">{selectedSurah.name}</strong>
              </p>
            </div>
          )}

          <button
            onClick={startSession}
            disabled={!selectedSurah}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xl font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎙️ بدء جلسة التسميع
          </button>
          <p className="text-xs text-center text-muted-foreground mt-3">* اسمح للمتصفح باستخدام الميكروفون عند الطلب</p>
        </div>
      </main>

      {sessionActive && (
        <div className="fixed inset-0 z-[9998] flex flex-col" style={{ background: '#fdfcf5' }} dir="rtl">

          {/* Header */}
          <div
            className="flex justify-between items-center px-5 py-3 sticky top-0 shadow-sm"
            style={{ background: '#fdfcf5', borderBottom: '1px solid rgba(181,137,26,0.25)' }}
          >
            <div>
              <h1 className="text-lg font-black" style={{ color: '#8a6000' }}>المحراب — تسميع الورد</h1>
              <p className="text-xs" style={{ color: '#b09060' }}>
                سورة {selectedSurah?.name} — آية {toArabicNumeral(currentVerse?.number || 1)}
                {" "}({toArabicNumeral(currentVerseIdx + 1)}/{toArabicNumeral(sessionVerses.length)})
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Golden progress dots */}
              <div className="flex gap-1.5">
                {sessionVerses.map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full transition-all duration-500"
                    style={{
                      background: completedVerses.includes(i)
                        ? 'linear-gradient(135deg,#B5891A,#e4b94a)'
                        : i === currentVerseIdx
                        ? '#c9a84c'
                        : '#e0d5b8',
                      boxShadow: completedVerses.includes(i) ? '0 0 6px rgba(181,137,26,0.6)' : 'none',
                    }}
                  />
                ))}
              </div>
              <button
                onClick={stopSession}
                className="text-sm font-bold px-3 py-1.5 rounded-full transition"
                style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}
              >
                إنهاء ✕
              </button>
            </div>
          </div>

          {/* Golden fill progress bar */}
          <div className="h-0.5 w-full" style={{ background: 'rgba(181,137,26,0.12)' }}>
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${(completedVerses.length / Math.max(sessionVerses.length, 1)) * 100}%`,
                background: 'linear-gradient(90deg, #B5891A, #e4b94a)',
              }}
            />
          </div>

          {sessionComplete ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-black mb-3" style={{ color: '#8a6000' }}>أحسنت!</h2>
              <p className="text-gray-500 text-lg mb-2">أتممتَ جلسة تسميع</p>
              <p className="font-bold text-xl mb-8" style={{ color: '#B5891A' }}>
                {toArabicNumeral(sessionVerses.length)} آيات من سورة {selectedSurah?.name}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={startSession}
                  className="px-8 py-3 rounded-full font-bold transition text-white"
                  style={{ background: 'linear-gradient(135deg,#B5891A,#e4b94a)' }}
                >
                  إعادة الجلسة
                </button>
                <button
                  onClick={stopSession}
                  className="px-8 py-3 rounded-full font-bold transition"
                  style={{ background: '#f5edd8', color: '#8a6000' }}
                >
                  اختيار ورد جديد
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-5 md:p-10 max-w-2xl mx-auto w-full gap-5">

              {/* Reference verse — ornate golden frame */}
              <div className="w-full relative">
                <div
                  className="relative rounded-2xl p-6 text-center cursor-pointer select-none transition-all duration-500 overflow-hidden"
                  style={{
                    border: '2px solid rgba(181,137,26,0.45)',
                    background: showOriginal
                      ? 'linear-gradient(135deg,#fffef8 0%,#fef9e7 50%,#fffef8 100%)'
                      : '#faf8f2',
                    boxShadow: '0 0 0 1px rgba(181,137,26,0.1), 0 4px 24px rgba(181,137,26,0.08)',
                  }}
                  onClick={() => setShowOriginal(!showOriginal)}
                  title="انقر لإظهار/إخفاء الآية"
                >
                  {/* Corner ornaments */}
                  {['top-2 right-2','top-2 left-2','bottom-2 right-2','bottom-2 left-2'].map((pos) => (
                    <span key={pos} className={`absolute ${pos} text-sm`} style={{ color: '#B5891A', opacity: 0.6 }}>✦</span>
                  ))}

                  {/* Golden fill layer based on completion */}
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-1000"
                    style={{
                      background: `linear-gradient(90deg, rgba(181,137,26,0.07) 0%, rgba(228,185,74,0.12) 100%)`,
                      width: `${(completedVerses.length / Math.max(sessionVerses.length, 1)) * 100}%`,
                    }}
                  />

                  <div
                    className={`relative text-3xl md:text-4xl leading-loose transition-all duration-500 ${!showOriginal ? 'blur-[4px]' : ''}`}
                  >
                    {currentVerse && <GoldenVerseText text={currentVerse.text} dimmed={!showOriginal} />}
                  </div>
                </div>
                <button
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="flex items-center gap-1 text-xs mx-auto mt-1.5 transition"
                  style={{ color: '#b09060' }}
                >
                  {showOriginal ? <EyeOff size={12} /> : <Eye size={12} />}
                  {showOriginal ? "إخفاء الآية" : "إظهار الآية للمساعدة"}
                </button>
              </div>

              {/* Recitation input area — ornate frame */}
              <div
                className="w-full rounded-2xl p-6 md:p-8 min-h-[100px] text-center relative overflow-hidden"
                style={{
                  border: '2px solid rgba(181,137,26,0.3)',
                  background: '#ffffff',
                  boxShadow: 'inset 0 2px 12px rgba(181,137,26,0.04)',
                }}
              >
                <span className="absolute top-2 right-2 text-xs" style={{ color: 'rgba(181,137,26,0.3)' }}>﴾</span>
                <span className="absolute top-2 left-2 text-xs" style={{ color: 'rgba(181,137,26,0.3)' }}>﴿</span>

                {result ? (
                  <div>
                    <div className="mb-4">{renderColoredText()}</div>
                    <div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-3"
                      style={{
                        background: result.status === "perfect" ? 'rgba(181,137,26,0.1)' : 'rgba(220,38,38,0.07)',
                        color: result.status === "perfect" ? '#8a6000' : '#dc2626',
                      }}
                    >
                      {result.status === "unavailable"
                        ? "التقييم الذكي غير متاح حالياً"
                        : result.status === "perfect"
                        ? "✅ ممتاز!"
                        : `⚠️ دقة التلاوة: ${Number.isFinite(result.accuracy_score) ? result.accuracy_score : 0}%`}
                    </div>
                    {result.teacher_note && (
                      <p className="text-sm rounded-xl p-3 mt-1" style={{ color: '#8a7050', background: '#faf8f0' }} dir="rtl">
                        💬 {result.teacher_note}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    {(finalText || interimText) ? (
                      <div className="text-2xl md:text-3xl leading-loose" style={{ fontFamily: "'Amiri', serif", color: '#2d2000' }} dir="rtl">
                        {finalText}
                        {interimText && <span style={{ color: '#c9a84c', opacity: 0.7 }}> {interimText}</span>}
                      </div>
                    ) : (
                      <span className="text-lg italic" style={{ color: 'rgba(181,137,26,0.4)' }}>
                        ... اقرأ الآية ليظهر ترتيلك هنا ...
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Listening indicator */}
              {isListening && (
                <div className="flex items-center gap-2">
                  {[16,24,14,20,18].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full animate-pulse"
                      style={{ height: `${h}px`, background: '#B5891A', animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                  <span className="text-sm font-bold mr-1" style={{ color: '#8a6000' }}>جاري الاستماع...</span>
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-col items-center gap-4 w-full">
                {!result && (
                  <p className="font-semibold" style={{ color: '#8a6000' }}>
                    {isListening ? "جاري التسجيل..." : "انقر على الميكروفون للبدء"}
                  </p>
                )}

                <div className="flex items-center gap-6">
                  <button
                    onClick={resetVerse}
                    className="w-12 h-12 rounded-full flex items-center justify-center transition"
                    style={{ background: '#f5edd8', color: '#8a6000' }}
                    title="إعادة المحاولة"
                  >
                    <RotateCcw size={18} />
                  </button>

                  <button
                    onClick={isListening ? stopListening : startListening}
                    className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-105 active:scale-95"
                    style={{
                      background: isListening
                        ? '#dc2626'
                        : 'linear-gradient(135deg,#B5891A,#e4b94a)',
                      color: '#fff',
                      boxShadow: isListening
                        ? '0 0 0 8px rgba(220,38,38,0.15)'
                        : '0 0 0 8px rgba(181,137,26,0.15), 0 8px 24px rgba(181,137,26,0.35)',
                    }}
                  >
                    {isListening ? <MicOff size={36} /> : <Mic size={36} />}
                  </button>

                  {result ? (
                    <button
                      onClick={nextVerse}
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white transition"
                      style={{ background: 'linear-gradient(135deg,#B5891A,#e4b94a)' }}
                      title="الآية التالية"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={checkRecitation}
                      disabled={!finalText.trim() || isEvaluating}
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white transition disabled:opacity-40"
                      style={{ background: '#c9a84c' }}
                      title="فحص التلاوة"
                    >
                      {isEvaluating ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle size={20} />
                      )}
                    </button>
                  )}
                </div>

                {!result && (
                  <button
                    onClick={checkRecitation}
                    disabled={!finalText.trim() || isEvaluating}
                    className="px-10 py-3 rounded-2xl font-black text-lg transition shadow-lg disabled:opacity-40 text-white"
                    style={{ background: 'linear-gradient(135deg,#B5891A,#e4b94a)' }}
                  >
                    {isEvaluating ? "جارٍ التأكيد..." : "✅ تأكيد التلاوة"}
                  </button>
                )}

                {result && (
                  <button
                    onClick={nextVerse}
                    className="px-10 py-3 rounded-2xl font-black text-lg transition shadow-lg text-white flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg,#B5891A,#e4b94a)' }}
                  >
                    {currentVerseIdx + 1 >= sessionVerses.length ? "إنهاء الجلسة 🏆" : "الآية التالية ←"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
