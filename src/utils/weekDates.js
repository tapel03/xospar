const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Local (not UTC) YYYY-MM-DD key - used to compare "which calendar day is
// this alert's createdAt on" against the day selected in the DaySelector,
// without timezone shifting the date.
export function toLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// The Monday-Sunday week that contains `today`, as 7 day descriptors for
// the DaySelector - real calendar dates, not hardcoded placeholders.
export function getCurrentWeekDays(today = new Date()) {
  const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
  const offsetFromMonday = (dayOfWeek + 6) % 7;

  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - offsetFromMonday);

  const todayKey = toLocalDateKey(today);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    return {
      key: toLocalDateKey(date),
      label: DAY_LABELS[date.getDay()],
      dateNum: String(date.getDate()),
      isToday: toLocalDateKey(date) === todayKey,
    };
  });
}
