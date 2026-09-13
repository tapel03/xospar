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

// Buckets an alert's time into the same three sections the Alerts screen
// already displays - Morning (before noon), Afternoon (noon - 5pm), and
// Evening (5pm onward). Kept in one place so the create form and the
// Alerts screen always agree on which bucket a given time falls into.
export function getPeriodForHour(hour) {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

// True once the current time is at or past the alert's set time on the
// same day it was created. Simple "has this fired yet" check - no sound
// or push notification wired up yet, this only drives UI (e.g. the bell
// icon on the asset modal linking straight into a due alert).
function computeIsDue(alert) {
  const now = new Date();
  const target = new Date(alert.createdAt);
  target.setHours(alert.hour, alert.minute, 0, 0);
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
          setAlerts(JSON.parse(stored));
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
    const persistAlerts = async () => {
      try {
        await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
      } catch (error) {
        console.warn("Failed to persist alerts to storage:", error);
      }
    };

    if (!isLoading) {
      persistAlerts();
    }
  }, [alerts, isLoading]);

  // heading/targetPrice/hour/minute come from the create-alert form.
  // symbol/pair identify which asset this alert belongs to, so the asset
  // modal can look it back up later.
  const addAlert = useCallback(
    ({ symbol, pair, heading, targetPrice, hour, minute }) => {
      const id = makeId();

      setAlerts((prev) => ({
        ...prev,
        [id]: {
          id,
          symbol,
          pair,
          heading,
          targetPrice,
          hour,
          minute,
          createdAt: new Date().toISOString(),
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
      return { ...prev, [id]: { ...prev[id], ...changes } };
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
        [id]: { ...prev[id], acknowledged: !prev[id].acknowledged },
      };
    });
  }, []);

  const allAlerts = useMemo(() => Object.values(alerts), [alerts]);

  // Alerts set for a specific symbol, most recently created first.
  const alertsForSymbol = useCallback(
    (symbol) =>
      allAlerts
        .filter((alert) => alert.symbol === symbol)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [allAlerts]
  );

  // The most recent still-open alert for a symbol whose set time has
  // already passed - this is what lets the bell icon jump straight into
  // an existing alert instead of opening the "create new" form.
  const dueAlertForSymbol = useCallback(
    (symbol) => {
      const due = allAlerts
        .filter((alert) => alert.symbol === symbol && !alert.acknowledged)
        .filter(computeIsDue)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
    <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertsContext);

  if (!context) {
    throw new Error("useAlerts must be used within an AlertsProvider");
  }

  return context;
}