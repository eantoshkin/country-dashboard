"use client";

import { useRef, useState } from "react";
import { fmtCompact, fmtFull } from "@/lib/format";
import type { ValueFormat, YearPoint } from "@/lib/types";

const VB_W = 600;
const PAD = { top: 10, right: 14, bottom: 24, left: 52 };

interface Props {
  points: YearPoint[];
  format: ValueFormat;
  height?: number;
}

/**
 * Single-series line chart with area fill, recessive grid, and a
 * crosshair + tooltip hover layer. One series per chart, so identity
 * is carried by the card title — no legend needed.
 */
export default function LineChart({ points, format, height = 210 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  if (points.length < 2) return null;

  const vbH = height;
  const plotW = VB_W - PAD.left - PAD.right;
  const plotH = vbH - PAD.top - PAD.bottom;

  const years = points.map((p) => p.year);
  const values = points.map((p) => p.value);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  const span = hi - lo || Math.abs(hi) || 1;
  lo -= span * 0.08;
  hi += span * 0.08;
  if (Math.min(...values) >= 0) lo = Math.max(0, lo);

  const x = (year: number) =>
    PAD.left + ((year - minYear) / (maxYear - minYear || 1)) * plotW;
  const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * plotH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.year).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${x(maxYear).toFixed(1)},${(PAD.top + plotH).toFixed(1)} L${x(minYear).toFixed(1)},${(PAD.top + plotH).toFixed(1)} Z`;

  const yTicks = [lo, (lo + hi) / 2, hi].map((v, i) =>
    i === 0 ? lo + (hi - lo) * 0.02 : i === 2 ? hi - (hi - lo) * 0.02 : v,
  );
  const gridYs = [0, 0.5, 1].map((t) => PAD.top + t * plotH);

  const xTickStep = Math.max(1, Math.ceil(points.length / 5));
  const xTicks = points
    .filter((_, i) => i % xTickStep === 0 || i === points.length - 1)
    .map((p) => p.year);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * VB_W;
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
    <div className="chart-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${vbH}`}
        role="img"
        aria-label={`Chart, ${points.length} years from ${minYear} to ${maxYear}`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {gridYs.map((gy) => (
          <line
            key={gy}
            x1={PAD.left}
            x2={VB_W - PAD.right}
            y1={gy}
            y2={gy}
            stroke="var(--chart-grid)"
            strokeWidth={1}
            strokeDasharray={gy === gridYs[2] ? undefined : "2 4"}
            opacity={0.7}
          />
        ))}
        {yTicks.map((v, i) => (
          <text
            key={i}
            className="chart-axis-text"
            x={PAD.left - 8}
            y={y(v) + 3.5}
            textAnchor="end"
          >
            {fmtCompact(v, format)}
          </text>
        ))}
        {xTicks.map((year) => (
          <text
            key={year}
            className="chart-axis-text"
            x={x(year)}
            y={vbH - 6}
            textAnchor="middle"
          >
            {year}
          </text>
        ))}

        <path d={areaPath} fill="var(--chart-stroke)" opacity={0.1} />
        <path
          d={linePath}
          fill="none"
          stroke="var(--chart-stroke)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {h && (
          <>
            <line
              x1={x(h.year)}
              x2={x(h.year)}
              y1={PAD.top}
              y2={PAD.top + plotH}
              stroke="var(--md-sys-color-outline)"
              strokeWidth={1}
            />
            <circle
              cx={x(h.year)}
              cy={y(h.value)}
              r={4.5}
              fill="var(--chart-stroke)"
              stroke="var(--md-sys-color-surface-container-low)"
              strokeWidth={2}
            />
          </>
        )}
      </svg>

      {h && (
        <div
          className="chart-tooltip md-typescale-label-medium"
          style={{
            left: `${(x(h.year) / VB_W) * 100}%`,
            top: 0,
          }}
        >
          <span className="tt-year">{h.year}</span>{" "}
          <span>{fmtFull(h.value, format)}</span>
        </div>
      )}
    </div>
  );
}
