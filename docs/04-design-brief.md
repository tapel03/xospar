# Savanai: Design Brief

## 1. Design intent
Calm, clear and trustworthy. The app should make complex market information feel understandable, never noisy or hype-driven.

## 2. Brand
- Name: Savanai (replaces the working names MARKET and EDGELINE).
- Personality: clear, grounded, honest, encouraging. No get-rich language.
- Logo: the three-shape mark (rounded square, circle, rounded blob) already used on splash, welcome and chat headers; confirm final colours for light and dark.

## 3. Current state to resolve
The codebase mixes three looks:
1. A strict greyscale system (EDGELINE prototype) where meaning is carried by glyphs, weight and outline, not colour.
2. A dark navy and blue-accent look (Markets, Calendar, Global Events).
3. A white, black and grey theme applied by a one-time colour conversion script, with red and green kept for price direction.

Decision needed: one theme system with light and dark modes driven by shared tokens, then retire the conversion script.

## 4. Recommended direction
- Default: light theme (white background, black text), matching the latest direction; dark mode available.
- Colour used only for meaning: green for gain, red for loss, amber for caution, blue for links and selection.
- Always pair colour with a symbol (arrow, plus/minus) so colour-blind users are covered; the prototype's glyph approach is worth keeping for this.

## 5. Typography
| Use | Style |
|---|---|
| Headline | System sans, bold, tight tracking |
| Body | System sans, 14 to 16 px, 1.4 line height |
| Numbers (prices, P&L) | Monospaced or tabular figures so digits do not jump |
| Captions | 11 to 12 px, muted colour |
Respect the user's system text size.

## 6. Layout and components
- Spacing on an 8 px grid; corner radius 8, 12 and 16.
- Minimum touch target 44 to 48 px.
- Cards: soft grey surface, hairline border.
- Bottom sheets for detail and forms, with a drag handle and swipe-to-dismiss.
- Shared components: Button (primary, secondary, ghost), Chip, Segmented control, Card, Badge, Sheet, Field, Toggle, Empty state, Skeleton, Sparkline, Candle/Line chart.
- Create a single component library so Home, Markets and Alerts stop re-implementing the same pill, card and tab styles.

## 7. Key screens and notes
| Screen | Design notes |
|---|---|
| Welcome | Full-bleed photo with gradient fade, strong headline, two buttons |
| Onboarding | One question per screen, progress pill, large tappable options, illustrations that react to the answer |
| Home | Top stories first, then mood, tools, prices; AI button always reachable |
| Markets | Four category folders, then watch list rows with price and change |
| Asset sheet | Price first, chart immediately below, timeframes in one row, buy/sell visible without scrolling |
| Alerts | Week strip, time-of-day groups, checkbox to acknowledge |
| Calendar | Week strip, filters, impact badges |
| Global Events | Dot-matrix map with category-coloured markers |
| AI chat | Hero greeting and suggestion cards, then a standard conversation view |

## 8. Motion
- 150 to 250 ms transitions.
- Animated mood bars, tab indicator slide, sheet spring, pulsing markers on recent events.
- Honour the system "reduce motion" setting.

## 9. Accessibility
- Contrast at least 4.5:1 for text.
- Labels on icon buttons.
- Do not rely on colour alone.
- Support dynamic type and screen readers.
- Voice features need a text alternative.

## 10. Content and tone
- Plain English; define jargon on first use.
- Every AI or analysis surface carries "Education only, not financial advice".
- Use scenarios and conditions ("if price closes above X") instead of predictions.
- Remove placeholder wording and sample figures from production builds, or label them "Sample".

## 11. Deliverables
1. Token set (colour, type, spacing, radius) for light and dark.
2. Component library in Figma and in code.
3. High-fidelity designs for the 12 key screens and all empty/error states.
4. Icon and illustration set; store screenshots and app icon.
5. Accessibility review report.
