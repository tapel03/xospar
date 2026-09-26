import { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { getCurrentWeekDays } from "../../../utils/weekDates";
import { colors } from "../../../theme/colors";

export default function DaySelector({ selectedDay, onSelectDay }) {
  const days = useMemo(() => getCurrentWeekDays(), []);

  return (
    <View style={styles.container}>
      {days.map((day) => {
        const active = selectedDay === day.key;

        return (
          <Pressable
            key={day.key}
            style={styles.day}
            onPress={() => onSelectDay(day.key)}
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
                {day.dateNum}
              </Text>
            </View>

            {day.isToday && !active ? <View style={styles.todayDot} /> : null}
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
    color: colors[500],
  },

  activeDayLabel: {
    color: colors[950],
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
    backgroundColor: colors[950],
  },

  dayDateText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors[500],
  },

  activeDayDateText: {
    color: colors.base,
    fontWeight: "700",
  },

  todayDot: {
    position: "absolute",
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3A7BD5",
  },
});