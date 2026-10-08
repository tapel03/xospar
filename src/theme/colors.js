// Black & white theme on a white background.
//
// Same keys as before (base + 50...950), so every component that does
// `colors[950]` for text or `colors.base` for the page background keeps
// working. The scale is now light -> dark instead of dark -> light:
//   base / 50 / 100 / 200  -> page + soft surfaces + hairlines
//   300 - 600              -> borders + muted text
//   700 - 950              -> text, 950 = pure black
export const colors = {
  base: "#FFFFFF",

  50: "#FAFAFA",
  100: "#F4F4F5",
  200: "#E8E8EA",
  300: "#D4D4D8",
  400: "#A1A1AA",
  500: "#71717A",
  600: "#52525B",
  700: "#3F3F46",
  800: "#27272A",
  900: "#18181B",
  950: "#000000",
};