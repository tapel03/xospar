import { View, FlatList, StyleSheet } from "react-native";

export default function AlertListItem() {
  return (
    <View style={styles.container}>

      <FlatList
        data={[]}
        renderItem={null}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#101820",
  },
});