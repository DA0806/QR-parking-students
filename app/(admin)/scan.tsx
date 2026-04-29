import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import { useFocusEffect, useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../../config/api';

export default function AdminScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [selectedZone, setSelectedZone] = useState<number>(1);
  const [zones, setZones] = useState<{ id: number, name: string }[]>([]);
  const navigation = useNavigation();
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef(false);

  const startScanCooldown = () => {
    isProcessingRef.current = true;
    setScanned(true);

    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }

    // Keep it locked even after the modal to prevent quick re-scans if the device is still pointing at it
    cooldownTimerRef.current = setTimeout(() => {
      setScanned(false);
      isProcessingRef.current = false;
      cooldownTimerRef.current = null;
    }, 4000);
  };

  const resetScanner = () => {
    // Keep a bare minimum lock to avoid instant re-reads after pressing Aceptar
    setTimeout(() => {
      setScanned(false);
      isProcessingRef.current = false;
    }, 1500);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetch(`${API_URL}/zones`)
        .then(res => res.json())
        .then(data => {
          setZones(data);
          if (data.length > 0) setSelectedZone(data[0].id);
        })
        .catch(console.error);
    }, [])
  );

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    startScanCooldown();
    try {
      const finalRes = await fetch(`${API_URL}/events/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data, zone_id: selectedZone })
      });

      if (!finalRes.ok) {
        const errorData = await finalRes.json();
        Alert.alert('Acceso Denegado', errorData.error || 'Error al autorizar.');
        return;
      }

      const scanResult = await finalRes.json();

      await fetch(`${API_URL}/zones`)
        .then(res => res.json())
        .then(setZones)
        .catch(console.error);

      Alert.alert(
        scanResult.isEntry ? 'Ingreso Autorizado' : 'Salida Registrada',
        `Vehículo ${scanResult.vehicle_plate}\nvía ${scanResult.isEntry ? 'Entrada' : 'Salida'} exitosa.`,
        [{ text: 'Aceptar', onPress: resetScanner }]
      );
    } catch (e: any) {
      console.log('Error de Escaneo:', e?.message || e);
      Alert.alert('Error de Escaneo', 'Código QR no reconocido o error de red.', [
        { text: 'Aceptar', onPress: resetScanner }
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
        <Text className="text-slate-400 mt-1 mb-4">Apunta la cámara al QR del estudiante.</Text>

        {zones.length > 0 ? (
          <View className="bg-slate-800 rounded-xl p-3 flex-row flex-wrap justify-between">
            {zones.map(z => (
              <TouchableOpacity
                key={z.id}
                onPress={() => setSelectedZone(z.id)}
                className={`px-3 py-2 rounded-lg mb-2 ${selectedZone === z.id ? 'bg-sky-500' : 'bg-slate-700'}`}
              >
                <Text className={`${selectedZone === z.id ? 'text-white font-bold' : 'text-slate-300'}`}>
                  {z.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <ActivityIndicator color="#38bdf8" />
        )}
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
              onPress={resetScanner}
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
