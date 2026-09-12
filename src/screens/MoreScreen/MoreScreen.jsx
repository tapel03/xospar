import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import SettingsItem from "./MoreComponents/Settings/SettingsItem";

export default function MoreScreen() {

  const navigation = useNavigation();

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        More
      </Text>

      <Text style={styles.subtitle}>
        Trading accounts, portfolio and settings
      </Text>


      {/* ACCOUNT */}

      <Text style={styles.section}>
        Account
      </Text>

      <View style={styles.card}>

        <SettingsItem
          icon="person-outline"
          label="Profile"
          onPress={() => navigation.navigate("Profile")}
        />

      </View>


      {/* TRADING HUB */}

      <Text style={styles.section}>
        Trading Hub
      </Text>

      <View style={styles.card}>

        <SettingsItem
          icon="link-outline"
          label="Connect MT4 / MT5"
          onPress={() => navigation.navigate("ConnectMT")}
        />

        <SettingsItem
          icon="wallet-outline"
          label="Connected Accounts"
          onPress={() => navigation.navigate("ConnectedAccounts")}
        />

        <SettingsItem
          icon="pie-chart-outline"
          label="Trading Portfolio"
          onPress={() => navigation.navigate("TradingPortfolio")}
        />

        <SettingsItem
          icon="trending-up-outline"
          label="Open Positions"
          onPress={() => navigation.navigate("OpenPositions")}
        />

      </View>


      {/* SETTINGS */}

      <Text style={styles.section}>
        Settings
      </Text>

      <View style={styles.card}>

        <SettingsItem
          icon="options-outline"
          label="Preferences"
          onPress={() => navigation.navigate("Preferences")}
        />

        <SettingsItem
          icon="notifications-outline"
          label="Notifications"
          onPress={() => navigation.navigate("Notifications")}
        />

      </View>

      <View style={{ height: 40 }} />

    </ScrollView>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    marginTop: 25,
    paddingHorizontal: 20,
  },

  subtitle: {
    color: "#8B949E",
    fontSize: 14,
    marginTop: 5,
    paddingHorizontal: 20,
  },

  section: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 28,
    marginBottom: 12,
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: "#101820",
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1C2630",
  },

});
