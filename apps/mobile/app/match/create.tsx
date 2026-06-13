import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export default function CreateMatchScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [pitchName, setPitchName] = useState('');
  const [players, setPlayers] = useState('10');
  const [totalCost, setTotalCost] = useState('200');

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // In a real flow, the user selects from their existing bookings.
      // For MVP, we'll create a dummy booking and a match.
      
      const { data: bookingData, error: bookingError } = await supabase.from('bookings').insert({
        user_id: user.id,
        time_slot_id: '4eb04297-b873-4ea2-8d93-d2eb9031cba6', // replace with dynamic later
        booking_status: 'confirmed',
        total_price: parseFloat(totalCost)
      }).select('id').single();

      if (bookingError) throw bookingError;

      const reqPlayers = parseInt(players);
      const costPerPlayer = parseFloat(totalCost) / reqPlayers;

      const { error: matchError } = await supabase.from('matches').insert({
        booking_id: bookingData.id,
        creator_id: user.id,
        required_players: reqPlayers,
        current_players: 1, // The creator is already 1
        cost_per_player: costPerPlayer,
        is_public: true,
        status: 'open'
      });

      if (matchError) throw matchError;

      Alert.alert('تم', 'تم إنشاء المباراة المفتوحة بنجاح!', [
        { text: 'موافق', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء الإنشاء');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900 px-6 pt-4">
      <View className="flex-row justify-between items-center mb-8">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-800 rounded-full">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-2xl font-[CairoBold] text-white">إنشاء مباراة</Text>
      </View>

      <View className="space-y-4 mb-auto">
        <View className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 mb-4">
          <Text className="text-blue-400 font-[Cairo] text-right text-sm">
            في النسخة الكاملة سيتم اختيار الملعب والوقت من قائمة الملاعب المتاحة. في هذه النسخة التجريبية سيتم إنشاء مباراة افتراضية.
          </Text>
        </View>

        <View>
          <Text className="text-slate-400 font-[Cairo] text-right mb-2">إجمالي تكلفة الملعب</Text>
          <TextInput
            className="bg-slate-800 text-white font-[Cairo] px-4 py-3 rounded-2xl border border-slate-700 text-right"
            value={totalCost}
            onChangeText={setTotalCost}
            keyboardType="number-pad"
            placeholderTextColor="#64748B"
          />
        </View>

        <View>
          <Text className="text-slate-400 font-[Cairo] text-right mb-2">العدد المطلوب لاكتمال المباراة (بما فيهم أنت)</Text>
          <TextInput
            className="bg-slate-800 text-white font-[Cairo] px-4 py-3 rounded-2xl border border-slate-700 text-right"
            value={players}
            onChangeText={setPlayers}
            keyboardType="number-pad"
            placeholderTextColor="#64748B"
          />
        </View>

        <View className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 mt-4">
          <Text className="text-slate-300 font-[Cairo] text-right">تكلفة اللاعب الواحد ستكون:</Text>
          <Text className="text-2xl font-[CairoBold] text-emerald-400 text-right mt-1">
            {players && totalCost ? (parseFloat(totalCost) / parseInt(players)).toFixed(2) : 0} ج.م
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className={`bg-emerald-500 py-4 rounded-2xl items-center flex-row justify-center mb-6 ${loading ? 'opacity-70' : ''}`}
        onPress={handleCreate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#0F172A" />
        ) : (
          <Text className="text-slate-900 font-[CairoBold] text-lg">إنشاء مباراة مفتوحة</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
