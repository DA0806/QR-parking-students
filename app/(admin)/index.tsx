import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../config/api';

type EventLog = {
  id: number;
  vehicle_plate: string;
  zone_name: string;
  event_type: string;
  timestamp: string;
};

type Stat = {
  name: string;
  total: number;
  occupancy: number;
};

export default function AdminDashboardScreen() {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch recent logs
      const logsResponse = await fetch(`${API_URL}/events/recent`);
      if (logsResponse.ok) setLogs(await logsResponse.json());

      // Fetch overall stats
      const statsResponse = await fetch(`${API_URL}/zones`);
      if (statsResponse.ok) {
        const zones = await statsResponse.json();
        setStats(zones.map((z: any) => ({ name: z.name, total: z.total_capacity, occupancy: z.current_occupancy })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-slate-900 px-4 pt-4">
      <Text className="text-2xl font-bold text-white mb-6">Dashboard Administrativo</Text>

      <View className="mb-6 flex-row flex-wrap justify-between">
        {stats.map((s, idx) => (
          <View key={idx} className="w-[48%] bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-700/50 shadow-lg">
            <Text className="text-slate-400 text-sm mb-1">{s.name}</Text>
            <View className="flex-row items-end">
              <Text className="text-2xl font-bold text-white">{s.occupancy}</Text>
              <Text className="text-slate-500 ml-1 mb-1">/ {s.total}</Text>
            </View>
            <View className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <View 
                className={`h-full ${s.occupancy/s.total > 0.8 ? 'bg-red-500' : 'bg-sky-500'}`} 
                style={{ width: `${(s.occupancy/s.total) * 100}%` }} 
              />
            </View>
          </View>
        ))}
      </View>

      <Text className="text-lg font-bold text-slate-200 mb-4">Bitácora Reciente</Text>
      
      <FlatList
        data={logs}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
        renderItem={({ item }) => (
          <View className="flex-row items-center p-4 bg-slate-800 mb-3 rounded-2xl border border-slate-700/30">
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 \${item.event_type === 'ENTRY' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
              <Ionicons 
                name={item.event_type === 'ENTRY' ? 'log-in-outline' : 'log-out-outline'} 
                size={24} 
                color={item.event_type === 'ENTRY' ? '#10b981' : '#f59e0b'} 
              />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">{item.vehicle_plate}</Text>
              <Text className="text-slate-400 text-sm">{item.zone_name}</Text>
            </View>
            <View className="items-end">
              <Text className={`font-bold \${item.event_type === 'ENTRY' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {item.event_type === 'ENTRY' ? 'ENTRADA' : 'SALIDA'}
              </Text>
              <Text className="text-slate-500 text-xs mt-1">
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="py-8 items-center">
            <Text className="text-slate-500">No hay registros recientes.</Text>
          </View>
        }
      />
    </View>
  );
}
