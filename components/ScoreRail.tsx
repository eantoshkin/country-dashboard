import { SCORE_MIXED_MAX, SCORE_MIXED_MIN } from "@/lib/score-band";

/**
 * Flat editorial score scale. The restrained rail keeps the three scoring
 * zones visible without turning every judgment into a dashboard gauge.
 */
export default function ScoreRail({
  value,
  ariaLabel,
}: {
  value: number;
  ariaLabel: string;
}) {
  const score = Math.min(100, Math.max(0, value));

  return (
    <div className="score-rail" role="img" aria-label={ariaLabel}>
      <div
        className="score-rail-track"
        aria-hidden="true"
        style={{
          background: `linear-gradient(90deg, var(--score-neg) 0 ${SCORE_MIXED_MIN}%, var(--md-sys-color-outline) ${SCORE_MIXED_MIN}% ${SCORE_MIXED_MAX}%, var(--score-pos) ${SCORE_MIXED_MAX}% 100%)`,
        }}
      >
        <span
          className="score-rail-marker"
          style={{ left: `clamp(1px, ${score}%, calc(100% - 1px))` }}
        />
      </div>
      <div className="score-rail-scale" aria-hidden="true">
        <span>0</span>
        <span>50 neutral</span>
        <span>100</span>
      </div>
    </div>
  );
}
