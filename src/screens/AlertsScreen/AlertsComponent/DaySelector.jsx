import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

const DAYS = [
  { id: "mon", label: "Mon", date: "12" },
  { id: "tue", label: "Tue", date: "13" },
  { id: "wed", label: "Wed", date: "14" },
  { id: "thu", label: "Thu", date: "15" },
  { id: "fri", label: "Fri", date: "16" },
  { id: "sat", label: "Sat", date: "17" },
  { id: "sun", label: "Sun", date: "18" },
];

export default function DaySelector() {
  const [selectedDay, setSelectedDay] = useState("fri");

  return (
    <View style={styles.container}>
      {DAYS.map((day) => {
        const active = selectedDay === day.id;

        return (
          <Pressable
            key={day.id}
            style={styles.day}
            onPress={() => setSelectedDay(day.id)}
          >
            <Text style={[styles.dayLabel, active && styles.activeDayLabel]}>
              {day.label}
            </Text>

            <View style={[styles.dayDate, active && styles.activeDayDate]}>
              <Text
                style={[
                  styles.dayDateText,
                  active && styles.activeDayDateText,
                ]}
              >
                {day.date}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    paddingBottom: 22,
  },

  day: {
    alignItems: "center",
    gap: 8,
    width: 34,
  },

  dayLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8e8e93",
  },

  activeDayLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  dayDate: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  activeDayDate: {
    backgroundColor: "#FFFFFF",
  },

  dayDateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8e8e93",
  },

  activeDayDateText: {
    color: "#000000",
    fontWeight: "700",
  },
});