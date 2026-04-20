import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { API_URL } from '../../config/api';

type User = { clerk_id: string, name: string, email: string, role: string };

export default function SuperAdminUsers() {
    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/users`);
            if (res.ok) setUsers(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const setRole = async (clerk_id: string, role: string) => {
        Alert.alert('Cambiar Rol', `¿Promover/Degradar a ${role}?`, [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Aceptar',
                onPress: async () => {
                    const res = await fetch(`${API_URL}/users/${clerk_id}/role`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ role })
                    });
                    if (res.ok) fetchUsers();
                }
            }
        ]);
    };

    return (
        <View className="flex-1 bg-slate-900 px-4 pt-4">
            <Text className="text-2xl font-bold text-white mb-6">Permisos de Usuario</Text>
            
            <FlatList
                data={users.filter(u => u.role !== 'superadmin')}
                keyExtractor={item => item.clerk_id}
                renderItem={({ item }) => (
                    <View className="bg-slate-800 p-4 rounded-xl mb-3 border border-slate-700/30">
                        <View className="flex-row justify-between items-center mb-3">
                            <View>
                                <Text className="text-white font-bold text-lg">{item.name}</Text>
                                <Text className="text-slate-400 text-sm">{item.email}</Text>
                            </View>
                            <View className={`px-2 py-1 rounded ${item.role === 'admin' ? 'bg-indigo-500' : 'bg-slate-600'}`}>
                                <Text className="text-white text-xs uppercase font-bold">{item.role}</Text>
                            </View>
                        </View>
                        
                        <View className="flex-row space-x-2">
                            {item.role === 'student' ? (
                                <TouchableOpacity 
                                    onPress={() => setRole(item.clerk_id, 'admin')}
                                    className="bg-indigo-500/20 border border-indigo-500 py-2 px-4 rounded-lg flex-1 items-center"
                                >
                                    <Text className="text-indigo-400 font-bold">Hacer Guardia (Admin)</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity 
                                    onPress={() => setRole(item.clerk_id, 'student')}
                                    className="bg-slate-700 py-2 px-4 rounded-lg flex-1 items-center"
                                >
                                    <Text className="text-slate-300 font-bold">Remover Permisos</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            />
        </View>
    );
}
