"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconCheck, IconX, IconClock } from "@tabler/icons-react";

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  const fetchOwnerBookings = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    // Fetch pitches owned by the user
    const { data: pitches } = await supabase.from('pitches').select('id').eq('owner_id', userData.user.id);
    if (!pitches || pitches.length === 0) {
      setLoading(false);
      return;
    }
    
    const pitchIds = pitches.map(p => p.id);

    // Fetch time slots for those pitches, then fetch bookings linked to those time slots
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_status,
        total_price,
        created_at,
        users ( full_name, phone ),
        time_slots (
          start_time,
          end_time,
          pitch_schedules (
            pitches ( name )
          )
        )
      `)
      // Note: In Supabase, filtering on deep relations requires a slightly different approach or RPC
      // For MVP, if it's too complex to filter nested, we fetch all and filter client side
      // Or we can use an inner join. 
      .order('created_at', { ascending: false })
      .limit(50);
      
      // In a real production app, we would use an RPC or a database View 
      // like `owner_bookings_view` to make this secure and efficient.
      // Filtering client-side for MVP based on pitch owner:
      const filtered = (data as any[] || []).filter(b => 
        pitchIds.includes(b.time_slots?.pitch_schedules?.pitches?.id || b.time_slots?.pitch_schedules?.pitch_id)
      );

    setBookings(filtered);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('bookings').update({ booking_status: status }).eq('id', id);
    if (!error) {
      fetchOwnerBookings();
    }
  };

  if (loading) return <div className="text-white">جاري التحميل...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">إدارة الحجوزات</h1>
        <p className="text-slate-400">تابع حجوزات ملاعبك الواردة وقم بإدارتها</p>
      </div>

      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden">
        <table className="w-full text-right text-slate-300">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-bold">اللاعب</th>
              <th className="px-6 py-4 font-bold">الملعب والتاريخ</th>
              <th className="px-6 py-4 font-bold">المبلغ</th>
              <th className="px-6 py-4 font-bold">الحالة</th>
              <th className="px-6 py-4 font-bold">الإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  لا توجد حجوزات حالياً
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{booking.users?.full_name || 'غير معروف'}</p>
                    <p className="text-sm text-slate-400">{booking.users?.phone || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-emerald-400">{booking.time_slots?.pitch_schedules?.pitches?.name || 'ملعب محذوف'}</p>
                    <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                      <IconClock size={14} />
                      <span>{booking.time_slots?.start_time?.substring(0,5)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">{booking.total_price} ج.م</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      booking.booking_status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                      booking.booking_status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {booking.booking_status === 'confirmed' ? 'مؤكد' : booking.booking_status === 'cancelled' ? 'ملغي' : 'قيد الانتظار'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {booking.booking_status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(booking.id, 'confirmed')} className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition">
                          <IconCheck size={18} />
                        </button>
                        <button onClick={() => updateStatus(booking.id, 'cancelled')} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition">
                          <IconX size={18} />
                        </button>
                      </div>
                    )}
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
