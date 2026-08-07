"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LineChart from "./LineChart";
import MetricCard from "./MetricCard";
import Ranking from "./Ranking";
import { fmtCompact, fmtDelta } from "@/lib/format";
import {
  DEFAULT_DASHBOARD_STATE,
  readDashboardState,
  writeDashboardState,
  type DashboardUrlState,
  type RankingSortState,
} from "@/lib/dashboard-state";
import type { CountryDashboard, RankingEntry } from "@/lib/types";

const VIEW_INDEX = { col: 0, us: 1, ranking: 2 } as const;
const INDEX_VIEW = ["col", "us", "ranking"] as const;

function updateDashboardUrl(
  state: DashboardUrlState,
  mode: "push" | "replace",
) {
  const search = writeDashboardState(window.location.search, state);
  const nextUrl = `${window.location.pathname}${search}${window.location.hash}`;
  if (mode === "push") window.history.pushState(null, "", nextUrl);
  else window.history.replaceState(null, "", nextUrl);
}

export default function Dashboard({
  countries,
  ranking,
}: {
  countries: CountryDashboard[];
  ranking: RankingEntry[];
}) {
  const [selected, setSelected] = useState(0);
  const [rankingSort, setRankingSort] = useState<RankingSortState>(
    DEFAULT_DASHBOARD_STATE.sort,
  );
  const tabsRef = useRef<HTMLElement & { activeTabIndex: number }>(null);

  useEffect(() => {
    import("./material");
  }, []);

  useEffect(() => {
    const syncFromUrl = () => {
      const state = readDashboardState(window.location.search);
      const nextSelected = VIEW_INDEX[state.view];
      setSelected(nextSelected);
      setRankingSort(state.sort);
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    const onChange = () => {
      const nextSelected = tabs.activeTabIndex;
      if (nextSelected === selected) return;
      setSelected(nextSelected);
      updateDashboardUrl(
        {
          view: INDEX_VIEW[nextSelected] ?? "col",
          sort: rankingSort,
        },
        "push",
      );
    };
    tabs.addEventListener("change", onChange);
    return () => tabs.removeEventListener("change", onChange);
  }, [rankingSort, selected]);

  const onRankingSortChange = (sort: RankingSortState) => {
    setRankingSort(sort);
    updateDashboardUrl({ view: "ranking", sort }, "replace");
  };

  const showRanking = selected >= countries.length;
  const country = countries[Math.min(selected, countries.length - 1)];
  const hero = country.hero;
  const heroFirst = hero.points[0];
  const heroDelta =
    hero.latest && heroFirst ? fmtDelta(heroFirst.value, hero.latest.value) : null;

  return (
    <div className="page dashboard-page">
      <header className="dashboard-masthead">
        <div className="dashboard-topline">
          <span className="dashboard-wordmark">Good Country</span>
          <span className="dashboard-edition md-typescale-label-medium">
            Public systems scoreboard · 2026
          </span>
        </div>

        <div className="dashboard-title-block">
          <p className="dashboard-eyebrow md-typescale-label-medium">
            Measure what compounds
          </p>
          <div>
            <h1>Countries should grow value for their citizens.</h1>
            <p className="dashboard-deck md-typescale-body-large">
              A public-economy scoreboard from the Country Manifesto—tracking
              market value, broad entrepreneurship, and the conditions that
              let both endure.
            </p>
          </div>
        </div>

        {/* The CTA sits beside md-tabs, never inside it: a non-tab child would
            shift activeTabIndex and break the `selected` math below. */}
        <div className="dashboard-nav">
          <md-tabs ref={tabsRef} aria-label="Country">
            {countries.map((c, i) => (
              <md-primary-tab key={c.code} active={i === selected}>
                {c.name}
              </md-primary-tab>
            ))}
            <md-primary-tab active={showRanking}>World ranking</md-primary-tab>
          </md-tabs>
          <Link href="/co" className="dashboard-monitor-link">
            <span>
              <small>Live country file</small>
              Colombia · laws &amp; votes
            </span>
            <md-icon aria-hidden="true">arrow_forward</md-icon>
          </Link>
        </div>
      </header>

      <main id="main-content">
        {showRanking ? (
          <Ranking
            entries={ranking}
            sort={rankingSort}
            onSortChange={onRankingSortChange}
          />
        ) : (
          <>
            <section
              className="dashboard-index"
              aria-labelledby="dashboard-index-heading"
            >
              <div className="dashboard-index-stat">
                <div className="dashboard-index-label">
                  <p className="md-typescale-label-medium">
                    Good Country Index
                  </p>
                  <span>{country.code}</span>
                </div>
                <h2 id="dashboard-index-heading">{country.name}</h2>

                {hero.latest ? (
                  <>
                    <p className="dashboard-index-value">
                      {fmtCompact(hero.latest.value, hero.format)}
                    </p>
                    <div className="dashboard-index-meta md-typescale-label-medium">
                      <span>Latest comparable value · {hero.latest.year}</span>
                      {heroDelta && heroFirst && (
                        <span className="dashboard-delta">
                          {heroDelta} since {heroFirst.year}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="no-data md-typescale-body-medium">
                    Index unavailable — a component series is missing
                  </div>
                )}

                <span className="formula-chip md-typescale-label-medium">
                  (market cap × public companies) ÷ population
                </span>
                <p className="dashboard-index-caption md-typescale-body-medium">
                  One giant corporation should not define a country&apos;s
                  success. The score rewards a wider field of companies too.
                </p>
              </div>

              <div className="dashboard-index-chart">
                <header>
                  <div>
                    <p className="dashboard-eyebrow md-typescale-label-medium">
                      Ten-year view
                    </p>
                    <h3>Public-economy momentum</h3>
                  </div>
                  <p className="md-typescale-label-small">
                    Source: {hero.source}
                  </p>
                </header>
                {hero.latest && (
                  <LineChart points={hero.points} format={hero.format} />
                )}
                {country.code === "COL" && (
                  <Link href="/co" className="dashboard-country-file">
                    <span>
                      <small>Go behind the score</small>
                      See what Colombia&apos;s Congress is doing
                    </span>
                    <md-icon aria-hidden="true">arrow_forward</md-icon>
                  </Link>
                )}
              </div>
            </section>

            <section className="dashboard-metrics" aria-labelledby="drivers-heading">
              <div className="dashboard-section-heading">
                <p className="dashboard-eyebrow md-typescale-label-medium">
                  The drivers
                </p>
                <h2 id="drivers-heading">What moves the score</h2>
                <p className="md-typescale-body-medium">
                  Six underlying series show whether value is broadening,
                  stalling, or relying on a proxy.
                </p>
              </div>
              <div className="grid metric-grid">
                {country.metrics.map((m) => (
                  <MetricCard key={m.id} series={m} />
                ))}
              </div>
            </section>
          </>
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
