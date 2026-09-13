import { useMemo, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";

import AlertHeader from "./AlertsComponent/AlertHeader";
import DaySelector from "./AlertsComponent/DaySelector";
import TaskSection from "./AlertsComponent/TaskSection";
import BottomToolbar from "./AlertsComponent/BottomToolbar";
import AlertFormModal from "../MarketsScreen/MarketsComponents/AlertFormModal";

import { useAlerts, getPeriodForHour } from "../../context/AlertsContext";

function formatTime(hour, minute) {
  const period = hour >= 12 ? "PM" : "AM";
  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

function toTaskShape(alert) {
  return {
    handle: `${alert.symbol}:`,
    text: `${alert.heading}${alert.targetPrice ? ` @ ${alert.targetPrice}` : ""}`,
    time: formatTime(alert.hour, alert.minute),
    acknowledged: alert.acknowledged,
    alert,
  };
}

export default function AlertsScreen() {
  const { alerts, toggleAcknowledged } = useAlerts();
  const [editingAlert, setEditingAlert] = useState(null);

  // Alerts created from any asset's modal land here automatically - sorted
  // by time and grouped into Morning/Afternoon/Evening based on when each
  // one was set for.
  const { morning, afternoon, evening } = useMemo(() => {
    const buckets = { morning: [], afternoon: [], evening: [] };

    alerts
      .slice()
      .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute))
      .forEach((alert) => {
        buckets[getPeriodForHour(alert.hour)].push(toTaskShape(alert));
      });

    return buckets;
  }, [alerts]);

  const handleTaskPress = (task) => {
    setEditingAlert(task.alert);
  };

  const handleTaskToggle = (task) => {
    toggleAcknowledged(task.alert.id);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AlertHeader />
        <DaySelector />

        <TaskSection
          icon="moon"
          title="Morning"
          tasks={morning}
          onTaskPress={handleTaskPress}
          onTaskToggle={handleTaskToggle}
        />
        <TaskSection
          icon="sunny"
          title="Afternoon"
          tasks={afternoon}
          onTaskPress={handleTaskPress}
          onTaskToggle={handleTaskToggle}
        />
        <TaskSection
          icon="moon"
          title="Evening"
          tasks={evening}
          onTaskPress={handleTaskPress}
          onTaskToggle={handleTaskToggle}
        />
      </ScrollView>

      <BottomToolbar />

      <AlertFormModal
        visible={editingAlert !== null}
        onClose={() => setEditingAlert(null)}
        asset={null}
        alert={editingAlert}
      />
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