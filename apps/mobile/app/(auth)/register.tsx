import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (!email || !password || !name) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    
    // 1. Create user in auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone_number: phone,
        }
      }
    });

    if (authError) {
      Alert.alert('فشل التسجيل', authError.message);
      setLoading(false);
      return;
    }

    // Since we have an auth trigger, it will automatically insert the user into the public.users table!
    Alert.alert('تم التسجيل بنجاح', 'يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب (إن كان التفعيل مفعّلاً)');
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-900"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View className="w-full max-w-sm">
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-[CairoBold] text-white mb-2">حساب جديد</Text>
            <Text className="text-slate-400 text-sm font-[Cairo]">انضم إلينا وابدأ حجز ملاعبك المفضلة</Text>
          </View>

          {/* Form */}
          <View className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/50 shadow-lg">
            
            <View className="mb-4">
              <Text className="text-slate-300 font-[Cairo] text-right mb-2">الاسم الكامل</Text>
              <TextInput
                className="bg-slate-900/50 text-white font-[Cairo] px-4 py-3 rounded-2xl border border-slate-700 focus:border-emerald-500 text-right"
                onChangeText={setName}
                value={name}
                placeholder="أحمد محمد"
                placeholderTextColor="#64748B"
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-300 font-[Cairo] text-right mb-2">البريد الإلكتروني</Text>
              <TextInput
                className="bg-slate-900/50 text-white font-[Cairo] px-4 py-3 rounded-2xl border border-slate-700 focus:border-emerald-500 text-right"
                onChangeText={setEmail}
                value={email}
                placeholder="name@example.com"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-300 font-[Cairo] text-right mb-2">رقم الهاتف (اختياري)</Text>
              <TextInput
                className="bg-slate-900/50 text-white font-[Cairo] px-4 py-3 rounded-2xl border border-slate-700 focus:border-emerald-500 text-right"
                onChangeText={setPhone}
                value={phone}
                placeholder="01xxxxxxxxx"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
              />
            </View>

            <View className="mb-8">
              <Text className="text-slate-300 font-[Cairo] text-right mb-2">كلمة المرور</Text>
              <TextInput
                className="bg-slate-900/50 text-white font-[Cairo] px-4 py-3 rounded-2xl border border-slate-700 focus:border-emerald-500 text-right"
                onChangeText={setPassword}
                value={password}
                secureTextEntry={true}
                placeholder="••••••••"
                placeholderTextColor="#64748B"
              />
            </View>

            <TouchableOpacity
              className={`bg-emerald-500 py-4 rounded-2xl items-center flex-row justify-center ${loading ? 'opacity-70' : ''}`}
              disabled={loading}
              onPress={signUpWithEmail}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-slate-900 font-[CairoBold] text-lg">إنشاء حساب</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View className="mt-8 flex-row justify-center space-x-1 space-x-reverse">
            <Text className="text-slate-400 font-[Cairo]">لديك حساب بالفعل؟</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-emerald-400 font-[CairoBold]">تسجيل الدخول</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
