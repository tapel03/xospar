import { cache } from './cache';
import { loadToken, saveToken } from './session';
import { userApi } from './userApi';

// Tracks whether a real person has signed in (as opposed to the anonymous device session the app
// creates on its own). The flag is saved on the device only when "Remember me" is on.
const KEY = 'auth';
let state = null; // { signedIn, email } once read

/** Reads the saved sign-in flag. Safe to call many times. */
export async function loadAuth() {
  if (state) return state;
  const saved = await cache.get(KEY);
  state = saved && saved.signedIn ? { signedIn: true, email: saved.email || '' } : { signedIn: false, email: '' };
  return state;
}

/** Sync check, valid after loadAuth() has run once (Splash does this). */
export const isSignedIn = () => !!(state && state.signedIn);

/** Makes sure there is some session token to talk to the server with (needed before register). */
export async function ensureSession() {
  if (await loadToken()) return;
  const s = await userApi.deviceSession();
  await saveToken(s.token);
}

/**
 * Marks the user as signed in. token: the session token from login (omit to keep the current one).
 * remember: keep the token and the flag on the device so the next launch skips the login screen.
 */
export async function signIn({ token, email = '', remember = true }) {
  const t = token || (await loadToken());
  await saveToken(t, remember);
  state = { signedIn: true, email };
  if (remember) await cache.set(KEY, state);
  else await cache.remove(KEY);
}

/** Log out: ends the session on the server and on this device. */
export async function endSession() {
  try { await userApi.logout(); } catch { /* server may be unreachable or the session already gone */ }
  await saveToken(null);
  state = { signedIn: false, email: '' };
  await cache.remove(KEY);
}

/** Forget the sign-in on this device only (used after the account was deleted). */
export async function forgetSignIn() {
  await saveToken(null);
  state = { signedIn: false, email: '' };
  await cache.remove(KEY);
}