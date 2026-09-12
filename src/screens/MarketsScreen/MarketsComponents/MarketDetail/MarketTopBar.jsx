import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function MarketTopBar() {
  return (
    <View style={styles.container}>

      <Pressable style={styles.coinButton}>

        <View style={styles.coinIcon}>
          <Text style={styles.coinText}>
            S
          </Text>
        </View>

        <Text style={styles.coinName}>
          SUI
        </Text>

      </Pressable>


      <Pressable style={styles.smallButton}>
        <Text style={styles.buttonText}>
          1H
        </Text>

        <Ionicons
          name="chevron-down"
          size={14}
          color="#FFFFFF"
        />
      </Pressable>


      <Pressable style={styles.iconButton}>
        <Ionicons
          name="settings-outline"
          size={20}
          color="#FFFFFF"
        />
      </Pressable>


      <Pressable style={styles.iconButton}>
        <Ionicons
          name="radio-button-on-outline"
          size={18}
          color="#FFFFFF"
        />
      </Pressable>


      <Pressable style={styles.iconButton}>
        <Ionicons
          name="grid-outline"
          size={18}
          color="#FFFFFF"
        />
      </Pressable>


      <Pressable style={styles.iconButton}>
        <Ionicons
          name="star-outline"
          size={20}
          color="#FFFFFF"
        />
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 6,
  },

  coinButton: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#53606B",
    borderRadius: 10,
  },

  coinIcon: {
    width: 25,
    height: 25,
    borderRadius: 15,
    backgroundColor: "#2D75D9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },

  coinText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  coinName: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },

  smallButton: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#26323B",
    borderRadius: 9,
  },

  buttonText: {
    color: "#FFFFFF",
    marginRight: 5,
    fontSize: 13,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#26323B",
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
});