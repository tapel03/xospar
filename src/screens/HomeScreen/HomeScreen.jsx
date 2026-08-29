
import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        MARKET
      </Text>

      <Text style={styles.subtitle}>
        Welcome to the Market App
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 16,
    marginTop: 10,
  },

});
