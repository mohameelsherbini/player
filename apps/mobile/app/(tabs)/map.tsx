import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useFilterStore } from '@/stores/filterStore';

export default function MapScreen() {
  const [pitches, setPitches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { sportType, minPrice, maxPrice, minRating } = useFilterStore();

  // Egypt center coordinates as default
  const defaultRegion = {
    latitude: 30.0444,
    longitude: 31.2357,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  const fetchPitches = async () => {
    setLoading(true);
    try {
      let query = supabase.from('pitches').select('id, name, location_text, price_per_hour, location, pitch_type').eq('status', 'active');
      
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      if (sportType) {
        query = query.eq('pitch_type', sportType);
      }
      
      if (minPrice > 0) {
        query = query.gte('price_per_hour', minPrice);
      }
      
      if (maxPrice < 2000) {
        query = query.lte('price_per_hour', maxPrice);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setPitches(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPitches();
  }, [searchQuery, sportType, minPrice, maxPrice, minRating]);

  return (
    <View className="flex-1 bg-slate-900">
      {/* Search Header */}
      <SafeAreaView edges={['top']} className="bg-slate-900/90 z-10 absolute top-0 w-full pb-4">
        <View className="px-6 flex-row items-center space-x-2 space-x-reverse mt-2">
          <View className="flex-1 flex-row items-center bg-slate-800 rounded-2xl px-4 border border-slate-700">
            <Ionicons name="search" size={20} color="#64748B" />
            <TextInput
              className="flex-1 py-3 px-2 text-white font-[Cairo] text-right"
              placeholder="ابحث عن ملعب..."
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/filter-modal')}
            className="bg-emerald-500 p-3 rounded-2xl items-center justify-center relative"
          >
            {(sportType || minPrice > 0 || maxPrice < 2000) && (
              <View className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border border-slate-900 z-20" />
            )}
            <Ionicons name="options" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Map */}
      {Platform.OS === 'web' ? (
        <View className="flex-1 bg-slate-800 items-center justify-center px-6">
          <Ionicons name="map-outline" size={64} color="#334155" />
          <Text className="text-slate-400 font-[Cairo] mt-4 text-center text-lg">
            الخريطة غير مدعومة في متصفح الويب حالياً.
            يرجى استخدام تطبيق الهاتف لرؤية الملاعب على الخريطة.
          </Text>
        </View>
      ) : (
        <MapView 
          style={{ flex: 1 }} 
          initialRegion={defaultRegion}
          userInterfaceStyle="dark"
        >
          {pitches.map((pitch) => {
            const lat = 30.0444 + (Math.random() - 0.5) * 0.1;
            const lng = 31.2357 + (Math.random() - 0.5) * 0.1;

            return (
              <Marker
                key={pitch.id}
                coordinate={{ latitude: lat, longitude: lng }}
              >
                <View className="bg-emerald-500 p-2 rounded-full border-2 border-white shadow-lg">
                  <Ionicons name="football" size={16} color="#0F172A" />
                </View>
                <Callout onPress={() => router.push(`/pitch/${pitch.id}`)}>
                  <View className="w-48 p-2 items-center">
                    <Text className="font-[CairoBold] text-slate-900 text-center mb-1">{pitch.name}</Text>
                    <Text className="font-[Cairo] text-slate-600 text-xs text-center mb-2">{pitch.location_text}</Text>
                    <Text className="font-[CairoBold] text-emerald-600">{pitch.price_per_hour} ج.م / ساعة</Text>
                    <TouchableOpacity className="mt-2 bg-slate-900 px-4 py-2 rounded-xl">
                      <Text className="text-white font-[CairoBold] text-xs text-center">احجز الآن</Text>
                    </TouchableOpacity>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      )}

      {loading && (
        <View className="absolute top-32 left-1/2 -ml-4 bg-slate-800 p-2 rounded-full shadow-lg">
          <ActivityIndicator color="#10B981" />
        </View>
      )}
    </View>
  );
}
