export default function Control() {

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Calendar
      </Text>

      <Text style={styles.subtitle}>
        Your market alerts
      </Text>

    </View>

  );

}

const styles = StyleSheet.create({

   container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  title: {
    fontSize: 10,
    fontWeight: "bold",
    color: '#FFFFFF',
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },

});
