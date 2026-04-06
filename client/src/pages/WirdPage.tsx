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
  status: "perfect" | "needs_improvement";
  accuracy_score: number;
  detailed_errors: Array<{ word_index: number; expected: string; provided: string; type: "shakl" | "word" }>;
  teacher_note: string;
}

function toArabicNumeral(n: number) {
  return String(n).split("").map((c) => ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"][parseInt(c)] ?? c).join("");
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
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("المتصفح لا يدعم التعرف على الصوت. استخدم Chrome."); return; }
    const rec = new SR() as SpeechRecognition;
    rec.lang = "ar-SA";
    rec.continuous = true;
    rec.interimResults = true;
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
    rec.onend = () => { setIsListening(false); setInterimText(""); };
    rec.onerror = () => { setIsListening(false); setInterimText(""); };
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText("");
  };

  const checkRecitation = async () => {
    const userText = (finalText + " " + interimText).trim();
    if (!userText) return;
    const originalText = sessionVerses[currentVerseIdx]?.text;
    if (!originalText) return;
    stopListening();
    setIsEvaluating(true);
    setResult(null);
    try {
      const res = await fetch("/api/evaluate-recitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalText, userText }),
      });
      const data: EvaluationResult = await res.json();
      setResult(data);
    } catch {
      setResult({
        status: "needs_improvement",
        accuracy_score: 0,
        detailed_errors: [],
        teacher_note: "تعذر الاتصال بمحرك التقييم، حاول مجدداً.",
      });
    } finally {
      setIsEvaluating(false);
    }
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
    const errorMap = new Map(result.detailed_errors.map((e) => [e.word_index, e]));
    return (
      <div className="flex flex-wrap justify-center gap-2 leading-loose" dir="rtl">
        {words.map((word, i) => {
          const err = errorMap.get(i);
          if (err) {
            return (
              <span key={i} className="relative group cursor-help">
                <span className="text-red-500 line-through">{err.provided}</span>
                <span className="text-amber-500 mr-1">({word})</span>
                <span className="absolute -top-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                  {err.type === "shakl" ? "خطأ تشكيل" : "خطأ كلمة"}
                </span>
              </span>
            );
          }
          return <span key={i} className="text-green-400">{word}</span>;
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
              <p className="text-xs text-muted-foreground">تسميع ذكي بالذكاء الاصطناعي</p>
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
        <div className="fixed inset-0 bg-[#fdfcf8] dark:bg-zinc-950 z-[9998] flex flex-col" dir="rtl">
          <div className="p-4 md:p-6 flex justify-between items-center border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 shadow-sm">
            <div>
              <h1 className="text-xl font-black text-emerald-700 dark:text-emerald-400">المحراب — تسميع الورد</h1>
              <p className="text-gray-500 text-sm mt-1">
                سورة {selectedSurah?.name} — آية {toArabicNumeral(currentVerse?.number || 1)}
                {" "}({toArabicNumeral(currentVerseIdx + 1)}/{toArabicNumeral(sessionVerses.length)})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {sessionVerses.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      completedVerses.includes(i) ? "bg-emerald-500" :
                      i === currentVerseIdx ? "bg-amber-500" : "bg-gray-300 dark:bg-zinc-600"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={stopSession}
                className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-600 px-4 py-2 rounded-full font-bold transition text-sm"
              >
                إنهاء ✕
              </button>
            </div>
          </div>

          {sessionComplete ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <Trophy className="w-20 h-20 text-amber-500 mb-6" />
              <h2 className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mb-4">أحسنت! 🎉</h2>
              <p className="text-gray-500 text-lg mb-2">لقد أتممت جلسة تسميع</p>
              <p className="text-emerald-600 font-bold text-xl mb-8">
                {toArabicNumeral(sessionVerses.length)} آيات من سورة {selectedSurah?.name}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={startSession}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition"
                >
                  إعادة الجلسة
                </button>
                <button
                  onClick={stopSession}
                  className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition"
                >
                  اختيار ورد جديد
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto w-full">
              <div className="w-full mb-8">
                <div
                  onClick={() => setShowOriginal(!showOriginal)}
                  className={`text-center text-3xl md:text-4xl leading-loose font-amiri cursor-pointer select-none transition-all duration-500 p-6 rounded-2xl border ${
                    showOriginal
                      ? "text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                      : "text-gray-300 dark:text-zinc-700 bg-gray-50 dark:bg-zinc-900 border-dashed border-gray-200 dark:border-zinc-800 blur-[3px] hover:blur-0"
                  }`}
                  title="انقر لإظهار/إخفاء الآية"
                  dir="rtl"
                  style={{ fontFamily: "'Amiri', serif" }}
                >
                  {currentVerse?.text}
                </div>
                <div className="flex justify-center gap-2 mt-2">
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                  >
                    {showOriginal ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showOriginal ? "إخفاء الآية" : "إظهار الآية للمساعدة"}
                  </button>
                </div>
              </div>

              <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-inner border border-gray-100 dark:border-zinc-800 p-6 md:p-10 min-h-[120px] mb-4 text-center">
                {result ? (
                  <div>
                    <div className="text-3xl md:text-4xl leading-loose mb-4" style={{ fontFamily: "'Amiri', serif" }}>
                      {renderColoredText()}
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${
                      result.status === "perfect"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    }`}>
                      {result.status === "perfect" ? "✅ ممتاز!" : `⚠️ دقة التشكيل: ${result.accuracy_score}%`}
                    </div>
                    {result.teacher_note && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 rounded-xl p-3 mt-2" dir="rtl">
                        💬 {result.teacher_note}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    {(finalText || interimText) ? (
                      <div className="text-2xl md:text-3xl leading-loose" style={{ fontFamily: "'Amiri', serif" }} dir="rtl">
                        <span className="text-gray-800 dark:text-gray-200">{finalText}</span>
                        {interimText && (
                          <span className="text-gray-400 dark:text-gray-600 italic"> {interimText}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-zinc-600 text-lg italic">
                        ... اقرأ الآية ليظهر ترتيلك هنا ...
                      </span>
                    )}
                  </div>
                )}
              </div>

              {isListening && (
                <div className="flex items-center gap-2 mb-4">
                  {[0,1,2,3,4].map((i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-500 rounded-full animate-pulse"
                      style={{ height: `${12 + Math.random() * 20}px`, animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold mr-2">جاري الاستماع...</span>
                </div>
              )}

              <div className="flex flex-col items-center gap-4 mt-2">
                {!result && (
                  <div className="text-emerald-700 dark:text-emerald-400 font-bold text-lg">
                    {isListening ? "جاري التسجيل..." : "انقر على الميكروفون للبدء"}
                  </div>
                )}

                <div className="flex items-center gap-6">
                  <button
                    onClick={resetVerse}
                    className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                    title="إعادة المحاولة"
                  >
                    <RotateCcw size={18} />
                  </button>

                  <button
                    id="mic-btn"
                    onClick={isListening ? stopListening : startListening}
                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {isListening ? <MicOff size={36} /> : <Mic size={36} />}
                  </button>

                  {result ? (
                    <button
                      onClick={nextVerse}
                      className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-700 transition"
                      title="الآية التالية"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={checkRecitation}
                      disabled={!finalText.trim() || isEvaluating}
                      className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white hover:bg-amber-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
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
                    className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-10 py-3 rounded-2xl font-black text-lg transition shadow-lg"
                  >
                    {isEvaluating ? "جاري التقييم الذكي..." : "✅ تأكيد التسميع وفحص الأخطاء"}
                  </button>
                )}

                {result && (
                  <button
                    onClick={nextVerse}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-2xl font-black text-lg transition shadow-lg flex items-center gap-2"
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
