import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';

// Keeps the backend session token on the device. Web: localStorage. Native: a file in the app's
// private documents folder (no extra native module needed). Every read and write is guarded, so a
// blocked store just means a new device session next launch.
const KEY = 'edgeline.session';
let cached;

function file() { return new File(Paths.document, `${KEY}.json`); }

export async function loadToken() {
  if (cached !== undefined) return cached;
  try {
    if (Platform.OS === 'web') cached = globalThis.localStorage?.getItem(KEY) || null;
    else { const f = file(); cached = f.exists ? JSON.parse(await f.text()).token || null : null; }
  } catch { cached = null; }
  return cached;
}

export async function saveToken(token) {
  cached = token || null;
  try {
    if (Platform.OS === 'web') {
      if (token) globalThis.localStorage?.setItem(KEY, token); else globalThis.localStorage?.removeItem(KEY);
      return;
    }
    const f = file();
    if (!token) { if (f.exists) f.delete(); return; }
    f.create({ overwrite: true });
    f.write(JSON.stringify({ token }));
  } catch { /* stays in memory for this run */ }
}

export const currentToken = () => cached || null;
