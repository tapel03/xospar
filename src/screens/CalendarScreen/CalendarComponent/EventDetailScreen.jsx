import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import AlertFormModal from "../../MarketsScreen/MarketsComponents/AlertFormModal";

const IMPACT_COLORS = {
  High: "#FF5A5F",
  Medium: "#FFB020",
  Low: "#8FCB8F",
};

function getNumericValue(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const number = parseFloat(String(value).replace("%", ""));

  return Number.isNaN(number) ? null : number;
}

function getResult(actual, forecast) {
  const actualValue = getNumericValue(actual);
  const forecastValue = getNumericValue(forecast);

  if (actualValue === null || forecastValue === null) {
    return {
      label: "Awaiting result",
      direction: "neutral",
    };
  }

  if (actualValue > forecastValue) {
    return {
      label: "Higher than expected",
      direction: "higher",
    };
  }

  if (actualValue < forecastValue) {
    return {
      label: "Lower than expected",
      direction: "lower",
    };
  }

  return {
    label: "In line with expectations",
    direction: "neutral",
  };
}

function getAnalysis(event, result) {
  const title = event.title?.toLowerCase() || "";
  const currency = event.currency || "the affected currency";

  if (title.includes("cpi") || title.includes("inflation")) {
    return {
      whatItMeans:
        "Inflation data shows how quickly consumer prices are changing. Markets watch it closely because it can influence expectations about interest rates.",

      higher:
        `If inflation comes in higher than expected, markets may expect ${currency} interest rates to remain higher for longer. This can support ${currency} and increase volatility in ${currency}-related pairs.`,

      lower:
        `If inflation comes in lower than expected, markets may expect less pressure for higher interest rates. This can weaken ${currency} and support currencies or assets trading against it.`,

      neutral:
        "A result close to expectations may produce a smaller reaction unless other parts of the report change the market's expectations.",

      watch: [
        `${currency} currency pairs`,
        "Interest-rate expectations",
        "Government bond yields",
        "Gold",
      ],
    };
  }

  if (
    title.includes("interest rate") ||
    title.includes("fed") ||
    title.includes("rate decision")
  ) {
    return {
      whatItMeans:
        "An interest-rate decision tells the market how a central bank is responding to economic conditions. The decision itself matters, but the statement and future guidance can matter just as much.",

      higher:
        `A more hawkish-than-expected decision can support ${currency} because higher rates can make assets denominated in ${currency} more attractive.`,

      lower:
        `A more dovish-than-expected decision can weaken ${currency} because markets may expect lower rates or easier monetary policy.`,

      neutral:
        "If the decision matches expectations, the biggest market reaction may come from the central bank's comments about future decisions.",

      watch: [
        `${currency} currency pairs`,
        "Central-bank guidance",
        "Bond yields",
        "Market expectations for future rates",
      ],
    };
  }

  if (
    title.includes("retail sales") ||
    title.includes("consumer spending")
  ) {
    return {
      whatItMeans:
        "Retail sales provide a view of consumer spending. Strong consumer spending can indicate stronger economic activity, while weak spending can point to slower growth.",

      higher:
        `Stronger-than-expected spending can support ${currency} if markets interpret it as evidence of a stronger economy.`,

      lower:
        `Weaker-than-expected spending can pressure ${currency} if markets interpret it as a sign of slowing economic activity.`,

      neutral:
        "A result close to expectations may have a limited immediate effect unless other economic data changes the outlook.",

      watch: [
        `${currency} currency pairs`,
        "Economic growth expectations",
        "Interest-rate expectations",
      ],
    };
  }

  return {
    whatItMeans:
      `This economic release can influence expectations for the ${currency} economy and may create volatility around the release time.`,

    higher:
      `A stronger-than-expected result may support ${currency} if traders interpret the data as positive for the economy.`,

    lower:
      `A weaker-than-expected result may pressure ${currency} if traders interpret the data as negative for the economy.`,

    neutral:
      "A result close to expectations may produce a smaller reaction, although the market can still react to other details in the release.",

    watch: [
      `${currency} currency pairs`,
      "Interest-rate expectations",
      "Related economic data",
    ],
  };
}

export default function EventDetailScreen() {
  const route = useRoute();

  const event = route.params?.event ?? {
    id: "unknown",
    time: "--:--",
    currency: "—",
    title: "Event details unavailable",
    impact: "Low",
    actual: "--",
    forecast: "--",
    previous: "--",
  };

  const [analysisExpanded, setAnalysisExpanded] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const impactColor =
    IMPACT_COLORS[event.impact] || IMPACT_COLORS.Low;

  const result = getResult(event.actual, event.forecast);
  const analysis = getAnalysis(event, result);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* EVENT HEADER */}
        <View style={styles.header}>
          <Text style={styles.time}>{event.time}</Text>

          <View style={styles.currencyRow}>
            <Text style={styles.currency}>
              {event.currency}
            </Text>

            <View
              style={[
                styles.impactBadge,
                { borderColor: impactColor },
              ]}
            >
              <Text
                style={[
                  styles.impactText,
                  { color: impactColor },
                ]}
              >
                {event.impact} Impact
              </Text>
            </View>
          </View>

          <Text style={styles.title}>
            {event.title}
          </Text>
        </View>

        {/* DATA */}
        <View style={styles.dataCard}>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Actual</Text>
            <Text style={styles.dataValue}>
              {event.actual || "--"}
            </Text>
          </View>

          <View style={styles.dataDivider} />

          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Forecast</Text>
            <Text style={styles.dataValue}>
              {event.forecast || "--"}
            </Text>
          </View>

          <View style={styles.dataDivider} />

          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Previous</Text>
            <Text style={styles.dataValue}>
              {event.previous || "--"}
            </Text>
          </View>
        </View>

        {/* RESULT */}
        {result.direction !== "neutral" && (
          <View style={styles.resultCard}>
            <Ionicons
              name={
                result.direction === "higher"
                  ? "arrow-up"
                  : "arrow-down"
              }
              size={18}
              color="#FFFFFF"
            />

            <View style={styles.resultTextContainer}>
              <Text style={styles.resultLabel}>
                Market result
              </Text>

              <Text style={styles.resultValue}>
                {result.label}
              </Text>
            </View>
          </View>
        )}

        {/* TWO MAIN ACTIONS */}
        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => setAlertVisible(true)}
          >
            <Ionicons
              name="notifications-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.primaryButtonText}>
              Create Alert
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              setAnalysisExpanded(!analysisExpanded)
            }
          >
            <Ionicons
              name={
                analysisExpanded
                  ? "chevron-up"
                  : "sparkles-outline"
              }
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.secondaryButtonText}>
              {analysisExpanded
                ? "Hide Analysis"
                : "Expand Analysis"}
            </Text>
          </Pressable>
        </View>

        {/* ANALYSIS */}
        {analysisExpanded && (
          <View style={styles.analysis}>
            <View style={styles.analysisHeader}>
              <View style={styles.analysisIcon}>
                <Ionicons
                  name="sparkles"
                  size={18}
                  color="#FFFFFF"
                />
              </View>

              <View>
                <Text style={styles.analysisTitle}>
                  Market Analysis
                </Text>

                <Text style={styles.analysisSubtitle}>
                  Understanding the possible market reaction
                </Text>
              </View>
            </View>

            {/* WHAT IT MEANS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                What does this event mean?
              </Text>

              <Text style={styles.sectionText}>
                {analysis.whatItMeans}
              </Text>
            </View>

            {/* RESULT ANALYSIS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                What happened?
              </Text>

              <View style={styles.comparisonRow}>
                <View style={styles.comparisonItem}>
                  <Text style={styles.comparisonLabel}>
                    Actual
                  </Text>

                  <Text style={styles.comparisonValue}>
                    {event.actual || "--"}
                  </Text>
                </View>

                <View style={styles.comparisonArrow}>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#777777"
                  />
                </View>

                <View style={styles.comparisonItem}>
                  <Text style={styles.comparisonLabel}>
                    Forecast
                  </Text>

                  <Text style={styles.comparisonValue}>
                    {event.forecast || "--"}
                  </Text>
                </View>
              </View>

              <Text style={styles.resultExplanation}>
                {result.direction === "higher"
                  ? analysis.higher
                  : result.direction === "lower"
                  ? analysis.lower
                  : analysis.neutral}
              </Text>
            </View>

            {/* POTENTIAL IMPACT */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Potential Market Impact
              </Text>

              <View style={styles.impactRow}>
                <View style={styles.impactAsset}>
                  <Text style={styles.impactAssetName}>
                    {event.currency}
                  </Text>

                  <Text style={styles.impactAssetDescription}>
                    Direct currency impact
                  </Text>
                </View>

                <Text style={styles.potentialText}>
                  Potential reaction
                </Text>
              </View>

              <View style={styles.impactRow}>
                <View style={styles.impactAsset}>
                  <Text style={styles.impactAssetName}>
                    Related pairs
                  </Text>

                  <Text style={styles.impactAssetDescription}>
                    Forex pairs involving {event.currency}
                  </Text>
                </View>

                <Text style={styles.potentialText}>
                  Increased volatility
                </Text>
              </View>
            </View>

            {/* WHAT TO WATCH */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                What to watch
              </Text>

              {analysis.watch.map((item, index) => (
                <View
                  key={index}
                  style={styles.watchRow}
                >
                  <View style={styles.watchDot} />

                  <Text style={styles.watchText}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            {/* TAKEAWAY */}
            <View style={styles.takeaway}>
              <Text style={styles.takeawayTitle}>
                AI Takeaway
              </Text>

              <Text style={styles.takeawayText}>
                The important thing is not simply whether
                the number is high or low. The market compares
                the release with expectations and then
                reassesses what the result could mean for
                interest rates, currencies and other assets.
              </Text>
            </View>

            <Text style={styles.disclaimer}>
              Market reactions are not guaranteed. This
              analysis is for information and education and
              should not be treated as financial advice.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* EXISTING ALERT FORM */}
      <AlertFormModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        event={event}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101820",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 20,
  },

  time: {
    color: "#9DA4AE",
    fontSize: 14,
    marginBottom: 8,
  },

  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  currency: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
  },

  impactBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  impactText: {
    fontSize: 11,
    fontWeight: "700",
  },

  dataCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B1119",
    borderWidth: 1,
    borderColor: "#28333F",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  dataItem: {
    flex: 1,
  },

  dataLabel: {
    color: "#737C86",
    fontSize: 12,
    marginBottom: 6,
  },

  dataValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  dataDivider: {
    width: 1,
    height: 34,
    backgroundColor: "#28333F",
    marginHorizontal: 10,
  },

  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18232D",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },

  resultTextContainer: {
    marginLeft: 10,
  },

  resultLabel: {
    color: "#737C86",
    fontSize: 11,
  },

  resultValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 3,
  },

  actions: {
    gap: 10,
    marginBottom: 20,
  },

  primaryButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#1C2630",
    borderWidth: 1,
    borderColor: "#394651",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  secondaryButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#0B1119",
    borderWidth: 1,
    borderColor: "#28333F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  analysis: {
    borderTopWidth: 1,
    borderTopColor: "#28333F",
    paddingTop: 20,
  },

  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  analysisIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1C2630",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  analysisTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  analysisSubtitle: {
    color: "#737C86",
    fontSize: 11,
    marginTop: 3,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 9,
  },

  sectionText: {
    color: "#AEB5BD",
    fontSize: 14,
    lineHeight: 21,
  },

  comparisonRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B1119",
    borderWidth: 1,
    borderColor: "#28333F",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },

  comparisonItem: {
    flex: 1,
  },

  comparisonLabel: {
    color: "#737C86",
    fontSize: 11,
    marginBottom: 5,
  },

  comparisonValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  comparisonArrow: {
    paddingHorizontal: 12,
  },

  resultExplanation: {
    color: "#AEB5BD",
    fontSize: 14,
    lineHeight: 21,
  },

  impactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0B1119",
    borderWidth: 1,
    borderColor: "#28333F",
    borderRadius: 10,
    padding: 13,
    marginBottom: 8,
  },

  impactAsset: {
    flex: 1,
    paddingRight: 10,
  },

  impactAssetName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  impactAssetDescription: {
    color: "#737C86",
    fontSize: 11,
    marginTop: 3,
  },

  potentialText: {
    color: "#AEB5BD",
    fontSize: 11,
    fontWeight: "600",
  },

  watchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  watchDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#AEB5BD",
    marginRight: 10,
  },

  watchText: {
    color: "#AEB5BD",
    fontSize: 13,
  },

  takeaway: {
    backgroundColor: "#18232D",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  takeawayTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  takeawayText: {
    color: "#AEB5BD",
    fontSize: 13,
    lineHeight: 20,
  },

  disclaimer: {
    color: "#5F6871",
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
  },
});