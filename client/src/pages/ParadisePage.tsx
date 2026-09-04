import { useLocation } from "wouter";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ParadisePage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50 py-4">
        <div className="container flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground">
            ← رجوع
          </button>
          <div className="flex items-center gap-2 text-right">
            <h1 className="text-xl font-bold text-primary">جنتي</h1>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8" dir="rtl">
        <div className="islamic-card text-center mb-10 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-xl p-8 border border-green-500/20">
          <div className="text-6xl mb-4">🏡</div>
          <h2 className="text-2xl font-bold text-primary mb-2">قصرك في الجنة</h2>
          <p className="text-muted-foreground">ابنِ قصرك من خلال أعمالك الصالحة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "الحسنات", value: "0", icon: "✨", color: "green", desc: "نقاط مكتسبة" },
            { label: "السيئات", value: "0", icon: "⚠️", color: "red", desc: "نقاط مفقودة" },
            { label: "مستوى القصر", value: "1", icon: "🏰", color: "amber", desc: "المستوى الحالي" },
          ].map((stat) => (
            <Card key={stat.label} className="islamic-card text-center">
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className={`text-4xl font-bold text-${stat.color}-600 mb-1`}>{stat.value}</div>
              <div className="font-semibold text-primary">{stat.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.desc}</div>
            </Card>
          ))}
        </div>

        <Card className="islamic-card mb-6">
          <h2 className="text-xl font-bold mb-4">مؤشرات الأداء الروحي</h2>
          <div className="space-y-4">
            {[
              { name: "الصلاة", current: 0, target: 5, icon: "🕌" },
              { name: "القرآن", current: 0, target: 10, icon: "📖" },
              { name: "الذكر", current: 0, target: 100, icon: "📿" },
              { name: "التصدق", current: 0, target: 1, icon: "🤲" },
            ].map((kpi) => (
              <div key={kpi.name} className="flex items-center gap-3">
                <span className="text-2xl">{kpi.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{kpi.name}</span>
                    <span className="text-xs text-muted-foreground">{kpi.current}/{kpi.target}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
