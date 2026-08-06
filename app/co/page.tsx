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
    <div className="page">
      <MaterialLoader />

      <header className="masthead co-masthead">
        <div>
          <Link href="/" className="back-btn md-typescale-label-large">
            <md-icon aria-hidden="true">arrow_back</md-icon>
            Good Country Dashboard
          </Link>
          <h1 className="md-typescale-headline-medium">
            Colombia — what Congress is actually doing
          </h1>
          <p className="subtitle md-typescale-body-large">
            The index says how Colombia is doing. This page asks who is doing
            something about it.
          </p>
        </div>
      </header>

      <main>
        <section className="grid">
          <article className="card card--hero co-hero">
            <div className="co-hero-figure">
              <p className="co-hero-label md-typescale-label-medium">
                Good Country Index · Colombia
              </p>
              {hero?.latest ? (
                <>
                  <p className="metric-value hero-value">
                    {fmtCompact(hero.latest.value, hero.format)}
                  </p>
                  <p className="co-hero-year md-typescale-label-medium">
                    as of {hero.latest.year}
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
            </div>

            <div className="co-hero-notes">
              <p className="editorial-note md-typescale-body-medium">
                <md-icon aria-hidden="true">gavel</md-icon>
                <span>
                  <strong>How to read the scores.</strong> Every law carries a
                  0–100 score for how much it plausibly moves this index. The
                  formula has three parts and a law can move any of them:{" "}
                  <strong>market capitalisation</strong>, what listed firms are
                  worth; <strong>the number of public companies</strong>, which
                  grows from the bottom as startups and small businesses find
                  investors and eventually list; and{" "}
                  <strong>population</strong>. A law that only lifts the value
                  of firms that already exist scores lower than one that widens
                  the pipeline of new ones. The score is{" "}
                  <strong>editorial judgment, not measured data</strong>, unlike
                  every other number on this site. Disagree with it freely; each
                  one states its reasoning in a line so there is something
                  specific to disagree with.
                </span>
              </p>
              <p className="editorial-note caveat md-typescale-body-medium">
                <md-icon aria-hidden="true">diversity_3</md-icon>
                <span>
                  <strong>On dividing by population.</strong> Arithmetically, a
                  shrinking country scores better on this index. Nothing here is
                  scored that way. People build, staff and buy from the
                  companies in the numerator, and a healthy working population
                  grows that numerator faster than it grows the denominator — so
                  laws that keep people alive, well and economically active are
                  scored as <em>raising</em> the index. No law is ever credited
                  for producing fewer people.
                </span>
              </p>
              <p className="judged-by md-typescale-label-medium">
                <md-icon aria-hidden="true">smart_toy</md-icon>
                <span>
                  <strong>Who made these calls.</strong> The scores, their
                  reasoning, and the choice of which laws to include are the
                  judgment of <strong>{JUDGED_BY.model}</strong> (
                  {JUDGED_BY.vendor}, model <code>{JUDGED_BY.modelId}</code>),
                  made on {JUDGED_BY.dateLabel}. A different model — or the same
                  one on a different day — would likely score some of these
                  differently. Nothing here was reviewed or endorsed by the
                  people and parties named.
                </span>
              </p>
              <p className="proxy-note md-typescale-label-medium">
                <strong>Coverage.</strong>{" "}
                Congress passed about 114 laws in 2025, roughly a third of them
                ceremonial. This is a set of landmark laws selected by{" "}
                {JUDGED_BY.model}, not the full record. Vote records are
                collected by hand from published
                sources, because no API exposes Colombia&apos;s roll-call votes
                — where a party&apos;s stance could not be verified it is marked{" "}
                <em>Not verified</em> rather than guessed.
              </p>
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
          <h2 className="section-heading md-typescale-title-large">
            <md-icon aria-hidden="true">pending_actions</md-icon>
            In discussion
            <span className="section-count md-typescale-label-medium">
              {inDiscussion.length} bills · 2026–2030 Congress
            </span>
          </h2>
          <p className="section-intro md-typescale-body-medium">
            The new Congress seated on 20 July 2026, so these are early-stage
            bills and none has been voted on yet.
          </p>
          <div className="grid">
            {inDiscussion.map((law) => (
              <LawCard key={law.slug} law={law} />
            ))}
          </div>
        </section>

        <section className="laws-section" id="passed">
          <h2 className="section-heading md-typescale-title-large">
            <md-icon aria-hidden="true">task_alt</md-icon>
            Passed
            <span className="section-count md-typescale-label-medium">
              {passed.length} laws · 2022–2026 Congress
            </span>
          </h2>
          <div className="grid">
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
