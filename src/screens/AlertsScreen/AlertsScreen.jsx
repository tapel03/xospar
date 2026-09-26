import { useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import AlertHeader from "./AlertsComponent/AlertHeader";
import DaySelector from "./AlertsComponent/DaySelector";
import TaskSection from "./AlertsComponent/TaskSection";
import BottomToolbar from "./AlertsComponent/BottomToolbar";
import AlertFormModal from "../MarketsScreen/MarketsComponents/AlertFormModal";

import { useAlerts, getPeriodForHour } from "../../context/AlertsContext";
import { getCurrentWeekDays, toLocalDateKey } from "../../utils/weekDates";
import { colors } from "../../theme/colors";

function formatTime(hour, minute) {
  const period = hour >= 12 ? "PM" : "AM";
  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

function toTaskShape(alert) {
  const handleLabel = alert.symbol || alert.currency || (alert.storyTitle ? "NEWS" : "");

  return {
    handle: handleLabel ? `${handleLabel}:` : "",
    text: `${alert.heading}${alert.targetPrice ? ` @ ${alert.targetPrice}` : ""}`,
    time: alert.hasTime === false ? "Anytime" : formatTime(alert.hour, alert.minute),
    acknowledged: alert.acknowledged,
    alert,
  };
}

const TODAY_KEY = toLocalDateKey(new Date());

export default function AlertsScreen() {
  const { alerts, toggleAcknowledged, deleteAlert } = useAlerts();

  const [selectedDay, setSelectedDay] = useState(TODAY_KEY);
  const [formVisible, setFormVisible] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);

  const [hideAcknowledged, setHideAcknowledged] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const weekDays = useMemo(() => getCurrentWeekDays(), []);
  const selectedDayLabel = useMemo(() => {
    if (selectedDay === TODAY_KEY) return "Today";
    const match = weekDays.find((day) => day.key === selectedDay);
    return match?.label || "Today";
  }, [selectedDay, weekDays]);

  const alertsForSelectedDay = useMemo(
    () => alerts.filter((alert) => toLocalDateKey(new Date(alert.createdAt)) === selectedDay),
    [alerts, selectedDay]
  );

  const visibleAlertsForSelectedDay = useMemo(
    () =>
      hideAcknowledged
        ? alertsForSelectedDay.filter((alert) => !alert.acknowledged)
        : alertsForSelectedDay,
    [alertsForSelectedDay, hideAcknowledged]
  );

  const { morning, afternoon, evening } = useMemo(() => {
    const buckets = { morning: [], afternoon: [], evening: [] };

    visibleAlertsForSelectedDay
      .slice()
      .sort((a, b) => (a.hour ?? 0) * 60 + (a.minute ?? 0) - ((b.hour ?? 0) * 60 + (b.minute ?? 0)))
      .forEach((alert) => {
        buckets[getPeriodForHour(alert.hour ?? 0)].push(toTaskShape(alert));
      });

    return buckets;
  }, [visibleAlertsForSelectedDay]);

  const acknowledgedCount = useMemo(
    () => alertsForSelectedDay.filter((alert) => alert.acknowledged).length,
    [alertsForSelectedDay]
  );

  const handleTaskPress = (task) => {
    if (editMode) return;
    setEditingAlert(task.alert);
    setFormVisible(true);
  };

  const handleTaskToggle = (task) => {
    toggleAcknowledged(task.alert.id);
  };

  const handleTaskDelete = (task) => {
    deleteAlert(task.alert.id);
  };

  const handleAddPress = () => {
    setEditingAlert(null);
    setFormVisible(true);
  };

  const handleFormClose = () => {
    setFormVisible(false);
    setEditingAlert(null);
  };

  const hasVisibleAlerts = visibleAlertsForSelectedDay.length > 0;
  const dayLabelLower = selectedDayLabel === "Today" ? "today" : selectedDayLabel;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AlertHeader
          dayLabel={selectedDayLabel}
          total={alertsForSelectedDay.length}
          acknowledged={acknowledgedCount}
        />
        <DaySelector selectedDay={selectedDay} onSelectDay={setSelectedDay} />

        {hasVisibleAlerts ? (
          <>
            <TaskSection
              icon="moon"
              title="Morning"
              tasks={morning}
              editMode={editMode}
              onTaskPress={handleTaskPress}
              onTaskToggle={handleTaskToggle}
              onTaskDelete={handleTaskDelete}
            />
            <TaskSection
              icon="sunny"
              title="Afternoon"
              tasks={afternoon}
              editMode={editMode}
              onTaskPress={handleTaskPress}
              onTaskToggle={handleTaskToggle}
              onTaskDelete={handleTaskDelete}
            />
            <TaskSection
              icon="moon"
              title="Evening"
              tasks={evening}
              editMode={editMode}
              onTaskPress={handleTaskPress}
              onTaskToggle={handleTaskToggle}
              onTaskDelete={handleTaskDelete}
            />
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {alertsForSelectedDay.length === 0
                ? `No alerts set for ${dayLabelLower}.`
                : `All alerts for ${dayLabelLower} are acknowledged.`}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {alertsForSelectedDay.length === 0
                ? "Tap + below to create one."
                : "Tap the checklist icon to show them again."}
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomToolbar
        hideAcknowledged={hideAcknowledged}
        onToggleHideAcknowledged={() => setHideAcknowledged((v) => !v)}
        editMode={editMode}
        onToggleEditMode={() => setEditMode((v) => !v)}
        onAddPress={handleAddPress}
      />

      <AlertFormModal
        visible={formVisible}
        onClose={handleFormClose}
        asset={null}
        alert={editingAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 100,
  },

  emptyState: {
    alignItems: "center",
    paddingTop: 60,
  },

  emptyStateText: {
    color: colors[500],
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  emptyStateSubtext: {
    color: colors[400],
    fontSize: 13,
  },
});