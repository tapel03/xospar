import { Platform } from 'react-native';
import Constants from 'expo-constants';

// The app only knows about OUR backend. No third-party keys ship in the bundle.
// Override with EXPO_PUBLIC_API_BASE_URL / EXPO_PUBLIC_WS_URL (see .env.example).
function devHost() {
  // While developing, the Expo dev server's host is the machine running the backend too,
  // which makes a physical phone work without editing anything.
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) return hostUri.split(':')[0];
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || `http://${devHost()}:4000`).replace(/\/$/, '');
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL || `${API_BASE_URL.replace(/^http/, 'ws')}/ws`;

export const featureFlags = {
  // Set EXPO_PUBLIC_USE_BACKEND=false to run purely on the bundled mock data.
  useBackend: process.env.EXPO_PUBLIC_USE_BACKEND !== 'false',
};
