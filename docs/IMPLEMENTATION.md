# Implementation notes

Status of the Good Country Dashboard as of 2026-07-30 (initial build session).

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

39 countries ranked by the index, each row with rank, 10-year sparkline,
latest value, Δ over the shown years, and the data year. Colombia and the
USA rows are highlighted.

### Data honesty rules (project policy)

- Metrics that approximate the request carry a visible proxy note
  (e.g. business registrations are gross — closures aren't published;
  births estimate stands in for birth-certificate issuance).
- Ranking only compares countries whose latest World Bank market data is
  ≤ 5 years old (27 of 39 as of this session). Countries whose exchanges
  stopped reporting longer ago (France 2018, Norway 2017, Netherlands
  2017, Sweden 2002, Italy 2014, Finland 2004, Portugal 2018, Venezuela
  2002, Ukraine 2018, Paraguay 1999, Uruguay 1996, Ecuador 2000) are
  listed below the ranking, unranked. Rows older than the current data
  year are visually muted; every row shows its data year.
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
- **Data layer** (`lib/data.ts`): World Bank API (multi-country batched
  requests) + keyless FRED CSV endpoint; year-joining and per-year
  aggregation helpers; all series truncated to the last 10 available
  years.

## Deployment

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
