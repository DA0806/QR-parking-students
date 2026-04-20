import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { API_URL } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

type Zone = { id: number, name: string, total_capacity: number, current_occupancy: number };

export default function SuperAdminZones() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState('');

    const fetchZones = async () => {
        try {
            const res = await fetch(`${API_URL}/zones`);
            if (res.ok) setZones(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { fetchZones(); }, []);

    const handleAdd = async () => {
        if (!name || !capacity) return Alert.alert('Error', 'Completar campos.');
        try {
            const res = await fetch(`${API_URL}/zones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, total_capacity: parseInt(capacity) })
            });
            if (res.ok) {
                setName(''); setCapacity('');
                fetchZones();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: number) => {
        Alert.alert('Confirmar', '¿Borrar esta zona?', [
            { text: 'Cancelar', style: 'cancel' },
            { 
                text: 'Borrar', style: 'destructive', 
                onPress: async () => {
                    const res = await fetch(`${API_URL}/zones/${id}`, { method: 'DELETE' });
                    if (res.ok) fetchZones();
                } 
            }
        ]);
    };

    return (
        <View className="flex-1 bg-slate-900 px-4 pt-4">
            <Text className="text-2xl font-bold text-white mb-6">Gestión de Zonas</Text>
            
            <View className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 mb-6">
                <Text className="text-slate-300 font-bold mb-3">Añadir Nueva Zona</Text>
                <TextInput
                    className="bg-slate-700 rounded-lg px-4 py-3 text-white mb-3"
                    placeholder="Nombre del Parqueo"
                    placeholderTextColor="#64748b"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    className="bg-slate-700 rounded-lg px-4 py-3 text-white mb-4"
                    placeholder="Capacidad Max."
                    placeholderTextColor="#64748b"
                    keyboardType="numeric"
                    value={capacity}
                    onChangeText={setCapacity}
                />
                <TouchableOpacity onPress={handleAdd} className="bg-sky-500 rounded-lg py-3 items-center">
                    <Text className="text-white font-bold">Crear Zona</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={zones}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View className="bg-slate-800 p-4 rounded-xl mb-3 flex-row justify-between border border-slate-700/30">
                        <View>
                            <Text className="text-white font-bold text-lg">{item.name}</Text>
                            <Text className="text-slate-400">Capacidad: {item.total_capacity}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item.id)} className="bg-red-500/20 p-2 rounded-full h-10 w-10 items-center justify-center">
                            <Ionicons name="trash" size={20} color="#f87171" />
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}
