import { useEffect, useMemo, useState } from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
  Switch,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useAlerts } from "../../../context/AlertsContext";
import InAppModalOverlay from "../../../components/InAppModalOverlay";

function clampMinute(minute) {
  return Math.max(0, Math.min(59, minute));
}

function clampHour(hour) {
  return Math.max(0, Math.min(23, hour));
}

function formatTime(hour, minute) {
  const period = hour >= 12 ? "PM" : "AM";

  let hour12 = hour % 12;

  if (hour12 === 0) {
    hour12 = 12;
  }

  return `${hour12}:${String(minute).padStart(
    2,
    "0"
  )} ${period}`;
}

function formatDate(date) {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function addDays(date, amount) {
  const next = new Date(date);

  next.setDate(next.getDate() + amount);

  return next;
}

// Alert "type" options, grouped by the context this form was opened in -
// an economic event, a news story, or a plain symbol/asset. Only one
// group is ever shown at a time (see alertTypeOptions below), so each
// option only ever needs to make sense for its own context.
const EVENT_ALERT_TYPES = [
  {
    id: "event",
    title: "Event starts",
    subtitle: "Alert when the event begins",
  },
  {
    id: "before",
    title: "Before event",
    subtitle: "Alert before the event",
  },
  {
    id: "impact",
    title: "High impact",
    subtitle: "Alert for high-impact events",
  },
];

const SYMBOL_ALERT_TYPES = [
  {
    id: "price_cross",
    title: "Price crosses",
    subtitle: "Alert when price crosses your target level",
  },
  {
    id: "price_touch",
    title: "Price touches",
    subtitle: "Alert when price touches your target level",
  },
  {
    id: "price_reverse",
    title: "Price reverses",
    subtitle: "Alert when price reverses direction near your target",
  },
  {
    id: "pattern",
    title: "Chart pattern",
    subtitle: "Alert on resistance/support breaks and candle patterns",
  },
];

const NEWS_ALERT_TYPES = [
  {
    id: "news",
    title: "Story alert",
    subtitle: "Alert me when there's an update on this story",
  },
];

const LEAD_TIMES = [
  {
    value: 5,
    label: "5 min",
  },
  {
    value: 15,
    label: "15 min",
  },
  {
    value: 30,
    label: "30 min",
  },
  {
    value: 60,
    label: "1 hour",
  },
];

const REPEAT_OPTIONS = [
  {
    value: "once",
    label: "Once",
  },
  {
    value: "daily",
    label: "Daily",
  },
  {
    value: "weekly",
    label: "Weekly",
  },
];

export default function AlertFormModal({
  visible,
  onClose,
  asset,
  alert,
  event,
  story,
}) {
  const {
    addAlert,
    updateAlert,
    deleteAlert,
  } = useAlerts();

  const isEditing = Boolean(alert?.id);

  const selectedEvent = event || null;
  const selectedStory = story || null;

  const [heading, setHeading] = useState("");
  const [targetPrice, setTargetPrice] = useState("");

  const [manualSymbol, setManualSymbol] = useState("");

  const [alertType, setAlertType] =
    useState("price_cross");

  const [leadTime, setLeadTime] =
    useState(15);

  const [repeat, setRepeat] =
    useState("once");

  const [repeatCount, setRepeatCount] =
    useState("1");

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);

  // Whether this alert is pinned to a specific day/time at all. Only
  // relevant for plain symbol/price alerts - an economic event alert
  // always has a time, and a news alert fires whenever the story
  // updates, so neither needs this toggle.
  const [timeEnabled, setTimeEnabled] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const now = new Date();

    setHeading(
      alert?.heading ||
        selectedEvent?.title ||
        selectedStory?.title ||
        ""
    );

    setTargetPrice(
      alert?.targetPrice != null
        ? String(alert.targetPrice)
        : ""
    );

    setManualSymbol("");

    setAlertType(
      alert?.alertType ||
        (selectedEvent
          ? "before"
          : selectedStory
          ? "news"
          : "price_cross")
    );

    setLeadTime(
      typeof alert?.leadTime === "number"
        ? alert.leadTime
        : 15
    );

    setRepeat(
      alert?.repeat ||
        "once"
    );

    setRepeatCount(
      alert?.repeatCount
        ? String(alert.repeatCount)
        : "1"
    );

    const initialDate = alert?.date
      ? new Date(alert.date)
      : now;

    if (!Number.isNaN(initialDate.getTime())) {
      setSelectedDate(initialDate);
    } else {
      setSelectedDate(now);
    }

    setHour(
      typeof alert?.hour === "number"
        ? alert.hour
        : now.getHours()
    );

    setMinute(
      typeof alert?.minute === "number"
        ? alert.minute
        : Math.floor(now.getMinutes() / 5) * 5
    );

    // News alerts never carry a day/time. Event alerts always do. Plain
    // symbol alerts default to "anytime" unless the alert being edited
    // already had a time set.
    setTimeEnabled(
      selectedStory
        ? false
        : selectedEvent
        ? true
        : alert
        ? alert.hasTime !== false
        : false
    );
  }, [
    visible,
    alert,
    selectedEvent,
    selectedStory,
  ]);

  const hasKnownSymbol = Boolean(
    alert?.symbol ||
      asset?.symbol
  );

  const symbol =
    alert?.symbol ??
    asset?.symbol ??
    manualSymbol
      .trim()
      .toUpperCase();

  const pair =
    alert?.pair ??
    asset?.pair ??
    "";

  const category =
    alert?.category ??
    asset?.category ??
    null;

  const eventTitle =
    alert?.eventTitle ||
    selectedEvent?.title ||
    "";

  const currency =
    alert?.currency ||
    selectedEvent?.currency ||
    "";

  const impact =
    alert?.impact ||
    selectedEvent?.impact ||
    "";

  const eventId =
    alert?.eventId ||
    selectedEvent?.id ||
    null;

  const storyTitle =
    alert?.storyTitle ||
    selectedStory?.title ||
    "";

  const storyUrl =
    alert?.storyUrl ||
    selectedStory?.url ||
    null;

  const storyId =
    alert?.storyId ||
    selectedStory?.id ||
    null;

  // Which context this form is in - each hides the fields that don't
  // apply to it. An event already carries its own scheduled time, a
  // news story fires whenever the story updates (no day/time to pick),
  // and a plain symbol is the only context where a target price and an
  // optional day/time make sense.
  const isEventContext = Boolean(selectedEvent) || Boolean(eventId);
  const isStoryContext =
    !isEventContext && (Boolean(selectedStory) || Boolean(storyId));
  const isSymbolContext = !isEventContext && !isStoryContext;

  const alertTypeOptions = isEventContext
    ? EVENT_ALERT_TYPES
    : isStoryContext
    ? NEWS_ALERT_TYPES
    : SYMBOL_ALERT_TYPES;

  // Whether this alert will actually be pinned to a day/time when saved.
  const willUseTime = isEventContext || (isSymbolContext && timeEnabled);

  const chartAsset = useMemo(
    () =>
      symbol
        ? { symbol }
        : null,
    [symbol]
  );

  const canSave =
    heading.trim().length > 0 &&
    (
      symbol.length > 0 ||
      eventTitle.length > 0 ||
      storyTitle.length > 0
    );

  const changeDay = (amount) => {
    setSelectedDate((current) =>
      addDays(current, amount)
    );
  };

  const handleSave = () => {
    if (!canSave) return;

    Keyboard.dismiss();

    let finalHour = hour;
    let finalMinute = minute;

    /*
     * If the alert is attached to an economic event,
     * use the event time when it is available.
     *
     * Example:
     * Event = 10:30 AM
     * Before event = 15 min
     * Alert = 10:15 AM
     */
    if (
      selectedEvent &&
      alertType === "before" &&
      selectedEvent.time
    ) {
      const timeMatch =
        selectedEvent.time.match(
          /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
        );

      if (timeMatch) {
        let eventHour =
          Number(timeMatch[1]);

        const eventMinute =
          Number(timeMatch[2]);

        const period =
          timeMatch[3].toUpperCase();

        if (
          period === "PM" &&
          eventHour !== 12
        ) {
          eventHour += 12;
        }

        if (
          period === "AM" &&
          eventHour === 12
        ) {
          eventHour = 0;
        }

        const eventDate = new Date(
          selectedDate
        );

        eventDate.setHours(
          eventHour,
          eventMinute,
          0,
          0
        );

        eventDate.setMinutes(
          eventDate.getMinutes() -
            leadTime
        );

        finalHour =
          eventDate.getHours();

        finalMinute =
          eventDate.getMinutes();
      }
    }

    const payload = {
      symbol,
      pair,
      category,

      heading:
        heading.trim(),

      targetPrice:
        targetPrice.trim()
          ? Number(targetPrice)
          : null,

      eventId,
      eventTitle,
      currency,
      impact,

      storyId,
      storyTitle,
      storyUrl,

      alertType,
      leadTime,

      hasTime: willUseTime,

      date: willUseTime
        ? selectedDate.toISOString()
        : null,

      hour: willUseTime ? clampHour(finalHour) : null,
      minute: willUseTime ? clampMinute(finalMinute) : null,

      repeat: willUseTime ? repeat : "once",

      repeatCount: willUseTime
        ? Math.max(1, Number(repeatCount) || 1)
        : 1,
    };

    if (isEditing) {
      updateAlert(
        alert.id,
        payload
      );
    } else {
      addAlert(payload);
    }

    const alertMessage = isStoryContext
      ? "We'll notify you when there's an update on this story."
      : willUseTime
      ? `We'll alert you on ${formatDate(selectedDate)} at ${formatTime(
          clampHour(finalHour),
          clampMinute(finalMinute)
        )}.`
      : "We'll alert you as soon as this condition is met.";

    Alert.alert(
      isEditing ? "Alert Updated" : "Alert Created",
      alertMessage
    );

    onClose?.();
  };

  const handleDelete = () => {
    Keyboard.dismiss();

    if (isEditing) {
      deleteAlert(alert.id);
    }

    onClose?.();
  };

  return (
    <InAppModalOverlay
      visible={visible}
      onClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={0}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {isEditing
                  ? "Edit Alert"
                  : "Create Alert"}
              </Text>

              {isEventContext ? (
                <Text style={styles.headerSubtitle}>
                  Upcoming event
                </Text>
              ) : isStoryContext ? (
                <Text style={styles.headerSubtitle}>
                  News story
                </Text>
              ) : null}
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={8}
            >
              <Ionicons
                name="close"
                size={22}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={
              styles.scrollContent
            }
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
          >
            {isEventContext ? (
              <View style={styles.eventCard}>
                <View style={styles.eventTop}>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventCurrency}>
                      {currency}
                    </Text>

                    <Text
                      style={styles.eventTitle}
                      numberOfLines={2}
                    >
                      {eventTitle}
                    </Text>
                  </View>

                  {impact ? (
                    <View style={styles.impactBadge}>
                      <Text
                        style={
                          styles.impactText
                        }
                      >
                        {impact}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {selectedEvent?.time ? (
                  <Text style={styles.eventTime}>
                    Event time:{" "}
                    {selectedEvent.time}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {isStoryContext ? (
              <View style={styles.eventCard}>
                <View style={styles.eventTop}>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventCurrency}>
                      {selectedStory?.source || "News"}
                    </Text>

                    <Text
                      style={styles.eventTitle}
                      numberOfLines={3}
                    >
                      {storyTitle}
                    </Text>
                  </View>

                  {selectedStory?.impact ? (
                    <View style={styles.impactBadge}>
                      <Text style={styles.impactText}>
                        {selectedStory.impact}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {selectedStory?.time ? (
                  <Text style={styles.eventTime}>
                    Published {selectedStory.time}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {isSymbolContext &&
            !hasKnownSymbol ? (
              <>
                <Text style={styles.label}>
                  Symbol
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="EURUSD, BTCUSDT, AAPL"
                  placeholderTextColor="#59636D"
                  autoCapitalize="characters"
                  value={manualSymbol}
                  onChangeText={
                    setManualSymbol
                  }
                  returnKeyType="done"
                />
              </>
            ) : null}

            {isSymbolContext &&
            hasKnownSymbol ? (
              <View style={styles.symbolRow}>
                <Text style={styles.symbolText}>
                  {symbol}
                </Text>

                {pair ? (
                  <Text style={styles.pairText}>
                    {pair}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {alertTypeOptions.length > 1 ? (
              <>
                <Text style={styles.label}>
                  What should I alert you about?
                </Text>

                <View style={styles.optionList}>
                  {alertTypeOptions.map(
                    (option) => {
                      const active =
                        alertType ===
                        option.id;

                      return (
                        <Pressable
                          key={option.id}
                          style={[
                            styles.option,
                            active &&
                              styles.optionActive,
                          ]}
                          onPress={() =>
                            setAlertType(
                              option.id
                            )
                          }
                        >
                          <View
                            style={
                              styles.optionText
                            }
                          >
                            <Text
                              style={
                                styles.optionTitle
                              }
                            >
                              {option.title}
                            </Text>

                            <Text
                              style={
                                styles.optionSubtitle
                              }
                            >
                              {
                                option.subtitle
                              }
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.radio,
                              active &&
                                styles.radioActive,
                            ]}
                          >
                            {active ? (
                              <View
                                style={
                                  styles.radioDot
                                }
                              />
                            ) : null}
                          </View>
                        </Pressable>
                      );
                    }
                  )}
                </View>
              </>
            ) : null}

            {alertType === "before" ? (
              <>
                <Text style={styles.label}>
                  Alert me
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={
                    false
                  }
                  contentContainerStyle={
                    styles.horizontalOptions
                  }
                >
                  {LEAD_TIMES.map(
                    (option) => {
                      const active =
                        leadTime ===
                        option.value;

                      return (
                        <Pressable
                          key={
                            option.value
                          }
                          style={[
                            styles.smallOption,
                            active &&
                              styles.smallOptionActive,
                          ]}
                          onPress={() =>
                            setLeadTime(
                              option.value
                            )
                          }
                        >
                          <Text
                            style={[
                              styles.smallOptionText,
                              active &&
                                styles.smallOptionTextActive,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    }
                  )}
                </ScrollView>
              </>
            ) : null}

            {isSymbolContext ? (
              <>
                <Text style={styles.label}>
                  Alert message
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    styles.messageInput,
                  ]}
                  placeholder="e.g. Breaks above resistance"
                  placeholderTextColor="#59636D"
                  value={heading}
                  onChangeText={
                    setHeading
                  }
                  multiline
                  textAlignVertical="top"
                />

                <Text style={styles.label}>
                  Target price
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Optional"
                  placeholderTextColor="#59636D"
                  keyboardType="decimal-pad"
                  value={targetPrice}
                  onChangeText={
                    setTargetPrice
                  }
                  returnKeyType="done"
                />
              </>
            ) : null}

            {isSymbolContext ? (
              <View style={styles.timeToggleRow}>
                <View style={styles.timeToggleTextContainer}>
                  <Text style={styles.timeToggleTitle}>
                    Set a specific day &amp; time
                  </Text>

                  <Text style={styles.timeToggleSubtitle}>
                    Leave this off to get alerted any time the
                    condition is met.
                  </Text>
                </View>

                <Switch
                  value={timeEnabled}
                  onValueChange={setTimeEnabled}
                  trackColor={{ false: "#263441", true: "#3A7BD5" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ) : null}

            {willUseTime ? (
              <>
                <Text style={styles.label}>
                  Day
                </Text>

                <View style={styles.dateRow}>
                  <Pressable
                    style={styles.dateButton}
                    onPress={() =>
                      changeDay(-1)
                    }
                  >
                    <Ionicons
                      name="chevron-back"
                      size={18}
                      color="#FFFFFF"
                    />
                  </Pressable>

                  <View
                    style={
                      styles.dateDisplay
                    }
                  >
                    <Text
                      style={
                        styles.dateText
                      }
                    >
                      {formatDate(
                        selectedDate
                      )}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.dateButton}
                    onPress={() =>
                      changeDay(1)
                    }
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#FFFFFF"
                    />
                  </Pressable>
                </View>

                <Text style={styles.label}>
                  Time
                </Text>

                <View style={styles.timeRow}>
                  <View style={styles.stepper}>
                    <Pressable
                      style={
                        styles.stepperButton
                      }
                      onPress={() =>
                        setHour((value) =>
                          clampHour(
                            value - 1
                          )
                        )
                      }
                    >
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color="#FFFFFF"
                      />
                    </Pressable>

                    <Text
                      style={styles.timeValue}
                    >
                      {String(hour).padStart(
                        2,
                        "0"
                      )}
                    </Text>

                    <Pressable
                      style={
                        styles.stepperButton
                      }
                      onPress={() =>
                        setHour((value) =>
                          clampHour(
                            value + 1
                          )
                        )
                      }
                    >
                      <Ionicons
                        name="chevron-up"
                        size={16}
                        color="#FFFFFF"
                      />
                    </Pressable>
                  </View>

                  <Text
                    style={
                      styles.timeSeparator
                    }
                  >
                    :
                  </Text>

                  <View style={styles.stepper}>
                    <Pressable
                      style={
                        styles.stepperButton
                      }
                      onPress={() =>
                        setMinute((value) =>
                          value - 5 < 0
                            ? 55
                            : value - 5
                        )
                      }
                    >
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color="#FFFFFF"
                      />
                    </Pressable>

                    <Text
                      style={styles.timeValue}
                    >
                      {String(minute).padStart(
                        2,
                        "0"
                      )}
                    </Text>

                    <Pressable
                      style={
                        styles.stepperButton
                      }
                      onPress={() =>
                        setMinute((value) =>
                          value + 5 > 59
                            ? 0
                            : value + 5
                        )
                      }
                    >
                      <Ionicons
                        name="chevron-up"
                        size={16}
                        color="#FFFFFF"
                      />
                    </Pressable>
                  </View>

                  <Text
                    style={
                      styles.timePreview
                    }
                  >
                    {formatTime(
                      hour,
                      minute
                    )}
                  </Text>
                </View>

                <Text style={styles.label}>
                  Repeat
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={
                    false
                  }
                  contentContainerStyle={
                    styles.horizontalOptions
                  }
                >
                  {REPEAT_OPTIONS.map(
                    (option) => {
                      const active =
                        repeat ===
                        option.value;

                      return (
                        <Pressable
                          key={option.value}
                          style={[
                            styles.smallOption,
                            active &&
                              styles.smallOptionActive,
                          ]}
                          onPress={() =>
                            setRepeat(
                              option.value
                            )
                          }
                        >
                          <Text
                            style={[
                              styles.smallOptionText,
                              active &&
                                styles.smallOptionTextActive,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    }
                  )}
                </ScrollView>

                {repeat !== "once" ? (
                  <>
                    <Text style={styles.label}>
                      How many times?
                    </Text>

                    <TextInput
                      style={styles.input}
                      value={repeatCount}
                      onChangeText={(value) =>
                        setRepeatCount(
                          value.replace(
                            /[^0-9]/g,
                            ""
                          )
                        )
                      }
                      keyboardType="number-pad"
                      placeholder="1"
                      placeholderTextColor="#59636D"
                    />
                  </>
                ) : null}
              </>
            ) : null}

            <View style={styles.bottomSpace} />
          </ScrollView>

          <View style={styles.footer}>
            {isEditing ? (
              <Pressable
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color="#FF5A5F"
                />

                <Text
                  style={styles.deleteText}
                >
                  Delete
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              style={[
                styles.saveButton,
                !canSave &&
                  styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!canSave}
            >
              <Text style={styles.saveText}>
                {isEditing
                  ? "Save Changes"
                  : "Create Alert"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </InAppModalOverlay>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(0,0,0,0.65)",
  },

  sheet: {
    height: "92%",
    maxHeight: "92%",
    backgroundColor: "#0A0A0A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "#262626",
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  handle: {
    width: 62,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#59636D",
    alignSelf: "center",
    marginBottom: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 12,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: "#737C86",
    fontSize: 12,
    marginTop: 3,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#262626",
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  eventCard: {
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },

  eventTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent:
      "space-between",
  },

  eventInfo: {
    flex: 1,
    paddingRight: 10,
  },

  eventCurrency: {
    color: "#8A949E",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },

  eventTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },

  eventTime: {
    color: "#8A949E",
    fontSize: 12,
    marginTop: 10,
  },

  impactBadge: {
    borderWidth: 1,
    borderColor: "#A3A3A3",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  impactText: {
    color: "#A3A3A3",
    fontSize: 11,
    fontWeight: "700",
  },

  symbolRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 18,
  },

  symbolText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  pairText: {
    color: "#8A949E",
    fontSize: 13,
  },

  label: {
    color: "#8A949E",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 15,
    marginBottom: 16,
  },

  messageInput: {
    minHeight: 80,
  },

  optionList: {
    marginBottom: 8,
  },

  option: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 8,
  },

  optionActive: {
    borderColor: "#FFFFFF",
  },

  optionText: {
    flex: 1,
    paddingRight: 12,
  },

  optionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  optionSubtitle: {
    color: "#737C86",
    fontSize: 11,
    marginTop: 3,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#59636D",
    alignItems: "center",
    justifyContent: "center",
  },

  radioActive: {
    borderColor: "#FFFFFF",
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },

  horizontalOptions: {
    gap: 8,
    paddingBottom: 16,
  },

  smallOption: {
    borderWidth: 1,
    borderColor: "#262626",
    backgroundColor: "#171717",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  smallOptionActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },

  smallOptionText: {
    color: "#8A949E",
    fontSize: 12,
    fontWeight: "600",
  },

  smallOptionTextActive: {
    color: "#000000",
  },

  timeToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },

  timeToggleTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  timeToggleTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  timeToggleSubtitle: {
    color: "#737C86",
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },

  dateButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#262626",
    alignItems: "center",
    justifyContent: "center",
  },

  dateDisplay: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#262626",
    alignItems: "center",
    justifyContent: "center",
  },

  dateText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 12,
    paddingHorizontal: 4,
  },

  stepperButton: {
    width: 32,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  timeValue: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    minWidth: 28,
    textAlign: "center",
  },

  timeSeparator: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  timePreview: {
    color: "#8A949E",
    fontSize: 12,
    flexShrink: 1,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 10,
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3A1E20",
    backgroundColor: "#180D0E",
  },

  deleteText: {
    color: "#8A8A8A",
    fontSize: 14,
    fontWeight: "600",
  },

  saveButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  saveButtonDisabled: {
    backgroundColor: "#1D3A5C",
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  bottomSpace: {
    height: 10,
  },
});
