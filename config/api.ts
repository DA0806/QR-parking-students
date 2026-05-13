import { Platform } from 'react-native';
import Constants from 'expo-constants';

const EXPO_API_URL = process.env.EXPO_PUBLIC_API_URL;

const getExpoHost = () => {
	const hostUri =
		Constants.expoConfig?.hostUri ||
		(Constants as any)?.expoGoConfig?.debuggerHost ||
		(Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ||
		(Constants as any)?.manifest?.debuggerHost;

	return hostUri?.split(':')[0];
};

const getHost = () => {
	if (Platform.OS === 'web') {
		return 'http://localhost:3000/api';
	}

	const expoHost = getExpoHost();
	if (expoHost) {
		return `http://${expoHost}:3000/api`;
	}

	if (EXPO_API_URL) {
		return EXPO_API_URL;
	}

	if (Platform.OS === 'android') {
		return 'http://10.0.2.2:3000/api';
	}

	return 'http://localhost:3000/api';
};

export const API_URL = getHost();
