import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";

export default function BottomToolbar({
  hideAcknowledged,
  onToggleHideAcknowledged,
  editMode,
  onToggleEditMode,
  onAddPress,
}) {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.toolbar}>

        <Pressable
          style={[styles.toolBtn, hideAcknowledged && styles.toolBtnActive]}
          onPress={onToggleHideAcknowledged}
        >
          <Ionicons
            name="checkbox-outline"
            size={20}
            color={hideAcknowledged ? colors.base : colors[500]}
          />
        </Pressable>

        <Pressable
          style={[styles.toolBtn, editMode && styles.toolBtnActive]}
          onPress={onToggleEditMode}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={editMode ? colors.base : colors[500]}
          />
        </Pressable>

        <Pressable style={styles.toolBtn} onPress={onAddPress}>
          <Ionicons name="add" size={22} color={colors[500]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 22,
    alignItems: "center",
  },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors[100],
    borderRadius: 30,
    padding: 8,
    shadowColor: colors.base,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },

  toolBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  toolBtnActive: {
    backgroundColor: colors[950],
  },
});