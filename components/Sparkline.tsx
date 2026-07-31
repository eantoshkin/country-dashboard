"use client";

import { useRef, useState } from "react";
import { fmtCompact } from "@/lib/format";
import type { ValueFormat, YearPoint } from "@/lib/types";

const W = 150;
const H = 40;
const PAD = 4;

/** Tiny inline trend chart for table rows: 2px line, hover dot + tooltip. */
export default function Sparkline({
  points,
  format,
  showRange = false,
}: {
  points: YearPoint[];
  format: ValueFormat;
  /** Render the first/last year under the line, like a mini axis. */
  showRange?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  if (points.length < 2) return null;

  const years = points.map((p) => p.year);
  const values = points.map((p) => p.value);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || Math.abs(hi) || 1;

  const x = (year: number) =>
    PAD + ((year - minYear) / (maxYear - minYear || 1)) * (W - PAD * 2);
  const y = (v: number) => PAD + (1 - (v - lo) / span) * (H - PAD * 2);

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.year).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join(" ");

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestDist = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(x(p.year) - px);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setHover(best);
  };

  const h = hover != null ? points[hover] : null;

  return (
    <div className="spark-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Index trend ${minYear}–${maxYear}`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <path
          d={path}
          fill="none"
          stroke="var(--chart-stroke)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {h && (
          <circle
            cx={x(h.year)}
            cy={y(h.value)}
            r={4}
            fill="var(--chart-stroke)"
            stroke="var(--md-sys-color-surface-container-low)"
            strokeWidth={2}
          />
        )}
      </svg>
      {h && (
        <div
          className="chart-tooltip md-typescale-label-medium"
          style={{ left: `${(x(h.year) / W) * 100}%`, bottom: "100%" }}
        >
          <span className="tt-year">{h.year}</span>{" "}
          <span>{fmtCompact(h.value, format)}</span>
        </div>
      )}
      {showRange && (
        <div className="spark-range" aria-hidden="true">
          <span>{minYear}</span>
          <span>{maxYear}</span>
        </div>
      )}
    </div>
  );
}
