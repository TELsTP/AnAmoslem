import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  BookOpen, Search, ChevronLeft, CheckCircle, Circle,
  Menu, X, Mic, MicOff, SkipForward, Trophy, RotateCcw,
} from "lucide-react";

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

interface QuranData {
  surahs: Surah[];
  totalSurahs: number;
}

const BISMILLAH = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";
const TASHKEEL_RE = /[\u064B-\u065F\u0670\u0610-\u061A\u06D6-\u06ED]/;

function stripTashkeel(s: string) {
  return s.replace(/[\u064B-\u065F\u0670\u0610-\u061A\u06D6-\u06ED]/g, "");
}

function normalizeArabic(s: string) {
  return stripTashkeel(s)
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\u0600-\u06FF]/g, "")
    .trim();
}

function loadReadSurahs(): Set<number> {
  try {
    const s = localStorage.getItem("quran_read_surahs");
    if (s) return new Set(JSON.parse(s));
  } catch {}
  return new Set();
}
function saveReadSurahs(set: Set<number>) {
  try { localStorage.setItem("quran_read_surahs", JSON.stringify([...set])); } catch {}
}
function loadLastSurah(): number {
  try { const s = localStorage.getItem("quran_last_surah"); if (s) return parseInt(s); } catch {}
  return 1;
}
function saveLastSurah(n: number) {
  try { localStorage.setItem("quran_last_surah", String(n)); } catch {}
}
function toArabicNumeral(n: number) {
  const d = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return String(n).split('').map(c => d[parseInt(c)] ?? c).join('');
}

function TashkeelText({ text, tashkeelColor = "#B5891A" }: { text: string; tashkeelColor?: string }) {
  return (
    <>
      {[...text].map((char, i) =>
        TASHKEEL_RE.test(char) ? (
          <span key={i} style={{ color: tashkeelColor }}>{char}</span>
        ) : (
          <span key={i}>{char}</span>
        )
      )}
    </>
  );
}

type WordStatus = "hidden" | "correct" | "error";
interface RevealedWord {
  word: string;
  status: WordStatus;
  verseNum: number;
}

function buildWordList(surah: Surah): { word: string; verseNum: number }[] {
  const list: { word: string; verseNum: number }[] = [];
  for (const v of surah.verses) {
    const words = v.text.split(/\s+/).filter(w => w.trim());
    for (const w of words) list.push({ word: w, verseNum: v.number });
  }
  return list;
}

const SpeechRec =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

function RecitationMode({ surah, onClose }: { surah: Surah; onClose: () => void }) {
  const wordList = useRef(buildWordList(surah));
  const total = wordList.current.length;

  const [revealed, setRevealed] = useState<RevealedWord[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [finished, setFinished] = useState(false);
  const [noMic, setNoMic] = useState(!SpeechRec);
  const recognitionRef = useRef<any>(null);
  const revealedContainerRef = useRef<HTMLDivElement>(null);
  const currentIdxRef = useRef(0);
  const revealedRef = useRef<RevealedWord[]>([]);

  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { revealedRef.current = revealed; }, [revealed]);

  useEffect(() => {
    if (revealedContainerRef.current) {
      revealedContainerRef.current.scrollTop = revealedContainerRef.current.scrollHeight;
    }
  }, [revealed]);

  const revealWord = useCallback((idx: number, status: WordStatus) => {
    const entry = wordList.current[idx];
    if (!entry) return;
    setRevealed(prev => [...prev, { word: entry.word, status, verseNum: entry.verseNum }]);
    const next = idx + 1;
    setCurrentIdx(next);
    if (next >= total) setFinished(true);
  }, [total]);

  const skip = useCallback(() => {
    const idx = currentIdxRef.current;
    if (idx >= total) return;
    revealWord(idx, "error");
  }, [revealWord, total]);

  const handleRecognized = useCallback((text: string) => {
    const recognizedWords = text.trim().split(/\s+/).filter(Boolean);
    let idx = currentIdxRef.current;
    for (const rw of recognizedWords) {
      if (idx >= total) break;
      const expected = wordList.current[idx];
      const normExpected = normalizeArabic(expected.word);
      const normRecognized = normalizeArabic(rw);
      const isMatch = normExpected === normRecognized || normExpected.startsWith(normRecognized) || normRecognized.startsWith(normExpected);
      revealWord(idx, isMatch ? "correct" : "error");
      idx++;
    }
  }, [revealWord, total]);

  const startListening = useCallback(() => {
    if (!SpeechRec) { setNoMic(true); return; }
    const rec = new SpeechRec();
    rec.lang = "ar-SA";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 3;

    rec.onstart = () => setIsListening(true);
    rec.onend = () => {
      setIsListening(false);
      setInterimText("");
    };
    rec.onerror = () => { setIsListening(false); setInterimText(""); };

    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          handleRecognized(result[0].transcript);
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimText(interim);
    };

    recognitionRef.current = rec;
    rec.start();
  }, [handleRecognized]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  const toggleMic = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  useEffect(() => { return () => recognitionRef.current?.stop(); }, []);

  const correctCount = revealed.filter(w => w.status === "correct").length;
  const errorCount = revealed.filter(w => w.status === "error").length;
  const progressPct = Math.round((revealed.length / total) * 100);

  if (finished) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8" dir="rtl">
        <div className="text-center max-w-md">
          <Trophy className="w-20 h-20 mx-auto mb-6 text-amber-500" />
          <h2 className="text-3xl font-bold mb-2">أحسنت!</h2>
          <p className="text-muted-foreground mb-8">
            انتهيت من تسميع سورة {surah.name}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="text-2xl font-bold text-green-600">{correctCount}</div>
              <div className="text-xs text-muted-foreground mt-1">صواب</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <div className="text-2xl font-bold text-red-500">{errorCount}</div>
              <div className="text-xs text-muted-foreground mt-1">خطأ</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">{Math.round((correctCount / total) * 100)}%</div>
              <div className="text-xs text-muted-foreground mt-1">دقة</div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setRevealed([]);
                setCurrentIdx(0);
                setFinished(false);
                setInterimText("");
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة التسميع</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col" dir="rtl">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-lg font-bold text-primary">تسميع سورة {surah.name}</div>
          <div className="text-xs text-muted-foreground">
            {toArabicNumeral(currentIdx)} / {toArabicNumeral(total)} كلمة
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-green-500 to-green-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-green-600 font-semibold w-8">{progressPct}%</span>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
          <span className="text-green-600">✓ {correctCount} صواب</span>
          <span className="text-red-500">✗ {errorCount} خطأ</span>
        </div>
      </div>

      <div
        ref={revealedContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4"
      >
        {revealed.length === 0 && !isListening && (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <div>
              <Mic className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">اضغط على الميكروفون وابدأ التلاوة</p>
              <p className="text-sm mt-2 opacity-60">ستظهر الكلمات هنا عند تلاوتها</p>
            </div>
          </div>
        )}

        <p
          className="verse-display text-justify"
          style={{ fontSize: "1.7rem", lineHeight: "3.4", direction: "rtl" }}
        >
          {revealed.map((item, i) => (
            <span key={i}>
              {item.status === "correct" ? (
                <span>
                  <TashkeelText text={item.word} tashkeelColor="#16a34a" />
                </span>
              ) : (
                <span>
                  <TashkeelText text={item.word} tashkeelColor="#dc2626" />
                </span>
              )}
              {" "}
              {i < revealed.length - 1 &&
                revealed[i].verseNum !== revealed[i + 1]?.verseNum && (
                  <span
                    className="text-blue-400 select-none"
                    style={{ fontSize: "1rem" }}
                  >
                    ﴿{toArabicNumeral(revealed[i].verseNum)}﴾{" "}
                  </span>
                )}
              {i === revealed.length - 1 && (
                <span
                  className="text-blue-400 select-none"
                  style={{ fontSize: "1rem" }}
                >
                </span>
              )}
            </span>
          ))}

          {interimText && (
            <span className="text-muted-foreground/60 italic text-2xl">
              {interimText}
            </span>
          )}
        </p>
      </div>

      <div className="border-t border-border px-6 py-4 flex-shrink-0 flex items-center justify-center gap-6">
        {noMic ? (
          <div className="text-center text-red-500 text-sm">
            <p>المتصفح لا يدعم التعرف على الصوت</p>
            <p className="text-xs text-muted-foreground mt-1">يُنصح باستخدام Chrome أو Edge</p>
          </div>
        ) : (
          <>
            <button
              onClick={skip}
              disabled={currentIdx >= total}
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-amber-600 transition-colors disabled:opacity-30"
            >
              <SkipForward className="w-6 h-6" />
              <span className="text-xs">تخطي</span>
            </button>

            <button
              onClick={toggleMic}
              className={`
                w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all
                ${isListening
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-blue-600 hover:bg-blue-700"}
                text-white
              `}
            >
              {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>

            <button
              onClick={() => {
                stopListening();
                setFinished(true);
              }}
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-green-600 transition-colors"
            >
              <CheckCircle className="w-6 h-6" />
              <span className="text-xs">إنهاء</span>
            </button>
          </>
        )}
      </div>

      <div className="pb-safe" />
    </div>
  );
}

export default function QuranPage() {
  const [, navigate] = useLocation();
  const [quranData, setQuranData] = useState<QuranData | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [readSurahs, setReadSurahs] = useState<Set<number>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recitationMode, setRecitationMode] = useState(false);
  const versesPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReadSurahs(loadReadSurahs());
    fetch("/data/quran.json")
      .then(r => r.json())
      .then((data: QuranData) => {
        setQuranData(data);
        const lastNum = loadLastSurah();
        const last = data.surahs.find(s => s.number === lastNum) || data.surahs[0];
        setSelectedSurah(last);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectSurah = useCallback((surah: Surah) => {
    setSelectedSurah(surah);
    saveLastSurah(surah.number);
    setSidebarOpen(false);
    if (versesPanelRef.current) versesPanelRef.current.scrollTop = 0;
  }, []);

  const toggleRead = useCallback((surahNum: number) => {
    setReadSurahs(prev => {
      const next = new Set(prev);
      next.has(surahNum) ? next.delete(surahNum) : next.add(surahNum);
      saveReadSurahs(next);
      return next;
    });
  }, []);

  const filteredSurahs = quranData?.surahs.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim();
    return s.name.includes(q) || s.englishName.toLowerCase().includes(q.toLowerCase()) || String(s.number).includes(q);
  }) ?? [];

  const readCount = readSurahs.size;
  const totalSurahs = quranData?.totalSurahs ?? 114;
  const progressPct = Math.round((readCount / totalSurahs) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center">
          <div className="verse-display text-4xl text-primary mb-6 animate-pulse leading-loose">
            <TashkeelText text={BISMILLAH} tashkeelColor="#B5891A" />
          </div>
          <p className="text-muted-foreground">جاري تحميل القرآن الكريم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {recitationMode && selectedSurah && (
        <RecitationMode surah={selectedSurah} onClose={() => setRecitationMode(false)} />
      )}

      <header className="border-b border-border bg-background/95 backdrop-blur z-50 flex-shrink-0">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>رجوع</span>
          </button>
          <div className="flex items-center gap-2" dir="rtl">
            <h1 className="text-xl font-bold text-primary">قراني</h1>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`
            ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
            fixed md:relative inset-0 z-40 md:z-auto
            w-full md:w-80 lg:w-96
            border-l border-border bg-background
            flex flex-col
            transition-transform duration-300 md:transition-none
          `}
          dir="rtl"
        >
          <div className="p-3 border-b border-border flex-shrink-0">
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="ابحث عن سورة..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-lg py-2 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{readCount} / {totalSurahs} مقروءة</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="font-semibold text-blue-600">{progressPct}%</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredSurahs.map(surah => {
              const isSelected = selectedSurah?.number === surah.number;
              const isRead = readSurahs.has(surah.number);
              return (
                <div
                  key={surah.number}
                  onClick={() => selectSurah(surah)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors border-b border-border/40
                    ${isSelected ? "bg-blue-50 border-r-4 border-r-blue-500" : "hover:bg-muted/50"}
                  `}
                >
                  <div className="flex-shrink-0">
                    {isRead ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}`}>
                        {surah.number}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs text-muted-foreground truncate">{surah.englishName}</span>
                      <span className={`font-bold text-base ${isSelected ? "text-blue-700" : "text-foreground"}`}>{surah.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground text-left">{surah.totalVerses} آية</div>
                  </div>
                </div>
              );
            })}
            {filteredSurahs.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">لا توجد نتائج</div>
            )}
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main
          ref={versesPanelRef}
          className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50/30 to-background"
          dir="rtl"
        >
          {selectedSurah ? (
            <div className="max-w-3xl mx-auto px-4 py-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1 text-sm mb-4 font-medium">
                  <span>سورة رقم {toArabicNumeral(selectedSurah.number)}</span>
                  <span>•</span>
                  <span>{toArabicNumeral(selectedSurah.totalVerses)} آية</span>
                </div>

                <h2 className="verse-display text-5xl text-primary leading-loose mb-1">
                  سورة {selectedSurah.name}
                </h2>
                <p className="text-muted-foreground text-sm mb-5">{selectedSurah.englishName}</p>

                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => toggleRead(selectedSurah.number)}
                    className={`
                      flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm
                      ${readSurahs.has(selectedSurah.number)
                        ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                        : "bg-white text-muted-foreground hover:bg-blue-50 hover:text-blue-700 border border-border"}
                    `}
                  >
                    {readSurahs.has(selectedSurah.number) ? (
                      <><CheckCircle className="w-4 h-4" /><span>تمت القراءة ✓</span></>
                    ) : (
                      <><Circle className="w-4 h-4" /><span>وضّع علامة مقروء</span></>
                    )}
                  </button>

                  <button
                    onClick={() => setRecitationMode(true)}
                    className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-all shadow-sm"
                  >
                    <Mic className="w-4 h-4" />
                    <span>تسميع وحفظ</span>
                  </button>

                  {selectedSurah.number > 1 && (
                    <button
                      onClick={() => {
                        const prev = quranData?.surahs.find(s => s.number === selectedSurah.number - 1);
                        if (prev) selectSurah(prev);
                      }}
                      className="flex items-center gap-1 px-3 py-2 rounded-full bg-white border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                      <span>السابقة</span>
                    </button>
                  )}
                  {selectedSurah.number < 114 && (
                    <button
                      onClick={() => {
                        const next = quranData?.surahs.find(s => s.number === selectedSurah.number + 1);
                        if (next) selectSurah(next);
                      }}
                      className="flex items-center gap-1 px-3 py-2 rounded-full bg-white border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
                    >
                      <span>التالية</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {selectedSurah.number !== 9 && (
                <div className="text-center py-5 mb-4">
                  <span className="verse-display text-2xl leading-loose">
                    <TashkeelText text={BISMILLAH} tashkeelColor="#B5891A" />
                  </span>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 md:p-10">
                <p
                  className="verse-display text-foreground text-justify"
                  style={{ fontSize: "1.5rem", lineHeight: "3.2", direction: "rtl" }}
                >
                  {selectedSurah.verses.map(verse => (
                    <span key={verse.number}>
                      <span className="hover:bg-yellow-50 transition-colors rounded cursor-default">
                        <TashkeelText text={verse.text} tashkeelColor="#B5891A" />
                      </span>
                      {" "}
                      <span
                        className="text-blue-400 select-none"
                        style={{ fontFamily: "'Amiri', serif", fontSize: "1.1rem" }}
                      >
                        ﴿{toArabicNumeral(verse.number)}﴾
                      </span>
                      {" "}
                    </span>
                  ))}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-border p-4 text-center shadow-sm" dir="rtl">
                  <div className="text-xl font-bold text-blue-600 mb-1">{toArabicNumeral(selectedSurah.number)}</div>
                  <div className="text-xs text-muted-foreground">رقم السورة</div>
                </div>
                <div className="bg-white rounded-xl border border-border p-4 text-center shadow-sm" dir="rtl">
                  <div className="text-xl font-bold text-green-600 mb-1">{toArabicNumeral(selectedSurah.totalVerses)}</div>
                  <div className="text-xs text-muted-foreground">عدد الآيات</div>
                </div>
                <div className="bg-white rounded-xl border border-border p-4 text-center shadow-sm" dir="rtl">
                  <div className={`text-xl font-bold mb-1 ${readSurahs.has(selectedSurah.number) ? "text-green-600" : "text-muted-foreground"}`}>
                    {readSurahs.has(selectedSurah.number) ? "مقروءة ✓" : "غير مقروءة"}
                  </div>
                  <div className="text-xs text-muted-foreground">الحالة</div>
                </div>
              </div>

              <div className="mt-5 flex justify-between items-center">
                {selectedSurah.number > 1 ? (
                  <button
                    onClick={() => {
                      const prev = quranData?.surahs.find(s => s.number === selectedSurah.number - 1);
                      if (prev) selectSurah(prev);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-border hover:bg-blue-50 hover:text-blue-700 text-sm transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 rotate-180" />
                    <span>سورة {quranData?.surahs.find(s => s.number === selectedSurah.number - 1)?.name}</span>
                  </button>
                ) : <div />}
                {selectedSurah.number < 114 ? (
                  <button
                    onClick={() => {
                      const next = quranData?.surahs.find(s => s.number === selectedSurah.number + 1);
                      if (next) selectSurah(next);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-border hover:bg-blue-50 hover:text-blue-700 text-sm transition-colors shadow-sm"
                  >
                    <span>سورة {quranData?.surahs.find(s => s.number === selectedSurah.number + 1)?.name}</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                ) : <div />}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8" dir="rtl">
              <div className="text-center text-muted-foreground">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>اختر سورة للبدء</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
