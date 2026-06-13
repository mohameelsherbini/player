import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export default function MatchDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    fetchMatchDetails();
  }, [id]);

  const fetchMatchDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          users!matches_creator_id_fkey ( full_name ),
          match_players ( user_id ),
          bookings (
            time_slots (
              start_time,
              end_time,
              pitch_schedules (
                pitches ( name, location_text )
              )
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setMatch(data);
      
      // Check if current user is already joined
      if (user && data.match_players) {
        const joined = data.match_players.some((p: any) => p.user_id === user.id);
        setIsJoined(joined);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user) {
      Alert.alert('تنبيه', 'يجب تسجيل الدخول للانضمام للمباراة');
      return router.push('/(auth)/login');
    }

    if (match.current_players >= match.required_players) {
      return Alert.alert('عذراً', 'هذه المباراة مكتملة العدد');
    }

    setJoining(true);
    try {
      // 1. Insert into match_players
      const { error: joinError } = await supabase.from('match_players').insert({
        match_id: match.id,
        user_id: user.id,
        payment_status: 'paid' // Simulated payment for MVP
      });

      if (joinError) {
        if (joinError.code === '23505') {
          // unique violation
          setIsJoined(true);
          return Alert.alert('تنبيه', 'أنت منضم بالفعل لهذه المباراة');
        }
        throw joinError;
      }

      // 2. Increment current_players
      const newCount = match.current_players + 1;
      const newStatus = newCount >= match.required_players ? 'full' : 'open';

      await supabase.from('matches').update({
        current_players: newCount,
        status: newStatus
      }).eq('id', match.id);

      setIsJoined(true);
      setMatch({ ...match, current_players: newCount, status: newStatus });
      Alert.alert('تم بنجاح', 'تم انضمامك للمباراة بنجاح!');
      
    } catch (error: any) {
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء الانضمام');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <Text className="text-white font-[CairoBold]">المباراة غير موجودة</Text>
      </SafeAreaView>
    );
  }

  const pitch = match.bookings?.time_slots?.pitch_schedules?.pitches;
  const time = match.bookings?.time_slots?.start_time?.substring(0, 5);

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="px-6 pt-4 pb-2 border-b border-slate-800 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-800 rounded-full">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-[CairoBold] text-white">تفاصيل المباراة</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="bg-slate-800 rounded-3xl p-6 border border-slate-700 mb-6">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-emerald-500/20 rounded-full items-center justify-center mb-4">
              <Ionicons name="football" size={32} color="#10B981" />
            </View>
            <Text className="text-2xl font-[CairoBold] text-white text-center">{pitch?.name}</Text>
            <Text className="text-slate-400 font-[Cairo] mt-1 text-center">{pitch?.location_text}</Text>
          </View>

          <View className="flex-row justify-between bg-slate-900/50 p-4 rounded-2xl mb-4">
            <View className="items-center">
              <Text className="text-slate-400 font-[Cairo] text-xs mb-1">صاحب المباراة</Text>
              <Text className="text-white font-[CairoBold]">{match.users?.full_name}</Text>
            </View>
            <View className="items-center border-l border-r border-slate-700 px-4">
              <Text className="text-slate-400 font-[Cairo] text-xs mb-1">التوقيت</Text>
              <Text className="text-white font-[CairoBold]">{time}</Text>
            </View>
            <View className="items-center">
              <Text className="text-slate-400 font-[Cairo] text-xs mb-1">تكلفة الفرد</Text>
              <Text className="text-emerald-400 font-[CairoBold]">{match.cost_per_player} ج</Text>
            </View>
          </View>

          <View className="items-center">
            <Text className="text-slate-400 font-[Cairo] mb-2">اللاعبين (الاكتمال)</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-3xl font-[CairoBold] text-white">{match.current_players}</Text>
              <Text className="text-xl text-slate-500 font-[CairoBold]">/ {match.required_players}</Text>
            </View>
            
            {/* Progress Bar */}
            <View className="w-full h-2 bg-slate-700 rounded-full mt-4 overflow-hidden">
              <View 
                className={`h-full ${match.status === 'full' ? 'bg-red-500' : 'bg-emerald-500'}`} 
                style={{ width: `${(match.current_players / match.required_players) * 100}%` }}
              />
            </View>
          </View>
        </View>

      </ScrollView>

      <View className="p-6 bg-slate-900 border-t border-slate-800">
        <TouchableOpacity
          className={`py-4 rounded-2xl items-center flex-row justify-center ${
            isJoined ? 'bg-slate-700' : 
            match.status === 'full' ? 'bg-red-500/20' : 'bg-emerald-500'
          } ${joining ? 'opacity-70' : ''}`}
          onPress={handleJoin}
          disabled={joining || isJoined || match.status === 'full'}
        >
          {joining ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text className={`font-[CairoBold] text-lg ${
              isJoined ? 'text-white' :
              match.status === 'full' ? 'text-red-400' : 'text-slate-900'
            }`}>
              {isJoined ? 'تم الانضمام' : 
               match.status === 'full' ? 'مكتملة العدد' : 'دفع والانضمام للمباراة'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
