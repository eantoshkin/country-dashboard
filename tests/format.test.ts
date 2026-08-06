import { describe, expect, it } from "vitest";
import { fmtCompact, fmtDelta, fmtFull } from "@/lib/format";

describe("fmtCompact", () => {
  it("keeps small numbers unabbreviated with locale separators", () => {
    expect(fmtCompact(9999, "count")).toBe("9,999");
    expect(fmtCompact(0, "count")).toBe("0");
  });

  it("abbreviates thousands, millions, billions, trillions", () => {
    expect(fmtCompact(52_300, "count")).toBe("52.3K");
    expect(fmtCompact(1_650_000, "count")).toBe("1.65M");
    expect(fmtCompact(3.61e12, "usd")).toBe("$3.61T");
  });

  it("scales precision by magnitude", () => {
    expect(fmtCompact(1.234e9, "count")).toBe("1.23B");
    expect(fmtCompact(12.34e9, "count")).toBe("12.3B");
    expect(fmtCompact(123.4e9, "count")).toBe("123B");
  });

  it("prefixes USD and suffixes COP", () => {
    expect(fmtCompact(5e9, "usd")).toBe("$5.00B");
    expect(fmtCompact(5e9, "cop")).toBe("5.00B COP");
  });

  it("handles negative values", () => {
    expect(fmtCompact(-1_500_000, "count")).toBe("-1.50M");
  });
});

describe("fmtFull", () => {
  it("renders full locale numbers with currency marks", () => {
    expect(fmtFull(1234567.89, "usd")).toBe("$1,234,568");
    expect(fmtFull(1234567.89, "cop")).toBe("1,234,568 COP");
    expect(fmtFull(1234567.89, "count")).toBe("1,234,568");
  });
});

describe("fmtDelta", () => {
  it("formats growth and decline with sign", () => {
    expect(fmtDelta(100, 216)).toBe("+116%");
    expect(fmtDelta(100, 95)).toBe("−5.0%");
  });

  it("uses one decimal below 10% and none above", () => {
    expect(fmtDelta(100, 104.2)).toBe("+4.2%");
    expect(fmtDelta(100, 150)).toBe("+50%");
  });

  it("returns null when the base is zero or not finite", () => {
    expect(fmtDelta(0, 100)).toBeNull();
    expect(fmtDelta(NaN, 100)).toBeNull();
  });

  it("measures against the absolute value of a negative base", () => {
    expect(fmtDelta(-100, -50)).toBe("+50%");
  });
});
