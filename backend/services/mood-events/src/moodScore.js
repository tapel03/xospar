// Global Market Mood: turns the scored news feed into RISK-ON / RISK-OFF / NEUTRAL plus four bars.
// Moved to the server from Savanai src/utils/marketMood.js (the doc lists it as "remove from the app,
// lives in the mood service"). Logic is unchanged: deterministic, no extra API key.

const THEME_KEYWORDS = {
  geopolitical: [
    "war",
    "conflict",
    "missile",
    "bombing",
    "attack",
    "military strike",
    "ceasefire",
    "sanctions",
  ],
  selloff: ["market selloff", "stock market", "stocks", "crash", "recession"],
  inflation: ["inflation", "cpi", "consumer prices"],
  rates: [
    "interest rate",
    "rate decision",
    "rate cut",
    "rate hike",
    "central bank",
    "federal reserve",
    "fed ",
  ],
  growth: ["gdp", "unemployment", "jobs report", "employment", "economic growth"],
  trade: ["tariff", "trade war"],
};

const DRIVER_LABELS = {
  geopolitical: "geopolitical tensions",
  selloff: "market volatility",
  inflation: "inflation pressures",
  rates: "central bank policy",
  growth: "growth concerns",
  trade: "trade tensions",
};

const IMPACT_WEIGHT = { High: 3, Medium: 1.5, Low: 0.5 };

// Scoring window - the freshest, highest-ranked stories carry the most
// weight for "what's moving markets right now".
const WINDOW_SIZE = 30;

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function clamp(value, min = 4, max = 96) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function buildDescription(mood, drivers) {
  const driverText = drivers.length
    ? drivers.slice(0, 2).map((key) => DRIVER_LABELS[key]).join(" and ")
    : "steady global news flow";

  if (mood === "RISK-OFF") {
    return `${capitalize(driverText)} are driving risk-off sentiment across global markets.`;
  }

  if (mood === "RISK-ON") {
    return `Calmer headlines around ${driverText} are supporting risk-on sentiment across global markets.`;
  }

  return `Mixed signals from ${driverText} are keeping global market sentiment balanced.`;
}

/**
 * @param {Array} stories - transformed news stories from newsService
 *   (each has `title`, `description`, `impact`, `markets`, `publishedAt`).
 * @returns {{mood: string, description: string, metrics: Array, updatedAt: string} | null}
 *   Returns null when there isn't enough news yet to score - callers should
 *   fall back to a loading state or the component's own defaults.
 */
export function computeMarketMood(stories = []) {
  if (!Array.isArray(stories) || stories.length === 0) {
    return null;
  }

  const recent = stories.slice(0, WINDOW_SIZE);

  const drivers = new Set();
  let fearPoints = 0;
  let totalWeight = 0;
  let highImpactCount = 0;
  let mediumImpactCount = 0;

  recent.forEach((story) => {
    const text = `${story.title || ""} ${story.description || ""}`.toLowerCase();
    const weight = IMPACT_WEIGHT[story.impact] ?? 0.5;

    totalWeight += weight;
    if (story.impact === "High") highImpactCount += 1;
    if (story.impact === "Medium") mediumImpactCount += 1;

    if (includesAny(text, THEME_KEYWORDS.geopolitical)) {
      fearPoints += weight * 1.4;
      drivers.add("geopolitical");
    }
    if (includesAny(text, THEME_KEYWORDS.selloff)) {
      fearPoints += weight * 1.2;
      drivers.add("selloff");
    }
    if (includesAny(text, THEME_KEYWORDS.trade)) {
      fearPoints += weight * 0.6;
      drivers.add("trade");
    }
    if (includesAny(text, THEME_KEYWORDS.rates)) drivers.add("rates");
    if (includesAny(text, THEME_KEYWORDS.inflation)) drivers.add("inflation");
    if (includesAny(text, THEME_KEYWORDS.growth)) drivers.add("growth");
  });

  // Fear - how much of the news "attention" is on threat-driven themes.
  const fear = clamp((fearPoints / Math.max(totalWeight, 1)) * 140);

  // Uncertainty - how many distinct market-moving themes are live at once,
  // plus how much of the feed is high/medium impact.
  const impactShare =
    (highImpactCount * 2 + mediumImpactCount) / Math.max(recent.length, 1);
  const uncertainty = clamp(drivers.size * 12 + impactShare * 25);

  // Risk appetite & confidence move inversely to fear/uncertainty.
  const risk = clamp(100 - fear * 0.75 - 10);
  const confidence = clamp(100 - uncertainty * 0.9 - 8);

  const offScore = fear + uncertainty;
  const onScore = risk + confidence;

  let mood = "NEUTRAL";
  if (offScore - onScore > 25) mood = "RISK-OFF";
  else if (onScore - offScore > 25) mood = "RISK-ON";

  return {
    mood,
    description: buildDescription(mood, Array.from(drivers)),
    metrics: [
      { label: "Fear", value: fear, color: "#F0445A" },
      { label: "Uncertainty", value: uncertainty, color: "#F29A52" },
      { label: "Risk", value: risk, color: "#22C55E" },
      { label: "Confidence", value: confidence, color: "#3B82F6" },
    ],
    updatedAt: new Date().toISOString(),
  };
}
