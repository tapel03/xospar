import { useCallback, useEffect, useState } from 'react';
import { upcomingEvents as sampleEvents } from '../../../mocks/mock';
import { EXTRA_EVENTS } from '../data/eventMeta';
import { userApi } from '../../../services/userApi';
import { featureFlags } from '../../../app/config';
import { useAppState } from '../../../hooks/useAppState';
import { cache } from '../../../services/cache';

const REFRESH_MS = 30 * 60000;
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n) => String(n).padStart(2, '0');
const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Puts the server's timestamp into this device's time zone: time, day label and days from today. */
export function localizeEvent(e, now = new Date()) {
  const d = new Date(e.ts);
  const offset = Math.round((midnight(d) - midnight(now)) / 86400000);
  const day = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : offset === -1 ? 'Yesterday' : DOW[d.getDay()];
  const allDay = d.getHours() === 0 && d.getMinutes() === 0;
  const mins = Math.round((e.ts - now.getTime()) / 60000);
  const soon = mins > 0 && mins < 180 ? `in ${mins >= 60 ? `${Math.floor(mins / 60)}h ` : ''}${mins % 60}m` : null;
  return { ...e, time: allDay ? 'All day' : `${pad(d.getHours())}:${pad(d.getMinutes())}`, day, offset, note: [soon, e.note].filter(Boolean).join(' · ') || null };
}

/**
 * This week's economic calendar from the backend (Forex Factory feed). The last answer is saved on the device
 * (as the server sent it, and re-localised each time), so the calendar still shows with no internet.
 * Falls back to the sample events when there is no saved copy and the backend is off or unreachable.
 */
export function useEconomicCalendar() {
  const [state, setState] = useState({ events: [...EXTRA_EVENTS, ...sampleEvents], source: 'sample', stale: false, fresh: false, loading: featureFlags.useBackend });
  const appState = useAppState();

  useEffect(() => {
    if (!featureFlags.useBackend) return undefined;
    let live = true;
    cache.get('calendar').then((saved) => {
      if (live && Array.isArray(saved) && saved.length) {
        setState((s) => (s.fresh ? s : { events: saved.map((e) => localizeEvent(e)), source: 'live', stale: true, fresh: false, loading: false }));
      }
    });
    return () => { live = false; };
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await userApi.calendar();
      if (res?.items?.length) {
        setState({ events: res.items.map((e) => localizeEvent(e)), source: 'live', stale: Boolean(res.stale), fresh: true, loading: false });
        cache.set('calendar', res.items);
        return;
      }
    } catch { /* keep what we have */ }
    setState((s) => (s.loading ? { ...s, loading: false } : s));
  }, []);

  useEffect(() => {
    if (!featureFlags.useBackend || appState !== 'active') return undefined;
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load, appState]);

  // "Upcoming": from now on, high impact first within the next few days.
  const now = Date.now();
  const upcoming = state.source === 'live'
    ? state.events.filter((e) => e.ts >= now - 30 * 60000).slice(0, 12)
    : sampleEvents;
  return { ...state, upcoming, refresh: load };
}