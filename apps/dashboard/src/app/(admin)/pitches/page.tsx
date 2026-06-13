"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconCheck, IconX, IconEye } from "@tabler/icons-react";

export default function AdminPitchesPage() {
  const [pitches, setPitches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchPitches();
  }, []);

  const fetchPitches = async () => {
    // In a real app, verify the user is an admin here first
    
    const { data, error } = await supabase
      .from('pitches')
      .select('*, users (full_name)')
      .order('created_at', { ascending: false });
      
    setPitches(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('pitches').update({ status }).eq('id', id);
    if (!error) {
      fetchPitches();
    } else {
      alert("حدث خطأ أثناء التحديث");
    }
  };

  if (loading) return <div className="text-white">جاري التحميل...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">إدارة الملاعب</h1>
        <p className="text-slate-400">مراجعة الملاعب الجديدة والموافقة عليها</p>
      </div>

      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden">
        <table className="w-full text-right text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-bold">اسم الملعب</th>
              <th className="px-6 py-4 font-bold">صاحب الملعب</th>
              <th className="px-6 py-4 font-bold">المدينة</th>
              <th className="px-6 py-4 font-bold">الحالة</th>
              <th className="px-6 py-4 font-bold">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {pitches.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  لا توجد ملاعب مسجلة حالياً
                </td>
              </tr>
            ) : (
              pitches.map((pitch) => (
                <tr key={pitch.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4 font-bold text-white">{pitch.name}</td>
                  <td className="px-6 py-4 text-slate-400">{pitch.users?.full_name || 'غير معروف'}</td>
                  <td className="px-6 py-4 text-slate-400">{pitch.city}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      pitch.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                      pitch.status === 'inactive' ? 'bg-red-500/20 text-red-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {pitch.status === 'active' ? 'نشط' : pitch.status === 'inactive' ? 'موقوف' : 'قيد المراجعة'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition">
                        <IconEye size={18} />
                      </button>
                      {pitch.status !== 'active' && (
                        <button onClick={() => updateStatus(pitch.id, 'active')} className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition">
                          <IconCheck size={18} />
                        </button>
                      )}
                      {pitch.status !== 'inactive' && (
                        <button onClick={() => updateStatus(pitch.id, 'inactive')} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition">
                          <IconX size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
