import { Text, StyleSheet } from "react-native";

export default function AuthHeading({ title, subtitle }) {
  return (
    <>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 36,
    marginBottom: 24,
  },

  subtitle: {
    color: "#8E8E93",
    fontSize: 14,
    lineHeight: 20,
    marginTop: -12,
    marginBottom: 24,
  },
});
