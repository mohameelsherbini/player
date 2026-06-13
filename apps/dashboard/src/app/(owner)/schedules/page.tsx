"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconClock, IconCalendar } from "@tabler/icons-react";

export default function SchedulesPage() {
  const [pitches, setPitches] = useState<any[]>([]);
  const [selectedPitch, setSelectedPitch] = useState("");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchPitches();
  }, []);

  useEffect(() => {
    if (selectedPitch) {
      fetchSchedules();
    }
  }, [selectedPitch]);

  const fetchPitches = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data } = await supabase
      .from('pitches')
      .select('id, name')
      .eq('owner_id', userData.user.id);
    
    if (data && data.length > 0) {
      setPitches(data);
      setSelectedPitch(data[0].id);
    }
    setLoading(false);
  };

  const fetchSchedules = async () => {
    const { data } = await supabase
      .from('pitch_schedules')
      .select('*')
      .eq('pitch_id', selectedPitch)
      .order('day_of_week');
    
    setSchedules(data || []);
  };

  const addDefaultSchedule = async () => {
    if (!selectedPitch) return;
    const { data: pitch } = await supabase.from('pitches').select('price_per_hour').eq('id', selectedPitch).single();
    const price = pitch?.price_per_hour || 200;

    const days = [0, 1, 2, 3, 4, 5, 6]; // Sun to Sat
    const defaultSchedules = days.map(day => ({
      pitch_id: selectedPitch,
      day_of_week: day,
      open_time: '14:00:00', // 2 PM
      close_time: '23:59:00', // 12 AM
      price_multiplier: 1.0,
      custom_price: price,
      is_active: true
    }));

    await supabase.from('pitch_schedules').insert(defaultSchedules);
    fetchSchedules();
  };

  const daysArabic = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  if (loading) return <div className="text-white">جاري التحميل...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">إدارة الأوقات والجداول</h1>
          <p className="text-slate-400">تحكم في أوقات العمل وأسعار الملاعب الخاصة بك</p>
        </div>
        
        <select 
          value={selectedPitch}
          onChange={(e) => setSelectedPitch(e.target.value)}
          className="bg-slate-800 text-white px-4 py-2 rounded-xl border border-slate-700 outline-none"
        >
          {pitches.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {!selectedPitch ? (
        <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 text-center">
          <p className="text-slate-400">لم تقم بإضافة أي ملاعب بعد.</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 text-center space-y-4">
          <IconCalendar size={48} className="mx-auto text-slate-500" />
          <p className="text-slate-300">لم يتم إعداد جدول المواعيد لهذا الملعب</p>
          <button 
            onClick={addDefaultSchedule}
            className="bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition"
          >
            إنشاء جدول افتراضي (من 2 ظهراً لمنتصف الليل)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${schedule.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                  <h3 className="font-bold">{daysArabic[schedule.day_of_week]}</h3>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <IconClock size={16} />
                    <span>{schedule.open_time.substring(0,5)} - {schedule.close_time.substring(0,5)}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">السعر المخصص: {schedule.custom_price} ج.م</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition">تعديل</button>
                <button className={`${schedule.is_active ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'} px-4 py-2 rounded-lg transition`}>
                  {schedule.is_active ? 'تعطيل' : 'تفعيل'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
