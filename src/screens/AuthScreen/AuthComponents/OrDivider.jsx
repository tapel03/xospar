import { Text, StyleSheet } from "react-native";

export default function OrDivider() {
  return <Text style={styles.text}>or</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: "#6B6B70",
    fontSize: 13,
    textAlign: "center",
    marginVertical: 18,
  },
});
