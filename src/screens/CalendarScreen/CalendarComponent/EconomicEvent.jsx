import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const IMPACT_COLORS = {
  High: "#E74C3C",
  Medium: "#F39C12",
  Low: "#8FCB8F",
};

export default function EconomicEvent({
  time = "8:30 AM",
  currency = "USD",
  title = "CPI Inflation (YoY)",
  impact = "High",
  actual = "3.4%",
  forecast = "3.3%",
  onPress,
}) {
  const impactColor =
    IMPACT_COLORS[impact] || IMPACT_COLORS.Low;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >

      {/* TOP ROW */}
      <View style={styles.topRow}>

        <View style={styles.timeContainer}>
          <Text style={styles.time}>
            {time}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={13}
            color="#59636D"
          />
        </View>

        <View style={styles.currencyContainer}>
          <View style={styles.flag}>
            <Text style={styles.flagText}>
              🇺🇸
            </Text>
          </View>

          <Text style={styles.currency}>
            {currency}
          </Text>
        </View>

        <View
          style={[
            styles.impactBadge,
            { backgroundColor: `${impactColor}22` },
          ]}
        >
          <Text
            style={[
              styles.impactText,
              { color: impactColor },
            ]}
          >
            {impact}
          </Text>
        </View>

      </View>

      {/* EVENT TITLE */}
      <Text style={styles.title}>
        {title}
      </Text>

      {/* DATA */}
      <View style={styles.dataRow}>

        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>
            Actual:
          </Text>

          <Text style={styles.dataValue}>
            {actual}
          </Text>
        </View>

        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>
            Forecast:
          </Text>

          <Text style={styles.dataValue}>
            {forecast}
          </Text>
        </View>

      </View>

    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#101820",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1B2732",
  },

  pressed: {
    opacity: 0.65,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 28,
  },

  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 82,
  },

  time: {
    color: "#9DA4AE",
    fontSize: 12,
    fontWeight: "500",
  },

  currencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  flag: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: 6,
  },

  flagText: {
    fontSize: 13,
  },

  currency: {
    color: "#AEB5BD",
    fontSize: 12,
    fontWeight: "600",
  },

  impactBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },

  impactText: {
    fontSize: 11,
    fontWeight: "700",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
  },

  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
    gap: 22,
  },

  dataItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  dataLabel: {
    color: "#737C86",
    fontSize: 12,
    marginRight: 4,
  },

  dataValue: {
    color: "#D5D9DF",
    fontSize: 12,
    fontWeight: "600",
  },
});