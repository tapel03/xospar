import {
  View,
  StyleSheet,
} from "react-native";

export default function ChartVolume() {

  const volumes = [
    20, 35, 25, 45, 30, 50,
    70, 40, 25, 35, 55, 30,
    45, 60, 35, 25, 40, 55,
    65, 30, 45, 50, 35, 60,
  ];

  return (
    <View style={styles.container}>

      {volumes.map((height, index) => (

        <View
          key={index}
          style={[
            styles.bar,
            {
              height: height,
            },
          ]}
        />

      ))}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 55,
    marginHorizontal: 15,
    marginTop: -55,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    paddingBottom: 5,
    position: "relative",
  },

  bar: {
    width: 5,
    backgroundColor: "#626B72",
  },
});