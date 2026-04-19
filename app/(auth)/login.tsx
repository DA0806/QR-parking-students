import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo.');
      return;
    }
    const success = await login(email.trim().toLowerCase());
    if (!success) {
      Alert.alert('Acceso Denegado', 'Correo no encontrado en la base de datos.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-900"
    >
      <StatusBar style="light" />
      <View className="flex-1 justify-center px-8 relative">
        {/* Background decorative elements */}
        <View className="absolute top-[-100] left-[-100] w-64 h-64 bg-sky-600 rounded-full opacity-20 blur-3xl"></View>
        <View className="absolute bottom-[-100] right-[-100] w-80 h-80 bg-blue-700 rounded-full opacity-20 blur-3xl"></View>

        <View className="items-center mb-12">
          <View className="w-24 h-24 bg-sky-500 rounded-3xl items-center justify-center mb-6 shadow-lg shadow-sky-500/50">
            <Text className="text-4xl">🔐</Text>
          </View>
          <Text className="text-4xl font-bold text-white mb-2 tracking-tight">Key Alumnos</Text>
          <Text className="text-slate-400 text-lg">Control Inteligente de Parqueos</Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-slate-300 font-medium mb-2 ml-1">Correo Institucional</Text>
            <View className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden">
              <TextInput
                className="px-5 py-4 text-white text-lg"
                placeholder="ej. diego@student.com"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="bg-sky-500 rounded-2xl py-4 mt-2 items-center active:scale-95 duration-200 shadow-md shadow-sky-500/30"
          >
            <Text className="text-white text-lg font-bold">
              {isLoading ? 'Ingresando...' : 'Acceder con Código QR'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View className="mt-12 items-center">
          <Text className="text-slate-500 text-sm">Cuentas de prueba:</Text>
          <Text className="text-slate-500 text-sm font-medium mt-1">Student: diego@student.com</Text>
          <Text className="text-slate-500 text-sm font-medium">Admin: admin@keyalumnos.com</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
