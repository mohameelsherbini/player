import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          pitch_id,
          pitches (
            id,
            name,
            location_text,
            price_per_hour,
            avg_rating
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (pitchId: string) => {
    try {
      setFavorites(favorites.filter(f => f.pitch_id !== pitchId));
      await supabase.from('favorites').delete().eq('user_id', user?.id).eq('pitch_id', pitchId);
    } catch (err) {
      console.error(err);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const pitch = item.pitches;
    if (!pitch) return null;

    return (
      <TouchableOpacity 
        className="bg-slate-800 p-4 rounded-3xl mb-4 border border-slate-700 shadow-lg flex-row justify-between items-center"
        onPress={() => router.push(`/pitch/${pitch.id}`)}
      >
        <TouchableOpacity onPress={() => removeFavorite(pitch.id)} className="p-2 bg-red-500/20 rounded-full">
          <Ionicons name="heart" size={24} color="#EF4444" />
        </TouchableOpacity>

        <View className="flex-1 items-end mr-4">
          <Text className="text-white font-[CairoBold] text-lg">{pitch.name}</Text>
          <Text className="text-slate-400 font-[Cairo] text-sm">{pitch.location_text}</Text>
          <View className="flex-row items-center gap-2 mt-2">
            <Text className="text-emerald-400 font-[CairoBold]">{pitch.price_per_hour} ج / ساعة</Text>
            <View className="flex-row items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-lg">
              <Text className="text-amber-400 font-[CairoBold] text-xs">{pitch.avg_rating || 5.0}</Text>
              <Ionicons name="star" size={12} color="#F59E0B" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center p-6">
        <Text className="text-white font-[CairoBold] text-xl mb-4">يجب تسجيل الدخول أولاً</Text>
        <TouchableOpacity 
          className="bg-emerald-500 py-3 px-8 rounded-xl"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-slate-900 font-[CairoBold]">تسجيل الدخول</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="px-6 py-4 border-b border-slate-800 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-800 rounded-full">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-2xl font-[CairoBold] text-white">الملاعب المفضلة</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.pitch_id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 24 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="heart-outline" size={64} color="#334155" />
              <Text className="text-slate-400 font-[Cairo] mt-4 text-center text-lg">
                قائمتك فارغة،{"\n"}تصفح الملاعب وأضفها لمفضلتك!
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
