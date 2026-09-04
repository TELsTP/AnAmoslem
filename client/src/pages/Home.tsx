import { ArrowUpLeft, BookOpen, Heart, Sparkles, Mic, Moon } from "lucide-react";
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
          <div className="mb-4 text-sm text-muted-foreground">
            تجربة روحية غير مميزة مع صلاحيات تُطلب عند الحاجة فقط
          </div>
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
            description="مساحة حوار هادئة تجمع ذاكرة نورا وبصيرة حياة في لحظتك اليومية"
            icon={<Heart className="w-8 h-8" />}
            image="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85"
            visualCue="جلسة تأملية"
            onClick={() => navigate("/companion")}
            featured
            badge="نورا + حياة"
          />
          <GatewayCard
            title="قراني"
            subtitle="Quranic Learning"
            description="تلاوة مركّزة، حفظ متدرّج، ومساحة تربط الآية بتطبيقها"
            icon={<BookOpen className="w-8 h-8" />}
            image="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85"
            visualCue="ضوء المعرفة"
            onClick={() => navigate("/quran")}
          />
          <GatewayCard
            title="ورد وتسميع"
            subtitle="Wird & Memorization"
            description="تدرّب بصوتك، راقب تقدّمك، وابنِ عادة تسميع ثابتة بلا تشتيت"
            icon={<Mic className="w-8 h-8" />}
            image="https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=85"
            visualCue="إيقاع يومي"
            onClick={() => navigate("/wird")}
            badge="التقييم الذكي متوقف حالياً"
          />
          <GatewayCard
            title="أذكاري"
            subtitle="Daily Adhkar & Tasbih"
            description="روتين صباحي ومسائي واضح مع مسبحة رقمية وإشارة تقدّم فورية"
            icon={<Moon className="w-8 h-8" />}
            image="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=85"
            visualCue="هدوء متصل"
            onClick={() => navigate("/adhkar")}
          />
          <GatewayCard
            title="جنتي"
            subtitle="My Paradise"
            description="لوحة شخصية تحوّل الأعمال الصغيرة إلى أثر مرئي في رحلتك"
            icon={<Sparkles className="w-8 h-8" />}
            image="https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=85"
            visualCue="أثر يتنامى"
            onClick={() => navigate("/paradise")}
          />
          <GatewayCard
            title="سنة رسولي"
            subtitle="Prophetic Tradition"
            description="حديث موثوق يُقرأ بفهم، ثم يتحول إلى معنى قريب من حياتك"
            icon={<Heart className="w-8 h-8" />}
            image="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&q=85"
            visualCue="حكمة قريبة"
            onClick={() => navigate("/sunnah")}
          />
          <GatewayCard
            title="المكتبة"
            subtitle="Islamic Library"
            description="مراجع مرتّبة وشروح قابلة للبحث لتبقى رحلة التعلّم في متناولك"
            icon={<BookOpen className="w-8 h-8" />}
            image="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=85"
            visualCue="رفوف مفتوحة"
            onClick={() => navigate("/library")}
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
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              تحدث مع حياة 🌿
            </button>
            <button
              onClick={() => navigate("/login")}
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
  image: string;
  visualCue: string;
  onClick: () => void;
  featured?: boolean;
  badge?: string;
  comingSoon?: boolean;
}

function GatewayCard({ title, subtitle, description, icon, image, visualCue, onClick, featured, badge, comingSoon }: GatewayCardProps) {
  return (
    <Card
      className={`photo-card stagger-reveal cursor-pointer p-0 ${
        featured ? "ring-2 ring-pink-400/50" : ""
      } ${comingSoon ? "opacity-60" : ""}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      style={{ "--card-image": `url("${image}")` } as React.CSSProperties}
    >
      <div className="photo-card__content p-6" dir="rtl">
        <div className="flex items-center justify-between gap-3 mb-5">
          <span className="photo-card__cue">
            <span className="text-sm">{icon}</span>
            {visualCue}
          </span>
          <span className="photo-card__arrow" aria-hidden="true">
            <ArrowUpLeft className="w-4 h-4" />
          </span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
        <p className="text-sm text-cyan-50/75 mb-3">{subtitle}</p>
        <p className="text-sm leading-7 text-white/90">{description}</p>
        {badge && <span className="mt-4 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/85 backdrop-blur">{badge}</span>}
      </div>
    </Card>
  );
}
