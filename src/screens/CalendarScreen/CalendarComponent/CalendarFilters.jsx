import { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const IMPACT_DOT_COLORS = {
  High: "#E74C3C",
  Medium: "#F39C12",
  Low: "#8FCB8F",
};

// Functional filter bar for the Economic Calendar - two icon-driven
// dropdown controls (Impact, Currency) that report their selections back
// to the parent screen via props, rather than holding the actual filter
// state themselves. This keeps CalendarScreen as the single source of
// truth so both the filter UI and the event list stay in sync.
export default function CalendarFilters({
  impactOptions = [],
  selectedImpacts = [],
  onToggleImpact,
  currencyOptions = [],
  selectedCurrencies = [],
  onToggleCurrency,
  onClearAll,
}) {
  // Only one dropdown is open at a time: null | "impact" | "currency"
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const hasImpactFilter = selectedImpacts.length > 0;
  const hasCurrencyFilter = selectedCurrencies.length > 0;
  const hasAnyFilter = hasImpactFilter || hasCurrencyFilter;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>

        {/* IMPACT FILTER */}
        <View style={styles.filterColumn}>
          <Pressable
            style={[styles.filter, hasImpactFilter && styles.filterActive]}
            onPress={() => toggleMenu("impact")}
          >
            <Ionicons
              name="pulse-outline"
              size={15}
              color={hasImpactFilter ? "#FFFFFF" : "#9DA4AE"}
            />

            <Text
              style={[
                styles.filterText,
                hasImpactFilter && styles.filterTextActive,
              ]}
            >
              {hasImpactFilter ? `Impact (${selectedImpacts.length})` : "Impact"}
            </Text>

            <Ionicons
              name={openMenu === "impact" ? "chevron-up" : "chevron-down"}
              size={14}
              color={hasImpactFilter ? "#FFFFFF" : "#9DA4AE"}
            />
          </Pressable>

          {openMenu === "impact" && (
            <View style={styles.dropdown}>
              {impactOptions.length === 0 ? (
                <Text style={styles.dropdownEmpty}>
                  No impact levels available.
                </Text>
              ) : (
                impactOptions.map((impact) => {
                  const active = selectedImpacts.includes(impact);
                  const dotColor = IMPACT_DOT_COLORS[impact] || "#8FCB8F";

                  return (
                    <Pressable
                      key={impact}
                      style={[
                        styles.dropdownRow,
                        active && styles.dropdownRowActive,
                      ]}
                      onPress={() => onToggleImpact?.(impact)}
                    >
                      <View style={styles.dropdownLeft}>
                        <View
                          style={[
                            styles.impactDot,
                            { backgroundColor: dotColor },
                          ]}
                        />
                        <Text style={styles.dropdownText}>{impact}</Text>
                      </View>

                      {active && (
                        <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                      )}
                    </Pressable>
                  );
                })
              )}
            </View>
          )}
        </View>

        {/* CURRENCY FILTER */}
        <View style={styles.filterColumn}>
          <Pressable
            style={[styles.filter, hasCurrencyFilter && styles.filterActive]}
            onPress={() => toggleMenu("currency")}
          >
            <Ionicons
              name="cash-outline"
              size={15}
              color={hasCurrencyFilter ? "#FFFFFF" : "#9DA4AE"}
            />

            <Text
              style={[
                styles.filterText,
                hasCurrencyFilter && styles.filterTextActive,
              ]}
            >
              {hasCurrencyFilter
                ? `Currency (${selectedCurrencies.length})`
                : "Currency"}
            </Text>

            <Ionicons
              name={openMenu === "currency" ? "chevron-up" : "chevron-down"}
              size={14}
              color={hasCurrencyFilter ? "#FFFFFF" : "#9DA4AE"}
            />
          </Pressable>

          {openMenu === "currency" && (
            <View style={styles.dropdown}>
              {currencyOptions.length === 0 ? (
                <Text style={styles.dropdownEmpty}>
                  No currencies available.
                </Text>
              ) : (
                <ScrollView
                  style={styles.dropdownScroll}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                >
                  {currencyOptions.map((currency) => {
                    const active = selectedCurrencies.includes(currency);

                    return (
                      <Pressable
                        key={currency}
                        style={[
                          styles.dropdownRow,
                          active && styles.dropdownRowActive,
                        ]}
                        onPress={() => onToggleCurrency?.(currency)}
                      >
                        <Text style={styles.dropdownText}>{currency}</Text>

                        {active && (
                          <Ionicons
                            name="checkmark"
                            size={15}
                            color="#FFFFFF"
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        {/* CLEAR ALL - only shown once a filter is actually active */}
        {hasAnyFilter && (
          <Pressable
            style={styles.clearButton}
            onPress={() => {
              onClearAll?.();
              setOpenMenu(null);
            }}
          >
            <Ionicons name="close-circle" size={15} color="#9DA4AE" />
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    marginBottom: 12,
    position: "relative",
    zIndex: 30,
  },

  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  filterColumn: {
    position: "relative",
  },

  filter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 12,
    backgroundColor: "#0B1119",
    borderWidth: 1,
    borderColor: "#28333F",
    borderRadius: 10,
  },

  filterActive: {
    backgroundColor: "#3A7BD5",
    borderColor: "#3A7BD5",
  },

  filterText: {
    color: "#C8CDD3",
    fontSize: 11,
    fontWeight: "500",
  },

  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minHeight: 38,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#28333F",
    backgroundColor: "#0B1119",
  },

  clearText: {
    color: "#9DA4AE",
    fontSize: 11,
    fontWeight: "600",
  },

  dropdown: {
    position: "absolute",
    top: 44,
    left: 0,
    minWidth: 180,
    maxHeight: 230,
    backgroundColor: "#101820",
    borderWidth: 1,
    borderColor: "#28333F",
    borderRadius: 12,
    paddingVertical: 6,
    zIndex: 50,
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },

  dropdownScroll: {
    maxHeight: 220,
  },

  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  dropdownRowActive: {
    backgroundColor: "#16202B",
  },

  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  impactDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  dropdownText: {
    color: "#D8DCE1",
    fontSize: 13,
    fontWeight: "500",
  },

  dropdownEmpty: {
    color: "#59636D",
    fontSize: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});