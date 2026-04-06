import { BookOpen, Heart, Briefcase, Sparkles, Mic, Moon } from "lucide-react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [, navigate] = useLocation();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح النور" : hour < 17 ? "مساء الخير" : "مساء النور";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container flex flex-row-reverse items-center justify-between h-16">
          <div className="text-2xl font-bold text-primary">أنا مسلم</div>
          <div className="text-sm text-muted-foreground">{greeting} 🌙</div>
        </div>
      </header>

      <main className="container py-10">
        <div className="text-center mb-14">
          <div
            className="verse-display text-primary mb-4"
            style={{ fontSize: "1.75rem", lineHeight: "2.8", letterSpacing: "0.05em", fontFamily: "'Amiri', serif" }}
            dir="rtl"
          >
            قل إن صلاتي ونسكي ومحياي ومماتي لله رب العالمين
          </div>
          <p className="text-muted-foreground text-lg mt-2">الأنعام - الآية 162</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <GatewayCard
            title="رفيقي الروحي"
            subtitle="AI Companion — Noura & Hayat"
            description="حوار إسلامي ذكي مع نورا ذاكرة المعرفة وحياة دليلة الروح"
            icon={<Heart className="w-8 h-8" />}
            color="from-pink-500 to-rose-600"
            onClick={() => navigate("/companion")}
            featured
            badge="نورا + حياة ✨"
          />
          <GatewayCard
            title="قراني"
            subtitle="Quranic Learning"
            description="تلاوتي وحفظي وتطبيقي للقرآن الكريم"
            icon={<BookOpen className="w-8 h-8" />}
            color="from-blue-500 to-blue-600"
            onClick={() => navigate("/quran")}
          />
          <GatewayCard
            title="ورد وتسميع"
            subtitle="Wird & Memorization"
            description="تسميع ذكي لحفظ القرآن بتقييم دقيق للتشكيل والنطق بالذكاء الاصطناعي"
            icon={<Mic className="w-8 h-8" />}
            color="from-emerald-500 to-teal-600"
            onClick={() => navigate("/wird")}
            badge="Mistral AI"
          />
          <GatewayCard
            title="أذكاري"
            subtitle="Daily Adhkar & Tasbih"
            description="أذكار الصباح والمساء مع مسبحة رقمية وتتبع يومي"
            icon={<Moon className="w-8 h-8" />}
            color="from-amber-500 to-orange-600"
            onClick={() => navigate("/adhkar")}
          />
          <GatewayCard
            title="جنتي"
            subtitle="My Paradise"
            description="بستاني وقصري وحسناتي وسيئاتي"
            icon={<Sparkles className="w-8 h-8" />}
            color="from-green-500 to-green-600"
            onClick={() => navigate("/paradise")}
          />
          <GatewayCard
            title="سنة رسولي"
            subtitle="Prophetic Tradition"
            description="أحاديث نبوية مختارة مع التفسير والتطبيق"
            icon={<Heart className="w-8 h-8" />}
            color="from-rose-500 to-rose-600"
            onClick={() => navigate("/sunnah")}
          />
          <GatewayCard
            title="دنيتي"
            subtitle="My World"
            description="عملي وأسرتي وجاري وأخلاقي"
            icon={<Briefcase className="w-8 h-8" />}
            color="from-slate-500 to-slate-600"
            onClick={() => {}}
            comingSoon
          />
        </div>

        <div
          className="text-center py-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20"
          dir="rtl"
        >
          <div className="text-4xl mb-4">🌿</div>
          <h2 className="text-3xl font-bold mb-4">ابدأ رحلتك الروحية</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
            تحدث مع نورا أو حياة، سمّع وردك اليومي، وأتم أذكارك — كل ذلك في مكان واحد
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate("/companion")}
              className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              تحدث مع حياة 🌿
            </button>
            <button
              onClick={() => navigate("/wird")}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              ابدأ وردك اليومي 🎙️
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

interface GatewayCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  featured?: boolean;
  badge?: string;
  comingSoon?: boolean;
}

function GatewayCard({ title, subtitle, description, icon, color, onClick, featured, badge, comingSoon }: GatewayCardProps) {
  return (
    <Card
      className={`islamic-card cursor-pointer transition-all hover:scale-105 hover:shadow-lg relative ${
        featured ? "ring-2 ring-pink-400/50" : ""
      } ${comingSoon ? "opacity-60" : ""}`}
      onClick={onClick}
    >
      {comingSoon && (
        <div className="absolute top-3 left-3 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
          قريباً
        </div>
      )}
      <div className={`bg-gradient-to-br ${color} rounded-lg p-4 mb-4 w-fit`}>
        <div className="text-white">{icon}</div>
      </div>
      <div dir="rtl">
        <h3 className="text-2xl font-bold text-primary mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{subtitle}</p>
        <p className="text-sm text-foreground">{description}</p>
        {badge && (
          <span className="inline-block mt-3 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
    </Card>
  );
}
