import { Platform, StyleSheet } from 'react-native';
import { useSyncExternalStore } from 'react';

// Edgeline: dark is the default. Light is the same design on a bright canvas.
// white and black are "strong text" and "text on strong fill", so they swap meaning between themes.
const dark = {
  bg: '#090B0B',
  bgAlt: '#0D1010',
  surface: '#101313',
  elevated: '#151919',
  elevated2: '#1A1F1F',
  border: '#222828',
  borderStrong: '#303737',
  faint: '#5F6969',
  muted: '#8C9696',
  text: '#F1F4F3',
  white: '#FFFFFF',
  black: '#050606',
  lime: '#53E38F',
  pink: '#E86D8A',
  lavender: '#8797FF',
  ice: '#152321',
  blue: '#7A8DF7',
  peach: '#171B1A',
  green: '#44D681',
  red: '#FF5F6D',
  btn: '#FFFFFF',
  btnText: '#141414',
  overlay: 'rgba(9,11,11,0.86)',
  okBg: '#12241C',
  gradA: '#1B2422',
  gradB: '#0D1110',
  glow: 1,
};

const light = {
  bg: '#F4F6F5',
  bgAlt: '#FFFFFF',
  surface: '#FFFFFF',
  elevated: '#F1F4F3',
  elevated2: '#E7ECEA',
  border: '#E1E6E4',
  borderStrong: '#C8D0CD',
  faint: '#9BA6A3',
  muted: '#5E6A67',
  text: '#0E1211',
  white: '#0E1211',
  black: '#FFFFFF',
  lime: '#2BAE6A',
  pink: '#D9506F',
  lavender: '#5B6CE6',
  ice: '#E3F3EC',
  blue: '#5568E8',
  peach: '#F1F4F3',
  green: '#14A558',
  red: '#E23B4B',
  btn: '#0E1211',
  btnText: '#FFFFFF',
  overlay: 'rgba(255,255,255,0.92)',
  okBg: '#E4F6EC',
  gradA: '#FFFFFF',
  gradB: '#EEF2F1',
  glow: 0,
};

const palettes = { dark, light };
let mode = 'dark';
const listeners = new Set();

/** Reads the current theme every time a colour is used, so screens pick up a change when they re-render. */
export const colors = {};
Object.keys(dark).forEach((k) => {
  Object.defineProperty(colors, k, { enumerable: true, get: () => palettes[mode][k] });
});

export const getMode = () => mode;
export const setMode = (next) => {
  if (!palettes[next] || next === mode) return;
  mode = next;
  listeners.forEach((l) => l());
};
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
/** Re-renders the component that calls it whenever the theme changes. Returns 'dark' or 'light'. */
export const useMode = () => useSyncExternalStore(subscribe, getMode);

/**
 * Styles that use theme colours. The sheet is rebuilt once per theme and cached,
 * and is used exactly like a StyleSheet (styles.card).
 */
export function themed(factory) {
  const cache = {};
  const get = () => cache[mode] || (cache[mode] = StyleSheet.create(factory()));
  return new Proxy({}, { get: (_, k) => get()[k] });
}

export const gradients = {
  primary: ['#17211F', '#0D1211'],
  cool: ['#121716', '#0C100F', '#090B0B'],
  warm: ['#171413', '#100E0E', '#090B0B'],
};

export const lightColors = colors;
export const radius = { sm: 9, md: 13, lg: 18, xl: 24, btn: 12, btnSm: 10 };
export const sp = (n) => n * 8;
export const motion = { fast: 150, base: 200 };
export const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' });
export const touch = 48;