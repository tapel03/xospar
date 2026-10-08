#!/usr/bin/env node
/**
 * apply-bw-theme.js
 *
 * One-shot codemod: turns the dark MARKET app into a black & white theme
 * on a white background. Layout is never touched - only color literals.
 *
 *   node scripts/apply-bw-theme.js --dry-run   (preview, writes nothing)
 *   node scripts/apply-bw-theme.js             (apply; backups in .bw-backup/)
 *
 * How colors are converted
 *   - Neutrals (blacks, greys, dark blue-greys) are inverted onto a grey
 *     ramp: black -> white, cards -> soft grey, white text -> black text,
 *     white buttons -> black buttons (their black labels become white).
 *   - Blue / purple accents become black when used as a foreground
 *     (icons, text, borders, lines) and light grey when used as a fill.
 *   - Red / green / orange keep their meaning, darkened so they read
 *     on white.
 *   - rgba(255,255,255,a) -> rgba(0,0,0,a). rgba(0,0,0,a) is kept (modal
 *     backdrops).
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const BACKUP = path.join(ROOT, ".bw-backup");
const MARKER = path.join(ROOT, ".bw-theme-applied");

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const FORCE = args.includes("--force");

// ---------------------------------------------------------------------
// Files that must NOT be color-converted (already light / already done).
// ---------------------------------------------------------------------
const SKIP = new Set([
  "theme/colors.js",
  "navigation/BottomTabNavigator.jsx",
  "screens/HomeScreen/HomeScreen.jsx",
  "screens/HomeScreen/HomeComponets/AIChatFAB.jsx",
  "screens/HomeScreen/HomeComponets/GlobalMarketMood.jsx",
  "screens/HomeScreen/HomeComponets/QuickTools.jsx",
  "screens/HomeScreen/HomeComponets/TopStoriesCard.jsx",
  "screens/HomeScreen/HomeComponets/MarketPriceList.jsx",
  "screens/MarketsScreen/MarketsComponents/CurrencyPriceChart.jsx",
  "screens/MarketsScreen/MarketsComponents/OrderTicketModal.jsx",
]);

// Files that are white on the outside but have a dark part: only the
// listed pieces are converted.
const PARTIAL = {
  "screens/MarketsScreen/MarketsComponents/AssetDetailModal.jsx": {
    styleKeys: /^(fullscreen|wideOrderButton)/,
    inlineFrom: "{chartFullscreen && (",
    inlineTo: "</InAppModalOverlay>",
  },
};

// Fixes for spots where the old design had white text on a white button.
const PROP_OVERRIDES = {
  "screens/MarketsScreen/MarketsComponents/AlertFormModal.jsx": [
    ["saveText", "color", "#FFFFFF"],
    ["saveButtonDisabled", "backgroundColor", "#A1A1AA"],
  ],
  "screens/MoreScreen/MoreComponents/MT5/ConnectMTScreen.jsx": [
    ["buttonText", "color", "#FFFFFF"],
  ],
  "screens/MarketsScreen/MarketsComponents/StrategyCoachPanel.jsx": [
    ["analyzeText", "color", "#FFFFFF"],
  ],
  "screens/MarketsScreen/MarketsComponents/AssetDetailModal.jsx": [
    ["buyButton", "backgroundColor", "#000000"],
  ],
  "screens/MarketsScreen/MarketsComponents/OrderTicketModal.jsx": [
    ["stepperTagTP", "backgroundColor", "#000000"],
  ],
};

// Literal text fixes applied after conversion: [regex, replacement].
const TEXT_OVERRIDES = {
  "screens/MarketsScreen/MarketsComponents/StrategyCoachPanel.jsx": [
    [/(name="sparkles"\s*size=\{18\}\s*color=)"#000000"/g, '$1"#FFFFFF"'],
  ],
  "components/ExperienceIllustration.jsx": [
    [/const ACCENT = "#000000";/, 'const ACCENT = "#A1A1AA";'],
  ],
  "screens/AuthScreen/AuthWelcomeScreen.jsx": [
    // The dark fade over the hero photo becomes a white fade.
    [/rgba\(0,0,0,\$\{/g, "rgba(255,255,255,${"],
  ],
};

// Logo / orb shapes: keep the three-shape mark, but monochrome.
const BRAND_SHAPES = {
  "#000000": ["square", "markSquare", "logoSquare", "orbRingOuter"],
  "#52525B": ["circle", "markCircle", "logoCircle", "orbRingInner"],
  "#A1A1AA": ["blob", "markBlob", "logoBlob", "orbCore"],
};

// ---------------------------------------------------------------------
// Color math
// ---------------------------------------------------------------------
const FILL_ACCENT = "#D1D1D6"; // blue/purple when used as a background
const FG_ACCENT = "#000000"; // blue/purple when used as text/icon/border
const FILL_KEYS = /^(backgroundColor|backgroundGradient\w*|bg)$/i;
const BLACK_FILL_NAMES = /dot|indicator|knob|fill|track|radio|progress/i;
const EXEMPT_KEYS = new Set(["thumbColor", "shadowColor"]);

const hex2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

function parseHex(literal) {
  let h = literal.slice(1);
  if (![3, 6, 8].includes(h.length)) return null;
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
    a: h.length === 8 ? h.slice(6, 8) : "",
  };
}

function hue(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

function isNeutral(r, g, b) {
  const max = Math.max(r, g, b);
  const chroma = max - Math.min(r, g, b);
  return chroma <= 40 || (max <= 140 && chroma <= 90);
}

// Dark -> light ramp. Card-range darks land on soft greys, mid greys
// stay readable, white lands on black.
function invertGray(L) {
  return L <= 60 ? 255 - 0.6 * L : 219 - (L - 60) * (219 / 195);
}

function mapRgb(r, g, b, ctx) {
  if (isNeutral(r, g, b)) {
    const v = invertGray(lum(r, g, b));
    return [v, v, v];
  }

  const h = hue(r, g, b);
  if (h >= 195 && h <= 290) {
    const asFill = FILL_KEYS.test(ctx.key || "") && !BLACK_FILL_NAMES.test(ctx.entry || "");
    const c = parseHex(asFill ? FILL_ACCENT : FG_ACCENT);
    return [c.r, c.g, c.b];
  }

  // Semantic colors (red / green / orange / yellow): darken to read on white.
  const f = Math.min(1, 130 / lum(r, g, b));
  return [r * f, g * f, b * f];
}

function mapHexLiteral(literal, ctx) {
  const c = parseHex(literal);
  if (!c) return literal;

  // A screen-level container that was near-black becomes pure white.
  if (
    ctx.entry === "container" &&
    /^backgroundColor$/i.test(ctx.key || "") &&
    isNeutral(c.r, c.g, c.b) &&
    lum(c.r, c.g, c.b) <= 30
  ) {
    return "#FFFFFF";
  }

  const [r, g, b] = mapRgb(c.r, c.g, c.b, ctx);
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${c.a}`.toUpperCase();
}

function mapRgbaLiteral(literal) {
  const m = literal.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (!m) return literal;

  const r = +m[1];
  const g = +m[2];
  const b = +m[3];
  const a = m[4];

  if (r === 0 && g === 0 && b === 0) return literal; // backdrops stay dark
  if (r === 255 && g === 255 && b === 255) {
    return a === undefined ? "rgb(0, 0, 0)" : `rgba(0, 0, 0, ${a})`;
  }
  if (!isNeutral(r, g, b)) return literal;

  const v = Math.round(invertGray(lum(r, g, b)));
  return a === undefined ? `rgb(${v}, ${v}, ${v})` : `rgba(${v}, ${v}, ${v}, ${a})`;
}

// ---------------------------------------------------------------------
// StyleSheet entry scanner (so we know which style a literal lives in)
// ---------------------------------------------------------------------
function scanEntries(src) {
  const entries = [];
  const re = /StyleSheet\.create\(\s*\{/g;
  let m;

  while ((m = re.exec(src))) {
    let i = m.index + m[0].length;
    let depth = 1;

    while (i < src.length && depth > 0) {
      if (depth === 1) {
        const sticky = /\s*([A-Za-z_$][\w$]*)\s*:\s*\{/y;
        sticky.lastIndex = i;
        const e = sticky.exec(src);

        if (e) {
          const start = i + e[0].length - 1; // the "{"
          let d = 0;
          let j = start;

          for (; j < src.length; j++) {
            if (src[j] === "{") d++;
            else if (src[j] === "}") {
              d--;
              if (d === 0) break;
            }
          }

          entries.push({ name: e[1], start, end: j });
          i = j + 1;
          continue;
        }
      }

      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
      i++;
    }
  }

  return entries;
}

function entryAt(entries, pos) {
  return entries.find((e) => pos >= e.start && pos <= e.end) || null;
}

function keyBefore(src, pos) {
  const lineStart = src.lastIndexOf("\n", pos) + 1;
  const prefix = src.slice(lineStart, pos);
  const m = prefix.match(/([A-Za-z_$][\w$]*)\s*[:=]\s*[^:=]*$/);
  return m ? m[1] : "";
}

// ---------------------------------------------------------------------
// Per-file transform
// ---------------------------------------------------------------------
const LITERAL_RE =
  /(["'])(#[0-9a-fA-F]{3,8})\1|(["'])(rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\))\3/g;

function convert(src, partial) {
  const entries = scanEntries(src);
  let inlineStart = -1;
  let inlineEnd = -1;

  if (partial) {
    inlineStart = src.indexOf(partial.inlineFrom);
    inlineEnd = inlineStart >= 0 ? src.indexOf(partial.inlineTo, inlineStart) : -1;
  }

  let count = 0;

  const out = src.replace(LITERAL_RE, (whole, q1, hexLit, q2, rgbaLit, offset) => {
    const entry = entryAt(entries, offset);

    if (partial) {
      const inStyle = entry && partial.styleKeys.test(entry.name);
      const inInline = !entry && inlineStart >= 0 && offset > inlineStart && offset < inlineEnd;
      if (!inStyle && !inInline) return whole;
    }

    const key = keyBefore(src, offset);
    if (EXEMPT_KEYS.has(key)) return whole;

    const ctx = { key, entry: entry ? entry.name : "" };
    const q = q1 || q2;
    const next = hexLit ? mapHexLiteral(hexLit, ctx) : mapRgbaLiteral(rgbaLit);

    if (next !== (hexLit || rgbaLit)) count++;
    return `${q}${next}${q}`;
  });

  return { out, count };
}

function setProp(src, entryName, prop, value) {
  const entry = scanEntries(src).find((e) => e.name === entryName);
  if (!entry) return src;

  const body = src.slice(entry.start, entry.end + 1);
  const re = new RegExp(`(\\b${prop}\\s*:\\s*)(["'])[^"']*\\2`);
  if (!re.test(body)) return src;

  return src.slice(0, entry.start) + body.replace(re, `$1"${value}"`) + src.slice(entry.end + 1);
}

function applyBrandShapes(src) {
  let out = src;

  for (const [color, names] of Object.entries(BRAND_SHAPES)) {
    for (const name of names) {
      const entry = scanEntries(out).find((e) => e.name === name);
      if (entry && /backgroundColor\s*:/.test(out.slice(entry.start, entry.end + 1))) {
        out = setProp(out, name, "backgroundColor", color);
      }
    }
  }

  return out;
}

function transformFile(rel, src) {
  let out = src;
  let count = 0;

  if (!SKIP.has(rel)) {
    const res = convert(out, PARTIAL[rel] || null);
    out = res.out;
    count = res.count;
    out = applyBrandShapes(out);
  }

  for (const [entry, prop, value] of PROP_OVERRIDES[rel] || []) {
    out = setProp(out, entry, prop, value);
  }

  for (const [re, replacement] of TEXT_OVERRIDES[rel] || []) {
    out = out.replace(re, replacement);
  }

  return { out, count };
}

// ---------------------------------------------------------------------
// Walk src/
// ---------------------------------------------------------------------
function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, acc);
    else if (/\.(js|jsx)$/.test(name)) acc.push(full);
  }
  return acc;
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error("Run this from your project root (the folder that contains src/).");
    process.exit(1);
  }

  if (fs.existsSync(MARKER) && !FORCE && !DRY) {
    console.error(
      "The black & white theme was already applied (.bw-theme-applied exists).\n" +
        "Running it twice would flip the colors back. Use --force only after restoring from .bw-backup/."
    );
    process.exit(1);
  }

  let changedFiles = 0;
  let changedColors = 0;

  for (const file of walk(SRC)) {
    const rel = path.relative(SRC, file).split(path.sep).join("/");
    const src = fs.readFileSync(file, "utf8");
    const { out, count } = transformFile(rel, src);

    if (out === src) continue;

    changedFiles++;
    changedColors += count;
    console.log(`${DRY ? "[dry-run] " : ""}${rel}  (${count} colors)`);

    if (!DRY) {
      const backupPath = path.join(BACKUP, rel);
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      if (!fs.existsSync(backupPath)) fs.writeFileSync(backupPath, src);
      fs.writeFileSync(file, out);
    }
  }

  if (!DRY) fs.writeFileSync(MARKER, new Date().toISOString());

  console.log(`\n${DRY ? "Would change" : "Changed"} ${changedFiles} files, ${changedColors} color values.`);
  if (!DRY) console.log("Originals saved to .bw-backup/. Delete that folder once you're happy.");
}

main();
