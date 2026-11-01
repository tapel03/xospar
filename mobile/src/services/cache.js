import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';

// Small key/value store that keeps data on the device so the app still has something to show offline.
// Web: localStorage. Native: one JSON file per key in the app's documents folder (same approach as session.js).
// Every call is guarded: if storage is blocked or full, the app just keeps working without a saved copy.
// To use AsyncStorage instead, only this file has to change (keep get / set / remove).
const PREFIX = 'edgeline.cache.';
const safe = (k) => String(k).replace(/[^A-Za-z0-9._-]/g, '_');
const file = (k) => new File(Paths.document, `${PREFIX}${safe(k)}.json`);

export const cache = {
  async get(key) {
    try {
      if (Platform.OS === 'web') {
        const raw = globalThis.localStorage?.getItem(PREFIX + key);
        return raw ? JSON.parse(raw) : null;
      }
      const f = file(key);
      if (!f.exists) return null;
      return JSON.parse(await f.text());
    } catch {
      return null;
    }
  },

  async set(key, value) {
    try {
      const text = JSON.stringify(value);
      if (Platform.OS === 'web') { globalThis.localStorage?.setItem(PREFIX + key, text); return; }
      const f = file(key);
      f.create({ overwrite: true });
      f.write(text);
    } catch { /* storage full or blocked: skip */ }
  },

  async remove(key) {
    try {
      if (Platform.OS === 'web') { globalThis.localStorage?.removeItem(PREFIX + key); return; }
      const f = file(key);
      if (f.exists) f.delete();
    } catch { /* nothing to remove */ }
  },
};