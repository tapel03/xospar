import { View, FlatList, StyleSheet, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ALERTS = [
  {
    id: "1",
    icon: "trending-down",
    iconBgColor: "#C23B3B",
    title: "High Revenue Drop Detected",
    timestamp: "May 31, 10:30 AM",
    severity: "High",
    severityColor: "#FF5A5F",
    status: "Active",
    statusColor: "#4ADE80",
  },
  {
    id: "2",
    icon: "alert-circle",
    iconBgColor: "#C23B3B",
    title: "Payment Failure Spike",
    timestamp: "May 31, 09:45 AM",
    severity: "High",
    severityColor: "#FF5A5F",
    status: "Active",
    statusColor: "#4ADE80",
  },
  {
    id: "3",
    icon: "settings",
    iconBgColor: "#D97706",
    title: "Unusual User Activity",
    timestamp: "May 31, 09:20 AM",
    severity: "Medium",
    severityColor: "#FFB020",
    status: "Acknowledged",
    statusColor: "#FFC857",
  },
  {
    id: "4",
    icon: "server",
    iconBgColor: "#D97706",
    title: "Server Response Time High",
    timestamp: "May 31, 08:50 AM",
    severity: "Medium",
    severityColor: "#FFB020",
    status: "Active",
    statusColor: "#4ADE80",
  },
  {
    id: "5",
    icon: "database",
    iconBgColor: "#C23B3B",
    title: "Database CPU Usage High",
    timestamp: "May 31, 07:30 AM",
    severity: "High",
    severityColor: "#FF5A5F",
    status: "Resolved",
    statusColor: "#8B8B8B",
  },
  {
    id: "6",
    icon: "person-add",
    iconBgColor: "#D97706",
    title: "New Signups Drop",
    timestamp: "May 31, 06:15 AM",
    severity: "Medium",
    severityColor: "#FFB020",
    status: "Snoozed",
    statusColor: "#5BC6F0",
  },
];

const AlertItem = ({ alert, onPress }) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.alertItem, pressed && styles.alertItemPressed]}
      onPress={onPress}
    >
      {/* Icon Circle */}
      <View style={[styles.iconContainer, { backgroundColor: alert.iconBgColor }]}>
        <Ionicons name={alert.icon} size={24} color="#FFFFFF" />
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        <Text style={styles.alertTitle}>{alert.title}</Text>
        <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
      </View>

      {/* Badge Section */}
      <View style={styles.badgeSection}>
        <Text style={[styles.severityBadge, { color: alert.severityColor }]}>
          {alert.severity}
        </Text>
        <Text style={[styles.statusBadge, { color: alert.statusColor }]}>
          {alert.status}
        </Text>
      </View>
    </Pressable>
  );
};

export default function AlertListItem() {
  return (
    <View style={styles.container}>
      <FlatList
        data={ALERTS}
        renderItem={({ item }) => <AlertItem alert={item} />}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
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

  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1C2630",
  },

  alertItemPressed: {
    backgroundColor: "#0F1519",
    opacity: 0.7,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  contentSection: {
    flex: 1,
  },

  alertTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },

  alertTimestamp: {
    color: "#8B949E",
    fontSize: 12,
  },

  badgeSection: {
    marginLeft: 12,
    alignItems: "flex-end",
  },

  severityBadge: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },

  statusBadge: {
    fontSize: 11,
    fontWeight: "600",
  },
});