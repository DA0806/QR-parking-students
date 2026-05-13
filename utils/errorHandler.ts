import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

export interface ApiCallOptions {
  successMessage?: string;
  errorMessage?: string;
  showHaptic?: boolean;
}

export async function handleApiCall<T>(
  apiCall: () => Promise<T>,
  options: ApiCallOptions = {}
): Promise<T | null> {
  try {
    const result = await apiCall();
    if (options.showHaptic) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (options.successMessage) {
      Alert.alert('Éxito', options.successMessage);
    }
    return result;
  } catch (error) {
    console.error('API Error:', error);
    if (options.showHaptic) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    Alert.alert('Error', options.errorMessage || 'Algo salió mal. Por favor intenta de nuevo.');
    return null;
  }
}

export function isNetworkError(error: any): boolean {
  return error?.message?.includes('Network request failed') ||
         error?.message?.includes('fetch failed') ||
         error?.code === 'NETWORK_ERROR';
}

export function getErrorMessage(error: any): string {
  if (isNetworkError(error)) {
    return 'No hay conexión a internet. Por favor verifica tu conexión.';
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.message) {
    return error.message;
  }

  return 'Ocurrió un error inesperado.';
}
