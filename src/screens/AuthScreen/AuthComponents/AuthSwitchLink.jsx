import { Text, Pressable, StyleSheet } from "react-native";

export default function AuthSwitchLink({ prompt, actionLabel, onPress }) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Text style={styles.text}>
        {prompt} <Text style={styles.action}>{actionLabel}</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: "center",
  },

  text: {
    color: "#6B6B70",
    fontSize: 13,
  },

  action: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
