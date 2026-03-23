import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Zap, TrendingUp, Award } from "lucide-react";

export default function ParadisePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-to-r from-green-500/10 to-emerald-600/10">
        <div className="container py-8">
          <h1 className="text-4xl font-bold text-primary mb-2">جنتي</h1>
          <p className="text-lg text-muted-foreground">
            بستاني وقصري وحسناتي وسيئاتي
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <Tabs defaultValue="garden" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="garden" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              البستان
            </TabsTrigger>
            <TabsTrigger value="indicators" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              المؤشرات
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              الإحصائيات
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              الرصيد
            </TabsTrigger>
          </TabsList>

          {/* البستان - Paradise Garden */}
          <TabsContent value="garden">
            <div className="space-y-6">
              {/* Paradise Visual */}
              <Card className="islamic-card overflow-hidden">
                <h2 className="text-2xl font-bold text-primary mb-6">بستاني في الجنة</h2>

                {/* Visual Garden */}
                <div className="paradise-visual mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🏰</div>
                      <p className="text-2xl font-bold text-primary">قصري في الجنة</p>
                      <p className="text-muted-foreground mt-2">
                        مستوى البناء: 5 من 10
                      </p>
                    </div>
                  </div>
                </div>

                {/* Garden Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <GardenStatCard
                    title="إجمالي الحسنات"
                    value="1,245"
                    subtitle="حسنة"
                    color="from-green-500 to-emerald-600"
                  />
                  <GardenStatCard
                    title="إجمالي السيئات"
                    value="45"
                    subtitle="سيئة"
                    color="from-red-500 to-rose-600"
                  />
                </div>

                {/* Net Reward */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 text-center">
                  <p className="text-muted-foreground mb-2">الرصيد الصافي</p>
                  <p className="text-4xl font-bold text-primary">1,200</p>
                  <p className="text-muted-foreground mt-2">حسنة صافية</p>
                </div>
              </Card>

              {/* Garden Development */}
              <Card className="islamic-card">
                <h3 className="text-xl font-bold text-primary mb-6">تطور البستان</h3>
                <div className="space-y-4">
                  <DevelopmentItem
                    stage="المرحلة الأولى"
                    description="البذرة والنبات"
                    progress={100}
                  />
                  <DevelopmentItem
                    stage="المرحلة الثانية"
                    description="الأشجار والأزهار"
                    progress={75}
                  />
                  <DevelopmentItem
                    stage="المرحلة الثالثة"
                    description="الأنهار والعيون"
                    progress={40}
                  />
                  <DevelopmentItem
                    stage="المرحلة الرابعة"
                    description="القصر والحصن"
                    progress={50}
                  />
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* المؤشرات - Performance Indicators */}
          <TabsContent value="indicators">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-primary mb-6">مؤشرات الأداء اليومية</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <IndicatorCard
                  title="حسناتي"
                  value="12"
                  subtitle="حسنة اليوم"
                  color="from-green-500 to-emerald-600"
                  icon="✨"
                />
                <IndicatorCard
                  title="سيئاتي"
                  value="2"
                  subtitle="سيئة اليوم"
                  color="from-red-500 to-rose-600"
                  icon="⚠️"
                />
                <IndicatorCard
                  title="تلاوتي"
                  value="85"
                  subtitle="% من الورد"
                  color="from-blue-500 to-blue-600"
                  icon="📖"
                />
                <IndicatorCard
                  title="حفظي"
                  value="92"
                  subtitle="% جودة"
                  color="from-purple-500 to-purple-600"
                  icon="📚"
                />
                <IndicatorCard
                  title="نفسيتي"
                  value="88"
                  subtitle="% الخشوع"
                  color="from-pink-500 to-rose-600"
                  icon="💝"
                />
                <IndicatorCard
                  title="دنيتي"
                  value="90"
                  subtitle="% الإتقان"
                  color="from-amber-500 to-amber-600"
                  icon="💼"
                />
              </div>

              {/* Add Indicator */}
              <Card className="islamic-card">
                <h3 className="text-xl font-bold text-primary mb-4">تسجيل مؤشر جديد</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      نوع المؤشر
                    </label>
                    <select className="w-full p-2 rounded border border-border bg-background">
                      <option>حسنة</option>
                      <option>سيئة</option>
                      <option>عمل صالح</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      الوصف
                    </label>
                    <textarea
                      placeholder="صف العمل أو السلوك..."
                      className="w-full p-2 rounded border border-border bg-background"
                      rows={3}
                    />
                  </div>
                  <Button className="w-full">تسجيل</Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* الإحصائيات - Statistics */}
          <TabsContent value="stats">
            <Card className="islamic-card">
              <h2 className="text-2xl font-bold text-primary mb-6">إحصائيات الأداء</h2>

              <div className="space-y-8">
                <StatsPeriod
                  period="اليوم"
                  goodDeeds={12}
                  badDeeds={2}
                  netReward={10}
                />
                <StatsPeriod
                  period="هذا الأسبوع"
                  goodDeeds={78}
                  badDeeds={8}
                  netReward={70}
                />
                <StatsPeriod
                  period="هذا الشهر"
                  goodDeeds={312}
                  badDeeds={28}
                  netReward={284}
                />
                <StatsPeriod
                  period="هذا العام"
                  goodDeeds={1245}
                  badDeeds={45}
                  netReward={1200}
                />
              </div>
            </Card>
          </TabsContent>

          {/* الرصيد - Rewards */}
          <TabsContent value="rewards">
            <Card className="islamic-card">
              <h2 className="text-2xl font-bold text-primary mb-6">رصيد الحسنات</h2>

              <div className="space-y-6">
                {/* Total Balance */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 text-center">
                  <p className="text-muted-foreground mb-2">الرصيد الإجمالي</p>
                  <p className="text-5xl font-bold text-primary">1,200</p>
                  <p className="text-muted-foreground mt-2">حسنة صافية</p>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <RewardCard
                    title="الحسنات"
                    value="1,245"
                    color="from-green-500 to-emerald-600"
                  />
                  <RewardCard
                    title="السيئات"
                    value="45"
                    color="from-red-500 to-rose-600"
                  />
                </div>

                {/* Recent Activities */}
                <div>
                  <h3 className="text-lg font-bold text-primary mb-4">
                    آخر الأنشطة
                  </h3>
                  <div className="space-y-3">
                    <ActivityItem
                      action="صلاة الفجر في الجماعة"
                      reward="+5"
                      time="منذ ساعة"
                    />
                    <ActivityItem
                      action="تلاوة 10 آيات"
                      reward="+3"
                      time="منذ ساعتين"
                    />
                    <ActivityItem
                      action="صلة الرحم"
                      reward="+4"
                      time="منذ 3 ساعات"
                    />
                    <ActivityItem
                      action="كلمة غير لائقة"
                      reward="-1"
                      time="منذ 4 ساعات"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

interface GardenStatCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: string;
}

function GardenStatCard({
  title,
  value,
  subtitle,
  color,
}: GardenStatCardProps) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-lg p-6 text-white`}>
      <p className="text-sm opacity-90 mb-2">{title}</p>
      <p className="text-4xl font-bold mb-1">{value}</p>
      <p className="text-sm opacity-75">{subtitle}</p>
    </div>
  );
}

interface DevelopmentItemProps {
  stage: string;
  description: string;
  progress: number;
}

function DevelopmentItem({
  stage,
  description,
  progress,
}: DevelopmentItemProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="font-bold text-foreground">{stage}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <p className="text-sm font-bold text-primary">{progress}%</p>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

interface IndicatorCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: string;
  icon: string;
}

function IndicatorCard({
  title,
  value,
  subtitle,
  color,
  icon,
}: IndicatorCardProps) {
  return (
    <Card className="islamic-card text-center">
      <div className={`bg-gradient-to-br ${color} rounded-lg p-4 mb-4 w-fit mx-auto`}>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <p className="text-3xl font-bold text-primary mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </Card>
  );
}

interface StatsPeriodProps {
  period: string;
  goodDeeds: number;
  badDeeds: number;
  netReward: number;
}

function StatsPeriod({
  period,
  goodDeeds,
  badDeeds,
  netReward,
}: StatsPeriodProps) {
  return (
    <div className="border-b border-border pb-6 last:border-b-0">
      <h3 className="text-lg font-bold text-primary mb-4">{period}</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{goodDeeds}</p>
          <p className="text-xs text-muted-foreground">حسنات</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{badDeeds}</p>
          <p className="text-xs text-muted-foreground">سيئات</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{netReward}</p>
          <p className="text-xs text-muted-foreground">صافي</p>
        </div>
      </div>
    </div>
  );
}

interface RewardCardProps {
  title: string;
  value: string;
  color: string;
}

function RewardCard({ title, value, color }: RewardCardProps) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-lg p-6 text-white text-center`}>
      <p className="text-sm opacity-90 mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

interface ActivityItemProps {
  action: string;
  reward: string;
  time: string;
}

function ActivityItem({ action, reward, time }: ActivityItemProps) {
  return (
    <div className="flex flex-row-reverse items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
      <div className="text-right flex-1">
        <p className="font-semibold text-foreground">{action}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
      <p
        className={`text-lg font-bold ${
          reward.startsWith("+") ? "text-green-600" : "text-red-600"
        }`}
      >
        {reward}
      </p>
    </div>
  );
}
