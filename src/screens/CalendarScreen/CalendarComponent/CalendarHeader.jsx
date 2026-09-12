import { View, Text, StyleSheet } from "react-native";

export default function CalendarHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Economic Calendar
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: "#101820",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
});