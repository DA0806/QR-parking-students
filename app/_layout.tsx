import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ClerkProvider, useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator } from 'react-native';
import "../global.css";

import { API_URL } from '../config/api';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log('No values stored under key: ' + key);
      }
      return item;
    } catch (error) {
      console.error('SecureStore get item error: ', error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

function RootNavigation() {
  const { isLoaded, isSignedIn, userId, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  // Sync user with our local Node.js backend when Clerk establishes session
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      fetch(`${API_URL}/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerk_id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          name: clerkUser.fullName || clerkUser.firstName || 'Usuario',
        })
      })
      .then(res => res.json())
      .then(data => {
        setRole(data.role); // student, admin, superadmin
      })
      .catch((e) => {
          console.error("Fetch DB error: ", e);
          // Si el servidor está caído, cerrar sesión para que no se atrape allí forever.
          // signOut();
      });
    } else {
      setRole(null);
    }
  }, [isSignedIn, clerkUser]);

  useEffect(() => {
    if (!isLoaded) return;
    
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isSignedIn && role) {
      if (role === 'student' && segments[0] !== '(student)') {
        router.replace('/(student)/');
      } else if (role === 'admin' && segments[0] !== '(admin)') {
        router.replace('/(admin)/');
      } else if (role === 'superadmin' && segments[0] !== '(superadmin)') {
        router.replace('/(superadmin)/zones');
      }
    }
  }, [isLoaded, isSignedIn, segments, role]);

  if (!isLoaded || (isSignedIn && !role)) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(student)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(superadmin)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <RootNavigation />
    </ClerkProvider>
  );
}
