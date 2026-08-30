import { View, Text, StyleSheet } from "react-native";


export default function MoreScreen() {

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        More
      </Text>

      <Text style={styles.subtitle}>
        More options and settings
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

