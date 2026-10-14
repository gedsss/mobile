import {
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/baloo-2';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { queryClient } from '@/api/query-client';
import { AuthProvider, useAuth } from '@/auth/auth-context';
import { Colors } from '@/constants/theme';
import { registerServiceWorker } from '@/utils/pwa';

SplashScreen.preventAutoHideAsync();
registerServiceWorker();

function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <Stack>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="species/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="catch/[id]" options={{ title: 'Captura' }} />
        <Stack.Screen name="user/[id]" options={{ title: 'Perfil' }} />
        <Stack.Screen name="friends/index" options={{ headerShown: false }} />
        <Stack.Screen name="friends/add" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({ Baloo2_800ExtraBold, Baloo2_700Bold, Baloo2_600SemiBold });

  if (!fontsLoaded) return null;

  const isDark = colorScheme === 'dark';
  const palette = isDark ? Colors.dark : Colors.light;
  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: palette.background,
      card: palette.backgroundElement,
      text: palette.text,
      border: palette.border,
      primary: palette.primary,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
