import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { BookOpen, Search, ChevronLeft, Bookmark, Layers, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";

type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  description: string;
  tags: string[];
  sample: string;
  status: "متاح" | "قيد الإضافة";
};

const BOOKS: Book[] = [
  { id: 1, title: "الرحيق المختوم", author: "صفي الرحمن المباركفوري", category: "السيرة", description: "مرجع سيرة نبويّة شامل وميسّر.", tags: ["سيرة", "نبوة", "مرجع"], sample: "هذا الكتاب أصلٌ مهم في السيرة.", status: "متاح" },
  { id: 2, title: "زاد المعاد", author: "ابن القيم", category: "السيرة", description: "فقه السيرة والهدى النبوي.", tags: ["فقه", "سيرة", "تربية"], sample: "جمع بين العلم والعمل والهدي.", status: "متاح" },
  { id: 3, title: "فتح الباري", author: "ابن حجر", category: "الحديث", description: "شرح صحيح البخاري من أهم الشروح.", tags: ["حديث", "شرح", "بخاري"], sample: "مرجع أصيل لفهم الأحاديث.", status: "متاح" },
  { id: 4, title: "صحيح البخاري", author: "الإمام البخاري", category: "الحديث", description: "أصح كتاب بعد كتاب الله.", tags: ["حديث", "أصول", "صحة"], sample: "أحاديث مختارة في الإيمان والفقه.", status: "متاح" },
  { id: 5, title: "تفسير الطبري", author: "الطبري", category: "التفسير", description: "من أوائل وأوسع كتب التفسير.", tags: ["تفسير", "أثر", "لغة"], sample: "يفيد في فهم أسباب النزول والمعاني.", status: "قيد الإضافة" },
  { id: 6, title: "تفسير ابن كثير", author: "ابن كثير", category: "التفسير", description: "تفسير واسع الانتشار وميسّر.", tags: ["تفسير", "آثار", "آيات"], sample: "مناسب لبناء المكتبة التعليمية.", status: "قيد الإضافة" },
];

const CATEGORIES = ["الكل", "السيرة", "الحديث", "التفسير"];

export default function LibraryPage() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("الكل");

  const filtered = useMemo(() => {
    return BOOKS.filter((book) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.description.toLowerCase().includes(q) ||
        book.tags.some((t) => t.toLowerCase().includes(q));
      const matchesCategory = category === "الكل" || book.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background" dir="rtl">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" />
            <span>رجوع</span>
          </button>
          <div className="text-center">
            <div className="text-xl font-bold text-primary">المكتبة الإسلامية الشاملة</div>
            <div className="text-xs text-muted-foreground">سيرة • حديث • تفسير • مرجعيات</div>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-2 text-primary"><BookOpen className="w-5 h-5" /> <span className="font-bold">مكتبة منظمة</span></div>
            <p className="text-sm text-muted-foreground">فهرس كتب مع تصنيف ومؤلف وملخص.</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-2 text-primary"><Layers className="w-5 h-5" /> <span className="font-bold">قابل للتوسعة</span></div>
            <p className="text-sm text-muted-foreground">جاهزة لإضافة آلاف الكتب والمراجع لاحقاً.</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-2 text-primary"><Bookmark className="w-5 h-5" /> <span className="font-bold">مراجع أساسية</span></div>
            <p className="text-sm text-muted-foreground">بدأنا بالرحيق المختوم وصحيح البخاري والتفاسير.</p>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في المكتبة..."
              className="w-full bg-white border border-border rounded-xl py-3 pr-9 pl-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-sm border transition ${
                  category === c ? "bg-primary text-white border-primary" : "bg-white border-border text-muted-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((book) => (
            <Card key={book.id} className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="text-lg font-bold text-primary">{book.title}</div>
                  <div className="text-sm text-muted-foreground">{book.author}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${book.status === "متاح" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {book.status}
                </span>
              </div>
              <p className="text-sm text-foreground mb-4">{book.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {book.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-sm text-foreground flex gap-2">
                <Quote className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span>{book.sample}</span>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            لا توجد نتائج مطابقة الآن
          </div>
        )}
      </main>
    </div>
  );
}