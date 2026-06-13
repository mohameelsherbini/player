"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconCurrencyDollar, IconTrendingUp, IconWallet } from "@tabler/icons-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Dummy data for the area chart
const earningsData = [
  { name: "يناير", amount: 1200 },
  { name: "فبراير", amount: 2100 },
  { name: "مارس", amount: 1800 },
  { name: "أبريل", amount: 3200 },
  { name: "مايو", amount: 2500 },
  { name: "يونيو", amount: 4100 },
  { name: "يوليو", amount: 3800 },
];

export default function OwnerEarningsPage() {
  const [earnings, setEarnings] = useState({ total: 0, pending: 0, completed: 0 });
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    // Fetch payout requests
    const { data: payoutsData } = await supabase
      .from('owner_payouts')
      .select('*')
      .eq('owner_id', userData.user.id)
      .order('created_at', { ascending: false });

    // Dummy logic for MVP - In real app, calculate from `payments` joining `bookings` and `pitches`
    setEarnings({
      total: 12500,
      pending: 2500,
      completed: 10000
    });
    
    setPayouts(payoutsData || []);
    setLoading(false);
  };

  const requestPayout = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.from('owner_payouts').insert({
      owner_id: userData.user.id,
      amount: earnings.pending,
      status: 'pending'
    });
    
    alert("تم تقديم طلب السحب بنجاح!");
    fetchEarnings();
  };

  if (loading) return <div className="text-white">جاري التحميل...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">الأرباح والتقارير المالية</h1>
        <p className="text-slate-400">تابع أرباحك، اتجاهات الحجوزات واطلب سحب رصيدك المتاح</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-emerald-500/20 p-3 rounded-2xl">
              <IconCurrencyDollar className="text-emerald-400" size={24} />
            </div>
          </div>
          <p className="text-slate-400 font-bold mb-1">إجمالي الأرباح</p>
          <h2 className="text-3xl font-bold text-white">{earnings.total} ج.م</h2>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-500/20 p-3 rounded-2xl">
              <IconWallet className="text-blue-400" size={24} />
            </div>
          </div>
          <p className="text-slate-400 font-bold mb-1">الرصيد المتاح للسحب</p>
          <h2 className="text-3xl font-bold text-white">{earnings.pending} ج.م</h2>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <p className="text-slate-400 font-bold mb-1">سحب الأرباح</p>
            <p className="text-sm text-slate-500">الحد الأدنى للسحب 1000 ج.م</p>
          </div>
          <button 
            onClick={requestPayout}
            disabled={earnings.pending < 1000}
            className={`w-full py-3 rounded-xl font-bold mt-4 transition ${earnings.pending >= 1000 ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
          >
            طلب سحب الرصيد
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
        <h3 className="text-xl font-bold text-white mb-6">مؤشر الأرباح الشهري</h3>
        <div className="h-80 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earningsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area type="monotone" dataKey="amount" name="الأرباح" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">سجل طلبات السحب</h2>
        </div>
        <table className="w-full text-right text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-bold">رقم الطلب</th>
              <th className="px-6 py-4 font-bold">المبلغ</th>
              <th className="px-6 py-4 font-bold">التاريخ</th>
              <th className="px-6 py-4 font-bold">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {payouts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  لا توجد طلبات سحب سابقة
                </td>
              </tr>
            ) : (
              payouts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4 text-slate-400">#{p.id.substring(0,8)}</td>
                  <td className="px-6 py-4 font-bold text-white">{p.amount} ج.م</td>
                  <td className="px-6 py-4 text-slate-400">{new Date(p.created_at).toLocaleDateString('ar-EG')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      p.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      p.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {p.status === 'completed' ? 'مكتمل' : p.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                    </span>
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
