import { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import MonthCalendarModal from "./MonthCalendarModal";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Returns the Monday-Sunday week that contains `date`.
function getWeekDates(date) {
  const day = date.getDay(); // 0=Sun..6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatRange(weekDates) {
  const start = weekDates[0];
  const end = weekDates[6];

  const startLabel = `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()}`;
  const endLabel =
    start.getMonth() === end.getMonth()
      ? `${end.getDate()}`
      : `${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}`;

  return `${startLabel} - ${endLabel}, ${end.getFullYear()}`;
}

export default function DateSelector({ selectedDate, onSelectDate }) {
  const [calendarVisible, setCalendarVisible] = useState(false);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  return (
    <View style={styles.container}>

      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>
          {formatRange(weekDates)}
        </Text>

        <Pressable
          style={styles.calendarButton}
          onPress={() => setCalendarVisible(true)}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color="#AAAAAA"
          />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContainer}
      >
        {weekDates.map((date, index) => {
          const active = isSameDate(date, selectedDate);

          return (
            <Pressable
              key={date.toISOString()}
              onPress={() => onSelectDate(date)}
              style={[
                styles.dayCard,
                active && styles.activeDayCard,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  active && styles.activeText,
                ]}
              >
                {DAY_LABELS[index]}
              </Text>

              <Text
                style={[
                  styles.dateText,
                  active && styles.activeText,
                ]}
              >
                {date.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <MonthCalendarModal
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#101820",
    paddingBottom: 12,
  },

  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  rangeText: {
    color: "#8C949E",
    fontSize: 13,
    fontWeight: "500",
  },

  calendarButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#0B1119",
    borderWidth: 1,
    borderColor: "#28333F",
    alignItems: "center",
    justifyContent: "center",
  },

  daysContainer: {
    paddingHorizontal: 12,
    gap: 8,
  },

  dayCard: {
    width: 58,
    height: 62,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2A3540",
    backgroundColor: "#171F28",
    alignItems: "center",
    justifyContent: "center",
  },

  activeDayCard: {
    backgroundColor: "#6C5CE7",
    borderColor: "#6C5CE7",
  },

  dayText: {
    color: "#8C949E",
    fontSize: 12,
    marginBottom: 5,
  },

  dateText: {
    color: "#D8DCE1",
    fontSize: 17,
    fontWeight: "700",
  },

  activeText: {
    color: "#FFFFFF",
  },
});