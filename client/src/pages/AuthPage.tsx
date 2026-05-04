import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clearUserProfile, getUserProfile, requestBasicPermissions, setUserProfile } from "../lib/user-session";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const existing = getUserProfile();
  const [name, setName] = useState(existing?.name || "");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const start = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setStatus("جارٍ طلب الصلاحيات...");
    const permissions = await requestBasicPermissions();
    const profile = {
      id: existing?.id || `user_${Date.now()}`,
      name: name.trim(),
      createdAt: existing?.createdAt || new Date().toISOString(),
      permissions,
    };
    setUserProfile(profile);
    setStatus("تم الحفظ بنجاح");
    setLoading(false);
    navigate("/");
  };

  const reset = () => {
    clearUserProfile();
    setName("");
    setStatus("تم مسح الحساب المحلي");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background via-primary/5 to-background" dir="rtl">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">دخول أنا مسلم</h1>
        <p className="text-sm text-muted-foreground text-center">
          لكل مستخدم تجربة خاصة، مع موافقة على المايك والكاميرا والتخزين المحلي.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اكتب اسمك"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none"
        />
        <div className="flex gap-2">
          <Button className="flex-1" onClick={start} disabled={loading || !name.trim()}>
            {loading ? "جارٍ البدء..." : "ابدأ"}
          </Button>
          <Button variant="outline" onClick={reset}>
            مسح
          </Button>
        </div>
        <div className="text-xs text-muted-foreground leading-6">
          الموافقات: المايك، الكاميرا، وتخزين محلي مستمر. لو رفضت أي صلاحية، تقدر تستخدم التطبيق جزئياً.
        </div>
        {status && <div className="text-sm text-center text-primary">{status}</div>}
      </Card>
    </div>
  );
}