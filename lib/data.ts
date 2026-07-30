import type {
  CountryCode,
  CountryDashboard,
  MetricSeries,
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

async function wbSeries(
  indicator: string,
): Promise<Record<CountryCode, YearPoint[]>> {
  const url = `https://api.worldbank.org/v2/country/COL;USA/indicator/${indicator}?format=json&per_page=400&date=1990:2035`;
  const res = await fetch(url, REVALIDATE);
  if (!res.ok) throw new Error(`World Bank ${indicator}: HTTP ${res.status}`);
  const json = (await res.json()) as [unknown, WbRow[] | null];
  const out: Record<CountryCode, YearPoint[]> = { COL: [], USA: [] };
  for (const row of json[1] ?? []) {
    if (row.value == null) continue;
    const code = row.countryiso3code;
    if (code === "COL" || code === "USA") {
      out[code].push({ year: Number(row.date), value: row.value });
    }
  }
  out.COL.sort((a, b) => a.year - b.year);
  out.USA.sort((a, b) => a.year - b.year);
  return out;
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
function lastObsPerYear(rows: FredObs[], scale = 1): YearPoint[] {
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
function sumPerCompleteYear(rows: FredObs[]): YearPoint[] {
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

function joinYears(
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
            "New businesses (net)",
            "count",
            "US Census via FRED (BABATOTALSAUS)",
            usBizApps ? sumPerCompleteYear(usBizApps) : null,
            "Business applications filed per year — closures are not published, so this is gross, not net.",
          )
        : buildSeries(
            "newbiz",
            "New businesses (net)",
            "count",
            "World Bank Entrepreneurship Database (IC.BUS.NREG)",
            newBizCol?.COL ?? null,
            "New company registrations per year — closures are not published, so this is gross, not net.",
          );

    const births = buildSeries(
      "births",
      "Birth certificates issued",
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
