import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={36} color="#FFFFFF" />
      </View>
      <Text style={styles.name}>Your Profile</Text>
      <Text style={styles.subtitle}>
        Manage your account details and trading info.
      </Text>
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
});
