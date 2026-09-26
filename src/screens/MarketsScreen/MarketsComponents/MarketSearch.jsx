import {
  View,
  TextInput,
  StyleSheet,
} from "react-native";

export default function MarketSearch() {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search markets"
        placeholderTextColor="#888888"
        style={styles.input}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
    backgroundColor: "#000000",
  },

  input: {
    height: 45,
    backgroundColor: "#171717",
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "#FFFFFF",
  },
});