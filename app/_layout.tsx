import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from '../db/setup';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { View, Text, ActivityIndicator } from 'react-native';
import "../global.css";

function RootNavigation() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Basic navigation guard logic
    if (isLoading) return;
    
    // Set ready to avoid initial flash
    setIsReady(true);
    
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      // Redirect to login if not logged in
      router.replace('/(auth)/login');
    } else if (user) {
      // Redirect based on role if logged in
      if (user.role === 'student' && segments[0] !== '(student)') {
        router.replace('/(student)/');
      } else if (user.role === 'admin' && segments[0] !== '(admin)') {
        router.replace('/(admin)/');
      }
    }
  }, [user, segments, isLoading]);

  if (!isReady || isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(student)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="keyalumnos.db" onInit={initializeDatabase} useSuspense>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
    </SQLiteProvider>
  );
}
