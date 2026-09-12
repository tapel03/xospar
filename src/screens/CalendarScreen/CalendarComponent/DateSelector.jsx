import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DAYS = [
  {
    id: "mon",
    day: "Mon",
    date: "13",
  },
  {
    id: "tue",
    day: "Tue",
    date: "14",
  },
  {
    id: "wed",
    day: "Wed",
    date: "15",
  },
  {
    id: "thu",
    day: "Thu",
    date: "16",
  },
  {
    id: "fri",
    day: "Fri",
    date: "17",
  },
];

export default function DateSelector() {
  const [selectedDay, setSelectedDay] = useState("wed");

  return (
    <View style={styles.container}>

      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>
          May 13 - 17, 2024
        </Text>

        <Pressable style={styles.calendarButton}>
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
        {DAYS.map((item) => {
          const active = selectedDay === item.id;

          return (
            <Pressable
              key={item.id}
              onPress={() => setSelectedDay(item.id)}
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
                {item.day}
              </Text>

              <Text
                style={[
                  styles.dateText,
                  active && styles.activeText,
                ]}
              >
                {item.date}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

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
