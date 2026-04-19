import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, TouchableOpacity } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

export default function AdminScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [selectedZone, setSelectedZone] = useState<number>(1); // Assuming 1 is Parqueo Norte
  const db = useSQLiteContext();
  const navigation = useNavigation();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    try {
      const qrData = JSON.parse(data);
      if (!qrData.plate) {
        Alert.alert('Error', 'QR Inválido o sin vehículo asociado.');
        return;
      }

      // Check current zone capacity
      const zone = await db.getFirstAsync<{ current_occupancy: number, total_capacity: number }>(
        'SELECT current_occupancy, total_capacity FROM Zones WHERE id = ?',
        [selectedZone]
      );

      if (!zone) {
        Alert.alert('Error', 'Zona inválida.');
        return;
      }

      // Allow choose entry or exit? Let's just ask the user or infer based on logic.
      // Logic: if already inside, it's an exit. We check the last event.
      const lastEvent = await db.getFirstAsync<{ event_type: string }>(
        'SELECT event_type FROM AccessEvents WHERE vehicle_plate = ? ORDER BY timestamp DESC LIMIT 1',
        [qrData.plate]
      );

      const isEntry = !lastEvent || lastEvent.event_type === 'EXIT';

      if (isEntry && zone.current_occupancy >= zone.total_capacity) {
        Alert.alert('Acceso Denegado', 'El parqueo está lleno.');
        return;
      }

      // Register event
      await db.runAsync(
        'INSERT INTO AccessEvents (vehicle_plate, zone_id, event_type) VALUES (?, ?, ?)',
        [qrData.plate, selectedZone, isEntry ? 'ENTRY' : 'EXIT']
      );

      // Update occupancy
      const delta = isEntry ? 1 : -1;
      await db.runAsync(
        'UPDATE Zones SET current_occupancy = current_occupancy + ? WHERE id = ?',
        [delta, selectedZone]
      );

      Alert.alert(
        isEntry ? 'Ingreso Autorizado' : 'Salida Registrada',
        `Vehículo ${qrData.plate}\nvía ${isEntry ? 'Entrada' : 'Salida'} exitosa.`,
        [{ text: 'Aceptar', onPress: () => setScanned(false) }]
      );
    } catch (e: any) {
      console.log('Error de Escaneo:', e?.message || e);
      Alert.alert('Error de Escaneo', 'Código QR no reconocido de Key Alumnos.', [
        { text: 'Aceptar', onPress: () => setScanned(false) }
      ]);
    }
  };

  if (hasPermission === null) {
    return <View className="flex-1 bg-slate-900 justify-center items-center"><Text className="text-white">Solicitando permiso de cámara...</Text></View>;
  }
  if (hasPermission === false) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center px-6">
        <Ionicons name="camera-outline" size={64} color="#64748b" className="mb-4" />
        <Text className="text-white text-center text-lg">No hay acceso a la cámara. Por favor autoriza la cámara en las configuraciones.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      <View className="p-6 pb-4">
        <Text className="text-2xl font-bold text-white">Escáner de Acceso</Text>
        <Text className="text-slate-400 mt-1">Apunta la cámara al QR del estudiante.</Text>
      </View>

      <View className="flex-1 relative rounded-t-3xl overflow-hidden mt-2 border-t-2 border-slate-800">
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
        />

        {/* Overlay target frame */}
        <View className="absolute inset-0 items-center justify-center pointer-events-none">
          <View className="w-64 h-64 border-2 border-sky-400 rounded-3xl bg-sky-400/10" />
        </View>

        {scanned && (
          <View className="absolute bottom-10 left-0 right-0 items-center">
            <TouchableOpacity
              onPress={() => setScanned(false)}
              className="bg-sky-500 px-8 py-4 rounded-full shadow-lg shadow-sky-500/50 flex-row items-center"
            >
              <Ionicons name="scan-outline" size={24} color="#fff" className="mr-2" />
              <Text className="text-white font-bold text-lg">Escanear de Nuevo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
