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
