import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AcademiesScreen() {
  const [academies, setAcademies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcademies();
  }, []);

  const fetchAcademies = async () => {
    const { data, error } = await supabase
      .from('academies')
      .select('*, users(full_name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
      
    setAcademies(data || []);
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="px-6 py-4 border-b border-slate-800 flex-row justify-between items-center">
        <Text className="text-2xl font-[CairoBold] text-white">الأكاديميات والتدريب</Text>
        <TouchableOpacity className="bg-slate-800 p-2 rounded-full">
          <Ionicons name="filter" size={20} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Banner */}
        <View className="bg-emerald-900/40 rounded-3xl p-6 border border-emerald-500/30 mb-8 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-xl font-[CairoBold] text-emerald-400 mb-2 text-right">طوّر مهاراتك</Text>
            <Text className="text-slate-300 font-[Cairo] text-xs text-right leading-5">
              انضم لأفضل الأكاديميات وتدرب مع مدربين محترفين في مختلف الرياضات.
            </Text>
          </View>
          <View className="bg-emerald-500/20 w-16 h-16 rounded-full items-center justify-center">
            <Ionicons name="trophy" size={32} color="#10B981" />
          </View>
        </View>

        {/* Academies List */}
        <Text className="text-lg font-[CairoBold] text-white mb-4 text-right">الأكاديميات المتاحة</Text>
        
        {loading ? (
          <Text className="text-slate-400 text-center font-[Cairo] mt-10">جاري التحميل...</Text>
        ) : academies.length === 0 ? (
          <View className="bg-slate-800/50 rounded-3xl p-8 items-center border border-slate-700 border-dashed">
            <Ionicons name="football" size={48} color="#475569" className="mb-4" />
            <Text className="text-slate-400 font-[Cairo]">لا توجد أكاديميات نشطة حالياً</Text>
          </View>
        ) : (
          academies.map((academy) => (
            <TouchableOpacity key={academy.id} className="bg-slate-800/80 rounded-3xl border border-slate-700 overflow-hidden mb-4 shadow-lg p-5">
              <View className="flex-row items-start justify-between mb-4">
                <View className="w-16 h-16 bg-slate-700 rounded-2xl items-center justify-center overflow-hidden">
                  {academy.logo_url ? (
                    <Image source={{ uri: academy.logo_url }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <Ionicons name="trophy-outline" size={32} color="#94A3B8" />
                  )}
                </View>
                <View className="bg-emerald-500/20 px-3 py-1 rounded-full">
                  <Text className="text-emerald-400 font-[Cairo] text-xs">{academy.sport_type}</Text>
                </View>
              </View>
              
              <Text className="text-xl font-[CairoBold] text-white text-right mb-1">{academy.name}</Text>
              <Text className="text-emerald-400 font-[Cairo] text-xs text-right mb-3">
                بإشراف الكابتن: {academy.users?.full_name}
              </Text>
              
              <Text className="text-slate-400 font-[Cairo] text-sm text-right mb-4" numberOfLines={2}>
                {academy.description || 'لا يوجد وصف متاح لهذه الأكاديمية'}
              </Text>
              
              <View className="flex-row justify-between items-center mt-2 pt-4 border-t border-slate-700">
                <TouchableOpacity className="bg-emerald-500 py-2 px-6 rounded-xl">
                  <Text className="text-slate-950 font-[CairoBold]">تصفح الحصص</Text>
                </TouchableOpacity>
                <View className="flex-row items-center">
                  <Text className="text-slate-300 font-[CairoBold] mr-2">متاح الحجز</Text>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
