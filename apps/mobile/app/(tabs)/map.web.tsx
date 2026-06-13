import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreenWeb() {
  return (
    <View className="flex-1 bg-slate-900">
      <SafeAreaView edges={['top']} className="bg-slate-900/90 z-10 absolute top-0 w-full pb-4">
        <View className="px-6 flex-row items-center space-x-2 space-x-reverse mt-2">
          <View className="flex-1 flex-row items-center bg-slate-800 rounded-2xl px-4 border border-slate-700">
            <Ionicons name="search" size={20} color="#64748B" />
            <TextInput
              className="flex-1 py-3 px-2 text-white font-[Cairo] text-right"
              placeholder="ابحث عن ملعب..."
              placeholderTextColor="#64748B"
              editable={false}
            />
          </View>
        </View>
      </SafeAreaView>

      <View className="flex-1 bg-slate-800 items-center justify-center px-6">
        <Ionicons name="map-outline" size={64} color="#334155" />
        <Text className="text-slate-400 font-[Cairo] mt-4 text-center text-lg">
          الخريطة التفاعلية غير مدعومة في متصفح الويب حالياً.
          يرجى استخدام تطبيق الهاتف لرؤية الملاعب على الخريطة.
        </Text>
      </View>
    </View>
  );
}
