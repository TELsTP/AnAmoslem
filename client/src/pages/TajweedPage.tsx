import { useState } from "react";
import { BookOpen, ChevronLeft, ExternalLink, Headphones, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

type Example = {
  text: string;
  ref: string;
  note: string;
  audio: string;
};

type TajweedRule = {
  title: string;
  subtitle: string;
  description: string;
  letters: string[];
  mnemonic: string;
  mnemonicMeaning: string;
  tone: {
    border: string;
    surface: string;
    badge: string;
    text: string;
  };
  examples: Example[];
};

const AUDIO_BASE = "https://everyayah.com/data/Alafasy_128kbps/";

const RULES: TajweedRule[] = [
  {
    title: "النّون والميم المشدّدتان",
    subtitle: "الغُنّة أكمل ما تكون",
    description: "إذا جاءت النون أو الميم مشدّدة، يجب إظهار الغُنّة بمقدار حركتين وجوباً.",
    letters: ["نّ", "مّ"],
    mnemonic: "الغُنّة أكمل ما تكون في المشدّد",
    mnemonicMeaning: "حكم مستقل يطبق دائماً",
    tone: { border: "border-emerald-200", surface: "bg-emerald-50", badge: "bg-emerald-600", text: "text-emerald-800" },
    examples: [
      { text: "إِنَّ الَّذِينَ آمَنُوا", ref: "البقرة 2:82", note: "نون مشددة — غنة أكمل", audio: `${AUDIO_BASE}002082.mp3` },
      { text: "ثُمَّ أَفِيضُوا", ref: "البقرة 2:199", note: "ميم مشددة", audio: `${AUDIO_BASE}002199.mp3` },
    ],
  },
  {
    title: "الإظهار الحلقي",
    subtitle: "إظهار",
    description: "إذا جاء بعد النون الساكنة أو التنوين أحد حروف الحلق الستة، يظهر النطق واضحاً بلا غنة زائدة ولا إدغام.",
    letters: ["ء", "هـ", "ع", "ح", "غ", "خ"],
    mnemonic: "أَخِي هَاكَ عِلْمًا حَازَهُ غَيْرُ خَاسِرٍ",
    mnemonicMeaning: "أول حرف من كل كلمة هو حرف إظهار",
    tone: { border: "border-sky-200", surface: "bg-sky-50", badge: "bg-sky-600", text: "text-sky-800" },
    examples: [
      { text: "مِنْ خَشْيَةِ اللَّهِ", ref: "البقرة 2:74", note: "نون ساكنة + خاء", audio: `${AUDIO_BASE}002074.mp3` },
      { text: "مَنْ آمَنَ", ref: "البقرة 2:62", note: "نون + همزة", audio: `${AUDIO_BASE}002062.mp3` },
      { text: "نَارٌ حَامِيَةٌ", ref: "القارعة 101:11", note: "تنوين + حاء", audio: `${AUDIO_BASE}101011.mp3` },
    ],
  },
  {
    title: "الإدغام بغُنّة",
    subtitle: "إدغام بغنة",
    description: "إذا جاء بعد النون الساكنة أو التنوين أحد حروف (ي ن م و) يُدغم الحرفان مع غنة حركتين.",
    letters: ["ي", "ن", "م", "و"],
    mnemonic: "يَنْمُو",
    mnemonicMeaning: "مجموع حروف الإدغام بغنة",
    tone: { border: "border-amber-200", surface: "bg-amber-50", badge: "bg-amber-600", text: "text-amber-800" },
    examples: [
      { text: "مَنْ يَعْمَلْ", ref: "النساء 4:123", note: "نون + ياء", audio: `${AUDIO_BASE}004123.mp3` },
      { text: "مِن مَّالٍ", ref: "البقرة 2:155", note: "نون + ميم", audio: `${AUDIO_BASE}002155.mp3` },
      { text: "سِرَاجًا وَهَّاجًا", ref: "النبأ 78:13", note: "تنوين + واو", audio: `${AUDIO_BASE}078013.mp3` },
    ],
  },
  {
    title: "الإدغام بغير غُنّة",
    subtitle: "إدغام بلا غنة",
    description: "في حرفي (ل ر) يُدغم النون أو التنوين إدغاماً كاملاً بلا غنة، مع تشديد اللام أو الراء.",
    letters: ["ل", "ر"],
    mnemonic: "ل — ر",
    mnemonicMeaning: "حرفان فقط — إدغام كامل بلا غنة",
    tone: { border: "border-orange-200", surface: "bg-orange-50", badge: "bg-orange-600", text: "text-orange-800" },
    examples: [
      { text: "وَيْلٌ لِّكُلِّ هُمَزَةٍ", ref: "الهمزة 104:1", note: "تنوين + لام", audio: `${AUDIO_BASE}104001.mp3` },
      { text: "مِن رَّبِّهِمْ", ref: "البقرة 2:5", note: "نون + راء", audio: `${AUDIO_BASE}002005.mp3` },
    ],
  },
  {
    title: "الإقلاب",
    subtitle: "إقلاب",
    description: "إذا جاء بعد النون الساكنة أو التنوين حرف الباء، تُقلب النون ميماً مخفاة مع غنة حركتين.",
    letters: ["ب"],
    mnemonic: "حرف واحد — الباء",
    mnemonicMeaning: "تقلب النون ميماً ثم تخفى بغنة",
    tone: { border: "border-violet-200", surface: "bg-violet-50", badge: "bg-violet-600", text: "text-violet-800" },
    examples: [
      { text: "مِنۢ بَعْدِ", ref: "البقرة 2:27", note: "نون + باء", audio: `${AUDIO_BASE}002027.mp3` },
      { text: "صُمٌّۢ بُكْمٌ", ref: "البقرة 2:18", note: "تنوين + باء", audio: `${AUDIO_BASE}002018.mp3` },
      { text: "عَلِيمٌۢ بِذَاتِ الصُّدُورِ", ref: "آل عمران 3:119", note: "تنوين + باء", audio: `${AUDIO_BASE}003119.mp3` },
    ],
  },
  {
    title: "الإخفاء الحقيقي",
    subtitle: "إخفاء",
    description: "في باقي الحروف الخمسة عشر تُخفى النون أو التنوين مع غنة حركتين، بين الإظهار والإدغام.",
    letters: ["ص", "ذ", "ث", "ك", "ج", "ش", "ق", "س", "د", "ط", "ز", "ف", "ت", "ض", "ظ"],
    mnemonic: "صِفْ ذَا ثَنَا كَمْ جَادَ شَخْصٌ قَدْ سَمَا",
    mnemonicMeaning: "أول حرف من كل كلمة هو حرف إخفاء",
    tone: { border: "border-teal-200", surface: "bg-teal-50", badge: "bg-teal-600", text: "text-teal-800" },
    examples: [
      { text: "مِن قَبْلِ", ref: "البقرة 2:4", note: "نون + قاف", audio: `${AUDIO_BASE}002004.mp3` },
      { text: "كُنتُمْ", ref: "البقرة 2:28", note: "نون + تاء", audio: `${AUDIO_BASE}002028.mp3` },
      { text: "مَنثُورًا", ref: "الفرقان 25:23", note: "نون + ثاء", audio: `${AUDIO_BASE}025023.mp3` },
      { text: "وَيَنصُرْكُمْ", ref: "التوبة 9:14", note: "نون + صاد", audio: `${AUDIO_BASE}009014.mp3` },
    ],
  },
  {
    title: "القلقلة",
    subtitle: "قلقلة",
    description: "حروف القلقلة إذا سكنت يهتز الصوت عندها، ولا يميل للفتح ولا للكسر. تكون كبرى عند الوقف وصغرى وسط الكلمة.",
    letters: ["ق", "ط", "ب", "ج", "د"],
    mnemonic: "قُطْبُ جَدٍّ",
    mnemonicMeaning: "خمسة أحرف تقلقل إذا سكنت",
    tone: { border: "border-rose-200", surface: "bg-rose-50", badge: "bg-rose-600", text: "text-rose-800" },
    examples: [
      { text: "قَدْ تَّبَيَّنَ", ref: "البقرة 2:256", note: "دال ساكنة — قلقلة صغرى", audio: `${AUDIO_BASE}002256.mp3` },
      { text: "قُلْ أَعُوذُ بِرَبِّ الفَلَقِ", ref: "الفلق 113:1", note: "قاف مقلقلة كبرى عند الوقف", audio: `${AUDIO_BASE}113001.mp3` },
      { text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", ref: "الإخلاص 112:3", note: "دال مقلقلة", audio: `${AUDIO_BASE}112003.mp3` },
    ],
  },
  {
    title: "الاستعلاء والتفخيم",
    subtitle: "تفخيم",
    description: "حروف الاستعلاء تفخم دائماً لأنها تخرج بارتفاع اللسان إلى الحنك الأعلى. للراء واللام أحوال تفخيم وترقيق.",
    letters: ["خ", "ص", "ض", "غ", "ط", "ق", "ظ"],
    mnemonic: "خُصَّ ضَغْطٍ قِظْ",
    mnemonicMeaning: "سبعة أحرف مستعلية مفخمة",
    tone: { border: "border-yellow-200", surface: "bg-yellow-50", badge: "bg-yellow-700", text: "text-yellow-900" },
    examples: [
      { text: "قَالَ إِنِّي أَعْلَمُ", ref: "البقرة 2:30", note: "قاف مفخمة — استعلاء", audio: `${AUDIO_BASE}002030.mp3` },
      { text: "صِرَاطَ الَّذِينَ", ref: "الفاتحة 1:6", note: "صاد مفخمة", audio: `${AUDIO_BASE}001006.mp3` },
      { text: "غَيْرِ الْمَغْضُوبِ", ref: "الفاتحة 1:7", note: "غين وضاد مفخمتان", audio: `${AUDIO_BASE}001007.mp3` },
    ],
  },
  {
    title: "الهمس",
    subtitle: "همس",
    description: "الهمس هو جريان النفس عند النطق بالحرف لضعف الاعتماد على المخرج، ويظهر أوضح ما يكون عند سكون الحرف.",
    letters: ["ف", "ح", "ث", "هـ", "ش", "خ", "ص", "س", "ك", "ت"],
    mnemonic: "فَحَثَّهُ شَخْصٌ سَكَتَ",
    mnemonicMeaning: "عشرة أحرف يجري فيها النفس عند السكون",
    tone: { border: "border-slate-200", surface: "bg-slate-50", badge: "bg-slate-600", text: "text-slate-800" },
    examples: [
      { text: "ٱهْدِنَا الصِّرَاطَ", ref: "الفاتحة 1:6", note: "هاء مهموسة", audio: `${AUDIO_BASE}001006.mp3` },
      { text: "قَدْ أَفْلَحَ مَن زَكَّاهَا", ref: "الشمس 91:9", note: "حاء وفاء مهموستان", audio: `${AUDIO_BASE}091009.mp3` },
      { text: "وَالْعَادِيَاتِ ضَبْحًا", ref: "العاديات 100:1", note: "حاء مهموسة عند الوقف", audio: `${AUDIO_BASE}100001.mp3` },
    ],
  },
];

function AudioExample({ example }: { example: Example }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-[#fcfaf6] p-4 transition hover:border-emerald-300 hover:bg-white">
      <div className="quran text-xl font-bold leading-[1.9] text-zinc-900">{example.text}</div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-zinc-600">{example.ref}</span>
        <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-white">{example.note}</span>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <audio controls preload="none" className="h-9 w-full" src={example.audio} />
        <a
          href={example.audio}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-900 px-3 py-2 text-xs font-bold text-zinc-900 transition hover:bg-zinc-900 hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          فتح رابط التلاوة
        </a>
      </div>
    </article>
  );
}

export default function TajweedPage() {
  const [, navigate] = useLocation();
  const [selectedRule, setSelectedRule] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#faf6ed] text-zinc-900" dir="rtl">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8">
        <header className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_8px_40px_-16px_rgba(0,0,0,0.12)]">
          <div className="p-6 md:p-9">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => navigate("/quran")}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-2 text-sm text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900"
              >
                <ChevronLeft className="h-4 w-4" />
                العودة إلى القرآن
              </button>
              <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-bold text-amber-100">
                <Sparkles className="h-3.5 w-3.5" />
                مرجع عملي للتجويد
              </span>
            </div>
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                <BookOpen className="h-7 w-7" />
              </div>
              <div>
                <h1 className="quran text-3xl font-bold leading-tight text-zinc-900 md:text-5xl">
                  مرجع التجويد المصوّر
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 md:text-base">
                  موسوعة مبسطة لأحكام التجويد مع حروف كل حكم، العبارات الضابطة، وأمثلة صوتية حقيقية بصوت الشيخ مشاري العفاسي.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950 md:grid-cols-[auto_1fr] md:items-center">
              <div className="inline-flex items-center gap-2 font-bold">
                <Headphones className="h-5 w-5" />
                استمع وطبّق
              </div>
              <p>كل مثال يحتوي على مشغل صوتي ورابط مباشر للمقطع من EveryAyah. استخدم المشغل للمقارنة بين القاعدة والتلاوة.</p>
            </div>
          </div>
        </header>

        <main className="mt-6">
          <div className="mb-5 flex flex-wrap gap-2">
            {RULES.map((rule, index) => (
              <button
                key={rule.title}
                onClick={() => setSelectedRule(selectedRule === index ? null : index)}
                className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                  selectedRule === index
                    ? `${rule.tone.badge} border-transparent text-white`
                    : `${rule.tone.surface} ${rule.tone.border} ${rule.tone.text} hover:brightness-95`
                }`}
              >
                {rule.title}
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {RULES.map((rule, index) => {
              if (selectedRule !== null && selectedRule !== index) return null;
              return (
                <section key={rule.title} className={`rounded-[24px] border ${rule.tone.border} bg-white p-5 shadow-sm md:p-6`}>
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold text-white ${rule.tone.badge}`}>
                          {index + 1}
                        </span>
                        <h2 className="quran text-2xl font-bold text-zinc-900">{rule.title}</h2>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${rule.tone.surface} ${rule.tone.text}`}>
                          {rule.subtitle}
                        </span>
                      </div>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">{rule.description}</p>
                    </div>
                    <div className={`shrink-0 rounded-2xl border ${rule.tone.border} ${rule.tone.surface} p-4 lg:min-w-[260px]`}>
                      <div className="mb-2 text-xs font-bold text-zinc-500">الحروف</div>
                      <div className="flex flex-wrap gap-2">
                        {rule.letters.map(letter => (
                          <span key={letter} className={`quran grid h-9 min-w-9 place-items-center rounded-lg bg-white px-2 text-lg font-bold shadow-sm ${rule.tone.text}`}>
                            {letter}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-zinc-200 bg-[#faf8f3] p-4">
                    <div className="mb-1 text-xs font-bold text-zinc-500">العبارة الضابطة</div>
                    <div className="quran text-lg font-bold leading-8 text-zinc-900">{rule.mnemonic}</div>
                    <div className="mt-1 text-xs text-zinc-600">{rule.mnemonicMeaning}</div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-700">
                      <Headphones className="h-4 w-4 text-emerald-600" />
                      أمثلة تطبيقية مع التلاوة
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {rule.examples.map(example => (
                        <AudioExample key={`${rule.title}-${example.ref}`} example={example} />
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </main>

        <footer className="py-8 text-center text-xs leading-6 text-zinc-500">
          مصدر التلاوات: EveryAyah — رواية حفص عن عاصم، بصوت الشيخ مشاري العفاسي.
        </footer>
      </div>
    </div>
  );
}