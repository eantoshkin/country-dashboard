# Implementation notes

Status of the Good Country Dashboard as of **2026-08-06** (evening session).

- **2026-07-30** — initial build; three ranking-data supplement batches covering
  all 39 countries; mobile table fix; color-coded change capsules; sortable
  Index / Change columns; per-row sparkline year ranges; review fixes
  (dark-mode contrast, population vintage).
- **2026-08-06** — new `/co` Colombia page: 14 curated laws with per-party
  votes, editorial index-impact scores, and bench scorecards. Material Web
  redesign (icons, score meters, dividers). Vercel Analytics and Speed
  Insights. Model attribution on every judgment. Scoring rubric revised after
  review to weigh company count and to reject the population denominator's
  perverse incentive.
- **2026-08-06** — editorial UX refresh: warm-paper/navy visual system,
  Newsreader display type, stronger page hierarchy and section navigation,
  compact three-lever methodology, progressive disclosure for law evidence,
  responsive law cards, skip navigation, visible focus states, reduced-motion
  support, and a zero-overflow mobile layout at 390 px.
- **2026-08-06** — brought the homepage and world ranking into the same
  civic-ledger system: manifesto-led opening, ruled tab navigation, split
  index/chart hero, editorial metric grid, and ranking header. Every 0–100 law
  and party scale now marks 50 explicitly and prints the rule: below 50 lowers
  the index, 50 is neutral, and above 50 improves it.
- **2026-08-06 (evening)** — audit-driven improvement pass: Next 16.3.0
  security upgrade, unit tests (Vitest), data-failure resilience, SEO/robots/
  sitemap/status pages, README rewrite, and a pension-re-vote roll-call
  deepening that took verified party coverage from 1 to 2 of 14 laws.
  Details below. A 2× scenario panel was built and then **removed on the
  owner's instruction — do not rebuild it** (see Ideas section).

## Session summary — 2026-08-06 evening: audit and hardening

A full-codebase audit, then incremental fixes. Index formula, source data,
law selection, and editorial scores unchanged (`JUDGED_BY` untouched — the
new pension/budget party data is sourced fact, not model judgment).

### Toolchain and hygiene

- **Next.js 16.2.12 → 16.3.0** (+ `eslint-config-next`), clearing three
  high-severity advisories in Next's bundled `postcss`/`sharp`; `npm audit
  fix` also patched `js-yaml`. Zero vulnerabilities after. Lint, build, and a
  browser pass verified both routes.
- README rewritten (was untouched create-next-app boilerplate); the five
  template SVGs in `public/` deleted; package renamed `app` →
  `country-dashboard`.
- **No GitHub Actions** — the owner doesn't use it, by choice (2026-08-06).
  Verification is local: `npm test`, `npm run lint`, `npm run build`.

### Unit tests (Vitest)

`npm test` runs 31 tests in `tests/`: the formatters, the data-shaping
helpers (`joinYears`, `lastObsPerYear`, `sumPerCompleteYear` — now exported
from `lib/data.ts` for tests), and — most importantly —
the scorecard honesty rules as executable policy: unverified/abstained/split/
absent stances contribute nothing, "All benches" is never a party, filing
counts as a for-vote, the executive is never a voting party, alignment clamps
to 0–100, plus `COLOMBIA_LAWS` integrity checks (unique slugs, score range,
date format, https sources, congress boundary).

### Data-failure resilience

`requireCore()` in `lib/data.ts`: if any of the three index-critical World
Bank series (market cap, listed companies, population) fails, the render now
**throws** instead of rendering "data unavailable" — so a daily ISR
revalidation that hits an outage keeps serving the last good page rather than
caching an empty one for 24 h. Secondary series (FRED, broad money, births)
still degrade per-card. Trade-off, accepted: a fresh build with the World
Bank down fails instead of deploying an empty dashboard.

### SEO and status pages

`lib/site.ts` (canonical origin) + `metadataBase`, Open Graph and Twitter
metadata on both routes; `app/robots.ts`; `app/sitemap.ts`; styled
`not-found.tsx` and `error.tsx` (`.status-page` CSS) in the civic-ledger
look. Verified served: `/robots.txt`, `/sitemap.xml`, the 404 page, and
`og:*` tags in the HTML.

### Roll-call deepening (pension re-vote, budget)

Two research passes over Colombian primary/press sources, same honesty rules:

- **Pension re-vote (28 Jun 2025)** now has bancada-level stances: Infobae
  explicitly names Pacto Histórico, Comunes, Alianza Verde, Partido de la U,
  Liberal and Conservador as backing the text, while Centro Democrático and
  Cambio Radical **boycotted the session** (El Espectador; both denounced
  procedural irregularities). That required a new first-class vote value —
  `absent` ("Did not attend") — because a boycott is neither "against" nor
  "abstained", and it deliberately contributes nothing to scorecards (scoring
  it as opposition would be inference). Tally corrected to the official
  Cámara figures 104–9 (outlets differ: 104–10, 97–0 vs 97–1 — noted in the
  UI). The named 9 "no" votes exist only in Acta 257's Gaceta text
  (referenced via Gaceta 1676/2025 approval record), which is not indexed
  online — the next deepening step if wanted.
- **2026 budget**: re-verified that **no per-party roll call exists** in any
  press or official source — kept unverified, but the party chips now carry
  sourced notes (Centro Democrático's open resistance per Infobae; Liberal/
  Conservador/La U support called decisive by the Pares analysis; rapporteurs
  named) and the aggregate discrepancy is disclosed: the Senate's own release
  says 50–24 where the press reported 50–27.
- Net effect: `lawsWithPartyVotes` is now **2 of 14** (auto-updates in the
  caveat), and the bench scorecards went from 4 to 8 cards — Centro
  Democrático 70 (unchanged; a boycott scores nothing), Pacto Histórico 40,
  Government (Petro) 35, Alianza Verde / Conservador / La U / Comunes 28
  (each on the single pension for-vote, score 28), Liberal 27. Only Cambio
  Radical still holds seats with nothing scoreable. These inherit the
  editorial law scores wholesale, as before.

### MANUAL_LATEST freshness check

Reviewed, deliberately **not** refreshed: the figures were hand-collected
2026-07-30 (one week before this session) from sources dated Dec 2025 – Jun
2026, comfortably within the ≤5-year policy and mostly within months. Next
worthwhile refresh: when FIAB publishes new monthly PDFs meaningfully ahead
of these vintages, or after the World Bank's next series update.

### Post-review fixes (same session)

A review pass over the day's changes produced six follow-up fixes:

- Honest wording where copy implied all 14 laws have per-party votes: README
  and the `/co` Open Graph description now say "per-party votes/records
  **where verified**".
- Canonical URLs: `alternates.canonical` — `/` in the root layout, `/co` on
  the Colombia page (`metadataBase` and Open Graph unchanged).
- The 2026 budget tally now shows the Senate's **official 50–24** rather
  than the press-reported 50–27; the "All benches" note states that choice
  and keeps the discrepancy disclosed.
- Stale "1 of 14" coverage statements in this file updated to 2 of 14
  (bench-scorecards section and the Ideas backlog).
- Tests extended for the new `absent` value: non-scoreable in scorecards,
  not a party vote in `lawsWithPartyVotes`, and an absent-only party counts
  as having no record (now 31 tests).

## End-of-day session summary — 2026-08-06

Today's work was a presentation and accessibility pass; the index formula,
source data, manual supplements, law selection, and editorial scores were not
changed.

- Replaced the generic purple Material-demo appearance with one shared
  editorial civic-ledger system: warm paper surfaces, navy ink, restrained
  Colombian flag accents, flatter ruled layouts, Roboto body copy, and
  Newsreader display typography.
- Rebuilt `/co` around a clear reading order: country header and section
  navigation, split index/method overview, visible model attribution, party
  record, bills in discussion, and passed laws. Long methodology notes and
  per-law vote/source evidence use native `<details>` disclosures to reduce
  visual noise without hiding provenance.
- Rebuilt `/` in the same visual language with a manifesto-led introduction,
  ruled Material tab band, live Colombia country-file link, split index/chart
  panel, editorial metric grid, and a dedicated world-ranking treatment. The
  Colombia, United States, and ranking tab interactions and existing data
  behavior remain intact.
- Added shared `ScoreScale` rendering for all 18 editorial 0–100 scales (14
  laws and 4 party/executive summaries). Every scale has a physical midpoint
  marker and visible text for `< 50 lowers index`, `50 neutral`, and `> 50
  improves index`; icons and words carry the meaning alongside color.
- Added or tightened accessibility behavior: a skip link, visible focus
  states, semantic links and headings, reduced-motion handling, stable
  `aria-labelledby` naming for the `/co` overview even when index data is
  unavailable, and no duplicate accessible label on the visible score key.
- Updated responsive behavior for the overview, metric, party, law, and ranking
  layouts; the browser pass found no horizontal overflow at the tested 390 px
  mobile width. Added light/dark theme colors and corrected the dark-palette
  validation comments to the configured `#101820` surface and container values.
- Verification completed after the final fixes: ESLint passed with zero
  warnings, TypeScript passed through `next build`, the production build
  prerendered `/` and `/co`, `git diff --check` passed, both routes showed no
  browser error overlay or console errors, the law disclosures worked, and all
  homepage tabs changed views correctly.

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

- **Split index panel**: the Good Country Index, latest value, Δ over the shown
  decade, formula and interpretation on the ink panel, plus a 10-year line
  chart and source on the adjoining paper panel.
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

### Colombia country page (`/co`) — session of 2026-08-06

A second route answering the question the index can't: who is doing something
about it. **14 curated laws — 7 passed since 2025, 7 before the new Congress —**
each with how the parties voted, an editorial 0–100 score for how much it moves
the Good Country Index, and per-law sources. English only, like the rest of the
site; the only Spanish retained is identifiers (law numbers, party names,
chamber names), because translating those would make the laws unsearchable
against their sources.

#### Why the data is hand-written

Per-legislator vote data for Colombia's Congress is not machine-readable
anywhere. Checked this session, so it needn't be re-researched:

- `datos.gov.co`'s Senate bill dataset (`feim-cysj`) has title, author, date,
  committee and status — and **no vote or party fields at all**.
- Congreso Visible (Uniandes) publishes aggregate tallies only; its
  `apicongresovisible` subdomain is an unconfigured Laravel default page, not
  an API.
- The roll call itself exists only in **Gaceta del Congreso PDFs**.

So `lib/laws-co.ts` is curated by hand with per-law sources, the same policy as
`MANUAL_LATEST`. **It does not auto-refresh — revisit each legislature.**
Party positions for major votes are obtainable from Colombian press (Infobae,
El Colombiano, senado.gov.co, camara.gov.co) with real digging. Warning when
researching: results are heavily polluted by **Argentina's** own labour and
pension reforms — always confirm the country.

#### Honesty rules applied here

- **A party's stance is never inferred.** Where the roll call wasn't
  verifiable, the party renders as *Not verified* with the tally alone. Ten of
  the thirteen party chips read that way, which is the honest consequence.
- Named members appear only where their individual vote is on the record.
  `brokeRanks` marks anyone who voted against their own party's line — the
  mechanism exists but **no verified instance is in the data yet**, because no
  documented party-line break turned up in the sources consulted.
- Coverage is disclosed: Congress passed ~114 laws in 2025 (about a third
  ceremonial), and the page carries 14 curated entries, not the full record.
- Failed selection is visible too: parties holding seats with nothing scoreable
  are named as unscored rather than given a default.

#### Congress boundary

Legislative elections were 8 March 2026 and the new Congress seated 20 July
2026, so passed laws belong to the 2022–2026 Congress while bills in discussion
belong to 2026–2030, whose party arithmetic differs. Every entry carries its
`congress` period so the two are never conflated.

#### Scoring rubric

The first pass scored almost everything through the market-capitalisation
channel alone. After review the rubric names all three parts of the formula
explicitly, and the page says so:

1. **Market capitalisation** — what listed firms are worth.
2. **Number of public companies** — which grows *from the bottom*: startups and
   small businesses finding investors and eventually listing. A law that only
   lifts the value of existing firms scores lower than one that widens the
   pipeline of new ones. Hence microcredit/seed capital is the highest item on
   the page (70 → 78), mining formalization 65 → 72, and the cancer
   right-to-be-forgotten law 50 → 62 — restoring credit access puts people back
   in the founder pipeline.
3. **Population** — with an explicit anti-perverse-incentive rule. Dividing by
   population means a shrinking country scores better arithmetically.
   **Nothing is scored that way.** A healthy working population grows the
   numerator faster than the denominator, so laws that keep people alive, well
   and economically active score as *raising* the index, and no law is ever
   credited for producing fewer people. The page states this in its own panel.
   Healthcare is represented by Ley 2518 de 2025 (mental health, 60) and the
   health reform filed 21 July 2026 (45); the right-to-food amendment rose
   45 → 55 on the same human-capital reasoning.

Every rendered 0–100 scale uses the shared `components/ScoreScale.tsx`
component. It overlays a visible marker at 50 and prints all three meanings
under the track (`< 50 lowers index`, `50 neutral`, `> 50 improves index`), so
readers do not have to infer the threshold from score-band colors.

#### Attribution

Every judgment on the page is signed. `JUDGED_BY` in `lib/laws-co.ts` is the
single source (model name, model id, vendor, date), rendered in three places: a
dashed panel in the hero naming `Claude Opus 5` / `claude-opus-5` / Anthropic
and the date, a one-line byline under each of the 14 law scores, and a byline on
the bench scorecards. It also states that a different model — or the same one on
another day — would score some of these differently, and that nothing was
reviewed or endorsed by the people and parties named. The **curation** is
attributed too, not just the scores: choosing 14 of ~114 laws was itself a
judgment. Update `JUDGED_BY` whenever the scores are re-made and the whole page
follows.

#### Bench scorecards, and why they're thin

`partyScorecards()` derives a per-bench record from the page's own data: backing
something scored above 50 counts for a bench, below 50 against, opposing is the
mirror, and filing a bill counts the same as voting for it. Unverified stances
contribute nothing. These inherit the editorial scores wholesale — a summary of
a judgment, not an independent measurement — so each card prints its basis
("1 verified vote · 3 bills filed"). As of this session: Centro Democrático 70,
Pacto Histórico 44, Government (Petro) 35, Partido Liberal 25.

**The executive is not a party.** `NON_VOTING_SPONSORS` marks sponsors that hold
no seat and cast no vote — currently `Government (Petro)`. Those get
`isExecutive: true`, render in their own group ("Files bills · holds no seat ·
casts no vote"), and their summary describes an agenda ("What it has filed
here…") rather than a voting record. Add any future non-party sponsor to that set.

**Only 2 of 14** laws have a published per-party record (labor reform, and
the pension re-vote as of the 2026-08-06 evening session), so most of the
section is still bill sponsorship. The section says this in its own caveat
panel and names the parties holding seats with nothing scoreable (now only
Cambio Radical). `lawsWithPartyVotes()` computes the ratio so the caveat can
never drift from the data. **Deepening this means transcribing roll calls out of
Gaceta PDFs by hand, one law at a time** — that is the task if real party
coverage is wanted.

#### Material Web

Following the quick-start guide, `components/material.ts` registers button,
icon, divider, linear-progress and elevation alongside tabs. `/co` is a Server
Component, so `components/MaterialLoader.tsx` performs the client-side
registration import; the md-* tags stream as unknown elements and upgrade in
place. `md-icon` and `md-divider` also get plain CSS defaults in `globals.css`
so they look right before that upgrade — without it, md-icon flashes its
ligature name ("check_circle") as literal text. Icons come from Material Symbols
Outlined via a `<link>`, because **next/font/google does not carry that family**
(`Material_Symbols_Outlined` fails with "Unknown font"). Scores render as
`md-linear-progress` meters rather than flat badges.

Material Web remains the control layer rather than the page aesthetic: tabs,
icons, dividers, and progress indicators are imported individually from the
installed package, following its production quick-start. The surrounding
layout uses an editorial civic-ledger treatment so dense public-policy content
scans as a publication instead of a component gallery.

#### Editorial layout and disclosure

The `/co` page now presents information in a fixed reading order: country and
section navigation, index, the three scoring levers, party evidence, bills in
discussion, then passed laws. Editorial attribution stays visible in every law
card and beside the methodology; longer coverage notes and per-law voting/source
records use native `<details>` disclosure so they remain accessible without
making the page read as a wall of caveats. On mobile the overview, methodology,
party cards, and law grid collapse to one column without horizontal overflow.

#### Ordering and entry points

*In discussion* comes before *Passed* — what Congress is about to do matters
more than what it already did. Within each, laws sort newest first; a year-only
date sorts to the end of its own year, since where it falls within the year
isn't known.

Three routes into `/co`: the filled live-country-file panel beside the tab
strip (always visible, on every tab), the link beneath the Colombia index
chart, and Colombia's name in the world-ranking table. The country-file panel
sits **beside** `md-tabs`, never inside it — a non-tab child shifts
`activeTabIndex` and breaks the
`selected >= countries.length` math that decides which panel renders.

Section anchors `#parties`, `#in-discussion` and `#passed` allow deep links.

#### Analytics

`@vercel/analytics` and `@vercel/speed-insights` are mounted in the root layout.
Both are **no-ops in local dev** — they only report once deployed to Vercel.

#### Contrast

The score bands needed their own tokens (`--score-pos`, `--score-neg`) because
the /co marks sit on lighter backdrops than the delta capsules were validated
against: the tinted pill over `.card`, and the score block on
surface-container-high. Measured on the real rendered DOM, `#0ca30c` fell to
4.18:1 and `#e66767` to 4.44:1 in dark, and `#d03b3b` to 3.80:1 in light. The
page now measures **≥4.92:1 in dark and ≥5.17:1 in light**, using
`#17b317`/`#ea7373` (dark) and `#006300`/`#b3261e`, the Material 3 error colour
(light). As elsewhere, colour never carries meaning alone — every chip prints an
icon and a word, every score prints its number.

#### Gotcha: JSX whitespace

Bit this session four separate times. `<strong>Word.</strong> Text` and
`{expr} word` can render glued together ("Coverage.Congress", "Claude Opus
5assigned", "14laws", "hasa published") even though the source has a real space.
**Use the explicit `{" "}` idiom** — already the convention elsewhere in this
codebase — and check the served HTML, not just the source.

## Architecture

- **Next.js 16** (App Router, TypeScript, Turbopack). The page is fully
  static, revalidated every 24 h; data is fetched server-side with
  `next.revalidate` — no API keys required anywhere.
- **Material Web** (`@material/web` tabs, registered client-side via
  dynamic import) + Material 3 design tokens in `app/globals.css`, light
  and dark schemes, Roboto body copy, and Newsreader display typography.
- **Charts**: hand-rolled SVG (`components/LineChart.tsx`,
  `components/Sparkline.tsx`) with crosshair/dot hover tooltips. Chart
  accent colors were validated for lightness, chroma, and contrast
  against both surfaces: `#173f67` (light) / `#a9c7e5` (dark).
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

- ~~The manifesto's closing note: model how Colombia's index would grow
  under the proposed system (2× economy scenario) and show its ranking
  neighbors before/after.~~ **Rejected 2026-08-06: built, then removed on
  the owner's instruction ("we will never have it"). Do not rebuild.**
- Language toggle (manifesto is in Russian; site is English-only — confirmed
  as the intent on 2026-08-06, so this is optional rather than a gap).
- Alternative index weightings (e.g. log of company count) for
  comparison while the formula is still a draft.
- Deepen `/co` party coverage by transcribing roll calls from Gaceta del
  Congreso PDFs — currently 2 of 14 laws have a per-party record, which is
  what keeps the bench scorecards thin.
- Extend the laws treatment to a second country (`/us`), and convert the
  homepage tabs into real routes if that happens.
