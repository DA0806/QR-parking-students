import React from 'react';
import { Modal, View, Text, TouchableOpacity, Platform } from 'react-native';

interface LogoutModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ visible, onCancel, onConfirm }: LogoutModalProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-4" style={Platform.OS === 'web' ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 } as any : {}}>
        <View className="bg-slate-800 w-full max-w-sm rounded-2xl p-6 border border-slate-700 shadow-2xl">
          <Text className="text-xl font-bold text-white text-center mb-2">Cerrar Sesión</Text>
          <Text className="text-slate-400 text-center mb-6">¿Estás seguro de que deseas salir?</Text>
          
          <View className="flex-row justify-between space-x-3">
            <TouchableOpacity 
              onPress={onCancel}
              className="flex-1 py-3 bg-slate-700 rounded-xl items-center"
            >
              <Text className="text-white font-bold">Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={onConfirm}
              className="flex-1 py-3 bg-red-500 rounded-xl items-center"
            >
              <Text className="text-white font-bold">Salir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
