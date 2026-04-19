import React, { useState, useCallback } from 'react';
import { View, Text, Switch } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../context/AuthContext';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';

type Vehicle = {
  plate: string;
  make: string;
  model: string;
};

export default function StudentQRScreen() {
  const { user } = useAuth();
  const db = useSQLiteContext();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const fetchVehicles = async () => {
    if (!user) return;
    try {
      const result = await db.getAllAsync<Vehicle>('SELECT * FROM Vehicles WHERE owner_id = ?', [user.id]);
      setVehicles(result);
      if (result.length > 0 && !selectedVehicle) {
        setSelectedVehicle(result[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [user])
  );

  const qrValue = selectedVehicle
    ? JSON.stringify({ plate: selectedVehicle.plate, userId: user?.id })
    : JSON.stringify({ userId: user?.id, type: 'pedestrian' });

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center px-6 relative">
      <View className="absolute top-[-100] left-[-100] w-96 h-96 bg-sky-600 rounded-full opacity-10 blur-3xl"></View>

      <View className="bg-white p-8 rounded-3xl shadow-2xl shadow-sky-900/40 items-center w-full max-w-sm">
        <Text className="text-xl font-bold text-slate-800 mb-6 text-center">
          Tu Pase de Acceso
        </Text>

        <View className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6 shadow-sm">
          <QRCode
            value={qrValue}
            size={200}
            color="#0f172a"
            backgroundColor="transparent"
          />
        </View>

        <Text className="text-lg font-bold text-slate-700">{user?.name}</Text>
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
