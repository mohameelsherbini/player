"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconPlus, IconTrophy, IconUsers } from "@tabler/icons-react";

export default function OwnerAcademiesPage() {
  const [academies, setAcademies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchAcademies();
  }, []);

  const fetchAcademies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('academies')
        .select('*, academy_sessions(count)')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });
        
      setAcademies(data || []);
    }
    setLoading(false);
  };

  if (loading) return <div className="text-white">جاري التحميل...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">أكاديمياتي</h1>
          <p className="text-slate-400">إدارة الأكاديميات والحصص التدريبية الخاصة بك</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2 px-4 rounded-xl transition">
          <IconPlus size={20} />
          إنشاء أكاديمية
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {academies.length === 0 ? (
          <div className="col-span-full bg-slate-900/80 rounded-3xl border border-slate-800 p-8 text-center border-dashed">
            <IconTrophy size={48} className="mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400 mb-4">لم تقم بإنشاء أي أكاديمية بعد</p>
            <button className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white font-bold py-2 px-6 rounded-xl transition">
              ابدأ الآن
            </button>
          </div>
        ) : (
          academies.map((academy) => (
            <div key={academy.id} className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 hover:border-emerald-500/50 transition cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center">
                  {academy.logo_url ? (
                    <img src={academy.logo_url} alt={academy.name} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <IconTrophy size={32} className="text-slate-400" />
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  academy.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                }`}>
                  {academy.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1">{academy.name}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{academy.description || 'لا يوجد وصف'}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                  <IconUsers size={18} className="text-emerald-400" />
                  <span className="text-sm font-bold">{academy.academy_sessions[0]?.count || 0} حصص</span>
                </div>
                <span className="bg-slate-800 px-3 py-1 rounded-lg text-xs text-slate-300">
                  {academy.sport_type}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
