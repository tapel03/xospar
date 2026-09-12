import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function ConnectMTScreen() {

  return (

    <View style={styles.container}>

      <View style={styles.logo}>
        <Ionicons
          name="analytics"
          size={60}
          color="#2F80ED"
        />
      </View>

      <Text style={styles.title}>
        Connect Your Trading Account
      </Text>

      <Text style={styles.description}>
        Securely connect MetaTrader 4 or MetaTrader 5 to sync balances,
        positions, history and live trading information.
      </Text>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>
          Connect MetaTrader 5
        </Text>
      </Pressable>

      <Pressable style={styles.buttonSecondary}>
        <Text style={styles.secondaryText}>
          Connect MetaTrader 4
        </Text>
      </Pressable>

      <Text style={styles.note}>
        Supported brokers include Exness, Deriv, IC Markets,
        Pepperstone, FTMO, Equity Edge and any MT4/MT5 broker.
      </Text>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    padding: 24,
  },

  logo: {
    marginTop: 30,
    marginBottom: 25,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },

  description: {
    color: "#9AA5B1",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    marginVertical: 20,
  },

  button: {
    backgroundColor: "#2F80ED",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  buttonSecondary: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2F80ED",
    alignItems: "center",
    marginTop: 14,
  },

  secondaryText: {
    color: "#2F80ED",
    fontWeight: "700",
    fontSize: 16,
  },

  note: {
    marginTop: 30,
    color: "#707A84",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

});