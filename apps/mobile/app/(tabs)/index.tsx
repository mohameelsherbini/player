import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [ads, setAds] = useState<any[]>([]);
  const [featuredPitches, setFeaturedPitches] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch Active Ads
    const { data: adsData } = await supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .eq('placement', 'home_banner')
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    setAds(adsData || []);

    // Fetch Featured Pitches
    const { data: pitchesData } = await supabase
      .from('pitches')
      .select('*, users(full_name)')
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('avg_rating', { ascending: false })
      .limit(5);

    setFeaturedPitches(pitchesData || []);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-slate-400 font-[Cairo] text-sm">مرحباً بك في</Text>
            <Text className="text-2xl font-[CairoBold] text-emerald-400">يلا حجز</Text>
          </View>
          <TouchableOpacity className="bg-slate-800 p-3 rounded-full border border-slate-700">
            <Ionicons name="notifications-outline" size={24} color="#F8FAFC" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <Link href="/search" asChild>
          <TouchableOpacity className="bg-slate-800/80 flex-row items-center px-4 py-3 rounded-2xl border border-slate-700/50 mb-6 shadow-lg">
            <Ionicons name="search" size={20} color="#64748B" />
            <Text className="text-slate-400 font-[Cairo] ml-3 flex-1 text-right">ابحث عن ملعب، منطقة، أو نادي...</Text>
          </TouchableOpacity>
        </Link>

        {/* Ads Carousel */}
        {ads.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-8"
            snapToInterval={width - 40 + 16} // card width + margin
            decelerationRate="fast"
          >
            {ads.map((ad, index) => (
              <TouchableOpacity 
                key={ad.id} 
                className="rounded-3xl overflow-hidden border border-slate-800 mr-4"
                style={{ width: width - 40, height: 160 }}
              >
                {ad.image_url ? (
                  <Image source={{ uri: ad.image_url }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="w-full h-full bg-slate-800 items-center justify-center">
                    <Text className="text-slate-400 font-[CairoBold] text-lg">{ad.title}</Text>
                  </View>
                )}
                <View className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded-md">
                  <Text className="text-white text-xs font-[Cairo]">إعلان</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Categories */}
        <Text className="text-lg font-[CairoBold] text-white mb-4 text-right">الرياضات</Text>
        <View className="flex-row justify-between mb-8">
          {['كرة قدم', 'بادل', 'تنس', 'سلة'].map((sport, index) => (
            <TouchableOpacity key={index} className="bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700 items-center w-[22%]">
              <Ionicons 
                name={index === 0 ? 'football' : index === 1 ? 'tennisball' : index === 2 ? 'baseball' : 'basketball'} 
                size={24} color="#10B981" className="mb-2" 
              />
              <Text className="text-slate-300 font-[Cairo] text-xs mt-1">{sport}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Pitches */}
        <View className="flex-row justify-between items-center mb-4">
          <Link href="/search" asChild>
            <TouchableOpacity>
              <Text className="text-emerald-400 font-[Cairo] text-sm">عرض الكل</Text>
            </TouchableOpacity>
          </Link>
          <Text className="text-lg font-[CairoBold] text-white">الملاعب المميزة القريبة</Text>
        </View>

        {featuredPitches.length > 0 ? featuredPitches.map(pitch => (
          <Link href={`/pitch/${pitch.id}`} asChild key={pitch.id}>
            <TouchableOpacity className="bg-slate-800/80 rounded-3xl border border-emerald-500/30 overflow-hidden mb-4 shadow-lg">
              <View className="h-40 bg-slate-700 items-center justify-center">
                 <Ionicons name="image-outline" size={40} color="#475569" />
              </View>
              <View className="absolute top-3 right-3 bg-emerald-500 px-3 py-1 rounded-full flex-row items-center shadow-lg">
                <Ionicons name="star" size={12} color="#064E3B" />
                <Text className="text-emerald-950 font-[CairoBold] text-xs ml-1">مميز</Text>
              </View>
              <View className="p-5">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="bg-slate-900/50 px-2 py-1 rounded-lg flex-row items-center">
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text className="text-amber-500 font-[CairoBold] ml-1 text-xs">{pitch.avg_rating}</Text>
                  </View>
                  <Text className="text-xl font-[CairoBold] text-white text-right flex-1 ml-4">{pitch.name}</Text>
                </View>
                <View className="flex-row justify-end items-center mb-3">
                  <Text className="text-slate-400 font-[Cairo] text-sm mr-1">{pitch.district}، {pitch.city}</Text>
                  <Ionicons name="location-outline" size={16} color="#64748B" />
                </View>
                <View className="flex-row justify-between items-center mt-2 pt-4 border-t border-slate-700">
                  <Text className="text-emerald-400 font-[CairoBold] text-lg">{pitch.price_per_hour} ج.م <Text className="text-slate-500 text-sm">/ ساعة</Text></Text>
                  <View className="bg-emerald-500/20 px-3 py-1 rounded-full">
                    <Text className="text-emerald-400 font-[Cairo] text-xs">{pitch.sport_type === 'football' ? 'كرة قدم' : 'بادل'}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        )) : (
          <View className="bg-slate-800/50 rounded-2xl p-8 items-center border border-slate-700 border-dashed mb-6">
             <Text className="text-slate-400 font-[Cairo]">لا توجد ملاعب مميزة حالياً</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
