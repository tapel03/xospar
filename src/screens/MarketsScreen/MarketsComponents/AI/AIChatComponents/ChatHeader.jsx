import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function ChatHeader() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
      </Pressable>

      <View style={styles.avatar}>
        <Ionicons name="hardware-chip-outline" size={16} color="#FFFFFF" />
      </View>

      <Text style={styles.title}>AI Assistant</Text>

      <Pressable hitSlop={10} style={styles.menuButton}>
        <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: "#0B1119",
    borderBottomWidth: 1,
    borderBottomColor: "#1B2732",
  },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#3A7BD5",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 14,
    marginRight: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },

  menuButton: {
    marginLeft: 8,
  },
});