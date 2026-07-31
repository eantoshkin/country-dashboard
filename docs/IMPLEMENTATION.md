# Implementation notes

Status of the Good Country Dashboard as of 2026-07-30 (initial build session;
updated same day: three ranking-data supplement batches covering all 39
countries, mobile table fix, color-coded change capsules, sortable Index /
Change columns, per-row sparkline year ranges, and review fixes — dark-mode
contrast, population vintage).

## What this is

A public dashboard for the Country Manifesto (Good Country) draft. The
manifesto's §10 thesis — politicians should be judged by the growth of the
country's public economy — is implemented as the site's north-star metric:

> **Good Country Index = (total stock-market capitalization × number of
> public companies) ÷ population**

Multiplying by the company count is deliberate: one giant corporation
shouldn't define a country's success; broad entrepreneurship should.

## Implemented

### Country view (Colombia, United States tabs)

- **Hero card**: the Good Country Index, latest value, Δ over the shown
  decade, 10-year line chart.
- **Six metric cards**, each with the current value and a 10-year chart:
  1. Public companies — World Bank `CM.MKT.LDOM.NO`
  2. Stock market size — World Bank `CM.MKT.LCAP.CD`
  3. Population — World Bank `SP.POP.TOTL`
  4. New businesses — Colombia: World Bank `IC.BUS.NREG`; USA: Census
     business applications via FRED `BABATOTALSAUS` (annual sums,
     complete years only)
  5. M2 money supply — Colombia: World Bank broad money `FM.LBL.BMNY.CN`
     (COP); USA: FRED `M2SL` (December levels)
  6. Birth certificates — estimated births (crude birth rate ×
     population), both countries

### World ranking tab

39 countries ranked by the index, each row with rank, a "History"
sparkline labeled with its own first/last plotted year (spans differ
where reporting gapped — Uruguay's runs 1995-2025), latest value, a
color-coded change capsule with
its explicit base year ("+116% since 2016" — the base year makes gap
countries self-explanatory, e.g. Venezuela "since 1994"; hidden on
mobile for width), and the data year. The Index and Change headers
sort (desc → asc toggle, canonical rank stays in the # column).
Colombia and the USA rows are highlighted. Mobile (≤640px): the sparkline column is
hidden, cell padding tightens, and headers wrap so the table fits
without horizontal scrolling.

### Data honesty rules (project policy)

- Metrics that approximate the request carry a visible proxy note
  (e.g. business registrations are gross — closures aren't published;
  births estimate stands in for birth-certificate issuance).
- Ranking only compares countries whose latest index point — whether
  from World Bank data or an approved manual supplement
  (`MANUAL_LATEST` in `lib/data.ts`) — is ≤ 5 years old. Where the
  World Bank series stopped years ago, the
  latest point is hand-collected from exchange statistics (session of
  2026-07-30), stored in `MANUAL_LATEST` in `lib/data.ts`, and marked
  with † in the table plus a per-country source footnote: France
  (Euronext/CEIC, Jun 2026), Netherlands (Euronext Amsterdam, Mar 2025),
  Italy (Borsa Italiana/ANSA, Dec 2025), Norway (Euronext Oslo, Q2
  2025), Portugal (Euronext Lisbon/CEIC, Mar 2025), Sweden (Nasdaq
  Stockholm, Dec 2025), Finland (Nasdaq Helsinki incl. First North, Q4
  2025), Ecuador (BVQ/MarketScreener, 2025). A second batch the same
  day refreshed countries stuck at 2021-2023: United Kingdom (LSE
  domestic-only Main Market + AIM via CEIC/Baker McKenzie, Dec 2025 —
  the headline LSE total includes ~37% international listings and must
  not be used), Russia (MOEX FY2025 release, Dec 2025; unique
  common-stock issuers, sanctions-era captive market), Mexico (BMV via
  WFE Focus, Mar 2026 — WFE is the World Bank's own source, directly
  comparable), Argentina (BYMA audited annual report at the MEP rate,
  Dec 2025), Costa Rica (BNV via FIAB monthly report, Dec 2025; thin
  market, ~14 equity trades/month). After this batch every ranked
  country has 2024+ data. Non-USD figures use each source's published
  rate (EUR at $1.08); company counts follow exchange-published totals
  (may include growth-market segments or funds — slightly broader than
  the World Bank's "listed domestic companies", noted in the UI). A
  third batch (same day, via an adversarially-verified research
  workflow — every figure re-checked against the primary PDF/source)
  cleared the last four formerly-unrankable countries, so
  `NO_CURRENT_DATA` is now empty (mechanism kept): Ukraine (OECD
  "Stronger Financial Markets…for Ukraine's Recovery", Mar 2026, citing
  PFTS: UAH 21.5bn cap at the NBU rate ≈ $520M, Aug 2025 — only 6 of
  ~1,600 public companies effectively trade; UX license saga noted, a
  dormant-market proxy, not a WB-comparable series), Venezuela (BVC via
  Finanzas Digital at the official BCV rate: $21.79B, Apr 2026; 36
  domestic companies per FIAB; market doubled in a year, Bloomberg
  corroborates ~$20B — rate-sensitive due to parallel-market premium),
  Paraguay (BVA via FIAB tables: $2.30B, 56 companies, Dec 2025,
  natively USD), Uruguay (FIAB cap $288.21M reported by BEVSA, Dec
  2025, + BVM share-issuer register: 7 companies; BVM doesn't feed
  FIAB, so the cap may slightly understate). Rows older than the
  current data year are visually muted; every row shows its data year.
  Manual composite points divide by the population of their own year
  when the World Bank has published it, otherwise the latest available
  (a <1%/yr vintage gap, disclosed here rather than dropping the
  country). These manual figures do NOT auto-refresh — revisit them
  periodically; FIAB monthly PDFs
  (`fiab.org/inf_mensuales/IM-<Mes><Year>.pdf`) cover the Latin
  American exchanges in one place.
- Failed fetches degrade to explicit "data unavailable" states.

## Architecture

- **Next.js 16** (App Router, TypeScript, Turbopack). The page is fully
  static, revalidated every 24 h; data is fetched server-side with
  `next.revalidate` — no API keys required anywhere.
- **Material Web** (`@material/web` tabs, registered client-side via
  dynamic import) + Material 3 design tokens in `app/globals.css`, light
  and dark schemes, Roboto.
- **Charts**: hand-rolled SVG (`components/LineChart.tsx`,
  `components/Sparkline.tsx`) with crosshair/dot hover tooltips. Chart
  accent colors were validated for lightness, chroma, and contrast
  against both surfaces: `#6750a4` (light) / `#9a82db` (dark).
- **Change capsules** (`--delta-pos`/`--delta-neg` tokens): green/red
  status colors validated against the card surfaces per mode — light
  `#006300`/`#d03b3b`, dark `#0ca30c`/`#e66767` (the darker red failed
  4.5:1 on the tinted pill background, so dark uses a lighter step).
  Direction never rides on color alone: every capsule prints its +/−
  sign.
- **Data layer** (`lib/data.ts`): World Bank API (multi-country batched
  requests) + keyless FRED CSV endpoint; year-joining and per-year
  aggregation helpers; all series truncated to the last 10 available
  years.

## Deployment

- Work from a local clone named after the repo (`country-dashboard`;
  the working folder was renamed from `cm` on 2026-07-30 to match).
- GitHub: <https://github.com/eantoshkin/country-dashboard> (public,
  single `main` branch — no feature branches by convention).
- Vercel: project `country-dashboard`, auto-deploys `main`; production
  URL <https://country-dashboard-omega.vercel.app>.
- The `docs/` folder is gitignored (private drafts) except this file.

## Ideas / not yet implemented

- The manifesto's closing note: model how Colombia's index would grow
  under the proposed system (2× economy scenario) and show its ranking
  neighbors before/after.
- Language toggle (manifesto is in Russian; site is English-only).
- Alternative index weightings (e.g. log of company count) for
  comparison while the formula is still a draft.
