"use client";

import LineChart from "./LineChart";
import { fmtCompact, fmtDelta } from "@/lib/format";
import type { MetricSeries } from "@/lib/types";

export default function MetricCard({ series }: { series: MetricSeries }) {
  const { latest, points } = series;
  const first = points[0];
  const delta = latest && first ? fmtDelta(first.value, latest.value) : null;

  return (
    <article className="card">
      <h3 className="md-typescale-title-medium">{series.label}</h3>

      {latest ? (
        <>
          <p className="metric-value md-typescale-display-small">
            {fmtCompact(latest.value, series.format)}
          </p>
          <div className="metric-meta md-typescale-label-medium">
            <span>as of {latest.year}</span>
            {delta && first && (
              <span className="delta-chip">
                {delta} since {first.year}
              </span>
            )}
          </div>
          <LineChart points={points} format={series.format} height={170} />
        </>
      ) : (
        <div className="no-data md-typescale-body-medium">
          Data unavailable for this country
        </div>
      )}

      {series.proxyNote && (
        <p className="proxy-note md-typescale-label-medium">{series.proxyNote}</p>
      )}
      <p className="source-line md-typescale-label-small">
        Source: {series.source}
      </p>
    </article>
  );
}
