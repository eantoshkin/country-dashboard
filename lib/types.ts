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

export interface CountryDashboard {
  code: CountryCode;
  name: string;
  hero: MetricSeries;
  metrics: MetricSeries[];
}
