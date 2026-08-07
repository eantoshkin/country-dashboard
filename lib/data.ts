import type {
  CountryCode,
  CountryDashboard,
  MetricSeries,
  RankingEntry,
  ValueFormat,
  YearPoint,
} from "./types";

const REVALIDATE = { next: { revalidate: 86400 } };
const YEARS_SHOWN = 10;

/* ---------------------------------- fetchers --------------------------------- */

interface WbRow {
  countryiso3code: string;
  date: string;
  value: number | null;
}

async function wbMulti(
  indicator: string,
  codes: string[],
): Promise<Map<string, YearPoint[]>> {
  const url = `https://api.worldbank.org/v2/country/${codes.join(";")}/indicator/${indicator}?format=json&per_page=20000&date=1990:2035`;
  const res = await fetch(url, REVALIDATE);
  if (!res.ok) throw new Error(`World Bank ${indicator}: HTTP ${res.status}`);
  const json = (await res.json()) as [unknown, WbRow[] | null];
  const out = new Map<string, YearPoint[]>(codes.map((c) => [c, []]));
  for (const row of json[1] ?? []) {
    if (row.value == null) continue;
    out
      .get(row.countryiso3code)
      ?.push({ year: Number(row.date), value: row.value });
  }
  for (const points of out.values()) points.sort((a, b) => a.year - b.year);
  return out;
}

async function wbSeries(
  indicator: string,
): Promise<Record<CountryCode, YearPoint[]>> {
  const map = await wbMulti(indicator, ["COL", "USA"]);
  return { COL: map.get("COL") ?? [], USA: map.get("USA") ?? [] };
}

interface FredObs {
  year: number;
  month: number;
  value: number;
}

async function fredMonthly(seriesId: string): Promise<FredObs[]> {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`;
  const res = await fetch(url, REVALIDATE);
  if (!res.ok) throw new Error(`FRED ${seriesId}: HTTP ${res.status}`);
  const text = await res.text();
  const rows: FredObs[] = [];
  for (const line of text.trim().split("\n").slice(1)) {
    const [date, raw] = line.split(",");
    const value = Number(raw);
    if (!date || !Number.isFinite(value)) continue;
    const [year, month] = date.split("-").map(Number);
    rows.push({ year, month, value });
  }
  return rows;
}

/* ------------------------------ shaping helpers ------------------------------ */

/** Level series (like M2): the last monthly observation of each year. */
// The shaping helpers below are exported for unit tests only.
export function lastObsPerYear(rows: FredObs[], scale = 1): YearPoint[] {
  const byYear = new Map<number, FredObs>();
  for (const row of rows) {
    const prev = byYear.get(row.year);
    if (!prev || row.month > prev.month) byYear.set(row.year, row);
  }
  return [...byYear.values()]
    .map((r) => ({ year: r.year, value: r.value * scale }))
    .sort((a, b) => a.year - b.year);
}

/** Flow series (like applications filed): annual sum over complete years only. */
export function sumPerCompleteYear(rows: FredObs[]): YearPoint[] {
  const byYear = new Map<number, { sum: number; months: number }>();
  for (const row of rows) {
    const acc = byYear.get(row.year) ?? { sum: 0, months: 0 };
    acc.sum += row.value;
    acc.months += 1;
    byYear.set(row.year, acc);
  }
  return [...byYear.entries()]
    .filter(([, acc]) => acc.months === 12)
    .map(([year, acc]) => ({ year, value: acc.sum }))
    .sort((a, b) => a.year - b.year);
}

export function joinYears(
  series: YearPoint[][],
  combine: (values: number[]) => number,
): YearPoint[] {
  if (series.some((s) => s.length === 0)) return [];
  const maps = series.map((s) => new Map(s.map((p) => [p.year, p.value])));
  const shared = [...maps[0].keys()].filter((y) => maps.every((m) => m.has(y)));
  return shared
    .sort((a, b) => a - b)
    .map((year) => ({ year, value: combine(maps.map((m) => m.get(year)!)) }));
}

function buildSeries(
  id: string,
  label: string,
  format: ValueFormat,
  source: string,
  points: YearPoint[] | null,
  proxyNote?: string,
): MetricSeries {
  const shown = (points ?? []).slice(-YEARS_SHOWN);
  return {
    id,
    label,
    format,
    source,
    points: shown,
    latest: shown.at(-1) ?? null,
    ...(proxyNote ? { proxyNote } : {}),
  };
}

async function safe<T>(promise: Promise<T>, what: string): Promise<T | null> {
  try {
    return await promise;
  } catch (err) {
    console.error(`[dashboard] ${what} failed:`, err);
    return null;
  }
}

/**
 * The three World Bank series the index itself needs. If any of them failed,
 * every index figure on the page would render "unavailable" — and with ISR
 * that empty page would be cached for a day. Throwing instead makes the
 * revalidation fail, so Next.js keeps serving the last good page until the
 * next attempt. (Secondary series — FRED, broad money, births — still degrade
 * per-card via `safe`.) Trade-off: a fresh build with the World Bank down
 * fails instead of deploying an empty dashboard, which is what we want.
 */
function requireCore<T>(core: Array<[T | null, string]>): void {
  const missing = core.filter(([v]) => v == null).map(([, name]) => name);
  if (missing.length > 0) {
    throw new Error(
      `[dashboard] core series unavailable (${missing.join(", ")}) — ` +
        "failing this render so the previous good page stays up",
    );
  }
}

/* --------------------------------- ranking ----------------------------------- */

/** Ranked countries, in the order requested for the World ranking tab. */
const RANKING_COUNTRIES: Array<{ code: string; name: string }> = [
  { code: "USA", name: "United States" },
  { code: "CAN", name: "Canada" },
  { code: "AUS", name: "Australia" },
  { code: "JPN", name: "Japan" },
  { code: "SGP", name: "Singapore" },
  { code: "KOR", name: "South Korea" },
  { code: "GBR", name: "United Kingdom" },
  { code: "CHE", name: "Switzerland" },
  { code: "CHN", name: "China" },
  { code: "FRA", name: "France" },
  { code: "ISR", name: "Israel" },
  { code: "NOR", name: "Norway" },
  { code: "IND", name: "India" },
  { code: "NLD", name: "Netherlands" },
  { code: "ARE", name: "UAE" },
  { code: "SWE", name: "Sweden" },
  { code: "FIN", name: "Finland" },
  { code: "ITA", name: "Italy" },
  { code: "POL", name: "Poland" },
  { code: "DEU", name: "Germany" },
  { code: "RUS", name: "Russia" },
  { code: "CHL", name: "Chile" },
  { code: "PER", name: "Peru" },
  { code: "BRA", name: "Brazil" },
  { code: "MEX", name: "Mexico" },
  { code: "PRT", name: "Portugal" },
  { code: "COL", name: "Colombia" },
  { code: "ARG", name: "Argentina" },
  { code: "PRY", name: "Paraguay" },
  { code: "ECU", name: "Ecuador" },
  { code: "URY", name: "Uruguay" },
  { code: "PAN", name: "Panama" },
  { code: "CRI", name: "Costa Rica" },
  { code: "UKR", name: "Ukraine" },
  { code: "ESP", name: "Spain" },
  { code: "VEN", name: "Venezuela" },
  { code: "THA", name: "Thailand" },
  { code: "TUR", name: "Turkey" },
  { code: "IDN", name: "Indonesia" },
];

/**
 * Latest figures hand-collected from exchange statistics (session of
 * 2026-07-30) for countries whose World Bank series stopped years ago.
 * Non-USD figures converted at the rate each source publishes (EUR at
 * $1.08/€ for the Euronext/Nasdaq batch). Company counts follow each
 * exchange's published totals, which may include growth-market segments —
 * slightly broader than the World Bank's "listed domestic companies".
 */
const MANUAL_LATEST: Record<
  string,
  { year: number; marketCapUsd: number; companies: number; source: string }
> = {
  FRA: { year: 2026, marketCapUsd: 3.61e12, companies: 800, source: "Euronext Paris via CEIC, Jun 2026" },
  NLD: { year: 2025, marketCapUsd: 1.65e12, companies: 160, source: "Euronext Amsterdam, Mar 2025" },
  ITA: { year: 2025, marketCapUsd: 1.13e12, companies: 411, source: "Borsa Italiana via ANSA, Dec 2025" },
  NOR: { year: 2025, marketCapUsd: 3.66e11, companies: 341, source: "Euronext Oslo Børs, Q2 2025" },
  PRT: { year: 2025, marketCapUsd: 9.2e10, companies: 34, source: "Euronext Lisbon via CEIC, Mar 2025" },
  SWE: { year: 2025, marketCapUsd: 1.33e12, companies: 363, source: "Nasdaq Stockholm, Dec 2025" },
  FIN: { year: 2025, marketCapUsd: 3.43e11, companies: 183, source: "Nasdaq Helsinki incl. First North, Q4 2025" },
  ECU: { year: 2025, marketCapUsd: 1.14e10, companies: 21, source: "Bolsa de Valores de Quito / MarketScreener, 2025" },
  // Second batch (same session): countries whose WB data was 2021-2023.
  // GBR: domestic-only Main Market cap ($3.99T) + domestic AIM (~$80B);
  // count includes closed-end funds, which the World Bank excludes.
  GBR: { year: 2025, marketCapUsd: 4.07e12, companies: 1199, source: "LSE domestic incl. AIM, via CEIC & Baker McKenzie, Dec 2025" },
  // RUS: unique common-stock issuers (MOEX's 260 counts pref shares separately);
  // sanctions-era captive domestic market, CBR-type FX rate.
  RUS: { year: 2025, marketCapUsd: 6.84e11, companies: 182, source: "MOEX FY2025 release (RUB 52.9T), Dec 2025" },
  // MEX: WFE Focus — the same source the WB series drew from; directly comparable.
  MEX: { year: 2026, marketCapUsd: 5.93e11, companies: 126, source: "BMV via WFE Focus, Mar 2026" },
  // ARG: BYMA audited annual report; USD at MEP rate (≈ official since Apr 2025
  // FX unification). Excludes CEDEARs and NYSE-only issuers, matching WB scope.
  ARG: { year: 2025, marketCapUsd: 8.03e10, companies: 83, source: "BYMA annual report, MEP rate, Dec 2025" },
  // CRI: BNV self-reports to FIAB; ~14 equity trades/month, so a thin-market valuation.
  CRI: { year: 2025, marketCapUsd: 3.73e9, companies: 9, source: "BNV via FIAB monthly report, Dec 2025" },
  // Third batch (same session): the four formerly-unrankable countries.
  // UKR: OECD "Stronger Financial Markets…for Ukraine's Recovery" (Mar 2026)
  // cites PFTS cap UAH 21.5bn, Aug 2025 (NBU rate ≈41.45); only 6 of ~1,600
  // public companies effectively trade — a dormant-market proxy, not a
  // WB-comparable series.
  UKR: { year: 2025, marketCapUsd: 5.2e8, companies: 6, source: "OECD citing PFTS (UAH 21.5bn, NBU rate), Aug 2025 — near-dormant market, 6 traded companies" },
  // VEN: BVC is rallying (cap doubled in a year; Bloomberg corroborates ~$20bn,
  // May 2026). Official BCV rate — parallel-market premium makes USD values
  // rate-sensitive. Count: FIAB shows 36 domestic / 0 foreign (Sep 2025).
  VEN: { year: 2026, marketCapUsd: 2.1788e10, companies: 36, source: "BVC via Finanzas Digital at official BCV rate, Apr 2026; count per FIAB" },
  // PRY: FIAB tables 1.1/1.2, natively USD; YoY cross-checked vs Dec 2024 PDF.
  PRY: { year: 2025, marketCapUsd: 2.3046e9, companies: 56, source: "BVA via FIAB monthly report, Dec 2025" },
  // URY: cap = FIAB (BEVSA-reported; BVM doesn't feed FIAB, may slightly
  // understate); count = BVM's official share-issuer register (7 issuers).
  URY: { year: 2025, marketCapUsd: 2.8821e8, companies: 7, source: "BEVSA/BVM via FIAB monthly report & issuer register, Dec 2025" },
};

/**
 * Countries that stay unranked, with the honest reason. Empty since
 * 2026-07-30 — every ranking country now has a current figure (the last
 * four came via OECD/PFTS, BVC, and FIAB) — but the mechanism stays for
 * the day a series dies again.
 */
const NO_CURRENT_DATA: Record<string, string> = {};

export async function getRankingData(): Promise<RankingEntry[]> {
  const codes = RANKING_COUNTRIES.map((c) => c.code);
  const [marketCap, listed, population] = await Promise.all([
    safe(wbMulti("CM.MKT.LCAP.CD", codes), "ranking market cap"),
    safe(wbMulti("CM.MKT.LDOM.NO", codes), "ranking listed companies"),
    safe(wbMulti("SP.POP.TOTL", codes), "ranking population"),
  ]);
  requireCore([
    [marketCap, "ranking market cap"],
    [listed, "ranking listed companies"],
    [population, "ranking population"],
  ]);

  const entries = RANKING_COUNTRIES.map(({ code, name }): RankingEntry => {
    let points = joinYears(
      [
        marketCap?.get(code) ?? [],
        listed?.get(code) ?? [],
        population?.get(code) ?? [],
      ],
      ([m, c, p]) => (m * c) / p,
    ).slice(-YEARS_SHOWN);

    const manual = MANUAL_LATEST[code];
    // Prefer the population of the manual point's own year; the World Bank
    // hasn't published one yet for current-year figures, so fall back to the
    // latest available rather than dropping the point — a <1%/yr denominator
    // vintage gap is immaterial next to the disclosed manual-source caveats.
    const popPoints = population?.get(code);
    const pop =
      popPoints?.find((p) => p.year === manual?.year) ?? popPoints?.at(-1);
    let manualSource: string | undefined;
    if (manual && pop && (points.at(-1)?.year ?? 0) < manual.year) {
      points = [
        ...points,
        {
          year: manual.year,
          value: (manual.marketCapUsd * manual.companies) / pop.value,
        },
      ].slice(-YEARS_SHOWN);
      manualSource = manual.source;
    }

    return {
      code,
      name,
      points,
      latest: points.at(-1) ?? null,
      ...(manualSource ? { manualSource } : {}),
      ...(NO_CURRENT_DATA[code] ? { unrankedReason: NO_CURRENT_DATA[code] } : {}),
    };
  });

  // Countries with no computable index sink to the bottom, keeping list order.
  return entries.sort(
    (a, b) => (b.latest?.value ?? -Infinity) - (a.latest?.value ?? -Infinity),
  );
}

/* --------------------------------- assembly ---------------------------------- */

export async function getDashboardData(): Promise<CountryDashboard[]> {
  const [marketCap, listed, population, broadMoney, newBizCol, birthRate, usM2, usBizApps] =
    await Promise.all([
      safe(wbSeries("CM.MKT.LCAP.CD"), "market cap"),
      safe(wbSeries("CM.MKT.LDOM.NO"), "listed companies"),
      safe(wbSeries("SP.POP.TOTL"), "population"),
      safe(wbSeries("FM.LBL.BMNY.CN"), "broad money"),
      safe(wbSeries("IC.BUS.NREG"), "new business registrations"),
      safe(wbSeries("SP.DYN.CBRT.IN"), "crude birth rate"),
      safe(fredMonthly("M2SL"), "US M2"),
      safe(fredMonthly("BABATOTALSAUS"), "US business applications"),
    ]);
  requireCore([
    [marketCap, "market cap"],
    [listed, "listed companies"],
    [population, "population"],
  ]);

  const countries: Array<{ code: CountryCode; name: string }> = [
    { code: "COL", name: "Colombia" },
    { code: "USA", name: "United States" },
  ];

  return countries.map(({ code, name }) => {
    const mcap = marketCap?.[code] ?? [];
    const companies = listed?.[code] ?? [];
    const pop = population?.[code] ?? [];

    const hero = buildSeries(
      "index",
      "Good Country Index",
      "index",
      "World Bank (market cap, listed companies, population)",
      joinYears([mcap, companies, pop], ([m, c, p]) => (m * c) / p),
    );

    const money: MetricSeries =
      code === "USA"
        ? buildSeries(
            "m2",
            "M2 money supply",
            "usd",
            "Federal Reserve via FRED (M2SL)",
            usM2 ? lastObsPerYear(usM2, 1e9) : null,
            "December level of each year; latest point is the most recent month.",
          )
        : buildSeries(
            "m2",
            "M2 money supply",
            "cop",
            "World Bank (FM.LBL.BMNY.CN)",
            broadMoney?.COL ?? null,
            "World Bank broad money in Colombian pesos — the closest published series to M2.",
          );

    const newBusinesses: MetricSeries =
      code === "USA"
        ? buildSeries(
            "newbiz",
            "New business registrations",
            "count",
            "US Census via FRED (BABATOTALSAUS)",
            usBizApps ? sumPerCompleteYear(usBizApps) : null,
            "Business applications filed per year — closures are not published, so this is gross, not net.",
          )
        : buildSeries(
            "newbiz",
            "New business registrations",
            "count",
            "World Bank Entrepreneurship Database (IC.BUS.NREG)",
            newBizCol?.COL ?? null,
            "New company registrations per year — closures are not published, so this is gross, not net.",
          );

    const births = buildSeries(
      "births",
      "Estimated births",
      "count",
      "World Bank (SP.DYN.CBRT.IN × SP.POP.TOTL)",
      joinYears(
        [birthRate?.[code] ?? [], pop],
        ([rate, p]) => (rate * p) / 1000,
      ),
      "Estimated births (crude birth rate × population) — certificate issuance counts are not published via API.",
    );

    return {
      code,
      name,
      hero,
      metrics: [
        buildSeries(
          "companies",
          "Public companies",
          "count",
          "World Bank (CM.MKT.LDOM.NO)",
          companies,
          "Listed domestic companies — excludes foreign listings and investment funds.",
        ),
        buildSeries(
          "marketcap",
          "Stock market size",
          "usd",
          "World Bank (CM.MKT.LCAP.CD)",
          mcap,
        ),
        buildSeries(
          "population",
          "Population",
          "count",
          "World Bank (SP.POP.TOTL)",
          pop,
        ),
        newBusinesses,
        money,
        births,
      ],
    };
  });
}
