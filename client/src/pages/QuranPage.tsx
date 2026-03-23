import { useLocation } from "wouter";
import { BookOpen, Star, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function QuranPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50 py-4">
        <div className="container flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground">
            ← رجوع
          </button>
          <div className="flex items-center gap-2 text-right">
            <h1 className="text-xl font-bold text-primary">قراني</h1>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8" dir="rtl">
        <div className="text-center mb-10 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl p-8 border border-blue-500/20">
          <div className="verse-display text-2xl text-primary mb-4">
            إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ
          </div>
          <p className="text-muted-foreground">الإسراء - الآية 9</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="islamic-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold">ورد اليوم</h2>
            </div>
            <p className="text-muted-foreground mb-4">الجزء الأول - سورة البقرة (الآيات 1-10)</p>
            <div className="space-y-2">
              {["التلاوة", "التدبر", "الحفظ"].map((item) => (
                <div key={item} className="flex items-center justify-between bg-muted/50 rounded-lg p-2">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="islamic-card">
            <h2 className="text-xl font-bold mb-4">إحصائيات الحفظ</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "آيات محفوظة", value: "0", color: "text-blue-600" },
                { label: "سور مكتملة", value: "0", color: "text-green-600" },
                { label: "أيام متتالية", value: "0", color: "text-amber-600" },
                { label: "ختمات", value: "0", color: "text-rose-600" },
              ].map((stat) => (
                <div key={stat.label} className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="islamic-card">
          <h2 className="text-xl font-bold mb-4">الأبعاد الأربعة للورد</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "التلقي", desc: "استقبال الآية وفهم معناها", icon: "📖" },
              { title: "القدوة", desc: "ربط الآية بسيرة النبي ﷺ", icon: "🌟" },
              { title: "التطبيق", desc: "تحديد عمل ملموس من الآية", icon: "✅" },
              { title: "الأثر", desc: "قياس تأثير الآية على النفس", icon: "💎" },
            ].map((dim) => (
              <div key={dim.title} className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg p-4 border border-blue-500/20">
                <div className="text-3xl mb-2">{dim.icon}</div>
                <h3 className="font-bold text-primary mb-1">{dim.title}</h3>
                <p className="text-xs text-muted-foreground">{dim.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
