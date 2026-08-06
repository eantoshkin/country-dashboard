# Good Country Dashboard

A public dashboard for the **Country Manifesto (Good Country)** draft. Its
north-star metric implements the manifesto's §10 thesis — politicians should
be judged by the growth of the country's public economy:

> **Good Country Index = (total stock-market capitalization × number of
> public companies) ÷ population**

Live at <https://country-dashboard-omega.vercel.app>.

## What's on it

- **`/`** — Colombia and United States country views (index hero plus six
  underlying metric series with 10-year charts) and a **World ranking** tab
  of 39 countries with sparklines and sortable columns.
- **`/co`** — a Colombia country file: 14 curated laws with per-party records
  where verified (unverified stances are marked, never guessed), editorial
  0–100 index-impact scores, and party scorecards. All judgments carry
  visible model attribution.

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript), fully static with
  daily revalidation — no API keys anywhere.
- [Material Web](https://material-web.dev) components with Material 3 tokens;
  Roboto body copy and Newsreader display type.
- Data from the World Bank API and FRED (keyless CSV); hand-collected
  supplements are marked with † and sourced in the UI.

## Development

```bash
npm run dev    # dev server on :3000
npm run lint   # ESLint
npm test       # unit tests (Vitest)
npm run build  # production build (also type-checks)
```

## Documentation

The real project documentation — data honesty rules, scoring rubric,
architecture, and session history — lives in
[`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md). Read it (and the rest of
`docs/`, which is gitignored as private drafts) before changing anything.

Deploys automatically from `main` to Vercel; single-branch convention.
