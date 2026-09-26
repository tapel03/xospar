import { Text, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TaskItem({
  handle,
  text,
  time,
  acknowledged = false,
  editMode = false,
  onPress,
  onToggle,
  onDelete,
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.task, pressed && styles.taskPressed]}
      onPress={onPress}
    >
      {editMode ? (
        <Pressable
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation?.();
            onDelete?.();
          }}
          style={styles.deleteButton}
        >
          <Ionicons name="remove" size={14} color="#FFFFFF" />
        </Pressable>
      ) : (
        <Pressable
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation?.();
            onToggle?.();
          }}
          style={[styles.checkbox, acknowledged && styles.checkboxChecked]}
        >
          <Ionicons
            name="checkmark"
            size={12}
            color="#000000"
            style={{ opacity: acknowledged ? 1 : 0 }}
          />
        </Pressable>
      )}

      <Text style={[styles.taskText, acknowledged && styles.taskTextChecked]}>
        <Text style={styles.handle}>{handle} </Text>
        {text}
      </Text>

      <View style={styles.timePill}>
        <Text style={styles.timeText}>{time}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  task: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#17171a",
    borderWidth: 1,
    borderColor: "#232326",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  taskPressed: {
    opacity: 0.7,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#57575b",
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxChecked: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },

  deleteButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF5A5F",
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  taskText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#d1d1d6",
  },

  taskTextChecked: {
    color: "#6b6b6f",
    textDecorationLine: "line-through",
  },

  handle: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  timePill: {
    backgroundColor: "#26262a",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 6,
  },

  timeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8e8e93",
  },
});