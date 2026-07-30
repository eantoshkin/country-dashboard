"use client";

import Sparkline from "./Sparkline";
import { fmtCompact, fmtDelta } from "@/lib/format";
import type { RankingEntry } from "@/lib/types";

const FOCUS_CODES = new Set(["COL", "USA"]);

const MAX_AGE_YEARS = 5;

export default function Ranking({ entries }: { entries: RankingEntry[] }) {
  const withData = entries.filter((e) => e.latest);
  const noData = entries.filter((e) => !e.latest);
  const currentYear = Math.max(...withData.map((e) => e.latest!.year));
  const ranked = withData.filter(
    (e) => e.latest!.year >= currentYear - MAX_AGE_YEARS,
  );
  const outdated = withData.filter(
    (e) => e.latest!.year < currentYear - MAX_AGE_YEARS,
  );

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
          Countries whose exchanges stopped reporting to the World Bank longer
          ago are listed below the ranking, unranked, because decades-old
          dollar values can&apos;t be compared fairly.
        </p>

        <div className="table-scroll">
          <table className="rank-table">
            <thead>
              <tr className="md-typescale-label-medium">
                <th className="num">#</th>
                <th>Country</th>
                <th>Last 10 years</th>
                <th className="num">Index</th>
                <th className="num">Δ over shown years</th>
                <th className="num">Data year</th>
              </tr>
            </thead>
            <tbody className="md-typescale-body-medium">
              {ranked.map((e, i) => (
                <RankingRow
                  key={e.code}
                  entry={e}
                  rank={i + 1}
                  stale={e.latest!.year < currentYear - 2}
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

        {noData.length > 0 && (
          <p className="proxy-note md-typescale-label-medium">
            No published stock-market data (their exchanges don&apos;t report to
            the World Bank): {noData.map((e) => e.name).join(", ")}.
          </p>
        )}
        <p className="source-line md-typescale-label-small">
          Source: World Bank (CM.MKT.LCAP.CD, CM.MKT.LDOM.NO, SP.POP.TOTL)
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
      <td className="spark-cell">
        <Sparkline points={entry.points} format="index" />
      </td>
      <td className="num value-cell">{fmtCompact(latest.value, "index")}</td>
      <td className="num">{delta ?? "—"}</td>
      <td className="num">{latest.year}</td>
    </tr>
  );
}
