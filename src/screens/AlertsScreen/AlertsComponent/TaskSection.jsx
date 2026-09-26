import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import TaskItem from "./TaskItem";

export default function TaskSection({
  icon,
  title,
  tasks,
  editMode = false,
  onTaskPress,
  onTaskToggle,
  onTaskDelete,
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={14} color="#8e8e93" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {tasks.map((task, index) => (
        <TaskItem
          key={index}
          handle={task.handle}
          text={task.text}
          time={task.time}
          acknowledged={task.acknowledged}
          editMode={editMode}
          onPress={() => onTaskPress?.(task)}
          onToggle={() => onTaskToggle?.(task)}
          onDelete={() => onTaskDelete?.(task)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 6,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8e8e93",
  },
});