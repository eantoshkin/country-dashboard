export default function ScoreScale({
  value,
  ariaLabel,
}: {
  value: number;
  ariaLabel: string;
}) {
  return (
    <div className="score-scale-wrap">
      <div className="score-progress-track">
        <md-linear-progress
          className="score-meter"
          value={value / 100}
          aria-label={ariaLabel}
        />
        <span className="score-threshold-line" aria-hidden="true" />
      </div>
      <div className="score-scale-key">
        <span className="scale-lowers">
          <md-icon aria-hidden="true">trending_down</md-icon>
          <span>
            <strong>&lt; 50</strong> lowers index
          </span>
        </span>
        <span className="scale-neutral">
          <strong>50</strong> neutral
        </span>
        <span className="scale-improves">
          <span>
            <strong>&gt; 50</strong> improves index
          </span>
          <md-icon aria-hidden="true">trending_up</md-icon>
        </span>
      </div>
    </div>
  );
}
