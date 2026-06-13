import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'booking_confirmed': return { name: 'checkmark-circle', color: '#10B981' };
      case 'booking_cancelled': return { name: 'close-circle', color: '#EF4444' };
      case 'match_full': return { name: 'people', color: '#3B82F6' };
      case 'system': return { name: 'information-circle', color: '#F59E0B' };
      default: return { name: 'notifications', color: '#64748B' };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text className="text-xl font-[CairoBold] text-white">الإشعارات</Text>
        <TouchableOpacity onPress={markAllAsRead} className="p-2">
          <Ionicons name="checkmark-done" size={24} color="#10B981" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6">
          <View className="w-24 h-24 bg-slate-800 rounded-full items-center justify-center mb-6">
            <Ionicons name="notifications-off-outline" size={48} color="#475569" />
          </View>
          <Text className="text-xl font-[CairoBold] text-white text-center mb-2">لا توجد إشعارات</Text>
          <Text className="text-slate-400 font-[Cairo] text-center text-lg">لم تتلق أي إشعارات حتى الآن.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const icon = getIconForType(item.type);
            return (
              <TouchableOpacity 
                className={`flex-row p-4 mb-3 rounded-2xl border ${item.is_read ? 'bg-slate-800 border-slate-700' : 'bg-slate-800/80 border-emerald-500/50'}`}
              >
                <View className="flex-1 mr-4">
                  <Text className={`font-[CairoBold] text-right text-lg mb-1 ${item.is_read ? 'text-white' : 'text-emerald-400'}`}>
                    {item.title}
                  </Text>
                  <Text className="text-slate-400 font-[Cairo] text-right text-sm leading-6">
                    {item.message}
                  </Text>
                  <Text className="text-slate-500 font-[Cairo] text-right text-xs mt-2">
                    {new Date(item.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View className="w-12 h-12 rounded-full bg-slate-900 items-center justify-center border border-slate-700">
                  <Ionicons name={icon.name as any} size={24} color={icon.color} />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
