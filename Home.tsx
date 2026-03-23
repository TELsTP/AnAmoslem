import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, BookOpen, Heart, Briefcase, Sparkles } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-12 h-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container flex flex-row-reverse items-center justify-between h-16">
          <div className="text-2xl font-bold text-primary">أنا مسلم</div>
          {isAuthenticated ? (
            <div className="flex flex-row-reverse items-center gap-4">
              <span className="text-sm text-muted-foreground">{user?.name}</span>
            </div>
          ) : (
            <Button asChild>
              <a href={getLoginUrl()}>دخول</a>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {/* Central Verse */}
        <div className="text-center mb-16">
          <div className="verse-display" style={{
            fontFamily: "'Amiri', serif",
            fontSize: "1.75rem",
            lineHeight: "2.8",
            textAlign: "center",
            letterSpacing: "0.05em"
          }}>
            قل إن صلاتي ونسكي ومحياي ومماتي لله رب العالمين
          </div>
          <p className="text-muted-foreground text-lg mt-6">
            الأنعام - الآية 162
          </p>
        </div>

        {/* Welcome Message */}
        {isAuthenticated && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              أهلاً وسهلاً يا {user?.name}
            </h1>
            <p className="text-xl text-muted-foreground">
              رفيقك في رحلة التعلم الإسلامي والنمو الروحي
            </p>
          </div>
        )}

        {/* Main Gateways */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* قراني - Quranic Section */}
          <GatewayCard
            title="قراني"
            subtitle="Quranic Learning"
            description="تلاوتي وحفظي وتطبيقي للقرآن الكريم"
            icon={<BookOpen className="w-8 h-8" />}
            color="from-blue-500 to-blue-600"
            onClick={() => isAuthenticated && navigate("/quran")}
            disabled={!isAuthenticated}
          />

          {/* سنة رسولي - Prophetic Tradition */}
          <GatewayCard
            title="سنة رسولي"
            subtitle="Prophetic Tradition"
            description="قدوتي وأخلاقي ونفسيتي وإيماني"
            icon={<Heart className="w-8 h-8" />}
            color="from-rose-500 to-rose-600"
            onClick={() => isAuthenticated && navigate("/sunnah")}
            disabled={!isAuthenticated}
          />

          {/* دنيتي - Worldly Life */}
          <GatewayCard
            title="دنيتي"
            subtitle="My World"
            description="عملي وأسرتي وجاري وأخلاقي"
            icon={<Briefcase className="w-8 h-8" />}
            color="from-amber-500 to-amber-600"
            onClick={() => isAuthenticated && navigate("/worldly")}
            disabled={!isAuthenticated}
          />

          {/* جنتي - Paradise */}
          <GatewayCard
            title="جنتي"
            subtitle="My Paradise"
            description="بستاني وقصري وحسناتي وسيئاتي"
            icon={<Sparkles className="w-8 h-8" />}
            color="from-green-500 to-green-600"
            onClick={() => isAuthenticated && navigate("/paradise")}
            disabled={!isAuthenticated}
          />

          {/* رفيقي الروحي - AI Companion */}
          <GatewayCard
            title="رفيقي الروحي"
            subtitle="AI Companion"
            description="حوار وتوجيه إسلامي ذكي"
            icon={<Heart className="w-8 h-8" />}
            color="from-pink-500 to-rose-600"
            onClick={() => isAuthenticated && navigate("/companion")}
            disabled={!isAuthenticated}
          />
        </div>

        {/* Call to Action */}
        {!isAuthenticated && (
          <div className="text-center py-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <h2 className="text-3xl font-bold mb-4">ابدأ رحلتك معنا</h2>
            <p className="text-lg text-muted-foreground mb-8">
              انضم إلى مجتمع المسلمين الذين يسعون لحياة إسلامية قويمة
            </p>
            <Button size="lg" asChild className="text-lg">
              <a href={getLoginUrl()}>دخول الآن</a>
            </Button>
          </div>
        )}

        {/* Features Overview */}
        {isAuthenticated && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-12">المميزات الرئيسية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                title="الورد اليومي"
                description="منهجية العشر آيات مع التلقي والقدوة والتطبيق والأثر"
              />
              <FeatureCard
                title="مؤشرات الأداء"
                description="تتبع حسناتك وسيئاتك وتقدمك الروحي يومياً"
              />
              <FeatureCard
                title="بستان الجنة"
                description="بناء قصرك في الجنة من خلال أعمالك الصالحة"
              />
              <FeatureCard
                title="الرفيق الذكي"
                description="مساعد ذكي يستمد إجاباته من المراجع الإسلامية المعتمدة"
              />
              <FeatureCard
                title="التذكيرات اليومية"
                description="تذكيرات للورد والأذكار والواجبات العملية"
              />
              <FeatureCard
                title="إحصائيات شاملة"
                description="تحليل تقدمك الشهري والسنوي والموسمي"
              />
            </div>
          </div>
        )}
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
  disabled?: boolean;
}

function GatewayCard({
  title,
  subtitle,
  description,
  icon,
  color,
  onClick,
  disabled,
}: GatewayCardProps) {
  return (
    <Card
      className={`islamic-card cursor-pointer transition-all hover:scale-105 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={onClick}
    >
      <div className={`bg-gradient-to-br ${color} rounded-lg p-4 mb-4 w-fit`}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-2xl font-bold text-primary mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{subtitle}</p>
      <p className="text-sm text-foreground">{description}</p>
    </Card>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <Card className="islamic-card">
      <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  );
}
