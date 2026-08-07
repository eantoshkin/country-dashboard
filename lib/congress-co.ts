import type { SeatSlice } from "@/components/SeatPie";
import type {
  CongressBand,
  YearCount,
} from "@/components/LawsPerYearChart";

/**
 * Seat composition and legislative throughput of Colombia's Congress, per
 * constitutional period. Hand-collected (session of 2026-08-07) with per-figure
 * sources, the same policy as MANUAL_LATEST and COLOMBIA_LAWS — it does NOT
 * auto-refresh; revisit after any CNE recomposition ruling.
 *
 * Seat counts combine BOTH chambers (Senate + Chamber of Representatives), as
 * chosen for the display. Slices are ordered by size, "Others" included, so the
 * two grey groups (CITREP, Others) never sit adjacent in the ring. A party
 * keeps the same color slot across both charts — color follows the entity.
 *
 * 2022-2026: initial 20 July 2022 allocation (not a later recomposition).
 * Senate 108 = 100 national + 2 indigenous + 5 Comunes (2016 peace accord) +
 * 1 statutory runner-up seat (R. Hernández). Chamber 188 includes 16 CITREP
 * victims' seats, 2 Afro seats and the runner-up's VP (M. Castillo).
 * Pacto Histórico's Chamber figure is reported between 25 (own lists) and 28
 * (incl. departmental coalition seats) — 28 is used, per the final tables.
 *
 * 2026-2030: final scrutiny (CNE/Registraduría, 7 July 2026), seated 20 July
 * 2026. The chambers SHRANK to Senate 103 + Chamber 183: Comunes' 5+5
 * guaranteed peace-accord seats expired after two terms, and the party missed
 * the electoral threshold. Pacto Histórico figures include both Opposition
 * Statute runner-up seats (I. Cepeda + VP). "Alianza Verde", "Cambio
 * Radical-ALMA" and the Others' "Ahora Colombia" are coalition lists —
 * intra-coalition splits are not reliably published, so coalition-level
 * figures are shown.
 */
export interface CongressInfo {
  period: "2022-2026" | "2026-2030";
  title: string;
  /** One-line framing under the title: seating date and chamber sizes. */
  subtitle: string;
  /** Combined Senate + Chamber seats, ordered by size. */
  slices: SeatSlice[];
  /**
   * Legislative throughput, one consistent scope per congress: bills FILED
   * during the term, tracked to their outcome (became law / didn't pass).
   * Display strings because "100+" is honest for the new Congress. `note`
   * (not rendered — kept as the record) states exactly what each number
   * covers; incompatible scopes are never blended into one figure.
   */
  stats: {
    filed: string;
    approved: string;
    notPassed: string;
    note: string;
  };
  sources: Array<{ label: string; url: string }>;
}

/**
 * Combined Senate + Chamber seats in the SITTING (2026–2030) Congress, for
 * ordering the bench scorecards: biggest current bench first. Derived from
 * the 2026–2030 research above (small-party figures come from the same
 * per-chamber tables that the chart folds into "Others"). 0 = holds no seat
 * in this Congress. Keys must match the party names used in lib/laws-co.ts.
 */
export const CURRENT_SEATS: Record<string, number> = {
  "Pacto Histórico": 68,
  "Centro Democrático": 47,
  "Partido Liberal": 37,
  "Partido Conservador": 30,
  "Partido de la U": 21,
  "Alianza Verde": 19,
  "Cambio Radical": 19,
  ASI: 2,
  MIRA: 1,
  Comunes: 0,
  "Colombia Justa Libres": 0,
};

/**
 * The two executives the page's laws span, most recent first. `key` matches
 * the sponsor name used in lib/laws-co.ts so a scorecard can be joined on.
 *
 * Petro stats use ONE scope — Orza's per-legislature counts of
 * government-initiative bills via El Tiempo (43+22+27+28 filed, 27+10+8+6
 * approved over the four legislatures; "didn't advance" is the arithmetic
 * complement). Other published tallies use different counting methods and
 * genuinely disagree (El Tiempo's approved-by-origin cuatrienio wrap counts
 * 32 government initiatives approved of 331 total; El País's became-law-
 * that-year framing gives 22 filed / 1 passed for 2025–26; the five flagship
 * social reforms tally is 1 of 5) — never blend them into one figure.
 * Source: https://www.eltiempo.com/politica/congreso/gobierno-petro-termina-con-bajo-indice-de-aprobacion-de-proyectos-en-el-congreso-3565669
 *
 * De la Espriella: inaugurated 7 Aug 2026 (first round 31 May 43.7%, runoff
 * 21 Jun 49.6% vs Cepeda 48.7% — the narrowest margin since runoffs began);
 * zero bills filed — an incoming administration can only file once in office
 * (Valora Analitik, Infobae). Revisit once its agenda lands in Congress.
 */
export interface ExecutiveInfo {
  /** Joins to the scorecard/sponsor name in lib/laws-co.ts. */
  key: string;
  title: string;
  subtitle: string;
  stats: {
    filed: string;
    approved: string;
    notAdvanced: string;
  };
}

export const EXECUTIVES: ExecutiveInfo[] = [
  {
    key: "Government (De la Espriella)",
    title: "De la Espriella government",
    subtitle: "Defensores de la Patria · inaugurated 7 August 2026",
    stats: { filed: "0", approved: "0", notAdvanced: "0" },
  },
  {
    key: "Government (Petro)",
    title: "Petro government",
    subtitle: "Pacto Histórico · 2022–2026",
    stats: { filed: "120", approved: "51", notAdvanced: "69" },
  },
];

/**
 * National laws (leyes de la República) sanctioned per calendar year,
 * 2016–2026. The 2026 value is included as a partial running year through
 * the research date, while 2016–2025 are complete calendar years.
 *
 * Derived from the Senate's official database (secretariasenado.gov.co
 * basedoc): Colombian laws are numbered sequentially with zero gaps
 * (verified across the whole range), so each year's count = last number −
 * first number + 1, with the year boundaries confirmed on the boundary
 * laws' sanction dates. Ranges: 2016 Ley 1772–1821 · 2017 1822–1876 ·
 * 2018 1877–1944 · 2019 1945–2014 · 2020 2015–2074 · 2021 2075–2181 ·
 * 2022 2182–2280 · 2023 2281–2345 · 2024 2346–2443 · 2025 2444–2563.
 * 2024 corroborated by Ofiscal ("98 leyes"), 2025 by the Marco Fiscal via
 * Semana ("120 nuevas leyes"). Press tallies for 2019–2021 run exactly one
 * lower (they count only laws the President personally sanctioned); the
 * numbering-derived counts include all laws bearing the year. Counts span
 * every law type — ordinary, statutory, treaty, honorific, budget.
 * Researched 2026-08-07; append new years manually.
 */
export const LAWS_PER_YEAR: YearCount[] = [
  { year: 2016, count: 50 },
  { year: 2017, count: 55 },
  { year: 2018, count: 68 },
  { year: 2019, count: 70 },
  { year: 2020, count: 60 },
  { year: 2021, count: 107 },
  { year: 2022, count: 99 },
  { year: 2023, count: 65 },
  { year: 2024, count: 98 },
  { year: 2025, count: 120 },
  /* 2026 is a running year: Ley 2564–2620 sanctioned by 7 Aug 2026 (the
     Senate DB indexes through 2615; 2616–2620 confirmed in other official
     sources, numbering is gap-free). Rendered as partial — dashed segment,
     hollow marker — and revised upward as the year advances. */
  { year: 2026, count: 57, partial: true, asOf: "7 Aug 2026" },
];

/**
 * Congress periods over that window. Each Congress seats on 20 July of its
 * election year, so band edges sit mid-year (year + 0.55), which the chart
 * renders honestly: an election-year's laws belong to two congresses.
 */
export const CONGRESS_BANDS: CongressBand[] = [
  { label: "2014–2018", from: 2016, to: 2018.55 },
  { label: "2018–2022 Congress", from: 2018.55, to: 2022.55 },
  { label: "2022–2026 Congress", from: 2022.55, to: 2026.55 },
  { label: "2026–2030", from: 2026.55, to: 2027 },
];

export const CONGRESSES: CongressInfo[] = [
  // Most recent Congress first — the page reads recent → oldest.
  {
    period: "2026-2030",
    title: "2026–2030 Congress",
    subtitle:
      "Seated 20 July 2026 · Senate 103 + Chamber 183 seats — Comunes' guaranteed peace-accord seats expired",
    slices: [
      {
        label: "Pacto Histórico",
        seats: 68,
        slot: 1,
        note: "incl. both Opposition Statute runner-up seats",
      },
      { label: "Centro Democrático", seats: 47, slot: 4 },
      { label: "Partido Liberal", seats: 37, slot: 2 },
      { label: "Partido Conservador", seats: 30, slot: 3 },
      {
        label: "Others",
        seats: 29,
        slot: "other",
        note: "Ahora Colombia 5, Salvación Nacional 5, Demócrata 3, ten small parties & special seats 16",
      },
      { label: "Partido de la U", seats: 21, slot: 7 },
      {
        label: "Alianza Verde",
        seats: 19,
        slot: 6,
        note: "Senate seats via the Alianza por Colombia coalition list",
      },
      { label: "Cambio Radical–ALMA", seats: 19, slot: 5 },
      {
        label: "CITREP peace seats",
        seats: 16,
        slot: "citrep",
        note: "victims' organizations, non-party",
      },
    ],
    stats: {
      filed: "100+",
      approved: "0",
      notPassed: "0",
      note: "Press counted 100+ initiatives in the Congress's first weeks; neither chamber has published a running total yet. No bill has completed passage — the incoming government files its agenda after the 7 August 2026 inauguration.",
    },
    sources: [
      {
        label: "El Nuevo Siglo — avalanche of bills in the first 10 days",
        url: "https://www.elnuevosiglo.com.co/politica/alud-de-proyectos-radicados-en-primeros-10-dias-del-congreso",
      },
      {
        label: "Infobae — Senate 2026–2030 final scrutiny (103 seats)",
        url: "https://www.infobae.com/colombia/2026/07/07/asi-quedo-conformado-el-senado-2026-2030-el-escrutinio-definitivo-fijo-en-103-las-curules-y-reporto-1947-millones-de-votos-validos/",
      },
      {
        label: "Radio Nacional — Chamber of Representatives 2026–2030",
        url: "https://www.radionacional.co/actualidad/politica/camara-de-representantes-2026-2030-asi-quedo-distribuida",
      },
      {
        label: "Wikipedia — 2026 Colombian parliamentary election (full tables)",
        url: "https://es.wikipedia.org/wiki/Elecciones_legislativas_de_Colombia_de_2026",
      },
    ],
  },
  {
    period: "2022-2026",
    title: "2022–2026 Congress",
    subtitle:
      "Seated 20 July 2022 · Senate 108 + Chamber 188 seats, both chambers combined below",
    slices: [
      { label: "Pacto Histórico", seats: 48, slot: 1 },
      { label: "Partido Liberal", seats: 46, slot: 2 },
      { label: "Partido Conservador", seats: 40, slot: 3 },
      { label: "Centro Democrático", seats: 29, slot: 4 },
      {
        label: "Others",
        seats: 29,
        slot: "other",
        note: "MIRA–CJL 5, Liga de Gobernantes 4, indigenous seats 3, Afro seats 2, nine small parties & departmental coalition lists 15",
      },
      { label: "Cambio Radical", seats: 27, slot: 5 },
      {
        label: "Alianza Verde–Centro Esperanza",
        seats: 26,
        slot: 6,
        note: "coalition list; internal split unpublished",
      },
      { label: "Partido de la U", seats: 25, slot: 7 },
      {
        label: "CITREP peace seats",
        seats: 16,
        slot: "citrep",
        note: "victims' organizations, non-party",
      },
      {
        label: "Comunes",
        seats: 10,
        slot: 8,
        note: "guaranteed by the 2016 peace accord",
      },
    ],
    stats: {
      filed: "3,011",
      approved: "344",
      notPassed: "2,667",
      note: "One scope throughout — Orza's cohort tracking of bills FILED in the term (El Colombiano): 644+665+907+795 filed, of which 117+116+100+11 became law. Didn't pass = the arithmetic complement, exact because the Congress ended 20 June 2026 and bills cannot cross congresses, so every filed bill is now law or dead. A different published scope — laws SANCTIONED during the window regardless of filing date — gives ≈320 (El Espectador via Pulzo); the two must never be blended.",
    },
    sources: [
      {
        label: "Wikipedia — 2022 Colombian parliamentary election (full tables)",
        url: "https://en.wikipedia.org/wiki/2022_Colombian_parliamentary_election",
      },
      {
        label: "El Colombiano/Orza — bills filed and approved per legislature",
        url: "https://www.elcolombiano.com/colombia/politica/congresistas-con-mas-leyes-aprobadas-ranking-2022-2026-KB38392181",
      },
      {
        label: "Pulzo/El Espectador — ≈320 laws sanctioned in 2022–2026",
        url: "https://www.pulzo.com/nacion/congreso-de-colombia-resumen-de-leyes-escandalos-y-balance-bajo-el-gobierno-de-gustavo-petro-PP5219734A",
      },
      {
        label: "NTN24 — Senate composition 2022–2026",
        url: "https://www.ntn24.com/noticias-politica/asi-quedo-conformado-por-partidos-politicos-el-senado-de-colombia-610914",
      },
      {
        label: "Infobae — Chamber distribution, March 2022",
        url: "https://www.infobae.com/america/colombia/2022/03/14/esta-seria-la-distribucion-de-la-camara-de-representantes/",
      },
    ],
  },
];
