import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "./src/context/AuthContext";
import { AlertsProvider } from "./src/context/AlertsContext";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <AuthProvider>
      <AlertsProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AlertsProvider>
    </AuthProvider>
  );
}