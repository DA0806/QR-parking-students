import { Platform } from 'react-native';
import Constants from 'expo-constants';

const EXPO_API_URL = process.env.EXPO_PUBLIC_API_URL;

const getHost = () => {
	if (EXPO_API_URL) {
		return EXPO_API_URL;
	}

	if (Platform.OS === 'web') {
		return 'http://localhost:3000/api';
	}

	// Use whatever Expo reports as the dev server host on native.
	const debuggerHost =
		Constants.expoConfig?.hostUri ||
		(Constants as any)?.expoGoConfig?.debuggerHost ||
		(Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ||
		(Constants as any)?.manifest?.debuggerHost;
	const host = debuggerHost?.split(':')[0];

	if (host) {
		return `http://${host}:3000/api`;
	}

	// Last-resort fallback for Android emulator.
	if (Platform.OS === 'android') {
		return 'http://10.0.2.2:3000/api';
	}

	return 'http://localhost:3000/api';
};

export const API_URL = getHost();
