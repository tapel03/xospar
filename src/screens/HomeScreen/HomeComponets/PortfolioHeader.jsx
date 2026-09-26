import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";

// Header row: avatar, name/email, and a notifications bell - mirrors the
// reference design's profile header exactly (avatar left, name + email
// stacked next to it, bell button pinned to the right).
export default function PortfolioHeader({
  name = "Tyrone Tremblay",
  email = "hello@tyrone.com",
  avatarUri,
  onPressBell,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={18} color={colors[700]} />
          </View>
        )}

        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>

          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
        </View>
      </View>

      <Pressable style={styles.bellButton} onPress={onPressBell} hitSlop={8}>
        <Ionicons name="notifications-outline" size={19} color={colors[900]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 10,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors[200],
    alignItems: "center",
    justifyContent: "center",
  },

  textContainer: {
    marginLeft: 10,
    flexShrink: 1,
  },

  name: {
    color: colors[950],
    fontSize: 14,
    fontWeight: "700",
  },

  email: {
    color: colors[500],
    fontSize: 11,
    marginTop: 2,
  },

  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors[100],
    alignItems: "center",
    justifyContent: "center",
  },
});