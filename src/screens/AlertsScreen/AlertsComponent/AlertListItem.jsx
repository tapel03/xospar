import { View, StyleSheet,flatlist } from "react-native";

export default function AlertListItem() {
  return (
    <flatlist style={styles.AlertListItem_container}>
    </flatlist>
  );
}

const styles = StyleSheet.create({
  AlertListItem_container: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#101820",
  borderWidth: 10,
  borderColor: "#FFFFFF",
   width: "100%",
},
});