import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ALERTS_STORAGE_KEY = "@market_app/price_alerts";

const AlertsContext = createContext(null);

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getPeriodForHour(hour) {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function getAlertDate(alert) {
  if (alert.date) {
    const date = new Date(alert.date);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  const date = new Date(alert.createdAt);
  date.setHours(alert.hour || 0, alert.minute || 0, 0, 0);
  return date;
}

function computeIsDue(alert) {
  const now = new Date();
  const target = getAlertDate(alert);

  return now >= target;
}

export function AlertsProvider({ children }) {
  const [alerts, setAlerts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const stored = await AsyncStorage.getItem(ALERTS_STORAGE_KEY);

        if (stored) {
          const parsed = JSON.parse(stored);

          if (parsed && typeof parsed === "object") {
            setAlerts(parsed);
          }
        }
      } catch (error) {
        console.warn("Failed to load alerts from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAlerts();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const persistAlerts = async () => {
      try {
        await AsyncStorage.setItem(
          ALERTS_STORAGE_KEY,
          JSON.stringify(alerts)
        );
      } catch (error) {
        console.warn("Failed to persist alerts:", error);
      }
    };

    persistAlerts();
  }, [alerts, isLoading]);

  const addAlert = useCallback(
    ({
      symbol = "",
      pair = "",
      category = null,
      heading = "",
      targetPrice = null,

      // Event support
      eventId = null,
      eventTitle = "",
      currency = "",
      impact = "",
      alertType = "event",
      leadTime = 0,

      // News support - links an alert back to the story that created it
      // (see AlertFormModal's `story` prop / NewsScreen).
      storyId = null,
      storyTitle = "",
      storyUrl = null,

      // Date/time - `hasTime: false` marks an "anytime" alert (no day/
      // time was set, so it's treated as due as soon as its condition is
      // met rather than at a specific clock time). date/hour/minute are
      // left null for these.
      hasTime = true,
      date = null,
      hour = 9,
      minute = 0,

      // Repeat
      repeat = "once",
      repeatCount = 1,
    }) => {
      const id = makeId();

      const createdAt = new Date().toISOString();

      setAlerts((prev) => ({
        ...prev,

        [id]: {
          id,

          symbol,
          pair,
          category,

          heading,
          targetPrice,

          eventId,
          eventTitle,
          currency,
          impact,

          storyId,
          storyTitle,
          storyUrl,

          alertType,
          leadTime,

          hasTime,
          date,
          hour,
          minute,

          repeat,
          repeatCount,

          createdAt,
          acknowledged: false,
        },
      }));

      return id;
    },
    []
  );

  const updateAlert = useCallback((id, changes) => {
    setAlerts((prev) => {
      if (!prev[id]) return prev;

      return {
        ...prev,
        [id]: {
          ...prev[id],
          ...changes,
        },
      };
    });
  }, []);

  const deleteAlert = useCallback((id) => {
    setAlerts((prev) => {
      const next = { ...prev };

      delete next[id];

      return next;
    });
  }, []);

  const toggleAcknowledged = useCallback((id) => {
    setAlerts((prev) => {
      if (!prev[id]) return prev;

      return {
        ...prev,
        [id]: {
          ...prev[id],
          acknowledged: !prev[id].acknowledged,
        },
      };
    });
  }, []);

  const allAlerts = useMemo(
    () => Object.values(alerts),
    [alerts]
  );

  const alertsForSymbol = useCallback(
    (symbol) =>
      allAlerts
        .filter((alert) => alert.symbol === symbol)
        .sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        ),
    [allAlerts]
  );

  const dueAlertForSymbol = useCallback(
    (symbol) => {
      const due = allAlerts
        .filter(
          (alert) =>
            alert.symbol === symbol &&
            !alert.acknowledged
        )
        .filter(computeIsDue)
        .sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );

      return due[0] || null;
    },
    [allAlerts]
  );

  const value = useMemo(
    () => ({
      alerts: allAlerts,
      isLoading,

      addAlert,
      updateAlert,
      deleteAlert,
      toggleAcknowledged,

      alertsForSymbol,
      dueAlertForSymbol,
    }),
    [
      allAlerts,
      isLoading,
      addAlert,
      updateAlert,
      deleteAlert,
      toggleAcknowledged,
      alertsForSymbol,
      dueAlertForSymbol,
    ]
  );

  return (
    <AlertsContext.Provider value={value}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertsContext);

  if (!context) {
    throw new Error(
      "useAlerts must be used within an AlertsProvider"
    );
  }

  return context;
}