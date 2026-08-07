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
  JUDGED_BY_FABLE,
  partiesWithoutRecord,
  partyScorecards,
} from "@/lib/laws-co";
import { CONGRESSES } from "@/lib/congress-co";
import type { Law } from "@/lib/types";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Colombia — laws and the Good Country Index",
  description:
    "Landmark laws passed by Colombia's Congress, bills in discussion, and the notable bills that died — with party votes where verified, seat charts for both congresses, and an editorial score for how much each law moves the Good Country Index.",
  alternates: { canonical: "/co" },
  openGraph: {
    title: "Colombia — laws and the Good Country Index",
    description:
      "19 curated laws and bills — passed, in discussion, and declined — with per-party votes where verified, and editorial scores for how much each moves Colombia's Good Country Index.",
    url: "/co",
    siteName: "Good Country Dashboard",
    type: "article",
  },
};

/**
 * Newest first. A year-only date sorts to the end of its own year, since we
 * don't know where in the year it falls and shouldn't pretend otherwise.
 */
function newestFirst(a: Law, b: Law) {
  const key = (d: string) => (d.length === 4 ? `${d}-00-00` : d);
  return key(b.date).localeCompare(key(a.date));
}

function SectionReturn() {
  return (
    <a className="section-return" href="#page-sections">
      Section menu
    </a>
  );
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
  const declined = COLOMBIA_LAWS.filter((l) => l.status === "declined").sort(
    newestFirst,
  );
  const cards = partyScorecards(COLOMBIA_LAWS);
  const unrecorded = partiesWithoutRecord(COLOMBIA_LAWS);

  return (
    <div className="page co-page">
      <MaterialLoader />

      <header className="masthead co-masthead">
        <div className="co-header-topline">
          <Link href="/" className="back-btn md-typescale-label-large">
            Good Country dashboard
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
        </div>
      </header>

      <nav className="co-jump-nav" id="page-sections" aria-label="On this page">
        <a href="#parties">
          <span>01</span> Party record
        </a>
        <a href="#in-discussion">
          <span>02</span> Bills in discussion
        </a>
        <a href="#passed">
          <span>03</span> Laws passed
        </a>
        <a href="#declined">
          <span>04</span> Declined
        </a>
      </nav>

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
            </div>
          </article>

          <div className="judged-by md-typescale-label-medium">
            <span className="judged-by-label">Editorial methodology</span>
            <span>
              <strong>
                Every 0–100 score on this page is editorial judgment by an AI
                model, not measured data.
              </strong>{" "}
              Laws and parties judged and curated by {JUDGED_BY.model},{" "}
              {JUDGED_BY.dateLabel}; the declined bills by{" "}
              {JUDGED_BY_FABLE.model}, {JUDGED_BY_FABLE.dateLabel} (both{" "}
              {JUDGED_BY.vendor}). Nothing here was reviewed or endorsed by the
              people and parties named.
            </span>
          </div>
        </section>

        <PartyScorecards
          cards={cards}
          unrecorded={unrecorded}
          congresses={CONGRESSES}
        />

        <section className="laws-section" id="in-discussion">
          <div className="section-heading-wrap">
            <p className="section-kicker md-typescale-label-medium">
              Legislative pipeline · 02
            </p>
            <h2 className="section-heading md-typescale-title-large">
              Bills in discussion
              <span className="section-count md-typescale-label-medium">
                {inDiscussion.length} · 2026–2030 Congress
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
          <SectionReturn />
        </section>

        <section className="laws-section" id="passed">
          <div className="section-heading-wrap">
            <p className="section-kicker md-typescale-label-medium">
              Legislative record · 03
            </p>
            <h2 className="section-heading md-typescale-title-large">
              Laws passed
              <span className="section-count md-typescale-label-medium">
                {passed.length} · 2022–2026 Congress
              </span>
            </h2>
          </div>
          <div className="grid law-grid">
            {passed.map((law) => (
              <LawCard key={law.slug} law={law} />
            ))}
          </div>
          <SectionReturn />
        </section>

        <section className="laws-section" id="declined">
          <div className="section-heading-wrap">
            <p className="section-kicker md-typescale-label-medium">
              Legislative record · 04
            </p>
            <h2 className="section-heading md-typescale-title-large">
              Bills declined or archived
              <span className="section-count md-typescale-label-medium">
                {declined.length} · 2022–2026 Congress
              </span>
            </h2>
          </div>
          <p className="section-intro md-typescale-body-medium">
            Notable bills that died — archived in committee, expired
            unscheduled, or withdrawn. Most failed bills in Colombia never get
            a floor vote, so several entries have no tally: that is the record,
            not a gap. Scores say how each would have moved the index had it
            passed.
          </p>
          <div className="grid law-grid">
            {declined.map((law) => (
              <LawCard key={law.slug} law={law} />
            ))}
          </div>
          <SectionReturn />
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
