import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from './store';

/** Every app-wide provider in one place. Add Theme/Query/Toast providers here as they appear. */
export default function AppProviders({ children }) {
  return (
    <SafeAreaProvider>
      <StoreProvider>{children}</StoreProvider>
    </SafeAreaProvider>
  );
}
