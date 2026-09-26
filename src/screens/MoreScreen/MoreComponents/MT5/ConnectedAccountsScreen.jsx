import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";

const ACCOUNTS = [
  {
    id: "1",
    broker: "Exness",
    account: "20458764",
    server: "Exness-MT5Real8",
    balance: "$5,842.32",
    status: "Connected",
  },
  {
    id: "2",
    broker: "Deriv",
    account: "MT5-1029485",
    server: "Deriv-Demo",
    balance: "$10,000.00",
    status: "Demo",
  },
];

export default function ConnectedAccountsScreen() {

  return (

    <FlatList
      style={styles.container}
      data={ACCOUNTS}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>

          <Text style={styles.broker}>
            {item.broker}
          </Text>

          <Text style={styles.account}>
            {item.account}
          </Text>

          <Text style={styles.server}>
            {item.server}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.balance}>
              {item.balance}
            </Text>

            <Text style={styles.status}>
              {item.status}
            </Text>
          </View>

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
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  broker: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  account: {
    color: "#8B949E",
    marginTop: 5,
  },

  server: {
    color: "#5F6C7B",
    marginTop: 2,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  balance: {
    color: "#F5F5F5",
    fontSize: 17,
    fontWeight: "700",
  },

  status: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

});
