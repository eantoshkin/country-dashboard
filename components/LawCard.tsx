import VoteBreakdown from "./VoteBreakdown";
import ScoreRail from "./ScoreRail";
import type { Law } from "@/lib/types";
import {
  SCORE_MIXED_MAX,
  SCORE_MIXED_MIN,
  scoreBand,
} from "@/lib/score-band";

const BAND = {
  good: { label: "Likely raises the index" },
  mixed: { label: "Neutral or mixed" },
  poor: { label: "Likely lowers the index" },
} as const;

/** Renders "2025" as-is and "2025-06-25" as a full date — no invented precision. */
function fmtDate(date: string): string {
  if (/^\d{4}$/.test(date)) return date;
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function LawCard({ law }: { law: Law }) {
  const b = scoreBand(law.score);

  return (
    <article className={`card law-card band-${b}`}>
      <header className="law-head">
        <div className="law-title">
          {law.lawNumber && (
            <p className="law-number md-typescale-label-small">
              {law.lawNumber}
            </p>
          )}
          <h3 className="md-typescale-title-medium">{law.title}</h3>
          <p className="law-ids md-typescale-label-small">
            <span>{fmtDate(law.date)}</span>
            <span className="dot" aria-hidden="true">
              ·
            </span>
            <span>{law.congress}</span>
          </p>
        </div>
      </header>

      {/* What the bill is, first — the model's judgment of it second. */}
      <p className="law-summary md-typescale-body-medium">{law.summary}</p>

      <div className={`score-block ${b}`}>
        <div className="score-block-head">
          <div>
            <p className="score-kind md-typescale-label-small">
              Editorial impact
            </p>
            <p className="score-label md-typescale-label-medium">
              {BAND[b].label}
            </p>
          </div>
          <p className="score-value" aria-hidden="true">
            <strong>{law.score}</strong><span>/100</span>
          </p>
        </div>
        <ScoreRail
          value={law.score}
          ariaLabel={`Editorial index impact ${law.score} out of 100 — below ${SCORE_MIXED_MIN} lowers the index, ${SCORE_MIXED_MIN} to ${SCORE_MIXED_MAX} is neutral, above ${SCORE_MIXED_MAX} improves it`}
        />
        <p className="score-reason md-typescale-label-medium">
          {law.scoreReason}
        </p>
      </div>

      <details className="law-evidence">
        <summary>
          <span>
            {law.status === "in-discussion"
              ? "Bill record & sources"
              : law.status === "declined"
                ? "What happened & sources"
                : "Voting record & sources"}
          </span>
          <span className="details-toggle" aria-hidden="true"></span>
        </summary>
        <div className="law-evidence-body">
          {law.tally && (
            <p className="law-tally md-typescale-label-medium">
              {law.chamber && (
                <span className="tally-where">{law.chamber}</span>
              )}
              <span className="tally-nums">
                <strong>{law.tally.for}</strong> for ·{" "}
                <strong>{law.tally.against}</strong> against
                {law.tally.notVoting != null && (
                  <> · {law.tally.notVoting} not voting</>
                )}
              </span>
            </p>
          )}

          <VoteBreakdown parties={law.parties} sponsor={law.sponsor} />

          <p className="source-line md-typescale-label-small">
            <strong>Sources</strong>
            {law.sources.map((s) => (
              <a
                href={s.url}
                key={s.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.label}
                <md-icon aria-hidden="true">open_in_new</md-icon>
              </a>
            ))}
          </p>
        </div>
      </details>
    </article>
  );
}
