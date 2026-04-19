import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { TouchableOpacity } from 'react-native';

export default function StudentLayout() {
  const { logout } = useAuth();
  
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0f172a', // slate-900
          shadowColor: 'transparent',
          borderBottomWidth: 0,
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#1e293b', // slate-800
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarActiveTintColor: '#38bdf8', // sky-400
        tabBarInactiveTintColor: '#64748b', // slate-500
        headerRight: () => (
          <TouchableOpacity onPress={logout} className="mr-4 p-2">
            <Ionicons name="log-out-outline" size={24} color="#f87171" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Zonas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="qr"
        options={{
          title: 'Código QR',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
