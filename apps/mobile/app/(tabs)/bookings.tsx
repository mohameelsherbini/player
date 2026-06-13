import { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export default function BookingsScreen() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    if (!user) return;
    try {
      // Joining bookings with pitches and time_slots
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_status,
          total_price,
          time_slots (
            start_time,
            end_time,
            pitch_schedules (
              pitches (
                name,
                location_text
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="px-6 py-4 border-b border-slate-800">
        <Text className="text-2xl font-[CairoBold] text-white text-right">حجوزاتي</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
      >
        {bookings.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="calendar-outline" size={64} color="#334155" className="mb-4" />
            <Text className="text-xl font-[CairoBold] text-white text-center">لا توجد حجوزات حالية</Text>
            <Text className="text-slate-400 font-[Cairo] text-center mt-2">احجز ملعبك المفضل الآن من الرئيسية</Text>
          </View>
        ) : (
          bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onRefresh={fetchBookings} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BookingCard({ booking, onRefresh }: { booking: any, onRefresh: () => void }) {
  const timeSlot = booking.time_slots;
  const pitch = timeSlot?.pitch_schedules?.pitches;
  const isConfirmed = booking.booking_status === 'confirmed';
  const isCancelled = booking.booking_status === 'cancelled';
  const isCompleted = booking.booking_status === 'completed';

  const [cancelling, setCancelling] = useState(false);

  const startTime = timeSlot?.start_time ? new Date(timeSlot.start_time) : null;
  const isUpcoming = startTime ? startTime > new Date() : false;

  const handleCancel = async () => {
    Alert.alert('إلغاء الحجز', 'هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟', [
      { text: 'تراجع', style: 'cancel' },
      { 
        text: 'إلغاء الحجز', 
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          const { error } = await supabase
            .from('bookings')
            .update({ booking_status: 'cancelled' })
            .eq('id', booking.id);
          
          setCancelling(false);
          if (error) {
            Alert.alert('خطأ', 'حدث خطأ أثناء الإلغاء');
          } else {
            onRefresh();
          }
        }
      }
    ]);
  };

  const handleRate = () => {
    Alert.alert('تقييم الملعب', 'سيتم إضافة شاشة التقييم قريباً!');
  };

  // Format time (assuming start_time is timestamp or time string)
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      // If it's just a time string like "18:00:00", we need a different approach,
      // assuming it's a full ISO string for now based on moddatetime/postgis
      return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr.substring(0, 5);
    }
  };

  return (
    <View className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden mb-4 shadow-lg p-5">
      <View className="flex-row justify-between items-start mb-4 border-b border-slate-700 pb-4">
        <View className={`px-3 py-1 rounded-full ${isConfirmed ? 'bg-emerald-500/20' : isCancelled ? 'bg-red-500/20' : isCompleted ? 'bg-blue-500/20' : 'bg-amber-500/20'}`}>
          <Text className={`font-[CairoBold] text-xs ${isConfirmed ? 'text-emerald-400' : isCancelled ? 'text-red-400' : isCompleted ? 'text-blue-400' : 'text-amber-400'}`}>
            {isConfirmed ? 'مؤكد' : isCancelled ? 'ملغي' : isCompleted ? 'مكتمل' : 'بانتظار التأكيد'}
          </Text>
        </View>
        <View className="items-end flex-1 ml-4">
          <Text className="text-lg font-[CairoBold] text-white text-right">{pitch?.name || 'اسم الملعب غير متوفر'}</Text>
          <Text className="text-slate-400 font-[Cairo] text-sm text-right">{pitch?.location_text || 'الموقع غير متوفر'}</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-slate-400 font-[Cairo] text-xs text-right mb-1">المبلغ الإجمالي</Text>
          <Text className="text-xl font-[CairoBold] text-emerald-400">{booking.total_price} ج.م</Text>
        </View>

        <View className="items-end">
          <Text className="text-slate-400 font-[Cairo] text-xs text-right mb-1">الوقت</Text>
          <View className="flex-row items-center">
            <Text className="text-white font-[CairoBold] text-sm">{formatTime(timeSlot?.start_time)}</Text>
            <Ionicons name="time-outline" size={16} color="#64748B" className="ml-1" />
          </View>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row justify-end mt-2 pt-4 border-t border-slate-700">
        {isUpcoming && !isCancelled && (
          <TouchableOpacity 
            onPress={handleCancel}
            disabled={cancelling}
            className="bg-red-500/10 px-6 py-2 rounded-xl border border-red-500/30 flex-row items-center"
          >
            <Text className="text-red-400 font-[CairoBold] mr-2">إلغاء الحجز</Text>
            {cancelling ? <ActivityIndicator size="small" color="#F87171" /> : <Ionicons name="close-circle-outline" size={18} color="#F87171" />}
          </TouchableOpacity>
        )}
        {(!isUpcoming || isCompleted) && !isCancelled && (
          <TouchableOpacity 
            onPress={handleRate}
            className="bg-amber-500/10 px-6 py-2 rounded-xl border border-amber-500/30 flex-row items-center"
          >
            <Text className="text-amber-400 font-[CairoBold] mr-2">تقييم الملعب</Text>
            <Ionicons name="star-outline" size={18} color="#FBBF24" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
