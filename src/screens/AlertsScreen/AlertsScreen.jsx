
import { View, Text, StyleSheet } from "react-native";

import AlertHeader from '../AlertsScreen/AlertsComponent/AlertHeader';
import FilterBar from './AlertsComponent/FilterBar';
import AlertListItem from '../AlertsScreen/AlertsComponent/AlertListItem';

export default function AlertsScreen() {

  return (

    <View style={styles.container}>
      <AlertHeader />
      <FilterBar />
      <AlertListItem />
    </View>

  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#000000',
     borderColor: "#FFFFFF",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },

});
