import { JUDGED_BY, type PartyScorecard } from "@/lib/laws-co";

function band(v: number): "good" | "mixed" | "poor" {
  if (v >= 60) return "good";
  if (v >= 40) return "mixed";
  return "poor";
}

const ICON = {
  good: "trending_up",
  mixed: "trending_flat",
  poor: "trending_down",
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
  const b = band(c.alignment);
  return (
    <article className={`card party-card band-${b}`}>
      <div className="party-card-head">
        <h3 className="md-typescale-title-medium">{c.party}</h3>
        <span className={`score-num ${b}`}>
          {c.alignment}
          <span className="score-scale">/100</span>
        </span>
      </div>
      <md-linear-progress
        className="score-meter"
        value={c.alignment / 100}
        aria-label={`${c.party} alignment ${c.alignment} out of 100`}
      />
      <p className="party-basis md-typescale-label-small">
        <md-icon aria-hidden="true">{ICON[b]}</md-icon>
        {countLabel(c)}
      </p>
      <p className="party-summary md-typescale-body-medium">{c.summary}</p>
    </article>
  );
}

export default function PartyScorecards({
  cards,
  unrecorded,
  totalLaws,
  lawsWithRollCall,
}: {
  cards: PartyScorecard[];
  unrecorded: string[];
  totalLaws: number;
  lawsWithRollCall: number;
}) {
  const parties = cards.filter((c) => !c.isExecutive);
  const executive = cards.filter((c) => c.isExecutive);

  return (
    <section className="laws-section" id="parties">
      <h2 className="section-heading md-typescale-title-large">
        <md-icon aria-hidden="true">groups</md-icon>
        Where each bench stands
      </h2>

      <p className="section-intro md-typescale-body-medium">
        Backing something scored above 50 counts for a bench, backing something
        below 50 counts against, and opposing is the mirror. Filing a bill
        counts the same as voting for it. The arithmetic is mechanical, but it
        runs entirely on the scores {JUDGED_BY.model} assigned below — so this
        is a summary of a model&apos;s judgment, not an independent measurement.
      </p>

      <p className="editorial-note caveat md-typescale-body-medium">
        <md-icon aria-hidden="true">warning</md-icon>
        <span>
          <strong>Why so few benches.</strong> Only {lawsWithRollCall} of the{" "}
          {totalLaws}{" "}
          laws here {lawsWithRollCall === 1 ? "has" : "have"}{" "}
          a published per-party roll call, because
          Colombia&apos;s vote records live in Gaceta PDFs rather than any
          machine-readable source. So this is mostly a record of what each bench{" "}
          <em>files</em>, not how it votes, and several parties holding seats
          appear below with nothing scoreable at all. Read it as a fragment of
          the picture, not the picture.
        </span>
      </p>

      <h3 className="group-heading md-typescale-title-medium">Parties</h3>
      <div className="party-grid">
        {parties.map((c) => (
          <Card key={c.party} c={c} />
        ))}
      </div>

      {executive.length > 0 && (
        <>
          <h3 className="group-heading md-typescale-title-medium">
            The executive
            <span className="group-note md-typescale-label-medium">
              Files bills · holds no seat · casts no vote
            </span>
          </h3>
          <div className="party-grid">
            {executive.map((c) => (
              <Card key={c.party} c={c} />
            ))}
          </div>
        </>
      )}

      {unrecorded.length > 0 && (
        <p className="proxy-note md-typescale-label-medium">
          Holding seats but not scored, because nothing they did on these laws
          is on the published record: {unrecorded.join(", ")}.
        </p>
      )}

      <p className="judged-by md-typescale-label-medium">
        <md-icon aria-hidden="true">smart_toy</md-icon>
        <span>
          Scores by {JUDGED_BY.model} ({JUDGED_BY.vendor}),{" "}
          {JUDGED_BY.dateLabel}. Not reviewed or endorsed by the benches named.
        </span>
      </p>
    </section>
  );
}
