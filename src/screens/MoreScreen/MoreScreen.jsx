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
    backgroundColor: '#000000'
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: '#FFFFFF',
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },

});

