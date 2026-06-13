"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconCheck, IconX, IconEye, IconPlus } from "@tabler/icons-react";

export default function AdminAdsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false });
      
    setAds(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, is_active: boolean) => {
    const { error } = await supabase.from('advertisements').update({ is_active }).eq('id', id);
    if (!error) {
      fetchAds();
    } else {
      alert("حدث خطأ أثناء التحديث");
    }
  };

  if (loading) return <div className="text-white">جاري التحميل...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">إدارة الإعلانات</h1>
          <p className="text-slate-400">تحكم في البنرات الإعلانية المعروضة في التطبيق</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2 px-4 rounded-xl transition">
          <IconPlus size={20} />
          إضافة إعلان
        </button>
      </div>

      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden">
        <table className="w-full text-right text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-bold">العنوان</th>
              <th className="px-6 py-4 font-bold">المكان</th>
              <th className="px-6 py-4 font-bold">المشاهدات</th>
              <th className="px-6 py-4 font-bold">النقرات</th>
              <th className="px-6 py-4 font-bold">تاريخ الانتهاء</th>
              <th className="px-6 py-4 font-bold">الحالة</th>
              <th className="px-6 py-4 font-bold">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {ads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  لا توجد إعلانات مسجلة حالياً
                </td>
              </tr>
            ) : (
              ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4 font-bold text-white">{ad.title}</td>
                  <td className="px-6 py-4 text-slate-400">
                    {ad.placement === 'home_banner' ? 'الرئيسية' : ad.placement}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{ad.impressions}</td>
                  <td className="px-6 py-4 text-slate-400">{ad.clicks}</td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(ad.end_date).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ad.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {ad.is_active ? 'نشط' : 'متوقف'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {!ad.is_active ? (
                        <button onClick={() => updateStatus(ad.id, true)} className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition">
                          <IconCheck size={18} />
                        </button>
                      ) : (
                        <button onClick={() => updateStatus(ad.id, false)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition">
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
