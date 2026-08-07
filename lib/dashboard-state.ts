export type DashboardView = "col" | "us" | "ranking";
export type RankingSortKey = "index" | "delta";

export interface RankingSortState {
  key: RankingSortKey;
  dir: 1 | -1;
}

export interface DashboardUrlState {
  view: DashboardView;
  sort: RankingSortState;
}

export const DEFAULT_DASHBOARD_STATE: DashboardUrlState = {
  view: "col",
  sort: { key: "index", dir: -1 },
};

/** Parse only the dashboard-owned query parameters; invalid values are safe defaults. */
export function readDashboardState(search: string): DashboardUrlState {
  const params = new URLSearchParams(search);
  const rawView = params.get("view");
  const view: DashboardView =
    rawView === "us" || rawView === "ranking" ? rawView : "col";

  return {
    view,
    sort: {
      key: params.get("sort") === "change" ? "delta" : "index",
      dir: params.get("dir") === "asc" ? 1 : -1,
    },
  };
}

/**
 * Update dashboard-owned parameters while preserving unrelated query state.
 * Defaults stay out of the URL so the canonical homepage remains `/`.
 */
export function writeDashboardState(
  search: string,
  state: DashboardUrlState,
): string {
  const params = new URLSearchParams(search);

  if (state.view === "col") params.delete("view");
  else params.set("view", state.view);

  if (state.view !== "ranking") {
    params.delete("sort");
    params.delete("dir");
  } else {
    if (state.sort.key === "index") params.delete("sort");
    else params.set("sort", "change");

    if (state.sort.dir === -1) params.delete("dir");
    else params.set("dir", "asc");
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
