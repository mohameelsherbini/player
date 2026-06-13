import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';

const { width } = Dimensions.get('window');

export default function PitchDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState<any>(null);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchTimeSlots = async () => {
      const { data, error } = await supabase
        .from('time_slots')
        .select(`
          id,
          start_time,
          end_time,
          price,
          is_booked,
          pitch_schedules!inner(pitch_id)
        `)
        .eq('pitch_schedules.pitch_id', id)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(10);

      if (!error && data) {
        setTimeSlots(data);
      }
    };

    fetchTimeSlots();

    const subscription = supabase
      .channel('public:time_slots')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'time_slots' },
        (payload) => {
          setTimeSlots((current) =>
            current.map((slot) =>
              slot.id === payload.new.id ? { ...slot, is_booked: payload.new.is_booked } : slot
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      Alert.alert('تنبيه', 'يجب تسجيل الدخول أولاً لإتمام الحجز');
      router.push('/(auth)/login');
      return;
    }

    if (!selectedTime) {
      Alert.alert('تنبيه', 'الرجاء اختيار وقت للحجز');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('book_slot', {
        p_time_slot_id: selectedTime.id,
        p_user_id: user.id,
        p_payment_method: 'card'
      });

      if (error) {
        Alert.alert('خطأ', 'عذراً، هذا الوقت غير متاح أو حدث خطأ أثناء الحجز.');
      } else {
        router.push(`/checkout?bookingId=${data}&amount=${selectedTime.price}`);
      }
    } catch (err) {
      Alert.alert('خطأ', 'حدث خطأ في الاتصال.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top', 'bottom']}>
      {/* Custom Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-slate-900/90 z-10">
        <TouchableOpacity onPress={() => router.back()} className="bg-slate-800 p-2 rounded-full">
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <TouchableOpacity className="bg-slate-800 p-2 rounded-full">
          <Ionicons name="heart-outline" size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      <ScrollView bounces={false}>
        {/* Pitch Image Gallery */}
        <View className="h-64 bg-slate-800 w-full relative">
          <FlatList
            data={dummyImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={{ width, height: 256 }} resizeMode="cover" />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
            {dummyImages.map((_, i) => (
              <View key={i} className="w-2 h-2 rounded-full bg-white/50 mx-1" />
            ))}
          </View>
        </View>

        {/* Content */}
        <View className="p-6">
          <View className="flex-row justify-between items-start mb-2">
            <View className="bg-slate-800 px-3 py-1 rounded-full flex-row items-center">
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text className="text-amber-500 font-[CairoBold] ml-1 text-sm">4.8</Text>
            </View>
            <Text className="text-2xl font-[CairoBold] text-white text-right flex-1 ml-4">ملعب سانتياجو برنابيو</Text>
          </View>

          <View className="flex-row justify-end items-center mb-6">
            <Text className="text-slate-400 font-[Cairo] text-base mr-1">مدينة نصر، خلف النادي الأهلي</Text>
            <Ionicons name="location-outline" size={18} color="#64748B" />
          </View>

          {/* Amenities */}
          <Text className="text-lg font-[CairoBold] text-white mb-4 text-right">المرافق</Text>
          <View className="flex-row flex-wrap justify-end mb-8 gap-2">
            {[
              { name: 'إضاءة LED', icon: 'bulb-outline' },
              { name: 'مدرجات', icon: 'people-outline' },
              { name: 'غرفة ملابس', icon: 'shirt-outline' },
              { name: 'مواقف سيارات', icon: 'car-outline' },
              { name: 'كافتيريا', icon: 'cafe-outline' }
            ].map((amenity, index) => (
              <View key={index} className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 flex-row items-center">
                <Text className="text-slate-300 font-[Cairo] text-sm mr-2">{amenity.name}</Text>
                <Ionicons name={amenity.icon as any} size={16} color="#10B981" />
              </View>
            ))}
          </View>

          {/* Map Location */}
          <Text className="text-lg font-[CairoBold] text-white mb-4 text-right">الموقع</Text>
          <View className="bg-slate-800 rounded-2xl overflow-hidden mb-8 border border-slate-700">
            <View className="h-40 bg-slate-700 items-center justify-center">
              <Ionicons name="map-outline" size={48} color="#94A3B8" />
              <Text className="text-slate-400 font-[Cairo] mt-2">خريطة مصغرة</Text>
            </View>
            <TouchableOpacity className="bg-slate-800 p-4 border-t border-slate-700 flex-row justify-between items-center">
              <Ionicons name="open-outline" size={20} color="#10B981" />
              <Text className="text-emerald-400 font-[CairoBold]">فتح في خرائط جوجل</Text>
            </TouchableOpacity>
          </View>

          {/* Time Slots Preview */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-emerald-400 font-[Cairo] text-sm">تغيير اليوم</Text>
            <Text className="text-lg font-[CairoBold] text-white">الأوقات المتاحة اليوم</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8" style={{ transform: [{ scaleX: -1 }] }}>
            {timeSlots.map((slot) => {
              const timeStr = new Date(slot.start_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
              const isSelected = selectedTime?.id === slot.id;
              
              return (
                <TouchableOpacity 
                  key={slot.id} 
                  onPress={() => !slot.is_booked && setSelectedTime(slot)}
                  disabled={slot.is_booked}
                  className={`px-6 py-3 rounded-2xl mx-1 border ${
                    slot.is_booked 
                      ? 'bg-slate-800/50 border-slate-700/50 opacity-50' 
                      : isSelected 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : 'bg-slate-800 border-slate-700'
                  }`} 
                  style={{ transform: [{ scaleX: -1 }] }}
                >
                  <Text className={`font-[CairoBold] ${
                    slot.is_booked ? 'text-slate-500' : isSelected ? 'text-slate-900' : 'text-slate-300'
                  }`}>{timeStr}</Text>
                  <Text className={`text-xs text-center mt-1 ${
                    slot.is_booked ? 'text-slate-600' : isSelected ? 'text-slate-800' : 'text-emerald-500'
                  }`}>{slot.price} ج.م</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

        </View>
      </ScrollView>

      {/* Bottom Booking Bar */}
      <View className="bg-slate-800/90 p-4 border-t border-slate-700 flex-row justify-between items-center">
        <TouchableOpacity 
          className={`bg-emerald-500 px-8 py-4 rounded-2xl flex-1 ml-4 flex-row justify-center items-center ${loading || !selectedTime ? 'opacity-70' : ''}`}
          onPress={handleBooking}
          disabled={loading || !selectedTime}
        >
          {loading ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text className="text-slate-900 font-[CairoBold] text-lg text-center">احجز الآن</Text>
          )}
        </TouchableOpacity>
        <View className="items-end">
          <Text className="text-slate-400 font-[Cairo] text-sm">الإجمالي</Text>
          <Text className="text-2xl font-[CairoBold] text-white">
            {selectedTime ? `${selectedTime.price} ج.م` : '0 ج.م'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
