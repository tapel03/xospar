import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BookmarkButton from "./BookmarkButton";
import { colors } from "../../../theme/colors";

export default function MarketRow({
  asset,
  onPress,
  bookmarked = false,
  onToggleBookmark,
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <BookmarkButton
          bookmarked={bookmarked}
          onPress={onToggleBookmark}
        />

        <View style={styles.icon}>
          <Text style={styles.iconText}>
            {asset.icon}
          </Text>
        </View>

        <View>
          <Text style={styles.name}>
            {asset.symbol}
          </Text>

          {!!asset.pair && (
            <Text style={styles.pair}>
              {asset.pair}
            </Text>
          )}

          {!!asset.allocation && (
            <Text style={styles.allocation}>
              {asset.allocation}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.middle}>
        <Text style={styles.price}>
          {asset.price}
        </Text>

        <Text
          style={[
            styles.change,
            {
              color: asset.positive ? "#4ADE80" : "#FF5A5F",
            },
          ]}
        >
          {asset.positive ? "↑ " : "↓ "}
          {asset.change}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={17}
        color={colors[500]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 70,
    marginHorizontal: 12,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors[200],
  },

  pressed: {
    opacity: 0.55,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  icon: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: colors[200],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  iconText: {
    color: colors[950],
    fontSize: 17,
    fontWeight: "700",
  },

  name: {
    color: colors[950],
    fontSize: 14,
    fontWeight: "700",
  },

  pair: {
    color: colors[500],
    fontSize: 10,
    marginTop: 2,
  },

  allocation: {
    color: colors[500],
    fontSize: 9,
    marginTop: 2,
  },

  middle: {
    alignItems: "flex-end",
    marginRight: 10,
  },

  price: {
    color: colors[950],
    fontSize: 13,
    fontWeight: "600",
  },

  change: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: "600",
  },
});
