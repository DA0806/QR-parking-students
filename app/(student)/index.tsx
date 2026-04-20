import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { API_URL } from '../../config/api';

type Zone = {
  id: number;
  name: string;
  total_capacity: number;
  current_occupancy: number;
};

export default function StudentZonesScreen() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchZones = async () => {
    try {
      const response = await fetch(`${API_URL}/zones`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      setZones(data);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchZones();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchZones();
    setRefreshing(false);
  };

  const getPercentage = (occupancy: number, capacity: number) => {
    if (capacity === 0) return 0;
    return (occupancy / capacity) * 100;
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  return (
    <View className="flex-1 bg-slate-900 px-4 pt-4 relative">
      <Text className="text-2xl font-bold text-white mb-6">Disponibilidad de Parqueos</Text>

      <FlatList
        data={zones}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />
        }
        renderItem={({ item }) => {
          const percentage = getPercentage(item.current_occupancy, item.total_capacity);
          const available = item.total_capacity - item.current_occupancy;
          
          return (
            <View className="bg-slate-800 rounded-2xl p-5 mb-4 shadow-lg shadow-black/20 border border-slate-700/50">
              <View className="flex-row justify-between items-end mb-4">
                <View>
                  <Text className="text-lg font-bold text-slate-100">{item.name}</Text>
                  <Text className="text-slate-400 mt-1">
                    {item.current_occupancy} ocupados de {item.total_capacity}
                  </Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${available > 0 ? 'bg-sky-500/20' : 'bg-red-500/20'} border ${available > 0 ? 'border-sky-500/30' : 'border-red-500/30'}`}>
                  <Text className={`font-bold ${available > 0 ? 'text-sky-400' : 'text-red-400'}`}>
                    {available} Libres
                  </Text>
                </View>
              </View>

              {/* Progress bar container */}
              <View className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <View 
                  className={`h-full ${getStatusColor(percentage)}`} 
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="py-10 items-center">
            <Text className="text-slate-500">Cargando disponibilidad...</Text>
          </View>
        }
      />
    </View>
  );
}
