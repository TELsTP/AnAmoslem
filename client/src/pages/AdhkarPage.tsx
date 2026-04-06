import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const MORNING_ADHKAR = [
  { text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1, note: "يقال عند الصباح" },
  { text: "آيَةُ الْكُرْسِيِّ — اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ، لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...", count: 1, note: "مرة واحدة صباحًا" },
  { text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", count: 3, note: "ثلاث مرات" },
  { text: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ ﷺ نَبِيًّا", count: 3, note: "ثلاث مرات" },
  { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 100, note: "مائة مرة" },
  { text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 10, note: "عشر مرات" },
  { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعِلْمَ النَّافِعَ، وَالرِّزْقَ الطَّيِّبَ، وَالْعَمَلَ الْمُتَقَبَّلَ", count: 1, note: "دعاء الصباح" },
  { text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ — قُلْ هُوَ اللَّهُ أَحَدٌ (الإخلاص) — قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ — قُلْ أَعُوذُ بِرَبِّ النَّاسِ", count: 3, note: "المعوذات ثلاث مرات" },
];

const EVENING_ADHKAR = [
  { text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1, note: "يقال عند المساء" },
  { text: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ", count: 1, note: "دعاء المساء" },
  { text: "سَيِّدُ الاسْتِغْفَارِ — اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ", count: 1, note: "سيد الاستغفار" },
  { text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", count: 3, note: "ثلاث مرات" },
  { text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ", count: 3, note: "ثلاث مرات" },
  { text: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", count: 7, note: "سبع مرات" },
  { text: "سُبْحَانَ اللَّهِ (٣٣) — الْحَمْدُ لِلَّهِ (٣٣) — اللَّهُ أَكْبَرُ (٣٣) — لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1, note: "تسبيح المساء" },
];

const TASBIH_OPTIONS = [
  { label: "سبحان الله", max: 33 },
  { label: "الحمد لله", max: 33 },
  { label: "الله أكبر", max: 33 },
  { label: "لا إله إلا الله", max: 100 },
  { label: "أستغفر الله", max: 100 },
];

function toArabicNumeral(n: number) {
  return String(n).split("").map((c) => ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"][parseInt(c)] ?? c).join("");
}

export default function AdhkarPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"morning" | "evening" | "tasbih">("morning");
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [tasbihCount, setTasbihCount] = useState(0);
  const [tasbihOption, setTasbihOption] = useState(0);
  const [vibrate, setVibrate] = useState(false);

  const isAM = new Date().getHours() < 12;

  useEffect(() => {
    setCompleted(new Set());
    setActiveTab(isAM ? "morning" : "evening");
  }, []);

  const adhkar = activeTab === "morning" ? MORNING_ADHKAR : EVENING_ADHKAR;

  const toggleCompleted = (i: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const incrementTasbih = () => {
    if (navigator.vibrate) navigator.vibrate(30);
    setVibrate(true);
    setTimeout(() => setVibrate(false), 100);
    setTasbihCount((n) => {
      const max = TASBIH_OPTIONS[tasbihOption].max;
      if (n + 1 >= max) {
        if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);
        return max;
      }
      return n + 1;
    });
  };

  const resetTasbih = () => {
    setTasbihCount(0);
  };

  const progress = adhkar.length > 0 ? (completed.size / adhkar.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b border-border bg-gradient-to-r from-amber-500/10 to-orange-600/10 py-3 sticky top-0 z-50 backdrop-blur">
        <div className="container flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground">← رجوع</button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg">
              {activeTab === "tasbih" ? "📿" : activeTab === "morning" ? "☀️" : "🌙"}
            </div>
            <div>
              <h1 className="text-lg font-bold text-amber-500">الأذكار والتسبيح</h1>
              <p className="text-xs text-muted-foreground">أذكار الصباح والمساء والتسبيح</p>
            </div>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <div className="container py-4">
        <div className="flex gap-2 justify-center mb-6">
          {(["morning", "evening", "tasbih"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCompleted(new Set()); }}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg"
                  : "bg-card border border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {tab === "morning" ? "☀️ الصباح" : tab === "evening" ? "🌙 المساء" : "📿 التسبيح"}
            </button>
          ))}
        </div>

        {activeTab !== "tasbih" && (
          <>
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {completed.size} من {adhkar.length} أذكار
                </span>
                <span className="font-bold text-amber-500">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {progress === 100 && (
                <div className="text-center mt-3 text-emerald-500 font-bold animate-pulse">
                  🌟 ما شاء الله! أتممت أذكار {activeTab === "morning" ? "الصباح" : "المساء"}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {adhkar.map((dhikr, i) => (
                <div
                  key={i}
                  onClick={() => toggleCompleted(i)}
                  className={`bg-card border rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md ${
                    completed.has(i)
                      ? "border-emerald-500/40 bg-emerald-500/5 opacity-70"
                      : "border-border hover:border-amber-500/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${
                        completed.has(i)
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-amber-500/50"
                      }`}
                    >
                      {completed.has(i) && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-lg leading-loose mb-2 ${completed.has(i) ? "text-muted-foreground line-through" : "text-foreground"}`}
                        style={{ fontFamily: "'Amiri', serif" }}
                        dir="rtl"
                      >
                        {dhikr.text}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{dhikr.note}</span>
                        <span className="text-xs bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                          {dhikr.count > 1 ? `× ${toArabicNumeral(dhikr.count)}` : "مرة واحدة"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "tasbih" && (
          <div className="max-w-sm mx-auto text-center py-8">
            <div className="mb-6">
              <label className="block text-sm font-bold text-foreground mb-2">اختر التسبيحة</label>
              <div className="flex flex-wrap gap-2 justify-center">
                {TASBIH_OPTIONS.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => { setTasbihOption(i); setTasbihCount(0); }}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                      tasbihOption === i
                        ? "bg-amber-500 text-white border-transparent"
                        : "bg-card border-border text-foreground hover:border-amber-500/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mb-8">
              <div
                className="w-56 h-56 rounded-full mx-auto flex items-center justify-center relative"
                style={{
                  background: `conic-gradient(#f59e0b ${(tasbihCount / TASBIH_OPTIONS[tasbihOption].max) * 360}deg, #1f2937 0deg)`,
                  padding: "6px",
                }}
              >
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center flex-col">
                  <span className="text-6xl font-black text-amber-500">
                    {toArabicNumeral(tasbihCount)}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">
                    من {toArabicNumeral(TASBIH_OPTIONS[tasbihOption].max)}
                  </span>
                </div>
              </div>
              {tasbihCount >= TASBIH_OPTIONS[tasbihOption].max && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl animate-bounce">🎉</div>
              )}
            </div>

            <p className="text-xl font-bold text-foreground mb-8" style={{ fontFamily: "'Amiri', serif" }}>
              {TASBIH_OPTIONS[tasbihOption].label}
            </p>

            <button
              onClick={incrementTasbih}
              disabled={tasbihCount >= TASBIH_OPTIONS[tasbihOption].max}
              className={`w-36 h-36 rounded-full text-white font-black text-2xl shadow-2xl transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed ${
                vibrate ? "scale-95" : "scale-100"
              }`}
              style={{
                background: tasbihCount >= TASBIH_OPTIONS[tasbihOption].max
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "linear-gradient(135deg, #f59e0b, #d97706)",
                boxShadow: "0 12px 40px rgba(245,158,11,0.4)",
              }}
            >
              سبّح
            </button>

            <button
              onClick={resetTasbih}
              className="block mx-auto mt-6 text-sm text-muted-foreground hover:text-red-500 transition"
            >
              تصفير العداد ↺
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
