"use client";

import { useState } from "react";
import Sparkline from "./Sparkline";
import { fmtCompact, fmtDelta } from "@/lib/format";
import type { RankingEntry } from "@/lib/types";

const FOCUS_CODES = new Set(["COL", "USA"]);

const MAX_AGE_YEARS = 5;

type SortKey = "index" | "delta";

export default function Ranking({ entries }: { entries: RankingEntry[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({
    key: "index",
    dir: -1,
  });
  const withData = entries.filter((e) => e.latest);
  const noData = entries.filter((e) => !e.latest);
  const currentYear = Math.max(...withData.map((e) => e.latest!.year));
  const ranked = withData.filter(
    (e) => e.latest!.year >= currentYear - MAX_AGE_YEARS,
  );
  const outdated = withData.filter(
    (e) => e.latest!.year < currentYear - MAX_AGE_YEARS,
  );

  // Canonical rank always follows the index, whatever the sort shows.
  const rows = ranked.map((entry, i) => {
    const first = entry.points[0];
    const deltaPct =
      first && first.value !== 0
        ? ((entry.latest!.value - first.value) / Math.abs(first.value)) * 100
        : null;
    return { entry, rank: i + 1, deltaPct };
  });
  const sortedRows = [...rows].sort((a, b) => {
    const value = (r: (typeof rows)[number]) =>
      sort.key === "index" ? r.entry.latest!.value : (r.deltaPct ?? -Infinity);
    return (value(b) - value(a)) * (sort.dir === -1 ? 1 : -1);
  });

  const toggleSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === -1 ? 1 : -1 } : { key, dir: -1 },
    );
  const ariaSort = (key: SortKey) =>
    sort.key === key
      ? sort.dir === -1
        ? ("descending" as const)
        : ("ascending" as const)
      : undefined;
  const arrow = (key: SortKey) =>
    sort.key === key ? (sort.dir === -1 ? " ▾" : " ▴") : "";

  return (
    <section className="grid">
      <article className="card card--hero">
        <h2 className="md-typescale-title-medium">
          World ranking — Good Country Index
        </h2>
        <span className="formula-chip md-typescale-label-medium">
          (stock-market capitalization × public companies) ÷ population
        </span>
        <p className="metric-meta md-typescale-label-medium">
          Ranked by the latest published value no older than {MAX_AGE_YEARS}{" "}
          years — the year column shows exactly how fresh each figure is.
          Where the World Bank series stopped years ago, the latest point is
          hand-collected from exchange statistics and marked with †. Should a
          country lose its only credible source, it drops below the ranking,
          unranked. Click the Index or Change headers to sort.
        </p>

        <div className="table-scroll">
          <table className="rank-table">
            <thead>
              <tr className="md-typescale-label-medium">
                <th className="num">#</th>
                <th>Country</th>
                <th className="col-spark">History</th>
                <th className="num" aria-sort={ariaSort("index")}>
                  <button
                    type="button"
                    className="sort-btn"
                    onClick={() => toggleSort("index")}
                  >
                    Index{arrow("index")}
                  </button>
                </th>
                <th className="num col-delta" aria-sort={ariaSort("delta")}>
                  <button
                    type="button"
                    className="sort-btn"
                    onClick={() => toggleSort("delta")}
                  >
                    Change{arrow("delta")}
                  </button>
                </th>
                <th className="num">Data year</th>
              </tr>
            </thead>
            <tbody className="md-typescale-body-medium">
              {sortedRows.map(({ entry, rank }) => (
                <RankingRow
                  key={entry.code}
                  entry={entry}
                  rank={rank}
                  stale={entry.latest!.year < currentYear - 2}
                />
              ))}
              {outdated.length > 0 && (
                <>
                  <tr className="section-row">
                    <td colSpan={6} className="md-typescale-label-medium">
                      Not ranked — last reported more than {MAX_AGE_YEARS} years
                      ago
                    </td>
                  </tr>
                  {outdated.map((e) => (
                    <RankingRow key={e.code} entry={e} rank={null} stale />
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {outdated.some((e) => e.unrankedReason) && (
          <p className="proxy-note md-typescale-label-medium">
            Why some countries can&apos;t be updated:{" "}
            {outdated
              .filter((e) => e.unrankedReason)
              .map((e) => `${e.name} — ${e.unrankedReason}`)
              .join("; ")}
            .
          </p>
        )}
        {ranked.some((e) => e.manualSource) && (
          <p className="proxy-note md-typescale-label-medium">
            † Hand-collected from exchange statistics (non-USD figures at each
            source&apos;s published rate; company counts may include
            growth-market segments, so not strictly comparable with older World
            Bank values):{" "}
            {ranked
              .filter((e) => e.manualSource)
              .map((e) => `${e.name} — ${e.manualSource}`)
              .join("; ")}
            .
          </p>
        )}
        {noData.length > 0 && (
          <p className="proxy-note md-typescale-label-medium">
            No published stock-market data (their exchanges don&apos;t report to
            the World Bank): {noData.map((e) => e.name).join(", ")}.
          </p>
        )}
        <p className="source-line md-typescale-label-small">
          Source: World Bank (CM.MKT.LCAP.CD, CM.MKT.LDOM.NO, SP.POP.TOTL),
          supplemented with exchange statistics where the World Bank series
          stopped
        </p>
      </article>
    </section>
  );
}

function RankingRow({
  entry,
  rank,
  stale,
}: {
  entry: RankingEntry;
  rank: number | null;
  stale: boolean;
}) {
  const first = entry.points[0];
  const latest = entry.latest!;
  const delta = first ? fmtDelta(first.value, latest.value) : null;
  return (
    <tr
      className={[
        stale ? "stale" : "",
        FOCUS_CODES.has(entry.code) ? "row-focus" : "",
      ].join(" ")}
    >
      <td className="num rank-num">{rank ?? "—"}</td>
      <td>{entry.name}</td>
      <td className="spark-cell col-spark">
        <Sparkline points={entry.points} format="index" showRange />
      </td>
      <td className="num value-cell">{fmtCompact(latest.value, "index")}</td>
      <td className="num col-delta">
        {delta ? (
          <>
            <span
              className={`delta-pill ${latest.value >= first!.value ? "pos" : "neg"}`}
            >
              {delta}
            </span>
            <span className="delta-since"> since {first!.year}</span>
          </>
        ) : (
          "—"
        )}
      </td>
      <td className="num">
        {latest.year}
        {entry.manualSource && (
          <span title={entry.manualSource}>&thinsp;†</span>
        )}
      </td>
    </tr>
  );
}
