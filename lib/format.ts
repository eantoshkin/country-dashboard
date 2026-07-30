import type { ValueFormat } from "./types";

const STEPS: Array<[number, string]> = [
  [1e12, "T"],
  [1e9, "B"],
  [1e6, "M"],
  [1e3, "K"],
];

function compactNumber(v: number): string {
  const abs = Math.abs(v);
  if (abs < 10_000) {
    return v.toLocaleString("en-US", {
      maximumFractionDigits: Number.isInteger(v) ? 0 : 1,
    });
  }
  for (const [step, suffix] of STEPS) {
    if (abs >= step) {
      const scaled = v / step;
      const digits = Math.abs(scaled) >= 100 ? 0 : Math.abs(scaled) >= 10 ? 1 : 2;
      return `${scaled.toFixed(digits)}${suffix}`;
    }
  }
  return abs >= 100 || Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1);
}

export function fmtCompact(v: number, format: ValueFormat): string {
  switch (format) {
    case "usd":
      return `$${compactNumber(v)}`;
    case "cop":
      return `${compactNumber(v)} COP`;
    default:
      return compactNumber(v);
  }
}

export function fmtFull(v: number, format: ValueFormat): string {
  const n = Math.round(v).toLocaleString("en-US");
  switch (format) {
    case "usd":
      return `$${n}`;
    case "cop":
      return `${n} COP`;
    default:
      return n;
  }
}

export function fmtDelta(first: number, last: number): string | null {
  if (!Number.isFinite(first) || first === 0) return null;
  const pct = ((last - first) / Math.abs(first)) * 100;
  const sign = pct >= 0 ? "+" : "−";
  return `${sign}${Math.abs(pct).toFixed(Math.abs(pct) >= 10 ? 0 : 1)}%`;
}
