import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'اكتشف أفضل الملاعب',
    description: 'ابحث عن أقرب وأفضل الملاعب حولك في ثوانٍ معدودة. اختر من بين عشرات الخيارات.',
    icon: 'search-outline',
    color: '#10B981' // Emerald
  },
  {
    id: '2',
    title: 'حجز فوري ومؤكد',
    description: 'احجز وقتك المفضل بضغطة زر، وادفع إلكترونياً بطرق الدفع المتعددة بأمان تام.',
    icon: 'calendar-outline',
    color: '#3B82F6' // Blue
  },
  {
    id: '3',
    title: 'العب مع الآخرين',
    description: 'انضم للمباريات المفتوحة، وتعرف على لاعبين جدد في مدينتك. يلا حجز يجمعنا!',
    icon: 'football-outline',
    color: '#8B5CF6' // Purple
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await AsyncStorage.setItem('@has_seen_onboarding', 'true');
      router.replace('/(auth)/login');
    }
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
    return (
      <View style={{ width }} className="items-center justify-center p-8">
        <View 
          className="w-64 h-64 rounded-full items-center justify-center mb-10"
          style={{ backgroundColor: `${item.color}20` }}
        >
          <Ionicons name={item.icon as any} size={120} color={item.color} />
        </View>
        <Text className="text-3xl font-[CairoBold] text-white text-center mb-4">
          {item.title}
        </Text>
        <Text className="text-slate-400 font-[Cairo] text-center text-lg leading-8">
          {item.description}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
        inverted={true} // For Arabic RTL feel if needed, but horizontal might be tricky. Let's keep default.
      />

      <View className="px-8 pb-12 pt-6">
        <View className="flex-row justify-center mb-10">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 transition-all duration-300 ${
                currentIndex === index ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          className="bg-emerald-500 py-4 rounded-2xl items-center shadow-lg shadow-emerald-500/30"
        >
          <Text className="text-slate-950 font-[CairoBold] text-lg">
            {currentIndex === SLIDES.length - 1 ? 'ابدأ الآن' : 'التالي'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
