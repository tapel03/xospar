import { View, Text, StyleSheet,Pressable } from "react-native";
 export default function AlertHeader() 
 {

return (
  <View style={styles.Container}>
    <Text style={styles.title}>Alerts</Text>

    <Pressable style={styles.CreateAlertBtn}>
      <Text style={styles.CreateAlertText}>+ Create Alert</Text>
    </Pressable>
  </View>
);
 }
const styles = StyleSheet.create({
  Container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
     paddingHorizontal: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  CreateAlertBtn: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  CreateAlertText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});

