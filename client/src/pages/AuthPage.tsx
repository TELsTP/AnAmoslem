import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background via-primary/5 to-background" dir="rtl">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">دخول أنا مسلم</h1>
        <p className="text-sm text-muted-foreground text-center">
          هذه النسخة لا تستخدم الاسم أو حالة المتصفح كهوية أو صلاحية. ابدأ تجربة غير مميزة، واطلب صلاحيات الجهاز فقط عند تشغيل الميزة التي تحتاجها.
        </p>
        <Button className="w-full" onClick={() => navigate("/")}>
          ابدأ التجربة
        </Button>
        <div className="text-xs text-muted-foreground leading-6">
          لا تُطلب الكاميرا أو التخزين الدائم عند الدخول. الميكروفون يُطلب فقط عندما تضغط زر التحدث داخل ميزة صوتية.
        </div>
      </Card>
    </div>
  );
}
