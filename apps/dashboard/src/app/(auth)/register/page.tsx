"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      alert("تم التسجيل بنجاح! سيتم تحويلك للوحة التحكم.");
      // Auto assign admin role for convenience during setup
      if (data.user) {
        await supabase.from("users").update({ role: "admin" }).eq("id", data.user.id);
      }
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-400 mb-2">يلا حجز</h1>
          <p className="text-slate-400">إنشاء حساب مدير جديد</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 text-right block">البريد الإلكتروني</label>
            <input
              type="email"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-right focus:outline-none focus:border-emerald-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 text-right block">كلمة المرور</label>
            <input
              type="password"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-right focus:outline-none focus:border-emerald-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl px-4 py-3 transition disabled:opacity-50"
          >
            {loading ? "جاري التسجيل..." : "إنشاء الحساب"}
          </button>
        </form>
      </div>
    </div>
  );
}
