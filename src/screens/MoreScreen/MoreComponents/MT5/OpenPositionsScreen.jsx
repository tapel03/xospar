import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";

const POSITIONS = [
  {
    id: "1",
    symbol: "NAS100",
    type: "BUY",
    lots: "0.20",
    entry: "23140.20",
    profit: "+$84.30",
  },
  {
    id: "2",
    symbol: "XAUUSD",
    type: "SELL",
    lots: "0.10",
    entry: "3372.44",
    profit: "-$12.80",
  },
  {
    id: "3",
    symbol: "EURUSD",
    type: "BUY",
    lots: "0.50",
    entry: "1.16820",
    profit: "+$45.90",
  },
];

export default function OpenPositionsScreen() {

  return (

    <FlatList
      style={styles.container}
      data={POSITIONS}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>

          <View style={styles.row}>

            <Text style={styles.symbol}>
              {item.symbol}
            </Text>

            <Text
              style={[
                styles.type,
                {
                  color:
                    item.type === "BUY"
                      ? "#4ADE80"
                      : "#FF5A5F",
                },
              ]}
            >
              {item.type}
            </Text>

          </View>

          <Text style={styles.entry}>
            Entry: {item.entry}
          </Text>

          <Text style={styles.entry}>
            Lot Size: {item.lots}
          </Text>

          <Text
            style={[
              styles.profit,
              {
                color:
                  item.profit.includes("+")
                    ? "#4ADE80"
                    : "#FF5A5F",
              },
            ]}
          >
            {item.profit}
          </Text>

        </View>
      )}
    />

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#000000",
    padding: 16,
  },

  card: {
    backgroundColor: "#0A0A0A",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  symbol: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  type: {
    fontWeight: "700",
  },

  entry: {
    color: "#8B949E",
    marginTop: 6,
  },

  profit: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "700",
  },

});
