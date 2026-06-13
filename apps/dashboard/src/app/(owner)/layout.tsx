"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconLayoutDashboard, IconCalendarEvent, IconUsers, IconSettings, IconLogout, IconPlus, IconTrophy, IconStar } from "@tabler/icons-react";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-emerald-400">جاري التحميل...</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-l border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-emerald-400">يلا حجز</h2>
          <p className="text-sm text-slate-400">لوحة الشركاء</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <IconLayoutDashboard size={20} />
            <span className="font-medium">الرئيسية</span>
          </Link>
          <Link href="/pitches" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition">
            <IconLayoutDashboard size={20} />
            <span className="font-medium">ملاعبي</span>
          </Link>
          <Link href="/bookings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition">
            <IconCalendarEvent size={20} />
            <span className="font-medium">الحجوزات</span>
          </Link>
          <Link href="/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition">
            <IconUsers size={20} />
            <span className="font-medium">التقارير المالية</span>
          </Link>
          <Link href="/academies" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition">
            <IconTrophy size={20} />
            <span className="font-medium">أكاديمياتي</span>
          </Link>
          <Link href="/reviews" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition">
            <IconStar size={20} />
            <span className="font-medium">التقييمات</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition">
            <IconSettings size={20} />
            <span className="font-medium">الإعدادات</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition"
          >
            <IconLogout size={20} />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
             {/* Mobile menu button could go here */}
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition">
              <IconPlus size={18} />
              <span>إضافة ملعب</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 relative">
           {/* Background glow */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}
