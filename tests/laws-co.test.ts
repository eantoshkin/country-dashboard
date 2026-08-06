import { describe, expect, it } from "vitest";
import {
  COLOMBIA_LAWS,
  lawsWithPartyVotes,
  partiesWithoutRecord,
  partyScorecards,
} from "@/lib/laws-co";
import type { Law } from "@/lib/types";

/** Minimal law fixture for exercising the scorecard arithmetic. */
function law(overrides: Partial<Law>): Law {
  return {
    slug: "fixture",
    title: "Fixture law",
    summary: "",
    status: "passed",
    date: "2025",
    congress: "2022-2026",
    parties: [],
    score: 50,
    scoreReason: "",
    sources: [],
    ...overrides,
  };
}

describe("partyScorecards — honesty rules", () => {
  it("ignores unverified, abstained, absent, and split stances entirely", () => {
    const cards = partyScorecards([
      law({
        parties: [
          { party: "A", vote: "unverified" },
          { party: "B", vote: "abstained" },
          { party: "C", vote: "split" },
          { party: "D", vote: "absent" },
        ],
        score: 90,
      }),
    ]);
    expect(cards).toEqual([]);
  });

  it('treats "All benches" as a placeholder, never a party', () => {
    const cards = partyScorecards([
      law({ parties: [{ party: "All benches", vote: "for" }], score: 90 }),
    ]);
    expect(cards).toEqual([]);
  });

  it("scores a verified For above 50 as helping, Against as the mirror", () => {
    const cards = partyScorecards([
      law({
        parties: [
          { party: "Pro", vote: "for" },
          { party: "Anti", vote: "against" },
        ],
        score: 70,
      }),
    ]);
    const pro = cards.find((c) => c.party === "Pro")!;
    const anti = cards.find((c) => c.party === "Anti")!;
    expect(pro.alignment).toBe(70); // 50 + (70 - 50)
    expect(anti.alignment).toBe(30); // 50 + (50 - 70)
    expect(pro.helped).toHaveLength(1);
    expect(anti.hindered).toHaveLength(1);
  });

  it("counts filing a bill the same as voting for it", () => {
    const cards = partyScorecards([law({ sponsorParty: "Filer", score: 60 })]);
    const filer = cards.find((c) => c.party === "Filer")!;
    expect(filer.billsFiled).toBe(1);
    expect(filer.votesCounted).toBe(0);
    expect(filer.alignment).toBe(60);
  });

  it("marks the executive and never treats it as a voting party", () => {
    const cards = partyScorecards([
      law({ sponsorParty: "Government (Petro)", score: 40 }),
    ]);
    const executive = cards.find((c) => c.party === "Government (Petro)")!;
    expect(executive.isExecutive).toBe(true);
    expect(executive.summary).toContain("What it has filed here");
  });

  it("clamps alignment to 0–100", () => {
    const cards = partyScorecards([
      law({ slug: "a", parties: [{ party: "P", vote: "against" }], score: 100 }),
      law({ slug: "b", parties: [{ party: "P", vote: "against" }], score: 100 }),
    ]);
    expect(cards[0].alignment).toBe(0);
  });
});

describe("lawsWithPartyVotes / partiesWithoutRecord", () => {
  it("counts only laws with a verifiable for/against stance", () => {
    expect(
      lawsWithPartyVotes([
        law({ parties: [{ party: "A", vote: "for" }] }),
        law({ parties: [{ party: "B", vote: "unverified" }] }),
      ]),
    ).toBe(1);
  });

  it("does not count a boycott (absent) as a party vote", () => {
    expect(
      lawsWithPartyVotes([
        law({ parties: [{ party: "Boycotter", vote: "absent" }] }),
      ]),
    ).toBe(0);
  });

  it("lists parties that appear but have nothing scoreable", () => {
    expect(
      partiesWithoutRecord([
        law({ parties: [{ party: "Silent", vote: "unverified" }] }),
      ]),
    ).toEqual(["Silent"]);
  });

  it("treats a party with only an absent record as having no record", () => {
    expect(
      partiesWithoutRecord([
        law({ parties: [{ party: "Boycotter", vote: "absent" }] }),
      ]),
    ).toEqual(["Boycotter"]);
  });
});

describe("COLOMBIA_LAWS data integrity", () => {
  it("has unique slugs", () => {
    const slugs = COLOMBIA_LAWS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("keeps every score in 0–100 with a stated reason", () => {
    for (const l of COLOMBIA_LAWS) {
      expect(l.score, l.slug).toBeGreaterThanOrEqual(0);
      expect(l.score, l.slug).toBeLessThanOrEqual(100);
      expect(l.scoreReason.length, l.slug).toBeGreaterThan(0);
    }
  });

  it("uses only full ISO dates or bare years — no invented precision", () => {
    for (const l of COLOMBIA_LAWS) {
      expect(l.date, l.slug).toMatch(/^\d{4}(-\d{2}-\d{2})?$/);
    }
  });

  it("cites at least one https source per law", () => {
    for (const l of COLOMBIA_LAWS) {
      expect(l.sources.length, l.slug).toBeGreaterThan(0);
      for (const s of l.sources) {
        expect(s.url, l.slug).toMatch(/^https:\/\//);
        expect(s.label.length, l.slug).toBeGreaterThan(0);
      }
    }
  });

  it("keeps the documented congress boundary: bills in discussion are 2026-2030", () => {
    for (const l of COLOMBIA_LAWS) {
      if (l.status === "in-discussion") {
        expect(l.congress, l.slug).toBe("2026-2030");
      }
    }
  });
});
