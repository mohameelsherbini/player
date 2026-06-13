import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export default function RatePitchScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        pitch_id: id,
        user_id: user.id,
        rating,
        comment
      });

      if (error) throw error;

      // In real life, Supabase Trigger `update_pitch_rating()` will update the `avg_rating` automatically
      
      Alert.alert('تم', 'شكراً لك! تم إضافة التقييم بنجاح', [
        { text: 'موافق', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء إرسال التقييم');
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
        <Text className="text-2xl font-[CairoBold] text-white">تقييم الملعب</Text>
      </View>

      <View className="items-center mb-8">
        <View className="bg-emerald-500/10 p-6 rounded-full mb-6">
          <Ionicons name="star" size={64} color="#10B981" />
        </View>
        <Text className="text-white font-[CairoBold] text-xl mb-4 text-center">ما هو تقييمك لتجربة الحجز في هذا الملعب؟</Text>
        
        <View className="flex-row gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons 
                name={star <= rating ? "star" : "star-outline"} 
                size={40} 
                color={star <= rating ? "#F59E0B" : "#64748B"} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-auto">
        <Text className="text-slate-400 font-[Cairo] text-right mb-2">أضف تعليقاً (اختياري)</Text>
        <TextInput
          className="bg-slate-800 text-white font-[Cairo] px-4 py-4 rounded-2xl border border-slate-700 text-right h-32"
          value={comment}
          onChangeText={setComment}
          placeholder="اكتب رأيك في الملعب..."
          placeholderTextColor="#64748B"
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        className={`bg-emerald-500 py-4 rounded-2xl items-center flex-row justify-center mb-6 ${loading ? 'opacity-70' : ''}`}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#0F172A" />
        ) : (
          <Text className="text-slate-900 font-[CairoBold] text-lg">إرسال التقييم</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
