import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../../theme/colors";

// Top bar for the Home screen: avatar + greeting on the left, bell and
// search icons on the right. Sits under the status bar (the tab/stack
// navigators have their own headers turned off), so it pads itself by
// the top safe-area inset.
export default function HomeHeader({
  name = "John",
  avatarUri,
  onPressAvatar,
  onPressBell,
  onPressSearch,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <Pressable style={styles.left} onPress={onPressAvatar} hitSlop={6}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={18} color={colors[700]} />
          </View>
        )}

        <Text style={styles.greeting} numberOfLines={1}>
          Hi {name}!
        </Text>
      </Pressable>

      <View style={styles.actions}>
        <Pressable style={styles.iconButton} onPress={onPressBell} hitSlop={6}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color={colors[950]}
          />
        </Pressable>

        <Pressable
          style={styles.iconButton}
          onPress={onPressSearch}
          hitSlop={6}
        >
          <Ionicons name="search-outline" size={22} color={colors[950]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: colors.base,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },

  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors[200],
    alignItems: "center",
    justifyContent: "center",
  },

  greeting: {
    color: colors[950],
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 10,
    flexShrink: 1,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});