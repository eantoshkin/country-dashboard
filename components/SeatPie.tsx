/**
 * Seat-composition donut for one congress. Pure SVG, no chart library, like
 * the rest of the site's charts.
 *
 * Identity is never color-alone: the SVG is decorative (aria-hidden) and the
 * adjacent legend prints every party's name and seat count as real text —
 * which also satisfies the palette's light-mode contrast relief rule. Colors
 * come from the fixed --viz-* slots; a party keeps its slot across both
 * congress charts so a color always means the same party.
 */
const C = 110;
const R_OUTER = 100;
const R_INNER = 60;

export interface SeatSlice {
  label: string;
  seats: number;
  /**
   * Fixed palette slot 1–8, "citrep" for the non-party peace seats, or
   * "other" for the folded remainder of small parties.
   */
  slot: number | "citrep" | "other";
  /** Optional disclosure, e.g. which small parties "Others" contains. */
  note?: string;
}

function point(radius: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [
    +(C + radius * Math.sin(rad)).toFixed(2),
    +(C - radius * Math.cos(rad)).toFixed(2),
  ];
}

/** Annular sector from a1 to a2 degrees, clockwise from 12 o'clock. */
function sector(a1: number, a2: number): string {
  const [ox1, oy1] = point(R_OUTER, a1);
  const [ox2, oy2] = point(R_OUTER, a2);
  const [ix1, iy1] = point(R_INNER, a1);
  const [ix2, iy2] = point(R_INNER, a2);
  const large = a2 - a1 > 180 ? 1 : 0;
  return [
    `M ${ox1} ${oy1}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${large} 1 ${ox2} ${oy2}`,
    `L ${ix2} ${iy2}`,
    `A ${R_INNER} ${R_INNER} 0 ${large} 0 ${ix1} ${iy1}`,
    "Z",
  ].join(" ");
}

/** Cumulative start/end angles for each slice — pure, no reassignment in render. */
function slicePaths(slices: SeatSlice[], total: number) {
  let angle = 0;
  return slices.map((s) => {
    const from = angle;
    angle += (s.seats / total) * 360;
    return {
      d: sector(from, angle),
      cls: `viz-${s.slot}`,
      key: s.label,
    };
  });
}

export default function SeatPie({ slices }: { slices: SeatSlice[] }) {
  const total = slices.reduce((s, x) => s + x.seats, 0);
  const paths = slicePaths(slices, total);
  const notes = slices.filter((slice) => slice.note);

  return (
    <figure className="seat-pie">
      <svg viewBox="0 0 220 220" aria-hidden="true">
        {paths.map((p) => (
          <path key={p.key} className={`pie-slice ${p.cls}`} d={p.d} />
        ))}
        <text className="pie-total" x={C} y={C - 6} textAnchor="middle">
          {total}
        </text>
        <text className="pie-total-label" x={C} y={C + 16} textAnchor="middle">
          seats
        </text>
      </svg>
      <figcaption>
        <ul className="pie-legend">
          {slices.map((s) => (
            <li key={s.label}>
              <span
                className={`legend-swatch viz-${s.slot}`}
                aria-hidden="true"
              />
              <span className="legend-label">
                {s.label}
                {s.note && (
                  <span className="legend-note md-typescale-label-small">
                    {" "}
                    {s.note}
                  </span>
                )}
              </span>
              <span className="legend-count">
                {s.seats}
                <span className="legend-pct">
                  {" "}
                  · {Math.round((s.seats / total) * 100)}%
                </span>
              </span>
            </li>
          ))}
        </ul>
        {notes.length > 0 && (
          <details className="seat-notes">
            <summary>Seat details</summary>
            <ul>
              {notes.map((slice) => (
                <li key={slice.label}>
                  <strong>{slice.label}:</strong> {slice.note}
                </li>
              ))}
            </ul>
          </details>
        )}
      </figcaption>
    </figure>
  );
}
