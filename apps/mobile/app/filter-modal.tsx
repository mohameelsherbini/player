import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFilterStore } from '@/stores/filterStore';

const SPORTS = [
  { id: 'football', label: 'كرة قدم', icon: 'football-outline' },
  { id: 'padel', label: 'بادل', icon: 'tennisball-outline' },
  { id: 'volleyball', label: 'طائرة', icon: 'baseball-outline' },
];

export default function FilterModalScreen() {
  const router = useRouter();
  const { 
    sportType, setSportType, 
    minPrice, maxPrice, setPriceRange,
    resetFilters
  } = useFilterStore();

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="close" size={28} color="#F8FAFC" />
        </TouchableOpacity>
        <Text className="text-xl font-[CairoBold] text-white">تصفية النتائج</Text>
        <TouchableOpacity onPress={() => resetFilters()} className="p-2">
          <Text className="text-emerald-500 font-[Cairo]">مسح</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {/* Sport Type */}
        <Text className="text-white font-[CairoBold] text-lg text-right mb-4">الرياضة</Text>
        <View className="flex-row flex-wrap justify-end gap-3 mb-8">
          {SPORTS.map((sport) => (
            <TouchableOpacity
              key={sport.id}
              onPress={() => setSportType(sportType === sport.id ? null : sport.id)}
              className={`px-4 py-3 rounded-xl border flex-row items-center ${
                sportType === sport.id 
                  ? 'bg-emerald-500 border-emerald-500' 
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <Text className={`font-[CairoBold] mr-2 ${sportType === sport.id ? 'text-slate-900' : 'text-slate-300'}`}>
                {sport.label}
              </Text>
              <Ionicons 
                name={sport.icon as any} 
                size={20} 
                color={sportType === sport.id ? '#0F172A' : '#94A3B8'} 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Range */}
        <Text className="text-white font-[CairoBold] text-lg text-right mb-4">السعر (للساعة)</Text>
        <View className="flex-row justify-between items-center mb-8 gap-4">
          <View className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 flex-row items-center">
            <Text className="text-slate-400 font-[Cairo] ml-2">إلى</Text>
            <TextInput
              className="flex-1 py-3 text-white font-[CairoBold] text-center"
              keyboardType="number-pad"
              value={maxPrice.toString()}
              onChangeText={(val) => setPriceRange(minPrice, parseInt(val) || 0)}
              placeholderTextColor="#64748B"
            />
          </View>
          <Text className="text-slate-500 font-[Cairo]">-</Text>
          <View className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 flex-row items-center">
            <Text className="text-slate-400 font-[Cairo] ml-2">من</Text>
            <TextInput
              className="flex-1 py-3 text-white font-[CairoBold] text-center"
              keyboardType="number-pad"
              value={minPrice.toString()}
              onChangeText={(val) => setPriceRange(parseInt(val) || 0, maxPrice)}
              placeholderTextColor="#64748B"
            />
          </View>
        </View>

        {/* Rating Placeholder */}
        <Text className="text-white font-[CairoBold] text-lg text-right mb-4">التقييم (قريباً)</Text>
        <View className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-8 items-end">
          <Text className="text-slate-400 font-[Cairo]">سيتم توفير الفلترة بالتقييم لاحقاً</Text>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View className="p-6 pt-2 border-t border-slate-800 bg-slate-900">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-emerald-500 py-4 rounded-2xl items-center shadow-lg shadow-emerald-500/20"
        >
          <Text className="text-slate-950 font-[CairoBold] text-lg">تطبيق الفلاتر</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
