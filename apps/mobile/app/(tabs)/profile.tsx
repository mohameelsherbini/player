import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export default function ProfileScreen() {
  const { user, profile, setProfile, signOut } = useAuthStore();
  const router = useRouter();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState(profile?.city || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleSignOut = async () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد من تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      { 
        text: 'نعم', 
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        }
      }
    ]);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updates = {
        id: user.id,
        full_name: fullName,
        phone,
        city,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('users').upsert(updates);
      if (error) throw error;
      
      // Update local store
      setProfile({ ...profile, ...updates });
      Alert.alert('تم', 'تم حفظ التغييرات بنجاح');
    } catch (error: any) {
      Alert.alert('خطأ', error.message || 'فشل في حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async () => {
    if (!user) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (result.canceled || !result.assets[0]) return;

      setUploading(true);
      const img = result.assets[0];
      
      // Read image as base64
      const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: 'base64' });
      
      const fileExt = img.uri.split('.').pop() || 'jpeg';
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64), {
          contentType: `image/${fileExt}`
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const newAvatarUrl = data.publicUrl;

      // Update profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      setProfile({ ...profile, avatar_url: newAvatarUrl });
      Alert.alert('تم', 'تم تحديث الصورة الشخصية');
      
    } catch (error: any) {
      Alert.alert('خطأ', error.message || 'فشل في رفع الصورة');
    } finally {
      setUploading(false);
    }
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
        <TouchableOpacity onPress={handleSignOut} className="p-2 bg-red-500/10 rounded-full">
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
        <Text className="text-2xl font-[CairoBold] text-white">حسابي</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* Avatar Section */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={uploadAvatar} disabled={uploading}>
            <View className="relative">
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} className="w-28 h-28 rounded-full border-2 border-emerald-500" />
              ) : (
                <View className="w-28 h-28 rounded-full bg-slate-800 items-center justify-center border-2 border-slate-700">
                  <Ionicons name="person" size={48} color="#64748B" />
                </View>
              )}
              
              {uploading && (
                <View className="absolute inset-0 bg-black/50 rounded-full justify-center items-center">
                  <ActivityIndicator color="#10B981" />
                </View>
              )}
              
              <View className="absolute bottom-0 right-0 bg-emerald-500 p-2 rounded-full border-2 border-slate-900">
                <Ionicons name="camera" size={16} color="#0F172A" />
              </View>
            </View>
          </TouchableOpacity>
          <Text className="text-white font-[CairoBold] text-xl mt-4">{fullName || 'مستخدم جديد'}</Text>
          <Text className="text-slate-400 font-[Cairo] text-sm">{user?.email}</Text>
        </View>

        {/* Form Section */}
        <View className="space-y-4 mb-8">
          <View>
            <Text className="text-slate-400 font-[Cairo] text-right mb-2">الاسم الكامل</Text>
            <TextInput
              className="bg-slate-800 text-white font-[Cairo] px-4 py-3 rounded-2xl border border-slate-700 text-right"
              value={fullName}
              onChangeText={setFullName}
              placeholder="الاسم الكامل"
              placeholderTextColor="#64748B"
            />
          </View>

          <View>
            <Text className="text-slate-400 font-[Cairo] text-right mb-2">رقم الهاتف</Text>
            <TextInput
              className="bg-slate-800 text-white font-[Cairo] px-4 py-3 rounded-2xl border border-slate-700 text-right"
              value={phone}
              onChangeText={setPhone}
              placeholder="01xxxxxxxxx"
              keyboardType="phone-pad"
              placeholderTextColor="#64748B"
            />
          </View>

          <View>
            <Text className="text-slate-400 font-[Cairo] text-right mb-2">المدينة</Text>
            <TextInput
              className="bg-slate-800 text-white font-[Cairo] px-4 py-3 rounded-2xl border border-slate-700 text-right"
              value={city}
              onChangeText={setCity}
              placeholder="القاهرة، الإسكندرية..."
              placeholderTextColor="#64748B"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          className={`bg-emerald-500 py-4 rounded-2xl items-center flex-row justify-center mb-6 ${saving ? 'opacity-70' : ''}`}
          onPress={saveProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text className="text-slate-900 font-[CairoBold] text-lg">حفظ التعديلات</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
