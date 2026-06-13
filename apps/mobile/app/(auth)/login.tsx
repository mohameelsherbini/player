import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('فشل تسجيل الدخول', error.message);
      setLoading(false);
    } else {
      setLoading(false);
      // Router will automatically navigate to (tabs) due to the _layout guard
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-900 justify-center items-center px-6"
    >
      <View className="w-full max-w-sm">
        {/* Logo or App Name */}
        <View className="items-center mb-10">
          <Text className="text-4xl font-[CairoBold] text-emerald-400 mb-2">يلا حجز</Text>
          <Text className="text-slate-400 text-base font-[Cairo]">المنصة الأولى لحجز الملاعب</Text>
        </View>

        {/* Glassmorphic Form Card */}
        <View className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/50 shadow-lg">
          <Text className="text-2xl font-[CairoBold] text-white text-right mb-6">تسجيل الدخول</Text>
          
          <View className="mb-4">
            <Text className="text-slate-300 font-[Cairo] text-right mb-2">البريد الإلكتروني</Text>
            <TextInput
              className="bg-slate-900/50 text-white font-[Cairo] px-4 py-3 rounded-2xl border border-slate-700 focus:border-emerald-500 text-right"
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholder="name@example.com"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View className="mb-8">
            <Text className="text-slate-300 font-[Cairo] text-right mb-2">كلمة المرور</Text>
            <TextInput
              className="bg-slate-900/50 text-white font-[Cairo] px-4 py-3 rounded-2xl border border-slate-700 focus:border-emerald-500 text-right"
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              placeholder="••••••••"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            className={`bg-emerald-500 py-4 rounded-2xl items-center flex-row justify-center ${loading ? 'opacity-70' : ''}`}
            disabled={loading}
            onPress={signInWithEmail}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-slate-900 font-[CairoBold] text-lg">دخول</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign up link */}
        <View className="mt-8 flex-row justify-center space-x-1 space-x-reverse">
          <Text className="text-slate-400 font-[Cairo]">ليس لديك حساب؟</Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text className="text-emerald-400 font-[CairoBold]">إنشاء حساب جديد</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
