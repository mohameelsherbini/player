"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconChartBar, IconUsers, IconCalendarEvent, IconCoin } from "@tabler/icons-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

// Dummy data for the charts (since we don't have enough historical data yet)
const revenueData = [
  { name: "يناير", revenue: 4000, bookings: 240 },
  { name: "فبراير", revenue: 3000, bookings: 139 },
  { name: "مارس", revenue: 2000, bookings: 980 },
  { name: "أبريل", revenue: 2780, bookings: 390 },
  { name: "مايو", revenue: 1890, bookings: 480 },
  { name: "يونيو", revenue: 2390, bookings: 380 },
  { name: "يوليو", revenue: 3490, bookings: 430 },
];

export default function AdminStatsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPitches: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: pitchesCount } = await supabase.from('pitches').select('*', { count: 'exact', head: true });
    const { count: bookingsCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    
    setStats({
      totalUsers: usersCount || 0,
      totalPitches: pitchesCount || 0,
      totalBookings: bookingsCount || 0,
      totalRevenue: 25000 // Placeholder for MVP
    });
    
    setLoading(false);
  };

  if (loading) return <div className="text-white">جاري التحميل...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">الإحصائيات العامة والتقارير المتقدمة</h1>
        <p className="text-slate-400">نظرة شاملة على أداء المنصة والأرباح</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-400 font-bold">إجمالي المستخدمين</p>
            <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400">
              <IconUsers size={24} />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white">{stats.totalUsers}</h2>
        </div>

        <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-400 font-bold">الملاعب المسجلة</p>
            <div className="bg-purple-500/20 p-2 rounded-xl text-purple-400">
              <IconChartBar size={24} />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white">{stats.totalPitches}</h2>
        </div>

        <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-400 font-bold">إجمالي الحجوزات</p>
            <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
              <IconCalendarEvent size={24} />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white">{stats.totalBookings}</h2>
        </div>

        <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20">
          <div className="flex justify-between items-center mb-4">
            <p className="text-emerald-500 font-bold">الأرباح (10% عمولة)</p>
            <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
              <IconCoin size={24} />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white">{stats.totalRevenue * 0.1} ج.م</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
          <h3 className="text-xl font-bold text-white mb-6">نمو الأرباح الشهرية (بالجنيه)</h3>
          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="الأرباح" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Chart */}
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
          <h3 className="text-xl font-bold text-white mb-6">معدل الحجوزات الشهرية</h3>
          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: '#334155' }}
                />
                <Legend />
                <Bar dataKey="bookings" name="عدد الحجوزات" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
