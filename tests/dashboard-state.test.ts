import { describe, expect, it } from "vitest";
import {
  DEFAULT_DASHBOARD_STATE,
  readDashboardState,
  writeDashboardState,
} from "@/lib/dashboard-state";

describe("dashboard URL state", () => {
  it("uses the Colombia/index defaults for an empty or invalid query", () => {
    expect(readDashboardState("")).toEqual(DEFAULT_DASHBOARD_STATE);
    expect(readDashboardState("?view=unknown&sort=nope&dir=nope")).toEqual(
      DEFAULT_DASHBOARD_STATE,
    );
  });

  it("parses a shareable ranking view and sort", () => {
    expect(readDashboardState("?view=ranking&sort=change&dir=asc")).toEqual({
      view: "ranking",
      sort: { key: "delta", dir: 1 },
    });
  });

  it("removes dashboard defaults and preserves unrelated parameters", () => {
    expect(
      writeDashboardState("?campaign=civic&view=ranking&sort=change", {
        view: "col",
        sort: { key: "delta", dir: -1 },
      }),
    ).toBe("?campaign=civic");
  });

  it("writes only non-default ranking options", () => {
    expect(
      writeDashboardState("", {
        view: "ranking",
        sort: { key: "index", dir: -1 },
      }),
    ).toBe("?view=ranking");
  });
});
