import Link from "next/link";
import type { Metadata } from "next";
import LawCard from "@/components/LawCard";
import MaterialLoader from "@/components/MaterialLoader";
import PartyScorecards from "@/components/PartyScorecards";
import { getDashboardData } from "@/lib/data";
import { fmtCompact } from "@/lib/format";
import {
  COLOMBIA_LAWS,
  JUDGED_BY,
  lawsWithPartyVotes,
  partiesWithoutRecord,
  partyScorecards,
} from "@/lib/laws-co";
import type { Law } from "@/lib/types";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Colombia — laws and the Good Country Index",
  description:
    "Landmark laws passed by Colombia's Congress since 2025 and bills now in discussion, with how each party voted and an editorial score for how much each moves the Good Country Index.",
};

/**
 * Newest first. A year-only date sorts to the end of its own year, since we
 * don't know where in the year it falls and shouldn't pretend otherwise.
 */
function newestFirst(a: Law, b: Law) {
  const key = (d: string) => (d.length === 4 ? `${d}-00-00` : d);
  return key(b.date).localeCompare(key(a.date));
}

export default async function ColombiaPage() {
  const countries = await getDashboardData();
  const hero = countries.find((c) => c.code === "COL")?.hero;

  const passed = COLOMBIA_LAWS.filter((l) => l.status === "passed").sort(
    newestFirst,
  );
  const inDiscussion = COLOMBIA_LAWS.filter(
    (l) => l.status === "in-discussion",
  ).sort(newestFirst);
  const cards = partyScorecards(COLOMBIA_LAWS);
  const unrecorded = partiesWithoutRecord(COLOMBIA_LAWS);

  return (
    <div className="page co-page">
      <MaterialLoader />

      <header className="masthead co-masthead">
        <div className="co-header-topline">
          <Link href="/" className="back-btn md-typescale-label-large">
            <md-icon aria-hidden="true">arrow_back</md-icon>
            Dashboard
          </Link>
          <span className="co-edition md-typescale-label-medium">
            Legislative monitor · 2025–2026
          </span>
        </div>
        <div className="co-title-block">
          <p className="co-eyebrow md-typescale-label-medium">
            Colombia · public economy
          </p>
          <h1 className="md-typescale-headline-medium">
            Colombia — what Congress is actually doing
          </h1>
          <p className="subtitle md-typescale-body-large">
            A sourced ledger of the laws that could widen—or narrow—the
            country&apos;s public economy.
          </p>
        </div>
        <nav className="co-jump-nav" aria-label="On this page">
          <a href="#parties">
            <span>01</span> Party record
          </a>
          <a href="#in-discussion">
            <span>02</span> In discussion
          </a>
          <a href="#passed">
            <span>03</span> Passed
          </a>
        </nav>
      </header>

      <main id="main-content">
        <section className="co-overview" aria-labelledby="index-heading">
          <article className="co-hero">
            <div className="co-hero-figure">
              <div className="co-index-heading">
                <p
                  className="co-hero-label md-typescale-label-medium"
                  id="index-heading"
                >
                  Good Country Index
                </p>
                <span className="co-country-code">COL</span>
              </div>
              {hero?.latest ? (
                <>
                  <p className="metric-value hero-value">
                    {fmtCompact(hero.latest.value, hero.format)}
                  </p>
                  <p className="co-hero-year md-typescale-label-medium">
                    Latest comparable value · {hero.latest.year}
                  </p>
                </>
              ) : (
                <div className="no-data md-typescale-body-medium">
                  Index unavailable — a component series is missing
                </div>
              )}
              <span className="formula-chip md-typescale-label-medium">
                (market cap × public companies) ÷ population
              </span>
              <p className="co-index-caption md-typescale-body-medium">
                Higher scores reward both market value and a broad base of
                listed companies—not a single national champion.
              </p>
            </div>

            <div className="co-hero-notes">
              <header className="method-heading">
                <p className="co-eyebrow md-typescale-label-medium">
                  Scoring method
                </p>
                <h2>One score, three economic levers</h2>
                <p className="md-typescale-body-medium">
                  Each law receives a 0–100 directional score. The reasoning is
                  published so the judgment can be challenged.
                </p>
              </header>
              <ol className="lever-list">
                <li>
                  <span>01</span>
                  <div>
                    <strong>Market value</strong>
                    <p>Does it help listed firms become more productive?</p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <strong>Company pipeline</strong>
                    <p>Does it help small firms form, finance, and list?</p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <strong>People</strong>
                    <p>
                      Health and participation count positively; fewer people
                      never earns credit.
                    </p>
                  </div>
                </li>
              </ol>
              <div className="judged-by md-typescale-label-medium">
                <md-icon aria-hidden="true">smart_toy</md-icon>
                <span>
                  <strong>Editorial scores, not measured data.</strong> Judged
                  and curated by {JUDGED_BY.model} ({JUDGED_BY.vendor}),{" "}
                  {JUDGED_BY.dateLabel}. Not reviewed or endorsed by the people
                  and parties named.
                </span>
              </div>
              <details className="method-details">
                <summary>Coverage &amp; methodology notes</summary>
                <div className="method-details-body md-typescale-body-medium">
                  <p>
                    Congress passed about 114 laws in 2025, roughly a third
                    ceremonial. These are landmark laws selected by{" "}
                    {JUDGED_BY.model}, not the full record.
                  </p>
                  <p>
                    Vote records are hand-collected from published sources.
                    Where a party&apos;s stance could not be verified, it is marked{" "}
                    <em>Not verified</em> rather than guessed.
                  </p>
                  <p>
                    Population is never treated as a shortcut: a shrinking
                    country scores better arithmetically, but no law is credited
                    for producing fewer people.
                  </p>
                  <p>
                    Model identifier: <code>{JUDGED_BY.modelId}</code>.
                  </p>
                </div>
              </details>
            </div>
          </article>
        </section>

        <PartyScorecards
          cards={cards}
          unrecorded={unrecorded}
          totalLaws={COLOMBIA_LAWS.length}
          lawsWithRollCall={lawsWithPartyVotes(COLOMBIA_LAWS)}
        />

        <section className="laws-section" id="in-discussion">
          <div className="section-heading-wrap">
            <p className="section-kicker md-typescale-label-medium">
              Legislative pipeline · 02
            </p>
            <h2 className="section-heading md-typescale-title-large">
              In discussion
              <span className="section-count md-typescale-label-medium">
                {inDiscussion.length} bills · 2026–2030 Congress
              </span>
            </h2>
          </div>
          <p className="section-intro md-typescale-body-medium">
            The new Congress seated on 20 July 2026, so these are early-stage
            bills and none has been voted on yet.
          </p>
          <div className="grid law-grid">
            {inDiscussion.map((law) => (
              <LawCard key={law.slug} law={law} />
            ))}
          </div>
        </section>

        <section className="laws-section" id="passed">
          <div className="section-heading-wrap">
            <p className="section-kicker md-typescale-label-medium">
              Legislative record · 03
            </p>
            <h2 className="section-heading md-typescale-title-large">
              Passed
              <span className="section-count md-typescale-label-medium">
                {passed.length} laws · 2022–2026 Congress
              </span>
            </h2>
          </div>
          <div className="grid law-grid">
            {passed.map((law) => (
              <LawCard key={law.slug} law={law} />
            ))}
          </div>
        </section>
      </main>

      <footer className="colophon md-typescale-label-medium">
        Based on the Country Manifesto (Good Country) draft. The index figure
        refreshes daily from the World Bank; the legislation below is
        hand-curated and does not auto-refresh. Built with Material Web.
      </footer>
    </div>
  );
}
