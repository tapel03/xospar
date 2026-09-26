import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../../theme/colors";

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
    backgroundColor: colors[50],
  },

  title: {
    color: colors[950],
    fontSize: 24,
    fontWeight: "bold",
  },
});