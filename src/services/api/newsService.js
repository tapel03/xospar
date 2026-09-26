const GDELT_BASE_URL = "https://api.gdeltproject.org/api/v2/doc/doc";

const MARKET_QUERY = `
(
  "central bank"
  OR "interest rate"
  OR inflation
  OR "consumer prices"
  OR "jobs report"
  OR employment
  OR "unemployment rate"
  OR GDP
  OR recession
  OR "economic growth"
  OR sanctions
  OR tariff
  OR tariffs
  OR war
  OR conflict
  OR missile
  OR bombing
  OR attack
  OR ceasefire
  OR "military strike"
  OR oil
  OR crude
  OR "oil supply"
  OR OPEC
  OR gold
  OR "stock market"
  OR stocks
  OR forex
  OR currency
  OR dollar
  OR euro
  OR yen
  OR pound
  OR "US dollar"
  OR "trade war"
  OR "market selloff"
)
`;

const HIGH_IMPACT_KEYWORDS = [
  "interest rate",
  "central bank",
  "rate decision",
  "rate cut",
  "rate hike",
  "inflation",
  "cpi",
  "nfp",
  "employment",
  "unemployment",
  "recession",
  "gdp",
  "war",
  "conflict",
  "bombing",
  "missile",
  "military strike",
  "sanctions",
  "tariff",
  "oil supply",
  "opec",
  "ceasefire",
  "bank failure",
  "financial crisis",
  "market crash",
  "stock market",
];

const MARKET_KEYWORDS = {
  Oil: [
    "oil",
    "crude",
    "opec",
    "oil supply",
    "brent",
    "wti",
  ],
  Gold: [
    "gold",
    "safe haven",
    "geopolitical",
    "war",
    "conflict",
  ],
  USD: [
    "federal reserve",
    "fed",
    "dollar",
    "us inflation",
    "us jobs",
    "treasury",
    "interest rate",
    "united states",
  ],
  EUR: [
    "ecb",
    "euro",
    "eurozone",
    "germany",
    "europe",
  ],
  GBP: [
    "bank of england",
    "boe",
    "pound",
    "uk inflation",
    "britain",
    "united kingdom",
  ],
  JPY: [
    "bank of japan",
    "boj",
    "yen",
    "japan",
  ],
  Stocks: [
    "stocks",
    "equities",
    "s&p 500",
    "nasdaq",
    "dow",
    "wall street",
  ],
};

function normaliseText(value = "") {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function calculateImpact(title = "") {
  const text = normaliseText(title);

  let score = 0;

  HIGH_IMPACT_KEYWORDS.forEach((keyword) => {
    if (text.includes(keyword)) {
      score += 3;
    }
  });

  if (
    text.includes("breaking") ||
    text.includes("urgent") ||
    text.includes("just in")
  ) {
    score += 2;
  }

  if (
    text.includes("attack") ||
    text.includes("bombing") ||
    text.includes("missile") ||
    text.includes("war") ||
    text.includes("military strike")
  ) {
    score += 4;
  }

  if (
    text.includes("rate decision") ||
    text.includes("rate cut") ||
    text.includes("rate hike") ||
    text.includes("inflation") ||
    text.includes("cpi") ||
    text.includes("jobs report")
  ) {
    score += 4;
  }

  if (score >= 9) return "High";
  if (score >= 4) return "Medium";

  return "Low";
}

function getMarkets(title = "") {
  const text = normaliseText(title);
  const matches = [];

  Object.entries(MARKET_KEYWORDS).forEach(([market, keywords]) => {
    if (keywords.some((keyword) => text.includes(keyword))) {
      matches.push(market);
    }
  });

  if (matches.length === 0) {
    return ["Global Markets"];
  }

  return [...new Set(matches)].slice(0, 3);
}

function getMarketReport(title = "", markets = []) {
  const text = normaliseText(title);

  if (
    text.includes("oil") ||
    text.includes("crude") ||
    text.includes("opec")
  ) {
    return "Oil markets may react as traders reassess supply and demand risks.";
  }

  if (
    text.includes("inflation") ||
    text.includes("cpi") ||
    text.includes("consumer prices")
  ) {
    return "Currency and bond markets may reprice expectations for future interest rates.";
  }

  if (
    text.includes("interest rate") ||
    text.includes("rate decision") ||
    text.includes("rate cut") ||
    text.includes("rate hike")
  ) {
    return "The decision can quickly change rate expectations and currency valuations.";
  }

  if (
    text.includes("war") ||
    text.includes("conflict") ||
    text.includes("bombing") ||
    text.includes("missile") ||
    text.includes("military strike")
  ) {
    return "Risk sentiment may shift while safe-haven and energy markets react.";
  }

  if (
    text.includes("tariff") ||
    text.includes("trade war") ||
    text.includes("sanction")
  ) {
    return "Trade and supply concerns may affect currencies, commodities and equities.";
  }

  if (
    text.includes("stocks") ||
    text.includes("equities") ||
    text.includes("s&p 500") ||
    text.includes("nasdaq")
  ) {
    return "Equity markets may reprice as investors reassess growth and risk.";
  }

  return `${markets.join(
    " / "
  )} may react as traders reassess the market implications.`;
}

function timeAgo(dateString) {
  if (!dateString) return "Just now";

  const parsed = new Date(dateString);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  const seconds = Math.floor((Date.now() - parsed.getTime()) / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
}

function parseSeenDate(value) {
  if (!value) {
    return null;
  }

  // GDELT commonly uses YYYYMMDDHHMMSS
  if (/^\d{14}$/.test(String(value))) {
    const raw = String(value);

    const formatted = `${raw.slice(0, 4)}-${raw.slice(
      4,
      6
    )}-${raw.slice(6, 8)}T${raw.slice(8, 10)}:${raw.slice(
      10,
      12
    )}:${raw.slice(12, 14)}Z`;

    return new Date(formatted);
  }

  return new Date(value);
}

function scoreArticle(article) {
  const title = normaliseText(article.title || "");
  const impact = calculateImpact(title);

  const impactScore =
    impact === "High" ? 100 : impact === "Medium" ? 50 : 10;

  const date = parseSeenDate(article.seendate);
  const ageMinutes = date
    ? Math.max(0, (Date.now() - date.getTime()) / 60000)
    : 99999;

  // Strong preference for fresh articles.
  const recencyScore = Math.max(0, 100 - ageMinutes);

  const sourceScore = article.domain ? 5 : 0;

  return impactScore * 2 + recencyScore + sourceScore;
}

function transformArticle(article, index) {
  const title = article.title || "Market news update";
  const markets = getMarkets(title);
  const impact = calculateImpact(title);
  const publishedDate = parseSeenDate(article.seendate);

  return {
    id:
      article.url ||
      `${article.title || "story"}-${index}-${article.seendate || ""}`,

    title,

    description: getMarketReport(title, markets),

    source: article.domain || "Global News",

    time: timeAgo(publishedDate?.toISOString()),

    impact,

    markets,

    image: article.socialimage || null,

    url: article.url || null,

    publishedAt: publishedDate
      ? publishedDate.toISOString()
      : new Date().toISOString(),
  };
}

export async function fetchMarketNews({
  timespan = "6h",
  maxRecords = 50,
} = {}) {
  const params = new URLSearchParams({
    query: MARKET_QUERY.replace(/\s+/g, " ").trim(),
    mode: "artlist",
    maxrecords: String(maxRecords),
    timespan,
    sort: "datedesc",
    format: "json",
  });

  const response = await fetch(`${GDELT_BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`News API request failed: ${response.status}`);
  }

  const data = await response.json();

  const articles = Array.isArray(data?.articles)
    ? data.articles
    : [];

  const uniqueArticles = [];
  const seenUrls = new Set();
  const seenTitles = new Set();

  for (const article of articles) {
    const titleKey = normaliseText(article.title || "");
    const urlKey = article.url || "";

    if (
      (urlKey && seenUrls.has(urlKey)) ||
      (titleKey && seenTitles.has(titleKey))
    ) {
      continue;
    }

    if (urlKey) {
      seenUrls.add(urlKey);
    }

    if (titleKey) {
      seenTitles.add(titleKey);
    }

    uniqueArticles.push(article);
  }

  return uniqueArticles
    .sort((a, b) => scoreArticle(b) - scoreArticle(a))
    .map(transformArticle);
}