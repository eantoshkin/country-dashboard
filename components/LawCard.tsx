import VoteBreakdown from "./VoteBreakdown";
import { JUDGED_BY } from "@/lib/laws-co";
import type { Law } from "@/lib/types";

/** Bands for the editorial score. The number is always printed too. */
function band(score: number): "good" | "mixed" | "poor" {
  if (score >= 60) return "good";
  if (score >= 40) return "mixed";
  return "poor";
}

const BAND = {
  good: { label: "Likely raises the index", icon: "trending_up" },
  mixed: { label: "Neutral or mixed", icon: "trending_flat" },
  poor: { label: "Likely lowers the index", icon: "trending_down" },
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
  const b = band(law.score);

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

      {/* Score meter — the visual anchor of the card. */}
      <div className={`score-block ${b}`}>
        <div className="score-top">
          <md-icon className="score-icon" aria-hidden="true">
            {BAND[b].icon}
          </md-icon>
          <span className="score-label md-typescale-label-medium">
            {BAND[b].label}
          </span>
          <span className="score-num">
            {law.score}
            <span className="score-scale">/100</span>
          </span>
        </div>
        <md-linear-progress
          className="score-meter"
          value={law.score / 100}
          aria-label={`Index impact score ${law.score} out of 100`}
        />
        <p className="score-reason md-typescale-label-medium">
          {law.scoreReason}
        </p>
        <p className="score-by md-typescale-label-small">
          <md-icon aria-hidden="true">smart_toy</md-icon>
          <span>
            Scored by {JUDGED_BY.model} ({JUDGED_BY.vendor}),{" "}
            {JUDGED_BY.dateLabel} — editorial judgment, not measured data.
          </span>
        </p>
      </div>

      <p className="law-summary md-typescale-body-medium">{law.summary}</p>

      <md-divider role="presentation" />

      {law.tally && (
        <p className="law-tally md-typescale-label-medium">
          {law.chamber && <span className="tally-where">{law.chamber}</span>}
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
        {law.sources.map((s, i) => (
          <span key={s.url}>
            {i > 0 && " · "}
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          </span>
        ))}
      </p>
    </article>
  );
}
