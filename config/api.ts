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

	// Expo Go / simulators can usually reach the machine over the packager host.
	const hostUri = Constants.expoConfig?.hostUri;
	const host = hostUri?.split(':')[0] ?? 'localhost';

	return `http://${host}:3000/api`;
};

export const API_URL = getHost();
