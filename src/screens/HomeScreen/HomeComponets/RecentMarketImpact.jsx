import { View, Text, StyleSheet, Pressable } from "react-native";

function getImpactColor(impact) {
  if (impact === "High") {
    return "#FF5A5F";
  }

  if (impact === "Medium") {
    return "#FFC857";
  }

  return "#8E8E93";
}

function getReportLine(story) {
  if (!story) {
    return "Markets may react as traders reassess the latest developments.";
  }

  return story.description;
}

export default function RecentMarketImpact({
  navigation,
  stories = [],
}) {
  const events = stories
    .filter((story) => story.impact !== "Low")
    .slice(0, 3);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>
            Recent Market Impact
          </Text>

          <Text style={styles.subtitle}>
            Latest developments with potential market impact
          </Text>
        </View>
      </View>

      {events.length === 0 ? (
        <Text style={styles.emptyText}>
          No major market-moving developments detected.
        </Text>
      ) : (
        events.map((event) => {
          const impactColor = getImpactColor(event.impact);

          return (
            <View key={event.id} style={styles.eventRow}>
              <View style={styles.eventTopRow}>
                <View style={styles.eventTitleContainer}>
                  <Text
                    style={styles.title}
                    numberOfLines={2}
                  >
                    {event.title}
                  </Text>

                  <Text style={styles.meta} numberOfLines={1}>
                    {event.source} • {event.time}
                  </Text>
                </View>

                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: `${impactColor}22`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: impactColor,
                      },
                    ]}
                  >
                    {event.impact}
                  </Text>
                </View>
              </View>

              <Text
                style={styles.report}
                numberOfLines={2}
              >
                {getReportLine(event)}
              </Text>

              <Text
                style={styles.markets}
                numberOfLines={1}
              >
                Markets: {event.markets.join(" • ")}
              </Text>
            </View>
          );
        })
      )}

      <Pressable
        style={styles.viewAllButton}
        onPress={() =>
          navigation.getParent()?.navigate("Calendar")
        }
      >
        <Text style={styles.viewAllText}>
          View All Events →
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#101820",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1C2630",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },

  subtitle: {
    color: "#737C86",
    fontSize: 11,
  },

  eventRow: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#1C2630",
  },

  eventTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  eventTitleContainer: {
    flex: 1,
    paddingRight: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
  },

  meta: {
    color: "#737C86",
    fontSize: 10,
    marginTop: 4,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  report: {
    color: "#AEB5BD",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  markets: {
    color: "#7D8691",
    fontSize: 10,
    marginTop: 7,
  },

  viewAllButton: {
    paddingTop: 13,
  },

  viewAllText: {
    color: "#3A7BD5",
    fontWeight: "600",
  },

  emptyText: {
    color: "#7D8691",
    fontSize: 12,
    lineHeight: 18,
    paddingVertical: 16,
  },
});