import type { PartyScorecard } from "@/lib/laws-co";
import {
  CONGRESS_BANDS,
  CURRENT_SEATS,
  EXECUTIVES,
  LAWS_PER_YEAR,
  type CongressInfo,
} from "@/lib/congress-co";
import {
  SCORE_MIXED_MAX,
  SCORE_MIXED_MIN,
  scoreBand,
} from "@/lib/score-band";
import { summarizeLawsPerYear } from "@/lib/laws-per-year";
import ScoreRail from "./ScoreRail";
import SeatPie from "./SeatPie";
import LawsPerYearChart from "./LawsPerYearChart";

const VERDICT = {
  good: "Favors the index",
  mixed: "Mixed record",
  poor: "Works against the index",
} as const;

function countLabel(c: PartyScorecard): string {
  const parts: string[] = [];
  if (c.votesCounted)
    parts.push(`${c.votesCounted} verified vote${c.votesCounted > 1 ? "s" : ""}`);
  if (c.billsFiled)
    parts.push(`${c.billsFiled} bill${c.billsFiled > 1 ? "s" : ""} filed`);
  return parts.join(" · ");
}

function Card({ c }: { c: PartyScorecard }) {
  const b = scoreBand(c.alignment);
  return (
    <article className={`card party-card band-${b}`}>
      <div className="party-card-head">
        <h3 className="md-typescale-title-medium">{c.party}</h3>
        <p className="score-value" aria-hidden="true">
          <strong>{c.alignment}</strong><span>/100</span>
        </p>
      </div>
      <p className="score-kind md-typescale-label-small">
        Editorial alignment
      </p>
      <ScoreRail
        value={c.alignment}
        ariaLabel={`${c.party} editorial alignment ${c.alignment} out of 100 — below ${SCORE_MIXED_MIN} works against the index, ${SCORE_MIXED_MIN} to ${SCORE_MIXED_MAX} is neutral, above ${SCORE_MIXED_MAX} works for it`}
      />
      <div className="party-card-meta md-typescale-label-small">
        <span className="party-record-count">{countLabel(c)}</span>
        <span className={`score-verdict ${b}`}>{VERDICT[b]}</span>
      </div>
      <p className="party-summary md-typescale-body-medium">{c.summary}</p>
    </article>
  );
}

export default function PartyScorecards({
  cards,
  unrecorded,
  congresses,
}: {
  cards: PartyScorecard[];
  unrecorded: string[];
  congresses: CongressInfo[];
}) {
  const lawsSummary = summarizeLawsPerYear(LAWS_PER_YEAR);
  // Benches ordered by how many seats they hold in the sitting Congress —
  // biggest current bench first; parties with no seat today go last.
  const parties = cards
    .filter((c) => !c.isExecutive)
    .sort(
      (a, b) =>
        (CURRENT_SEATS[b.party] ?? 0) - (CURRENT_SEATS[a.party] ?? 0) ||
        a.party.localeCompare(b.party),
    );
  const executive = cards.filter((c) => c.isExecutive);

  return (
    <section className="laws-section" id="parties">
      <div className="section-heading-wrap">
        <p className="section-kicker md-typescale-label-medium">
          Party record · 01
        </p>
        <h2 className="section-heading md-typescale-title-large">
          Where each bench stands
        </h2>
      </div>

      <h3 className="group-heading md-typescale-title-medium">
        Seats in Congress
        <span className="group-note md-typescale-label-medium">
          Senate + Chamber combined · CITREP peace seats are non-party
        </span>
      </h3>
      <div className="congress-grid">
        {congresses.map((c) => (
          <article className="congress-card" key={c.period}>
            <h3>{c.title}</h3>
            <p className="congress-period-note md-typescale-body-medium">
              {c.subtitle}
            </p>
            <md-divider></md-divider>
            <dl className="congress-stats">
              <div>
                <dt>Bills filed</dt>
                <dd>{c.stats.filed}</dd>
              </div>
              <div>
                <dt>Became law</dt>
                <dd>{c.stats.approved}</dd>
              </div>
              <div>
                <dt>Didn&apos;t pass</dt>
                <dd>{c.stats.notPassed}</dd>
              </div>
            </dl>
            <md-divider></md-divider>
            <SeatPie slices={c.slices} />
          </article>
        ))}

        <LawsPerYearChart
          title={`Laws sanctioned per year · ${lawsSummary.yearRange}${lawsSummary.partialNote}`}
          data={LAWS_PER_YEAR}
          bands={CONGRESS_BANDS}
          ariaLabel={`Area chart of national laws sanctioned per year ${lawsSummary.spokenYearRange}, with ${lawsSummary.valueSummary}, and the 2014–2018, 2018–2022, 2022–2026 and 2026–2030 Congress periods marked on the timeline`}
        />
      </div>

      <h3 className="group-heading md-typescale-title-medium">Parties</h3>
      <div className="party-grid">
        {parties.map((c) => (
          <Card key={c.party} c={c} />
        ))}
      </div>

      <h3 className="group-heading md-typescale-title-medium">
        The executive
        <span className="group-note md-typescale-label-medium">
          Files bills · holds no seat · casts no vote
        </span>
      </h3>
      <div className="party-grid executive-grid">
        {EXECUTIVES.map((e) => {
          const sc = executive.find((c) => c.party === e.key);
          const b = sc ? scoreBand(sc.alignment) : "mixed";
          return (
            <article className={`card party-card band-${b}`} key={e.key}>
              <div className="party-card-head">
                <h3 className="md-typescale-title-medium">{e.title}</h3>
                {sc && (
                  <p className="score-value" aria-hidden="true">
                    <strong>{sc.alignment}</strong><span>/100</span>
                  </p>
                )}
              </div>
              {sc && (
                <>
                  <p className="score-kind md-typescale-label-small">
                    Editorial alignment
                  </p>
                  <ScoreRail
                    value={sc.alignment}
                    ariaLabel={`${e.title} editorial alignment ${sc.alignment} out of 100 — below ${SCORE_MIXED_MIN} works against the index, ${SCORE_MIXED_MIN} to ${SCORE_MIXED_MAX} is neutral, above ${SCORE_MIXED_MAX} works for it`}
                  />
                </>
              )}
              <p className="party-basis md-typescale-label-small">
                {e.subtitle}
              </p>
              <md-divider></md-divider>
              <dl className="congress-stats">
                <div>
                  <dt>Bills filed</dt>
                  <dd>{e.stats.filed}</dd>
                </div>
                <div>
                  <dt>Became law</dt>
                  <dd>{e.stats.approved}</dd>
                </div>
                <div>
                  <dt>Didn&apos;t pass</dt>
                  <dd>{e.stats.notAdvanced}</dd>
                </div>
              </dl>
              <md-divider></md-divider>
              <p className="party-summary md-typescale-body-medium">
                {sc
                  ? sc.summary
                  : "Nothing to score yet — a new administration can only file bills once in office, and its agenda reaches Congress in the weeks after inauguration."}
              </p>
            </article>
          );
        })}
      </div>

      {unrecorded.length > 0 && (
        <p className="proxy-note md-typescale-label-medium">
          Holding seats but not scored, because nothing they did on these laws
          is on the published record: {unrecorded.join(", ")}.
        </p>
      )}

      <a className="section-return" href="#page-sections">
        Section menu
      </a>
    </section>
  );
}
