import '../global.css';
import { useFonts, Cairo_400Regular, Cairo_700Bold } from '@expo-google-fonts/cairo';

import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { usePushNotifications } from '@/hooks/usePushNotifications';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Force Dark Theme for Yalla Book
const YallaDarkTheme = {
  colors: {
    primary: '#10B981', // emerald-500
    background: '#0F172A', // slate-900
    card: '#1E293B', // slate-800
    text: '#F8FAFC', // slate-50
    border: '#334155', // slate-700
    notification: '#F59E0B', // amber-500
  },
};


export default function RootLayout() {
  const [loaded, error] = useFonts({
    Cairo: Cairo_400Regular,
    CairoBold: Cairo_700Bold,
  });

  const { session, setSession, setInitialized, isInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Initialize push notifications
  usePushNotifications(session?.user?.id);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  // Check onboarding status
  useEffect(() => {
    import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
      AsyncStorage.getItem('@has_seen_onboarding').then((val) => {
        setHasSeenOnboarding(val === 'true');
      });
    });
  }, []);

  // Protected Routes Logic
  useEffect(() => {
    if (!isInitialized || !loaded || hasSeenOnboarding === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    
    if (!hasSeenOnboarding && !inOnboarding) {
      router.replace('/onboarding');
      return;
    }

    if (!session && !inAuthGroup && hasSeenOnboarding && !inOnboarding) {
      // Not logged in and trying to access protected route -> redirect to login
      router.replace('/(auth)/login');
    } else if (session && (inAuthGroup || inOnboarding)) {
      // Logged in and trying to access auth screens -> redirect to home
      router.replace('/(tabs)');
    }
  }, [session, isInitialized, segments, loaded, hasSeenOnboarding]);

  useEffect(() => {
    if (loaded && isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isInitialized]);

  if (!loaded || !isInitialized) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F172A' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="pitch/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="filter-modal" options={{ presentation: 'modal' }} />
      </Stack>
    </QueryClientProvider>
  );
}
