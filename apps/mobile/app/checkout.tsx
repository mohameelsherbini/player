import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export default function CheckoutScreen() {
  const { bookingId, amount } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'card' | 'wallet' | 'cash'>('card');

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (method === 'cash') {
        // Just update booking to confirmed
        const { error } = await supabase
          .from('bookings')
          .update({ booking_status: 'confirmed' })
          .eq('id', bookingId);
        
        if (error) throw error;

        // Record cash payment
        await supabase.from('payments').insert({
          booking_id: bookingId,
          user_id: user?.id,
          amount: parseFloat(amount as string),
          provider: 'cash',
          status: 'completed',
        });

        Alert.alert('تم بنجاح', 'تم تأكيد حجزك الدفع عند الوصول!', [
          { text: 'موافق', onPress: () => router.push('/(tabs)/bookings') }
        ]);
      } else {
        // Simulate Paymob card/wallet flow
        // In real app: Call edge function to get paymob iframe URL, open WebView
        setTimeout(async () => {
          const { error } = await supabase
            .from('bookings')
            .update({ booking_status: 'confirmed' })
            .eq('id', bookingId);
          
          if (error) throw error;

          await supabase.from('payments').insert({
            booking_id: bookingId,
            user_id: user?.id,
            amount: parseFloat(amount as string),
            provider: method === 'card' ? 'paymob_card' : 'paymob_wallet',
            status: 'completed',
          });

          Alert.alert('تمت العملية', 'تم الدفع وتأكيد الحجز بنجاح!', [
            { text: 'موافق', onPress: () => router.push('/(tabs)/bookings') }
          ]);
          setLoading(false);
        }, 1500);
      }
    } catch (error: any) {
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء الدفع');
    } finally {
      if (method === 'cash') setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900 px-6 pt-4">
      <View className="flex-row justify-between items-center mb-8">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-800 rounded-full">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-2xl font-[CairoBold] text-white">إتمام الدفع</Text>
      </View>

      <View className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-3xl items-center mb-8">
        <Text className="text-slate-400 font-[Cairo] mb-2">المبلغ المطلوب للدفع</Text>
        <Text className="text-4xl font-[CairoBold] text-emerald-400">{amount} ج.م</Text>
      </View>

      <Text className="text-xl font-[CairoBold] text-white text-right mb-4">اختر طريقة الدفع</Text>

      <View className="space-y-4 mb-auto">
        <TouchableOpacity 
          className={`flex-row-reverse items-center p-4 rounded-2xl border ${method === 'card' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}
          onPress={() => setMethod('card')}
        >
          <Ionicons name="card" size={28} color={method === 'card' ? '#10B981' : '#64748B'} className="ml-4" />
          <View className="flex-1">
            <Text className={`text-right font-[CairoBold] text-lg ${method === 'card' ? 'text-emerald-400' : 'text-slate-300'}`}>البطاقة البنكية</Text>
            <Text className="text-right text-slate-500 font-[Cairo] text-sm">Visa, MasterCard, Meeza</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          className={`flex-row-reverse items-center p-4 rounded-2xl border ${method === 'wallet' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}
          onPress={() => setMethod('wallet')}
        >
          <Ionicons name="phone-portrait" size={28} color={method === 'wallet' ? '#10B981' : '#64748B'} className="ml-4" />
          <View className="flex-1">
            <Text className={`text-right font-[CairoBold] text-lg ${method === 'wallet' ? 'text-emerald-400' : 'text-slate-300'}`}>المحافظ الإلكترونية</Text>
            <Text className="text-right text-slate-500 font-[Cairo] text-sm">Vodafone Cash, Fawry</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          className={`flex-row-reverse items-center p-4 rounded-2xl border ${method === 'cash' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}
          onPress={() => setMethod('cash')}
        >
          <Ionicons name="cash" size={28} color={method === 'cash' ? '#10B981' : '#64748B'} className="ml-4" />
          <View className="flex-1">
            <Text className={`text-right font-[CairoBold] text-lg ${method === 'cash' ? 'text-emerald-400' : 'text-slate-300'}`}>الدفع عند الوصول</Text>
            <Text className="text-right text-slate-500 font-[Cairo] text-sm">الدفع نقداً في الملعب</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className={`bg-emerald-500 py-4 rounded-2xl items-center flex-row justify-center mb-6 ${loading ? 'opacity-70' : ''}`}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#0F172A" />
        ) : (
          <Text className="text-slate-900 font-[CairoBold] text-lg">
            {method === 'cash' ? 'تأكيد الحجز' : `دفع ${amount} ج.م`}
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
