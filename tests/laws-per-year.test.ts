import { describe, expect, it } from "vitest";
import { summarizeLawsPerYear } from "@/lib/laws-per-year";

describe("summarizeLawsPerYear", () => {
  it("derives the range, peak, partial count, and cutoff from the data", () => {
    const summary = summarizeLawsPerYear([
      { year: 2024, count: 8 },
      { year: 2025, count: 12 },
      { year: 2026, count: 5, partial: true, asOf: "7 Aug 2026" },
    ]);

    expect(summary.yearRange).toBe("2024–2026");
    expect(summary.spokenYearRange).toBe("from 2024 to 2026");
    expect(summary.partialNote).toBe(" (* 2026 to 7 Aug 2026)");
    expect(summary.valueSummary).toContain("8 in 2024");
    expect(summary.valueSummary).toContain("a peak of 12 in 2025");
    expect(summary.valueSummary).toContain(
      "5 so far in the partial year 2026 through 7 Aug 2026",
    );
  });

  it("returns safe copy for empty data", () => {
    expect(summarizeLawsPerYear([]).valueSummary).toBe(
      "no yearly totals available",
    );
  });
});
