import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../../../context/AuthContext";

export default function Profile() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={36} color="#FFFFFF" />
      </View>
      <Text style={styles.name}>Your Profile</Text>
      <Text style={styles.subtitle}>
        Manage your account details and trading info.
      </Text>

      {/* Signing out drops isAuthenticated back to false, and
          RootNavigator returns to the Auth flow automatically. */}
      <Pressable style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={18} color="#FF5A5F" />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101820",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1C2630",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#AAAAAA",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 36,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A1417",
    backgroundColor: "#1C1013",
  },

  logoutText: {
    color: "#FF5A5F",
    fontSize: 15,
    fontWeight: "700",
  },
});