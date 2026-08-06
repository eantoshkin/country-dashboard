export type CountryCode = "COL" | "USA";

export type ValueFormat = "usd" | "cop" | "count" | "index";

export interface YearPoint {
  year: number;
  value: number;
}

export interface MetricSeries {
  id: string;
  label: string;
  format: ValueFormat;
  /** Last ~10 available years, ascending. Empty when no data. */
  points: YearPoint[];
  latest: YearPoint | null;
  /** Honest labeling when the metric is an approximation of what was asked. */
  proxyNote?: string;
  source: string;
}

export interface RankingEntry {
  code: string;
  name: string;
  /** Last ~10 joint years of the index, ascending. Empty when uncomputable. */
  points: YearPoint[];
  latest: YearPoint | null;
  /** Set when the latest point is hand-collected from exchange statistics. */
  manualSource?: string;
  /** Honest reason why no current figure exists for this country. */
  unrankedReason?: string;
}

export interface CountryDashboard {
  code: CountryCode;
  name: string;
  hero: MetricSeries;
  metrics: MetricSeries[];
}

/* ----------------------------- legislation ----------------------------- */

export type LawStatus = "passed" | "in-discussion";

/**
 * "unverified" is a first-class value, not a gap: Colombia's per-legislator
 * roll call lives only in Gaceta del Congreso PDFs, so a party's stance is
 * shown as unverified rather than inferred from its politics.
 */
export type PartyVote =
  | "for"
  | "against"
  | "abstained"
  /** Did not attend the vote (e.g. a bench boycott) — distinct from abstaining while present. */
  | "absent"
  | "split"
  | "unverified";

export interface PartyPosition {
  party: string;
  vote: PartyVote;
  /**
   * Named members whose individual vote is on the record. `brokeRanks` marks
   * someone who voted against their own party's line.
   */
  members?: Array<{
    name: string;
    vote: "for" | "against" | "abstained";
    brokeRanks?: boolean;
  }>;
  /** Caveat shown beside the party, e.g. why its stance stayed unverified. */
  note?: string;
}

export interface Law {
  slug: string;
  /** "Ley 2466 de 2025" — absent while still a bill. */
  lawNumber?: string;
  title: string;
  summary: string;
  status: LawStatus;
  /**
   * Sanction date for laws, filing/last action for bills. Either a full ISO
   * date ("2025-06-25") or a bare year ("2025") when only the year is on the
   * record — rendering never invents a precision the source didn't give.
   */
  date: string;
  congress: "2022-2026" | "2026-2030";
  /** Who filed it — the useful identifier before any vote exists. */
  sponsor?: string;
  /** Sponsor attributed to a single party/entity, for the party scorecard. */
  sponsorParty?: string;
  /** Where the recorded vote happened, e.g. "Senate plenary". */
  chamber?: string;
  tally?: { for: number; against: number; notVoting?: number };
  parties: PartyPosition[];
  /** Editorial judgment, 0-100. NOT measured data — see the page disclaimer. */
  score: number;
  scoreReason: string;
  sources: Array<{ label: string; url: string }>;
}
