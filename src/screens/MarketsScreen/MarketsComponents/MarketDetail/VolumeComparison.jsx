import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function VolumeComparison() {

  const months = [
    {
      month: "Mar",
      bar1: 70,
      bar2: 45,
      bar3: 85,
    },
    {
      month: "Apr",
      bar1: 55,
      bar2: 100,
      bar3: 75,
    },
    {
      month: "May",
      bar1: 40,
      bar2: 80,
      bar3: 65,
    },
    {
      month: "Jun",
      bar1: 65,
      bar2: 90,
      bar3: 50,
    },
    {
      month: "Jul",
      bar1: 50,
      bar2: 95,
      bar3: 70,
    },
  ];

  return (
    <View style={styles.card}>

      <View style={styles.chart}>

        <View style={styles.line1} />
        <View style={styles.line2} />
        <View style={styles.line3} />
        <View style={styles.line4} />

        <Text style={styles.number1}>
          20k
        </Text>

        <Text style={styles.number2}>
          15k
        </Text>

        <Text style={styles.number3}>
          10k
        </Text>

        <Text style={styles.number4}>
          5k
        </Text>


        <View style={styles.barsContainer}>

          {months.map((item, index) => (

            <View
              key={index}
              style={styles.monthGroup}
            >

              <View style={styles.bars}>

                <View
                  style={[
                    styles.bar,
                    styles.barOne,
                    {
                      height: item.bar1,
                    },
                  ]}
                />

                <View
                  style={[
                    styles.bar,
                    styles.barTwo,
                    {
                      height: item.bar2,
                    },
                  ]}
                />

                <View
                  style={[
                    styles.bar,
                    styles.barThree,
                    {
                      height: item.bar3,
                    },
                  ]}
                />

              </View>

              <Text style={styles.month}>
                {item.month}
              </Text>

            </View>

          ))}

        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 10,
    marginTop: 0,
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: "#070C10",
    borderWidth: 1,
    borderColor: "#202A33",
    borderRadius: 12,
  },

  chart: {
    height: 210,
    position: "relative",
  },

  line1: {
    position: "absolute",
    top: 25,
    left: 35,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#1C252C",
  },

  line2: {
    position: "absolute",
    top: 70,
    left: 35,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#1C252C",
  },

  line3: {
    position: "absolute",
    top: 115,
    left: 35,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#1C252C",
  },

  line4: {
    position: "absolute",
    top: 160,
    left: 35,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#1C252C",
  },

  number1: {
    position: "absolute",
    left: 0,
    top: 18,
    color: "#8B949A",
    fontSize: 11,
  },

  number2: {
    position: "absolute",
    left: 0,
    top: 63,
    color: "#8B949A",
    fontSize: 11,
  },

  number3: {
    position: "absolute",
    left: 0,
    top: 108,
    color: "#8B949A",
    fontSize: 11,
  },

  number4: {
    position: "absolute",
    left: 0,
    top: 153,
    color: "#8B949A",
    fontSize: 11,
  },

  barsContainer: {
    position: "absolute",
    left: 40,
    right: 5,
    bottom: 0,
    height: 185,
    flexDirection: "row",
    justifyContent: "space-around",
  },

  monthGroup: {
    alignItems: "center",
    justifyContent: "flex-end",
  },

  bars: {
    height: 165,
    flexDirection: "row",
    alignItems: "flex-end",
  },

  bar: {
    width: 12,
    marginHorizontal: 2,
  },

  barOne: {
    backgroundColor: "#AAB1B5",
  },

  barTwo: {
    backgroundColor: "#F0F1F2",
  },

  barThree: {
    backgroundColor: "#626A70",
  },

  month: {
    color: "#AEB5B9",
    fontSize: 11,
    marginTop: 8,
  },
});