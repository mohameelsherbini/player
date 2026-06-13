import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function MatchesScreen() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          required_players,
          current_players,
          cost_per_player,
          status,
          bookings (
            time_slots (
              start_time,
              pitch_schedules (
                pitches ( name, location_text )
              )
            )
          )
        `)
        .eq('is_public', true)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const renderMatch = ({ item }: { item: any }) => {
    const pitch = item.bookings?.time_slots?.pitch_schedules?.pitches;
    const time = item.bookings?.time_slots?.start_time?.substring(0, 5);

    return (
      <TouchableOpacity 
        className="bg-slate-800 p-4 rounded-3xl mb-4 border border-slate-700 shadow-lg"
        onPress={() => router.push(`/match/${item.id}`)}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="bg-emerald-500/20 px-3 py-1 rounded-full">
            <Text className="text-emerald-400 font-[CairoBold] text-xs">متاح للانضمام</Text>
          </View>
          <View className="items-end">
            <Text className="text-white font-[CairoBold] text-lg">{pitch?.name || 'ملعب غير معروف'}</Text>
            <Text className="text-slate-400 font-[Cairo] text-sm">{pitch?.location_text || '-'}</Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center bg-slate-900/50 p-3 rounded-2xl">
          <View className="items-center">
            <Ionicons name="time-outline" size={20} color="#10B981" />
            <Text className="text-white font-[CairoBold] mt-1">{time || '--:--'}</Text>
          </View>
          
          <View className="items-center border-l border-r border-slate-700 px-6">
            <Ionicons name="people-outline" size={20} color="#3B82F6" />
            <Text className="text-white font-[CairoBold] mt-1">
              {item.current_players} / {item.required_players}
            </Text>
          </View>
          
          <View className="items-center">
            <Ionicons name="cash-outline" size={20} color="#F59E0B" />
            <Text className="text-white font-[CairoBold] mt-1">{item.cost_per_player} ج</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="px-6 py-4 border-b border-slate-800 flex-row justify-between items-center">
        <TouchableOpacity className="p-2 bg-slate-800 rounded-full" onPress={() => router.push('/match/create')}>
          <Ionicons name="add" size={24} color="#10B981" />
        </TouchableOpacity>
        <Text className="text-2xl font-[CairoBold] text-white">المباريات المفتوحة</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatch}
          contentContainerStyle={{ padding: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="football-outline" size={64} color="#334155" />
              <Text className="text-slate-400 font-[Cairo] mt-4 text-center text-lg">
                لا توجد مباريات مفتوحة حالياً،{"\n"}كُن أول من ينشئ مباراة!
              </Text>
              <TouchableOpacity 
                className="mt-6 bg-emerald-500 px-6 py-3 rounded-xl"
                onPress={() => router.push('/match/create')}
              >
                <Text className="text-slate-900 font-[CairoBold]">إنشاء مباراة جديدة</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
