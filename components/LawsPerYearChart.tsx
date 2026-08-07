/**
 * Laws sanctioned per year as an area chart, with the congress periods
 * banded on the same timeline. Pure SVG like the site's other charts;
 * identity never rides on color alone — every point prints its value and
 * every band its label.
 *
 * Congress boundaries fall on 20 July of an election year, so band edges sit
 * mid-year (x = year + 0.55) rather than between points — that is the honest
 * geometry: an election-year's laws belong to two congresses.
 *
 * A `partial` final point (a running year) renders as a dashed segment and a
 * hollow marker, and the area fill stops at the last complete year, so a
 * year in progress never reads as a collapse.
 */
export interface YearCount {
  year: number;
  count: number;
  /** True for a running year — counted only up to the research date. */
  partial?: boolean;
  /** Human-readable cutoff for a running year. */
  asOf?: string;
}

export interface CongressBand {
  label: string;
  /** Fractional years, e.g. 2018.55 for a 20 July boundary. */
  from: number;
  to: number;
}

const W = 720;
const H = 240;
const M = { top: 34, right: 12, bottom: 26, left: 12 };
/** Bands narrower than this get an edge-anchored label instead of a centered one. */
const NARROW_BAND = 90;

export default function LawsPerYearChart({
  title,
  data,
  bands,
  ariaLabel,
}: {
  title: string;
  data: YearCount[];
  bands: CongressBand[];
  ariaLabel: string;
}) {
  const full = data.filter((d) => !d.partial);

  if (data.length === 0 || full.length === 0) {
    return (
      <figure className="laws-year-chart">
        <p className="chart-title md-typescale-label-medium">
          <md-icon aria-hidden="true">show_chart</md-icon>
          {title}
        </p>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} />
      </figure>
    );
  }

  const years = data.map((d) => d.year);
  const min = Math.min(...years);
  const max = Math.max(...years);
  const innerW = W - M.left - M.right;
  const innerH = H - M.top - M.bottom;
  /** Domain runs half a year past each end so every point has room. */
  const x = (v: number) => M.left + ((v - min + 0.5) / (max - min + 1)) * innerW;
  const peak = Math.max(...data.map((d) => d.count));
  const y = (v: number) => M.top + innerH - (v / peak) * innerH;
  const baseline = M.top + innerH;

  const partialTail = data.filter((d) => d.partial);
  const pts = (list: YearCount[]) =>
    list.map((d) => `${x(d.year).toFixed(1)},${y(d.count).toFixed(1)}`).join(" ");
  const lastFull = full[full.length - 1];
  const area = `M ${x(full[0].year).toFixed(1)} ${baseline} L ${pts(full)} L ${x(
    lastFull.year,
  ).toFixed(1)} ${baseline} Z`;

  return (
    <figure className="laws-year-chart">
      <p className="chart-title md-typescale-label-medium">
        <md-icon aria-hidden="true">show_chart</md-icon>
        {title}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
        {bands.map((b, i) => {
          const x1 = Math.max(M.left, x(b.from - 0.5));
          const x2 = Math.min(W - M.right, x(b.to - 0.5));
          const narrow = x2 - x1 < NARROW_BAND;
          return (
            <g key={b.label}>
              <rect
                className={`band-fill ${i % 2 ? "band-alt" : ""}`}
                x={x1}
                y={M.top - 22}
                width={x2 - x1}
                height={innerH + 22}
              />
              <line
                className="band-edge"
                x1={x1}
                y1={M.top - 22}
                x2={x1}
                y2={baseline}
              />
              <text
                className="band-label"
                x={narrow ? x2 : (x1 + x2) / 2}
                y={M.top - 9}
                textAnchor={narrow ? "end" : "middle"}
              >
                {b.label}
              </text>
            </g>
          );
        })}
        <line
          className="chart-baseline"
          x1={M.left}
          y1={baseline}
          x2={W - M.right}
          y2={baseline}
        />
        <path className="area-fill" d={area} />
        <polyline className="area-line" points={pts(full)} />
        {partialTail.length > 0 && (
          <polyline
            className="area-line area-line-partial"
            points={pts([lastFull, ...partialTail])}
          />
        )}
        {data.map((d) => (
          <g key={d.year}>
            <circle
              className={`area-dot ${d.partial ? "area-dot-partial" : ""}`}
              cx={x(d.year)}
              cy={y(d.count)}
              r="4"
            />
            {/* A peak label would collide with the band-label strip — drop it
                below its dot instead. */}
            <text
              className="point-value"
              x={x(d.year)}
              y={y(d.count) < M.top + 16 ? y(d.count) + 22 : y(d.count) - 10}
              textAnchor="middle"
            >
              {d.count}
            </text>
            <text
              className="point-year"
              x={x(d.year)}
              y={baseline + 17}
              textAnchor="middle"
            >
              {d.partial ? `${d.year}*` : d.year}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
