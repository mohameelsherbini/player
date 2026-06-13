"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconUserEdit, IconUserOff, IconUserCheck } from "@tabler/icons-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Note: Due to RLS, the admin should use a service role key or an RPC to fetch all users
    // For MVP, if RLS allows admin to read all users:
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
      
    setUsers(data || []);
    setLoading(false);
  };

  const updateRole = async (id: string, newRole: string) => {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', id);
    if (!error) {
      fetchUsers();
    } else {
      alert("حدث خطأ أثناء التحديث: " + error.message);
    }
  };

  if (loading) return <div className="text-white">جاري التحميل...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">إدارة المستخدمين</h1>
        <p className="text-slate-400">تحكم في الصلاحيات وأدوار المستخدمين</p>
      </div>

      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden">
        <table className="w-full text-right text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-bold">الاسم</th>
              <th className="px-6 py-4 font-bold">البريد الإلكتروني</th>
              <th className="px-6 py-4 font-bold">الهاتف</th>
              <th className="px-6 py-4 font-bold">الدور (Role)</th>
              <th className="px-6 py-4 font-bold">تغيير الصلاحية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  لا يوجد مستخدمين
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4 font-bold text-white">{user.full_name || 'بدون اسم'}</td>
                  <td className="px-6 py-4 text-slate-400">{user.email}</td>
                  <td className="px-6 py-4 text-slate-400">{user.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                      user.role === 'owner' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {user.role !== 'owner' && (
                        <button onClick={() => updateRole(user.id, 'owner')} title="ترقية لصاحب ملعب" className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition">
                          <IconUserEdit size={18} />
                        </button>
                      )}
                      {user.role !== 'player' && (
                        <button onClick={() => updateRole(user.id, 'player')} title="إرجاع للاعب عادي" className="p-2 bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition">
                          <IconUserOff size={18} />
                        </button>
                      )}
                      {user.role !== 'admin' && (
                        <button onClick={() => updateRole(user.id, 'admin')} title="ترقية لآدمن" className="p-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white rounded-lg transition">
                          <IconUserCheck size={18} />
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
