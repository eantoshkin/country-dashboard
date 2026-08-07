"use client";

import { useState } from "react";
import Link from "next/link";
import Sparkline from "./Sparkline";
import { fmtCompact, fmtDelta } from "@/lib/format";
import type { RankingSortKey, RankingSortState } from "@/lib/dashboard-state";
import type { RankingEntry } from "@/lib/types";

const FOCUS_CODES = new Set(["COL", "USA"]);

const MAX_AGE_YEARS = 5;

export default function Ranking({
  entries,
  sort,
  onSortChange,
}: {
  entries: RankingEntry[];
  sort: RankingSortState;
  onSortChange: (sort: RankingSortState) => void;
}) {
  const [manualSourcesOpen, setManualSourcesOpen] = useState(false);
  const withData = entries.filter((e) => e.latest);
  const noData = entries.filter((e) => !e.latest);
  const currentYear = Math.max(...withData.map((e) => e.latest!.year));
  const ranked = withData.filter(
    (e) => e.latest!.year >= currentYear - MAX_AGE_YEARS,
  );
  const outdated = withData.filter(
    (e) => e.latest!.year < currentYear - MAX_AGE_YEARS,
  );
  const manualSourceEntries = [...ranked, ...outdated].filter(
    (entry) => entry.manualSource,
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

  const toggleSort = (key: RankingSortKey) =>
    onSortChange(
      sort.key === key
        ? { key, dir: sort.dir === -1 ? 1 : -1 }
        : { key, dir: -1 },
    );
  const ariaSort = (key: RankingSortKey) =>
    sort.key === key
      ? sort.dir === -1
        ? ("descending" as const)
        : ("ascending" as const)
      : undefined;
  const arrow = (key: RankingSortKey) =>
    sort.key === key ? (sort.dir === -1 ? " ▾" : " ▴") : "";

  const showManualSource = (code: string) => {
    setManualSourcesOpen(true);
    window.requestAnimationFrame(() => {
      document
        .getElementById(`manual-source-${code}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  return (
    <section className="ranking-view">
      <article className="ranking-ledger">
        <header className="ranking-heading">
          <p className="dashboard-eyebrow md-typescale-label-medium">
            World comparison
          </p>
          <h2>Good Country Index ranking</h2>
        </header>
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
                  onShowManualSource={showManualSource}
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
                    <RankingRow
                      key={e.code}
                      entry={e}
                      rank={null}
                      stale
                      onShowManualSource={showManualSource}
                    />
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
        {manualSourceEntries.length > 0 && (
          <details
            className="ranking-sources"
            id="manual-supplements"
            open={manualSourcesOpen}
            onToggle={(event) =>
              setManualSourcesOpen(event.currentTarget.open)
            }
          >
            <summary>
              Manual exchange supplements ({manualSourceEntries.length})
            </summary>
            <p className="md-typescale-label-medium">
              Non-USD figures use each source&apos;s published rate. Company
              counts may include growth-market segments, so they are not always
              strictly comparable with older World Bank values.
            </p>
            <ul className="md-typescale-label-medium">
              {manualSourceEntries.map((e) => (
                <li id={`manual-source-${e.code}`} key={e.code}>
                  <strong>{e.name}</strong> — {e.manualSource}
                </li>
              ))}
            </ul>
          </details>
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
  onShowManualSource,
}: {
  entry: RankingEntry;
  rank: number | null;
  stale: boolean;
  onShowManualSource: (code: string) => void;
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
      <td>
        {entry.code === "COL" ? (
          <Link className="row-link" href="/co">
            {entry.name}
          </Link>
        ) : (
          entry.name
        )}
      </td>
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
          <button
            type="button"
            className="manual-marker"
            title={entry.manualSource}
            aria-label={`Show manual source for ${entry.name}`}
            onClick={() => onShowManualSource(entry.code)}
          >
            †
          </button>
        )}
      </td>
    </tr>
  );
}
