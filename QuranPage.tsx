import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Bookmark, Zap } from "lucide-react";

export default function QuranPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-to-r from-blue-500/10 to-blue-600/10">
        <div className="container py-8">
          <h1 className="text-4xl font-bold text-primary mb-2">قراني</h1>
          <p className="text-lg text-muted-foreground">
            رحلتك مع القرآن الكريم والعلم والعمل
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <Tabs defaultValue="wird" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="wird" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              تلاوتي
            </TabsTrigger>
            <TabsTrigger value="memorization" className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              حفظي
            </TabsTrigger>
            <TabsTrigger value="application" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              عملي
            </TabsTrigger>
          </TabsList>

          {/* تلاوتي - Daily Recitation */}
          <TabsContent value="wird">
            <div className="space-y-6">
              {/* Today's Verses */}
              <Card className="islamic-card">
                <h2 className="text-2xl font-bold text-primary mb-6">الورد اليومي</h2>

                {/* Verse Display */}
                <div className="islamic-card" style={{
                  fontFamily: "'Amiri', serif",
                  fontSize: "1.75rem",
                  lineHeight: "2.8",
                  textAlign: "center",
                  letterSpacing: "0.05em",
                  background: "linear-gradient(to bottom, hsl(var(--primary) / 0.05), hsl(var(--accent) / 0.05))",
                  padding: "2rem",
                  marginBottom: "2rem",
                  borderRight: "4px solid hsl(var(--primary))"
                }}>
                  بسم الله الرحمن الرحيم
                  <br />
                  الحمد لله رب العالمين
                </div>

                {/* Four Dimensions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* التلقي - Reception */}
                  <DimensionCard
                    title="التلقي"
                    subtitle="Reception"
                    description="فهم الآيات وتدبرها"
                    content="اقرأ الآيات بتمعن وتدبر معانيها. ما هو المقصد الأساسي من هذه الآيات؟"
                    color="from-blue-500 to-blue-600"
                  />

                  {/* القدوة - Role Model */}
                  <DimensionCard
                    title="القدوة"
                    subtitle="Role Model"
                    description="ربط الآيات بسيرة النبي ﷺ"
                    content="كيف طبق النبي ﷺ هذه الآيات؟ ما هي دروسه العملية؟"
                    color="from-rose-500 to-rose-600"
                  />

                  {/* التطبيق - Application */}
                  <DimensionCard
                    title="التطبيق"
                    subtitle="Application"
                    description="الواجب العملي من الآيات"
                    content="ما هو الواجب العملي الذي تستخلصه من هذه الآيات؟"
                    color="from-amber-500 to-amber-600"
                  />

                  {/* الأثر - Impact */}
                  <DimensionCard
                    title="الأثر"
                    subtitle="Impact"
                    description="تأثير الآيات على النفس"
                    content="كيف تؤثر هذه الآيات على روحك وقلبك؟ ما هو شعورك؟"
                    color="from-green-500 to-green-600"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row-reverse gap-4 mt-8">
                  <Button className="flex-1">حفظ التقدم</Button>
                  <Button variant="outline" className="flex-1">
                    الآية التالية
                  </Button>
                </div>
              </Card>

              {/* Related Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RelatedCard
                  title="التفسير"
                  content="تفسير ابن كثير والسعدي وغيرهما"
                />
                <RelatedCard
                  title="السيرة النبوية"
                  content="قصص من الرحيق المختوم وسيرة النبي ﷺ"
                />
                <RelatedCard
                  title="الأحاديث الصحيحة"
                  content="أحاديث من الصحيحين تتعلق بالآيات"
                />
              </div>
            </div>
          </TabsContent>

          {/* حفظي - Memorization */}
          <TabsContent value="memorization">
            <Card className="islamic-card">
              <h2 className="text-2xl font-bold text-primary mb-6">حفظي</h2>
              <p className="text-muted-foreground mb-6">
                تتبع تقدمك في حفظ القرآن الكريم وتقييم جودة الحفظ والترتيل
              </p>

              {/* Memorization Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard label="الآيات المحفوظة" value="45" unit="آية" />
                <StatCard label="جودة الحفظ" value="92" unit="%" />
                <StatCard label="جودة الترتيل" value="88" unit="%" />
              </div>

              <Button className="w-full">تسجيل تلاوة جديدة</Button>
            </Card>
          </TabsContent>

          {/* عملي - Application */}
          <TabsContent value="application">
            <Card className="islamic-card">
              <h2 className="text-2xl font-bold text-primary mb-6">عملي ومعاشي</h2>
              <p className="text-muted-foreground mb-6">
                ربط آيات القرآن بحياتك اليومية والعملية
              </p>

              <div className="space-y-4">
                <ApplicationItem
                  title="العمل والإتقان"
                  description="تطبيق قيم القرآن في عملك اليومي"
                />
                <ApplicationItem
                  title="الأسرة والأقارب"
                  description="صلة الرحم والعطف على الوالدين"
                />
                <ApplicationItem
                  title="حسن الجوار"
                  description="التعامل الطيب مع الجيران"
                />
                <ApplicationItem
                  title="الأخلاق والمعاملات"
                  description="الصدق والأمانة والعدل"
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

interface DimensionCardProps {
  title: string;
  subtitle: string;
  description: string;
  content: string;
  color: string;
}

function DimensionCard({
  title,
  subtitle,
  description,
  content,
  color,
}: DimensionCardProps) {
  return (
    <div className="islamic-card">
      <div className={`bg-gradient-to-br ${color} rounded-lg p-3 mb-4 w-fit`}>
        <div className="text-white font-bold text-lg">{title}</div>
      </div>
      <h3 className="text-lg font-bold text-primary mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{subtitle}</p>
      <p className="text-sm font-semibold text-foreground mb-3">{description}</p>
      <p className="text-sm text-muted-foreground">{content}</p>
      <textarea
        placeholder="اكتب ملاحظاتك هنا..."
        className="w-full mt-4 p-3 rounded border border-border bg-background text-foreground text-sm"
        rows={3}
      />
    </div>
  );
}

interface RelatedCardProps {
  title: string;
  content: string;
}

function RelatedCard({ title, content }: RelatedCardProps) {
  return (
    <Card className="islamic-card">
      <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{content}</p>
      <Button variant="outline" size="sm" className="w-full">
        اقرأ المزيد
      </Button>
    </Card>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
}

function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div className="indicator-card">
      <p className="indicator-label">{label}</p>
      <div className="indicator-value">{value}</div>
      <p className="text-sm text-muted-foreground">{unit}</p>
    </div>
  );
}

interface ApplicationItemProps {
  title: string;
  description: string;
}

function ApplicationItem({ title, description }: ApplicationItemProps) {
  return (
    <div className="p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
      <h3 className="font-bold text-primary mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
