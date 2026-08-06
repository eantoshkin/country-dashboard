import { describe, expect, it } from "vitest";
import { joinYears, lastObsPerYear, sumPerCompleteYear } from "@/lib/data";

describe("joinYears", () => {
  it("combines values for years shared by every series", () => {
    const joined = joinYears(
      [
        [
          { year: 2020, value: 10 },
          { year: 2021, value: 20 },
        ],
        [
          { year: 2021, value: 3 },
          { year: 2022, value: 4 },
        ],
      ],
      ([a, b]) => a * b,
    );
    expect(joined).toEqual([{ year: 2021, value: 60 }]);
  });

  it("returns empty when any series is empty (no partial index)", () => {
    expect(joinYears([[{ year: 2021, value: 1 }], []], ([a]) => a)).toEqual([]);
  });

  it("computes the index formula (cap × companies) ÷ population", () => {
    const joined = joinYears(
      [
        [{ year: 2024, value: 1e12 }],
        [{ year: 2024, value: 100 }],
        [{ year: 2024, value: 50e6 }],
      ],
      ([m, c, p]) => (m * c) / p,
    );
    expect(joined[0].value).toBe(2e6);
  });

  it("sorts joined years ascending", () => {
    const joined = joinYears(
      [
        [
          { year: 2022, value: 2 },
          { year: 2020, value: 1 },
        ].sort((a, b) => a.year - b.year),
        [
          { year: 2020, value: 1 },
          { year: 2022, value: 1 },
        ],
      ],
      ([a]) => a,
    );
    expect(joined.map((p) => p.year)).toEqual([2020, 2022]);
  });
});

describe("lastObsPerYear", () => {
  it("keeps the last monthly observation of each year and applies scale", () => {
    const out = lastObsPerYear(
      [
        { year: 2023, month: 1, value: 10 },
        { year: 2023, month: 12, value: 12 },
        { year: 2024, month: 6, value: 15 },
      ],
      2,
    );
    expect(out).toEqual([
      { year: 2023, value: 24 },
      { year: 2024, value: 30 },
    ]);
  });
});

describe("sumPerCompleteYear", () => {
  it("sums only years with all 12 months reported", () => {
    const complete = Array.from({ length: 12 }, (_, i) => ({
      year: 2023,
      month: i + 1,
      value: 100,
    }));
    const partial = Array.from({ length: 7 }, (_, i) => ({
      year: 2024,
      month: i + 1,
      value: 100,
    }));
    const out = sumPerCompleteYear([...complete, ...partial]);
    expect(out).toEqual([{ year: 2023, value: 1200 }]);
  });
});
