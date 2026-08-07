import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LawsPerYearChart from "@/components/LawsPerYearChart";

describe("LawsPerYearChart", () => {
  it.each([
    ["empty data", []],
    ["all-partial data", [{ year: 2026, count: 5, partial: true }]],
  ])("renders a safe empty chart for %s", (_, data) => {
    const markup = renderToStaticMarkup(
      createElement(LawsPerYearChart, {
        title: "Laws",
        data,
        bands: [],
        ariaLabel: "Laws chart",
      }),
    );

    expect(markup).toContain('aria-label="Laws chart"');
    expect(markup).not.toContain("NaN");
    expect(markup).not.toContain("Infinity");
  });
});
