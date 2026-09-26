import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// NOTE: react-native-maps requires a custom dev build and does not run
// in Expo Go - importing it there crashes the app to a blank screen.
// This placeholder keeps the same card shape until a dev build is set up.
export default function MarketMapCard() {
  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Ionicons name="globe-outline" size={22} color="#6C5CE7" />
        <Text style={styles.title}>Global Markets</Text>
      </View>

      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={32} color="#3A4551" />
        <Text style={styles.placeholderText}>
          Map view requires a custom dev build (not available in Expo Go)
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.marketRow}>
          <View style={[styles.dot, { backgroundColor: "#00D26A" }]} />
          <Text style={styles.marketText}>New York - Open</Text>
        </View>

        <View style={styles.marketRow}>
          <View style={[styles.dot, { backgroundColor: "#FFD600" }]} />
          <Text style={styles.marketText}>London - Closing Soon</Text>
        </View>

        <View style={styles.marketRow}>
          <View style={[styles.dot, { backgroundColor: "#FF5A5F" }]} />
          <Text style={styles.marketText}>Tokyo - Closed</Text>
        </View>

        <View style={styles.marketRow}>
          <View style={[styles.dot, { backgroundColor: "#A855F7" }]} />
          <Text style={styles.marketText}>Johannesburg - Open</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0B1119",
    borderRadius: 20,
    overflow: "hidden",
    marginVertical: 15,
    borderWidth: 1,
    borderColor: "#28333F",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },

  mapPlaceholder: {
    width: "100%",
    height: 330,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F1720",
    paddingHorizontal: 30,
    gap: 10,
  },

  placeholderText: {
    color: "#7D8691",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },

  footer: {
    padding: 15,
  },

  marketRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },

  marketText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});