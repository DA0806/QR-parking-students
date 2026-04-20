import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import LogoutModal from '../../components/LogoutModal';

export default function SuperAdminLayout() {
  const { signOut } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  
  const handleLogoutClick = () => setModalVisible(true);
  
  const confirmLogout = () => {
    setModalVisible(false);
    signOut();
  };
  
  return (
    <>
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0f172a',
          shadowColor: 'transparent',
          borderBottomWidth: 0,
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#38bdf8',
        tabBarInactiveTintColor: '#64748b',
        headerRight: () => (
          <TouchableOpacity onPress={handleLogoutClick} className="mr-4 p-2">
            <Ionicons name="log-out-outline" size={24} color="#f87171" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="zones"
        options={{
          title: 'Zonas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Usuarios',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
    <LogoutModal visible={modalVisible} onCancel={() => setModalVisible(false)} onConfirm={confirmLogout} />
    </>
  );
}
