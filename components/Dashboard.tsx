"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LineChart from "./LineChart";
import MetricCard from "./MetricCard";
import Ranking from "./Ranking";
import { fmtCompact, fmtDelta } from "@/lib/format";
import type { CountryDashboard, RankingEntry } from "@/lib/types";

export default function Dashboard({
  countries,
  ranking,
}: {
  countries: CountryDashboard[];
  ranking: RankingEntry[];
}) {
  const [selected, setSelected] = useState(0);
  const tabsRef = useRef<HTMLElement & { activeTabIndex: number }>(null);

  useEffect(() => {
    import("./material");
  }, []);

  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    const onChange = () => setSelected(tabs.activeTabIndex);
    tabs.addEventListener("change", onChange);
    return () => tabs.removeEventListener("change", onChange);
  }, []);

  const showRanking = selected >= countries.length;
  const country = countries[Math.min(selected, countries.length - 1)];
  const hero = country.hero;
  const heroFirst = hero.points[0];
  const heroDelta =
    hero.latest && heroFirst ? fmtDelta(heroFirst.value, hero.latest.value) : null;

  return (
    <div className="page">
      <header className="masthead">
        <div>
          <h1 className="md-typescale-headline-small">Good Country Dashboard</h1>
          <p className="subtitle md-typescale-body-medium">
            A public-systems scoreboard from the Country Manifesto: countries
            compete like companies, and citizens own the upside.
          </p>
        </div>
        {/* The CTA sits beside md-tabs, never inside it: a non-tab child would
            shift activeTabIndex and break the `selected` math below. */}
        <div className="tabs-cluster">
          <md-tabs ref={tabsRef} aria-label="Country">
            {countries.map((c, i) => (
              <md-primary-tab key={c.code} active={i === selected}>
                {c.name}
              </md-primary-tab>
            ))}
            <md-primary-tab active={showRanking}>World ranking</md-primary-tab>
          </md-tabs>
          <Link href="/co" className="tab-cta md-typescale-label-large">
            <md-icon aria-hidden="true">gavel</md-icon>
            Colombia: laws &amp; votes
            <md-icon className="tab-cta-arrow" aria-hidden="true">
              arrow_forward
            </md-icon>
          </Link>
        </div>
      </header>

      <main>
        {showRanking ? (
          <Ranking entries={ranking} />
        ) : (
        <section className="grid">
          <article className="card card--hero">
            <h2 className="md-typescale-title-medium">
              Good Country Index — {country.name}
            </h2>
            <span className="formula-chip md-typescale-label-medium">
              (stock-market capitalization × public companies) ÷ population
            </span>

            {hero.latest ? (
              <>
                <p className="metric-value hero-value">
                  {fmtCompact(hero.latest.value, hero.format)}
                </p>
                <div className="metric-meta md-typescale-label-medium">
                  <span>as of {hero.latest.year}</span>
                  {heroDelta && heroFirst && (
                    <span className="delta-chip">
                      {heroDelta} since {heroFirst.year}
                    </span>
                  )}
                  <span>
                    A composite score: one giant corporation shouldn&apos;t
                    define a country&apos;s success — broad entrepreneurship
                    should.
                  </span>
                </div>
                <LineChart points={hero.points} format={hero.format} />
              </>
            ) : (
              <div className="no-data md-typescale-body-medium">
                Index unavailable — a component series is missing
              </div>
            )}
            {country.code === "COL" && (
              <Link href="/co" className="cta-banner">
                <md-icon className="cta-icon" aria-hidden="true">
                  gavel
                </md-icon>
                <span className="cta-text">
                  <strong className="md-typescale-title-medium">
                    What is Congress doing about it?
                  </strong>
                  <span className="md-typescale-body-medium">
                    Landmark laws and bills, how parties voted where the record
                    is published, and what each one does to this index.
                  </span>
                </span>
                <md-icon className="cta-arrow" aria-hidden="true">
                  arrow_forward
                </md-icon>
              </Link>
            )}
            <p className="source-line md-typescale-label-small">
              Source: {hero.source}
            </p>
          </article>

          {country.metrics.map((m) => (
            <MetricCard key={m.id} series={m} />
          ))}
        </section>
        )}
      </main>

      <footer className="colophon md-typescale-label-medium">
        Based on the Country Manifesto (Good Country) draft. Data refreshes
        daily from the World Bank and FRED; proxy series are labeled on each
        card. Built with Material Web.
      </footer>
    </div>
  );
}
