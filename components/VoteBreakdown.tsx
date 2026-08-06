import type { PartyPosition, PartyVote } from "@/lib/types";

/** Icon + word, so a vote never rides on colour alone. */
const VOTE: Record<PartyVote, { icon: string; label: string }> = {
  for: { icon: "check_circle", label: "For" },
  against: { icon: "cancel", label: "Against" },
  abstained: { icon: "do_not_disturb_on", label: "Abstained" },
  split: { icon: "change_circle", label: "Split" },
  unverified: { icon: "help", label: "Not verified" },
};

export default function VoteBreakdown({
  parties,
  sponsor,
}: {
  parties: PartyPosition[];
  sponsor?: string;
}) {
  if (parties.length === 0) {
    return (
      <p className="vote-empty md-typescale-label-medium">
        <md-icon aria-hidden="true">schedule</md-icon>
        <span>No vote held yet{sponsor ? ` — filed by ${sponsor}` : ""}.</span>
      </p>
    );
  }

  return (
    <div className="vote-list">
      {sponsor && (
        <p className="vote-empty md-typescale-label-medium">
          <md-icon aria-hidden="true">edit_document</md-icon>
          <span>Filed by {sponsor}.</span>
        </p>
      )}
      {parties.map((p) => {
        const v = VOTE[p.vote];
        return (
          <div className="party-row" key={p.party}>
            <div className="party-head">
              <span className={`party-chip ${p.vote}`}>
                <md-icon aria-hidden="true">{v.icon}</md-icon>
                {v.label}
              </span>
              <span className="party-name md-typescale-body-medium">
                {p.party}
              </span>
            </div>

            {p.members && p.members.length > 0 && (
              <ul className="member-list md-typescale-label-medium">
                {p.members.map((m) => (
                  <li
                    key={m.name}
                    className={m.brokeRanks ? "member broke" : "member"}
                  >
                    {m.name} — {m.vote}
                    {m.brokeRanks && (
                      <span className="broke-tag"> broke with party</span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {p.note && (
              <p className="party-note md-typescale-label-medium">{p.note}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
