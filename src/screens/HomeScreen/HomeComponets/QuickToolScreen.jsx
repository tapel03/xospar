import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const num = (value) => parseFloat(String(value ?? "").replace(/,/g, ""));

function fmt(value, decimals = 2) {
  return Number.isFinite(value)
    ? value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : "--";
}

const MISSING = { error: "Fill in every field with a number above 0." };

// Each tool: its input fields plus a compute() that returns either
// { rows: [{ label, value }] } or { error: "..." }.
const TOOLS = {
  position: {
    title: "Position Size",
    subtitle: "How many units to trade for a fixed risk.",
    fields: [
      { key: "balance", label: "Account balance", placeholder: "10000" },
      { key: "riskPct", label: "Risk per trade (%)", placeholder: "1" },
      { key: "entry", label: "Entry price", placeholder: "1.0850" },
      { key: "stop", label: "Stop-loss price", placeholder: "1.0800" },
    ],
    compute: (v) => {
      const balance = num(v.balance);
      const riskPct = num(v.riskPct);
      const entry = num(v.entry);
      const stop = num(v.stop);

      if ([balance, riskPct, entry, stop].some((x) => !(x > 0))) return MISSING;
      if (entry === stop) return { error: "Entry and stop can't be the same price." };

      const riskAmount = (balance * riskPct) / 100;
      const units = riskAmount / Math.abs(entry - stop);

      return {
        rows: [
          { label: "Risk amount", value: fmt(riskAmount) },
          { label: "Position size (units)", value: fmt(units, 2) },
          { label: "Position value", value: fmt(units * entry) },
        ],
      };
    },
  },

  rr: {
    title: "Risk/Reward",
    subtitle: "Compare what you risk with what you could make.",
    fields: [
      { key: "entry", label: "Entry price", placeholder: "1.0850" },
      { key: "stop", label: "Stop-loss price", placeholder: "1.0800" },
      { key: "target", label: "Take-profit price", placeholder: "1.0950" },
    ],
    compute: (v) => {
      const entry = num(v.entry);
      const stop = num(v.stop);
      const target = num(v.target);

      if ([entry, stop, target].some((x) => !(x > 0))) return MISSING;

      const isLong = stop < entry && target > entry;
      const isShort = stop > entry && target < entry;

      if (!isLong && !isShort) {
        return { error: "Stop and target must be on opposite sides of entry." };
      }

      const risk = Math.abs(entry - stop);
      const reward = Math.abs(target - entry);

      return {
        rows: [
          { label: "Direction", value: isLong ? "Long" : "Short" },
          { label: "Risk (price distance)", value: fmt(risk, 4) },
          { label: "Reward (price distance)", value: fmt(reward, 4) },
          { label: "Risk : Reward", value: `1 : ${fmt(reward / risk, 2)}` },
        ],
      };
    },
  },

  pip: {
    title: "Pip Calculator",
    subtitle: "Pip value for a pair and lot size.",
    fields: [
      { key: "pair", label: "Pair", placeholder: "EURUSD", text: true },
      { key: "lots", label: "Lot size", placeholder: "1" },
      { key: "pips", label: "Number of pips", placeholder: "20" },
    ],
    compute: (v) => {
      const pair = String(v.pair || "").replace("/", "").trim().toUpperCase();
      const lots = num(v.lots);
      const pips = num(v.pips);

      if (!pair) return { error: "Enter a pair, e.g. EURUSD." };
      if (!(lots > 0) || !(pips > 0)) return MISSING;

      const pipSize = pair.includes("JPY") ? 0.01 : 0.0001;
      const perPip = lots * 100000 * pipSize;
      const quote = pair.length >= 6 ? pair.slice(3, 6) : "quote ccy";

      return {
        rows: [
          { label: "Pip size", value: String(pipSize) },
          { label: `Value per pip (${quote})`, value: fmt(perPip) },
          { label: `Total for ${fmt(pips, 0)} pips (${quote})`, value: fmt(perPip * pips) },
        ],
      };
    },
  },

  lot: {
    title: "Lot Size",
    subtitle: "Lots to trade for a fixed risk and stop distance.",
    fields: [
      { key: "balance", label: "Account balance", placeholder: "10000" },
      { key: "riskPct", label: "Risk per trade (%)", placeholder: "1" },
      { key: "slPips", label: "Stop-loss (pips)", placeholder: "50" },
      {
        key: "pipValue",
        label: "Pip value per 1.0 lot",
        placeholder: "10",
        defaultValue: "10",
      },
    ],
    compute: (v) => {
      const balance = num(v.balance);
      const riskPct = num(v.riskPct);
      const slPips = num(v.slPips);
      const pipValue = num(v.pipValue);

      if ([balance, riskPct, slPips, pipValue].some((x) => !(x > 0))) return MISSING;

      const riskAmount = (balance * riskPct) / 100;
      const lots = riskAmount / (slPips * pipValue);

      return {
        rows: [
          { label: "Risk amount", value: fmt(riskAmount) },
          { label: "Lot size", value: fmt(lots, 2) },
          { label: "Units", value: fmt(lots * 100000, 0) },
        ],
      };
    },
  },
};

function buildInitialValues() {
  const initial = {};

  Object.entries(TOOLS).forEach(([toolKey, tool]) => {
    initial[toolKey] = {};
    tool.fields.forEach((field) => {
      initial[toolKey][field.key] = field.defaultValue || "";
    });
  });

  return initial;
}

export default function QuickToolScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  // Fixed for the life of this screen - whichever tool it was opened
  // for. There's no in-screen switcher to the other tools anymore, so
  // this never needs to change after mount.
  const toolKey = route?.params?.tool || "position";
  const [values, setValues] = useState(buildInitialValues);

  const tool = TOOLS[toolKey];
  const toolValues = values[toolKey];

  const setValue = (key, text) => {
    setValues((prev) => ({
      ...prev,
      [toolKey]: { ...prev[toolKey], [key]: text },
    }));
  };

  const hasInput = Object.entries(toolValues).some(
    ([key, value]) =>
      value !== "" &&
      value !== (tool.fields.find((field) => field.key === key)?.defaultValue || "")
  );

  const result = hasInput ? tool.compute(toolValues) : null;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER - shows only the tool that was opened, no switcher to
          the other three. */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.title}>{tool.title}</Text>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <Text style={styles.toolTitle}>{tool.title}</Text>
        <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>

        {tool.fields.map((field) => (
          <View key={field.key} style={styles.field}>
            <Text style={styles.label}>{field.label}</Text>

            <TextInput
              value={toolValues[field.key]}
              onChangeText={(text) => setValue(field.key, text)}
              placeholder={field.placeholder}
              placeholderTextColor="#59636D"
              keyboardType={field.text ? "default" : "decimal-pad"}
              autoCapitalize={field.text ? "characters" : "none"}
              style={styles.input}
            />
          </View>
        ))}

        {result?.error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{result.error}</Text>
          </View>
        ) : null}

        {result?.rows ? (
          <View style={styles.resultCard}>
            {result.rows.map((row, index) => (
              <View
                key={row.label}
                style={[
                  styles.resultRow,
                  index === result.rows.length - 1 && styles.resultRowLast,
                ]}
              >
                <Text style={styles.resultLabel}>{row.label}</Text>
                <Text style={styles.resultValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.disclaimer}>
          For education only. Results are estimates and not financial advice.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050A12",
  },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 20,
  },

  toolTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },

  toolSubtitle: {
    color: "#AEB5BD",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 18,
  },

  field: {
    marginBottom: 14,
  },

  label: {
    color: "#8B949E",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },

  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontSize: 15,
    backgroundColor: "#0B1420",
    borderWidth: 1,
    borderColor: "#1C2A3A",
  },

  resultCard: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: "#0B1420",
    borderWidth: 1,
    borderColor: "#1F3B5C",
    paddingHorizontal: 14,
  },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#16202D",
  },

  resultRowLast: {
    borderBottomWidth: 0,
  },

  resultLabel: {
    flex: 1,
    color: "#AEB5BD",
    fontSize: 13,
    paddingRight: 10,
  },

  resultValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  errorCard: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#2A1517",
    borderWidth: 1,
    borderColor: "#5A2226",
  },

  errorText: {
    color: "#FF8A8E",
    fontSize: 13,
  },

  disclaimer: {
    color: "#5F6871",
    fontSize: 11,
    textAlign: "center",
    marginTop: 20,
  },
});