import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function PriceChart() {

  const candles = [
    { height: 40, top: 130, type: "green" },
    { height: 65, top: 105, type: "green" },
    { height: 45, top: 125, type: "red" },
    { height: 55, top: 115, type: "green" },
    { height: 85, top: 85, type: "green" },
    { height: 110, top: 45, type: "green" },
    { height: 70, top: 70, type: "red" },
    { height: 90, top: 50, type: "green" },
    { height: 65, top: 85, type: "red" },
    { height: 55, top: 105, type: "red" },
    { height: 45, top: 125, type: "green" },
    { height: 75, top: 75, type: "green" },
    { height: 95, top: 55, type: "green" },
    { height: 65, top: 90, type: "red" },
    { height: 45, top: 115, type: "red" },
    { height: 55, top: 105, type: "green" },
    { height: 40, top: 125, type: "red" },
    { height: 60, top: 100, type: "green" },
    { height: 80, top: 70, type: "green" },
  ];

  return (
    <View style={styles.chartContainer}>

      <View style={styles.chartArea}>

        <View style={styles.horizontalLine1} />
        <View style={styles.horizontalLine2} />
        <View style={styles.horizontalLine3} />
        <View style={styles.horizontalLine4} />
        <View style={styles.horizontalLine5} />

        {candles.map((candle, index) => (

          <View
            key={index}
            style={[
              styles.candle,
              {
                height: candle.height,
                top: candle.top,
                left: 8 + index * 15,
              },
            ]}
          >

            <View
              style={[
                styles.wick,
                {
                  height: candle.height + 20,
                },
              ]}
            />

            <View
              style={[
                styles.body,
                candle.type === "green"
                  ? styles.green
                  : styles.red,
              ]}
            />

          </View>

        ))}


        <Text style={styles.price1}>
          8.80
        </Text>

        <Text style={styles.price2}>
          7.75
        </Text>

        <Text style={styles.price3}>
          7.55
        </Text>

        <Text style={styles.price4}>
          7.25
        </Text>

        <Text style={styles.price5}>
          7.00
        </Text>


        <View style={styles.currentPriceLine}>
          <Text style={styles.currentPrice}>
            7.55
          </Text>
        </View>

      </View>


      <View style={styles.timeRow}>

        <Text style={styles.time}>
          10am
        </Text>

        <Text style={styles.time}>
          6pm
        </Text>

        <Text style={styles.time}>
          2am
        </Text>

        <Text style={styles.time}>
          6am
        </Text>

        <Text style={styles.time}>
          auto⌄
        </Text>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#202A33",
    borderRadius: 12,
    overflow: "hidden",
  },

  chartArea: {
    height: 230,
    position: "relative",
    backgroundColor: "#050A0E",
    overflow: "hidden",
  },

  horizontalLine1: {
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#151D24",
  },

  horizontalLine2: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#151D24",
  },

  horizontalLine3: {
    position: "absolute",
    top: 110,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#151D24",
  },

  horizontalLine4: {
    position: "absolute",
    top: 150,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#151D24",
  },

  horizontalLine5: {
    position: "absolute",
    top: 190,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#151D24",
  },

  candle: {
    position: "absolute",
    width: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  wick: {
    position: "absolute",
    width: 1,
    backgroundColor: "#BFC7CC",
  },

  body: {
    width: 7,
    height: 28,
  },

  green: {
    backgroundColor: "#D9E0E4",
  },

  red: {
    backgroundColor: "#626B72",
  },

  price1: {
    position: "absolute",
    right: 5,
    top: 18,
    color: "#DCE2E6",
    fontSize: 12,
  },

  price2: {
    position: "absolute",
    right: 5,
    top: 60,
    color: "#DCE2E6",
    fontSize: 12,
  },

  price3: {
    position: "absolute",
    right: 5,
    top: 100,
    color: "#DCE2E6",
    fontSize: 12,
  },

  price4: {
    position: "absolute",
    right: 5,
    top: 140,
    color: "#DCE2E6",
    fontSize: 12,
  },

  price5: {
    position: "absolute",
    right: 5,
    top: 180,
    color: "#DCE2E6",
    fontSize: 12,
  },

  currentPriceLine: {
    position: "absolute",
    top: 103,
    left: 0,
    right: 45,
    borderTopWidth: 1,
    borderTopColor: "#777F84",
  },

  currentPrice: {
    position: "absolute",
    right: -45,
    top: -11,
    backgroundColor: "#E1E4E6",
    color: "#111111",
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 12,
  },

  timeRow: {
    height: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    backgroundColor: "#070C10",
  },

  time: {
    color: "#C4C9CC",
    fontSize: 11,
  },
});