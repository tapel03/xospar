import { View, ScrollView, StyleSheet } from "react-native";

import AlertHeader from "./AlertsComponent/AlertHeader";
import DaySelector from "./AlertsComponent/DaySelector";
import TaskSection from "./AlertsComponent/TaskSection";
import BottomToolbar from "./AlertsComponent/BottomToolbar";

const MORNING_TASKS = [
  {
    handle: "@coinbase:",
    text: "design user registration process",
    time: "50 min",
  },
  {
    handle: "@apple:",
    text: "review and provide feedback on the wireframes for the new design concept",
    time: "45 min",
  },
  {
    handle: "@shopify:",
    text: "mood board for the ecommerce template",
    time: "30 min",
  },
];

const AFTERNOON_TASKS = [
  {
    handle: "@apple:",
    text: "finalize color palette and typography",
    time: "25 min",
  },
  {
    handle: "@insurance:",
    text: "analyze user feedback and suggest improvements",
    time: "60 min",
  },
  {
    handle: "@shopify:",
    text: "evaluate two potential website layouts",
    time: "45 min",
  },
];

const EVENING_TASKS = [];

export default function AlertsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AlertHeader />
        <DaySelector />

        <TaskSection icon="moon" title="Morning" tasks={MORNING_TASKS} />
        <TaskSection icon="sunny" title="Afternoon" tasks={AFTERNOON_TASKS} />
        <TaskSection icon="moon" title="Evening" tasks={EVENING_TASKS} />
      </ScrollView>

      <BottomToolbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 100,
  },
});