import React, { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useFocusEffect } from 'expo-router';
import * as Brightness from 'expo-brightness';
import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';
import { API_URL } from '../../config/api';

type Vehicle = {
  plate: string;
  make: string;
  model: string;
};

export default function StudentQRScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [qrToken, setQrToken] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(270);

  const fetchVehicles = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/vehicles/${user.id}`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      setVehicles(data);
      if (data.length > 0 && !selectedVehicle) {
        setSelectedVehicle(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQrToken = async () => {
    if (!user) return;
    try {
      // 1. Check if we have the secret offline
      let secretKey = await SecureStore.getItemAsync('qr_secret_key');
      
      // 2. If no secret, ask backend for it (Requires internet ONCE)
      if (!secretKey) {
        const token = await getToken();
        console.log('Fetching initial secret from backend...');
        const response = await fetch(`${API_URL}/users/sync-secret`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
        });
        const data = await response.json();
        
        if (data.secret) {
          secretKey = data.secret;
          await SecureStore.setItemAsync('qr_secret_key', secretKey); // Use standard type explicitly for setItemAsync to appease TS
        } else {
          throw new Error('Failed to obtain secret from server');
        }
      }

      // 3. Generate Token OFFLINE
      if (secretKey) {
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        
        const payloadObj = selectedVehicle
          ? { userId: user.id, plate: selectedVehicle.plate, timestamp: currentTimeInSeconds }
          : { userId: user.id, type: 'pedestrian', timestamp: currentTimeInSeconds };
          
        // Create an HMAC using CryptoJS
        const signature = CryptoJS.HmacSHA256(JSON.stringify(payloadObj), secretKey).toString(CryptoJS.enc.Hex);

        const secureTokenPayload = {
          payload: payloadObj,
          signature: signature
        };

        setQrToken(JSON.stringify(secureTokenPayload));
      }
    } catch (e) {
      console.error('Error generating offline QR token', e);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Maximize brightness to make scanning easier
  useFocusEffect(
    useCallback(() => {
      let previousBrightness: number | null = null;
      (async () => {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === 'granted') {
          previousBrightness = await Brightness.getBrightnessAsync();
          await Brightness.setBrightnessAsync(1); // Set to max brightness
        }
      })();

      return () => {
        if (previousBrightness !== null) {
          Brightness.setBrightnessAsync(previousBrightness); // Restore on blur
        }
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [user])
  );

  useFocusEffect(
    useCallback(() => {
      fetchQrToken();
      setTimeLeft(270);

      // Refresh token every 4.5 minutes (270 seconds), counting down each second
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            fetchQrToken();
            return 270;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }, [user, selectedVehicle])
  );

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center px-6 relative">
      <View className="absolute top-[-100] left-[-100] w-96 h-96 bg-sky-600 rounded-full opacity-10 blur-3xl"></View>

      <View className="bg-white p-8 rounded-3xl shadow-2xl shadow-sky-900/40 items-center w-full max-w-sm">
        <Text className="text-xl font-bold text-slate-800 mb-6 text-center">
          Tu Pase de Acceso
        </Text>

        <View className="items-center mb-6">
          <View className="p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm mb-3">
            {qrToken ? (
              <QRCode
                value={qrToken}
                size={200}
                color="#0f172a"
                backgroundColor="transparent"
              />
            ) : (
               <View style={{ width: 200, height: 200, justifyContent: 'center', alignItems: 'center' }}>
                 <Text>Generando QR...</Text>
               </View>
            )}
          </View>
          <View className="bg-sky-100 px-4 py-1 rounded-full flex-row items-center border border-sky-200">
            <View className="w-2 h-2 rounded-full bg-sky-500 mr-2" />
            <Text className="text-sky-700 font-semibold text-sm">
              Expira en {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        <Text className="text-lg font-bold text-slate-700">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</Text>
        <Text className="text-slate-500 mb-6 text-center">Estudiante</Text>

        {vehicles.length > 0 && (
          <View className="w-full mt-2 pt-6 border-t border-slate-200">
            <Text className="text-sm font-semibold text-slate-500 mb-3 ml-1">Seleccionar Vehículo:</Text>
            {vehicles.map((v) => (
              <View
                key={v.plate}
                className={`flex-row justify-between items-center p-3 mb-2 rounded-xl border ${selectedVehicle?.plate === v.plate ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-slate-50'}`}
                onTouchEnd={() => setSelectedVehicle(v)}
              >
                <View>
                  <Text className={`font-bold ${selectedVehicle?.plate === v.plate ? 'text-sky-700' : 'text-slate-700'}`}>
                    {v.plate}
                  </Text>
                  <Text className="text-xs text-slate-500">{v.make} {v.model}</Text>
                </View>
                {selectedVehicle?.plate === v.plate && (
                  <View className="w-4 h-4 rounded-full bg-sky-500" />
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
