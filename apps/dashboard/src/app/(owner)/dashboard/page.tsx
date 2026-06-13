"use client";

import { IconTrendingUp, IconUsers, IconCalendarEvent, IconCash } from "@tabler/icons-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">ملخص الأداء</h1>
          <p className="text-slate-400">نظرة عامة على نشاط ملاعبك اليوم</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="حجوزات اليوم" 
          value="12" 
          trend="+2 من الأمس" 
          icon={<IconCalendarEvent className="text-emerald-400" />} 
          trendUp={true}
        />
        <StatCard 
          title="إجمالي الأرباح" 
          value="3,200 ج.م" 
          trend="+15% هذا الأسبوع" 
          icon={<IconCash className="text-blue-400" />} 
          trendUp={true}
        />
        <StatCard 
          title="معدل الإشغال" 
          value="75%" 
          trend="-5% عن المتوسط" 
          icon={<IconTrendingUp className="text-amber-400" />} 
          trendUp={false}
        />
        <StatCard 
          title="تقييم اللاعبين" 
          value="4.8" 
          trend="من 45 مراجعة" 
          icon={<IconUsers className="text-purple-400" />} 
          trendUp={true}
        />
      </div>

      {/* Recent Bookings Table Placeholder */}
      <div className="mt-8 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">أحدث الحجوزات</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-4 font-medium">اللاعب</th>
                <th className="pb-4 font-medium">الملعب</th>
                <th className="pb-4 font-medium">التاريخ والوقت</th>
                <th className="pb-4 font-medium">المبلغ</th>
                <th className="pb-4 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <BookingRow player="أحمد محمود" pitch="ملعب الأبطال" time="اليوم, 08:00 م" amount="250 ج.م" status="مؤكد" />
              <BookingRow player="كريم مجدي" pitch="ملعب سانتياجو" time="اليوم, 10:00 م" amount="300 ج.م" status="مؤكد" />
              <BookingRow player="مصطفى علي" pitch="ملعب الأبطال" time="غداً, 06:00 م" amount="250 ج.م" status="بانتظار الدفع" />
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, trend, icon, trendUp }: any) {
  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
          {icon}
        </div>
        <span className={`text-sm font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-slate-400 text-sm mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
    </div>
  );
}

function BookingRow({ player, pitch, time, amount, status }: any) {
  const isConfirmed = status === "مؤكد";
  return (
    <tr className="text-slate-300">
      <td className="py-4">{player}</td>
      <td className="py-4">{pitch}</td>
      <td className="py-4">{time}</td>
      <td className="py-4 text-emerald-400 font-bold">{amount}</td>
      <td className="py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${isConfirmed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}
