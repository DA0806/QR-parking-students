import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { API_URL } from '../../config/api';
import { useFocusEffect } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';

type Vehicle = { id: number, plate: string, make: string, model: string };

export default function StudentVehiclesScreen() {
    const { user } = useUser();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [plate, setPlate] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');

    const fetchVehicles = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/vehicles/${user.id}`);
            if (res.ok) setVehicles(await res.json());
        } catch (e) {
            console.error(e);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            fetchVehicles();
        }, [fetchVehicles])
    );

    const addVehicle = async () => {
        if (!plate || !make) return Alert.alert('Error', 'Placa y Marca son obligatorias');
        
        try {
            const res = await fetch(`${API_URL}/vehicles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plate, make, model, owner_clerk_id: user?.id })
            });

            if (res.ok) {
                setPlate(''); setMake(''); setModel('');
                fetchVehicles();
            } else {
                Alert.alert('Error', 'No se pudo agregar el vehículo, posibles placas duplicadas.');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteVehicle = async (id: number) => {
        Alert.alert('Confirmar', '¿Eliminar este vehículo?', [
            { text: 'Cancelar', style: 'cancel' },
            { 
                text: 'Eliminar', style: 'destructive', 
                onPress: async () => {
                    const res = await fetch(`${API_URL}/vehicles/${id}`, { method: 'DELETE' });
                    if (res.ok) fetchVehicles();
                } 
            }
        ]);
    };

    return (
        <View className="flex-1 bg-slate-900 px-4 pt-4">
            <Text className="text-2xl font-bold text-white mb-6">Mis Vehículos</Text>

            <View className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 mb-6">
                <Text className="text-slate-300 font-bold mb-3">Agregar Nuevo Vehículo</Text>
                <TextInput
                    className="bg-slate-700 rounded-lg px-4 py-3 text-white mb-3"
                    placeholder="Placa ej. XYZ-123"
                    placeholderTextColor="#64748b"
                    autoCapitalize="characters"
                    value={plate}
                    onChangeText={setPlate}
                />
                <View className="flex-row justify-between mb-4">
                    <TextInput
                        className="bg-slate-700 rounded-lg px-4 py-3 text-white flex-1 mr-2"
                        placeholder="Marca"
                        placeholderTextColor="#64748b"
                        value={make}
                        onChangeText={setMake}
                    />
                    <TextInput
                        className="bg-slate-700 rounded-lg px-4 py-3 text-white flex-1 ml-2"
                        placeholder="Modelo"
                        placeholderTextColor="#64748b"
                        value={model}
                        onChangeText={setModel}
                    />
                </View>

                <TouchableOpacity 
                    onPress={addVehicle}
                    className="bg-sky-500 rounded-lg py-3 items-center"
                >
                    <Text className="text-white font-bold">Añadir Módulo</Text>
                </TouchableOpacity>
            </View>

            <Text className="text-lg font-bold text-slate-200 mb-4">Registrados</Text>
            <FlatList
                data={vehicles}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View className="flex-row justify-between items-center p-4 bg-slate-800 mb-3 rounded-2xl border border-slate-700/30">
                        <View>
                            <Text className="text-white font-bold text-lg">{item.plate}</Text>
                            <Text className="text-slate-400 text-sm">{item.make} {item.model}</Text>
                        </View>
                        <TouchableOpacity onPress={() => deleteVehicle(item.id)} className="p-2 bg-red-500/20 rounded-full">
                            <Ionicons name="trash-outline" size={20} color="#f87171" />
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={<Text className="text-slate-500 text-center py-4">No tienes vehículos registrados.</Text>}
            />
        </View>
    );
}
