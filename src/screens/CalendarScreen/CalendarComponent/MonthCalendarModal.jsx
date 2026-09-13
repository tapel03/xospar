import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function buildMonthGrid(year, month) {
  // Monday-first grid. JS getDay(): 0=Sun..6=Sat.
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0=Mon..6=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function MonthCalendarModal({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
}) {
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  const cells = buildMonthGrid(viewYear, viewMonth);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const pickDay = (day) => {
    if (!day) return;
    onSelectDate(new Date(viewYear, viewMonth, day));
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>

          <View style={styles.header}>
            <Pressable onPress={goPrevMonth} hitSlop={10}>
              <Ionicons name="chevron-back" size={20} color="#D8DCE1" />
            </Pressable>

            <Text style={styles.headerTitle}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>

            <Pressable onPress={goNextMonth} hitSlop={10}>
              <Ionicons name="chevron-forward" size={20} color="#D8DCE1" />
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((label) => (
              <Text key={label} style={styles.weekdayLabel}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, index) => {
              const thisDate = day
                ? new Date(viewYear, viewMonth, day)
                : null;

              const active = thisDate && isSameDate(thisDate, selectedDate);

              return (
                <Pressable
                  key={index}
                  style={styles.cell}
                  onPress={() => pickDay(day)}
                  disabled={!day}
                >
                  {day && (
                    <View style={[styles.dayCircle, active && styles.dayCircleActive]}>
                      <Text style={[styles.dayText, active && styles.dayTextActive]}>
                        {day}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#101820",
    borderWidth: 1,
    borderColor: "#28333F",
    borderRadius: 16,
    padding: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  weekdayRow: {
    flexDirection: "row",
    marginBottom: 6,
  },

  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    color: "#737C86",
    fontSize: 11,
    fontWeight: "600",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  dayCircleActive: {
    backgroundColor: "#6C5CE7",
  },

  dayText: {
    color: "#D8DCE1",
    fontSize: 13,
    fontWeight: "500",
  },

  dayTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});