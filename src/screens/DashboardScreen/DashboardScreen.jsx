import { View, Text, StyleSheet } from "react-native";


export default function DashboardScreen() {

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Dashboard
      </Text>

      <Text style={styles.subtitle}>
        Welcome to your market dashboard
      </Text>

    </View>

  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
  },

});
