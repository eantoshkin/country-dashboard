import type { Law } from "./types";

/**
 * Colombian legislation, hand-curated (session of 2026-08-06).
 *
 * WHY THIS IS HAND-WRITTEN: per-legislator vote data for Colombia's Congress
 * is not machine-readable anywhere. datos.gov.co's Senate bill dataset
 * (feim-cysj) carries title/author/date/committee/status and no vote or party
 * fields at all; Congreso Visible publishes aggregate tallies only; the roll
 * call itself exists solely in Gaceta del Congreso PDFs. So these entries are
 * collected by hand with per-law sources, the same policy as MANUAL_LATEST in
 * ./data.ts. They do NOT auto-refresh — revisit them each legislature.
 *
 * HONESTY RULE: a party's stance is never inferred. Where the roll call wasn't
 * verifiable, `vote` is "unverified" and the tally alone is shown. Named
 * members appear only where their individual vote is on the record.
 *
 * SELECTION: landmark laws only. Congress passed ~114 laws in 2025, roughly a
 * third of them ceremonial (national days, municipal honours); this is a
 * curated set, not the full record, and the page says so.
 *
 * CONGRESS BOUNDARY: legislative elections were 8 March 2026 and the new
 * Congress seated 20 July 2026. Passed laws below belong to the 2022-2026
 * Congress; bills in discussion belong to 2026-2030, whose party arithmetic is
 * different. Every entry carries its `congress` so the two are never conflated.
 *
 * SCORES are editorial judgment, not measured data. See the page disclaimer.
 */
export const COLOMBIA_LAWS: Law[] = [
  /* -------------------------------- passed -------------------------------- */
  {
    slug: "mental-health-policy-2025",
    lawNumber: "Ley 2518 de 2025",
    title: "National mental health policy",
    summary:
      "Strengthens Ley 1616 of 2013 and the national mental health policy: updated clinical protocols, guaranteed access to services and medication, priority for vulnerable groups, and coordination across public, private, educational and community institutions.",
    status: "passed",
    date: "2025-08-26",
    congress: "2022-2026",
    parties: [
      {
        party: "All benches",
        vote: "unverified",
        note: "No roll call published for this law.",
      },
    ],
    score: 60,
    scoreReason:
      "Mental illness takes working-age people out of the economy for years at a time, so treating it keeps founders, employees and customers active — population is what builds the companies in the numerator, not just the number underneath.",
    sources: [
      {
        label: "MinSalud — full text of Ley 2518 de 2025 (PDF)",
        url: "https://www.minsalud.gov.co/sites/rid/Lists/BibliotecaDigital/RIDE/INEC/IGUB/ley-2518-de-2025.pdf",
      },
      {
        label: "SUIN-Juriscol — Ley 2518 de 2025",
        url: "https://www.suin-juriscol.gov.co/viewDocument.asp?ruta=Leyes/30055468",
      },
    ],
  },
  {
    slug: "budget-2026",
    title: "2026 national budget",
    summary:
      "Approves a 546.9-trillion-peso budget, the largest in Colombian history and about 7% above 2025. It counted 16.3 trillion pesos of revenue from a financing law that Congress went on to reject in December, leaving the gap unfunded.",
    status: "passed",
    date: "2025-10-16",
    congress: "2022-2026",
    chamber: "Senate plenary, after adopting the Chamber text",
    tally: { for: 50, against: 27 },
    parties: [
      {
        party: "All benches",
        vote: "unverified",
        note: "Party-level records weren't published. The Chamber passed it 74–24; reporting attributes the broad support to the alternative of the government issuing the budget by decree.",
      },
    ],
    score: 40,
    scoreReason:
      "Funding the largest budget on record with revenue Congress then refused to approve widens the deficit, and the borrowing costs that follow are felt first by the small firms with the weakest access to credit.",
    sources: [
      {
        label: "Forbes Colombia — Senate approves the 2026 budget",
        url: "https://forbes.co/economia-y-finanzas/senado-aprueba-el-presupuesto-general-de-2026-por-5469-billones-tras-acoger-texto-de-la-camara",
      },
      {
        label: "Cámara de Representantes — 546.9 trillion pesos approved",
        url: "https://www.camara.gov.co/546-9-billones-de-pesos-fueron-aprobados-para-el-presupuesto-de-2026-en-la-camara-de-representantes/",
      },
    ],
  },
  {
    slug: "pension-reform-revote-2025",
    lawNumber: "Ley 2381 de 2024",
    title: "Pension reform (re-vote)",
    summary:
      "Replaces the competing public/private system with four pillars, routing most contributions to the public fund Colpensiones. The Constitutional Court found a procedural defect and ordered the Chamber to repeat the debate, which it did on 28 June 2025; the law remained suspended at the close of 2025.",
    status: "passed",
    date: "2025-06-28",
    congress: "2022-2026",
    chamber: "Chamber of Representatives plenary, extra session",
    tally: { for: 97, against: 0 },
    parties: [
      {
        party: "All benches",
        vote: "unverified",
        note: "Only aggregate counts were published: 104–9 on the substitutive motion, then 97 in favour of adopting the Senate text.",
      },
    ],
    score: 28,
    scoreReason:
      "Draining the private pension funds removes both the largest domestic buyers of listed equity and the anchor investors an IPO needs, which narrows the exit that turns a private company into a public one — it hits both halves of the index at once.",
    sources: [
      {
        label:
          "Cámara de Representantes — Chamber re-approves pension reform on Court order",
        url: "https://www.camara.gov.co/camara-aprobo-de-nuevo-reforma-pensional-por-orden-de-la-corte-constitucional/",
      },
      {
        label: "Infobae — pension reform officially law, 29 June 2025",
        url: "https://www.infobae.com/colombia/2025/06/29/reforma-pensional-es-oficialmente-ley-de-la-republica-plenaria-de-la-camara-aprobo-el-texto-en-sesion-extra/",
      },
    ],
  },
  {
    slug: "labor-reform-2025",
    lawNumber: "Ley 2466 de 2025",
    title: "Labor reform",
    summary:
      "Moves the night-shift premium back to 7:00 p.m., raises Sunday and holiday pay to 100% in stages through 2027, makes the open-ended contract the default form of hiring, and converts SENA apprenticeships into full employment contracts.",
    status: "passed",
    date: "2025-06-25",
    congress: "2022-2026",
    chamber: "Senate plenary, fourth and final debate (17 June 2025)",
    tally: { for: 57, against: 31, notVoting: 28 },
    parties: [
      {
        party: "Pacto Histórico",
        vote: "for",
        members: [
          { name: "Wilson Arias", vote: "for" },
          { name: "Isabel Zuleta", vote: "for" },
          { name: "Iván Cepeda", vote: "for" },
          { name: "María José Pizarro", vote: "for" },
          { name: "Clara López", vote: "for" },
          { name: "Martha Peralta", vote: "for" },
        ],
      },
      {
        party: "Partido Liberal",
        vote: "for",
        members: [{ name: "John Jairo Roldán", vote: "for" }],
        note: "Roldán co-authored the report that carried the bill.",
      },
      {
        party: "Centro Democrático",
        vote: "against",
        members: [
          { name: "Paloma Valencia", vote: "against" },
          { name: "María Fernanda Cabal", vote: "against" },
          { name: "Paola Holguín", vote: "against" },
          { name: "Ciro Ramírez", vote: "against" },
        ],
      },
      {
        party: "Partido Conservador",
        vote: "unverified",
        members: [{ name: "Efraín Cepeda", vote: "against" }],
        note: "Senate president Cepeda voted against; the rest of the bench isn't in the published record.",
      },
      {
        party: "Cambio Radical",
        vote: "unverified",
        note: "Senator Carlos Fernando Motoa carried the motion that struck Article 63, but the bench's final vote isn't published.",
      },
      { party: "Partido de la U", vote: "unverified" },
      { party: "Alianza Verde", vote: "unverified" },
    ],
    score: 25,
    scoreReason:
      "The added cost per employee lands hardest on the smallest and youngest firms — the pool every future public company is drawn from — and the SENA change specifically prices up a startup's first hires.",
    sources: [
      {
        label: "Senado de la República — Senate approves labor reform",
        url: "https://www.senado.gov.co/index.php/el-senado/noticias/6565-senado-aprueba-reforma-laboral",
      },
      {
        label: "Infobae — how the Senate voted, 18 June 2025",
        url: "https://www.infobae.com/colombia/2025/06/18/asi-votaron-la-reforma-laboral-en-el-senado-de-la-republica-la-iniciativa-pasara-a-conciliacion/",
      },
      {
        label: "Función Pública — full text of Ley 2466 de 2025",
        url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=260676",
      },
    ],
  },
  {
    slug: "right-to-food-2025",
    lawNumber: "Acto Legislativo 01 de 2025",
    title: "Constitutional right to adequate food",
    summary:
      "Amends the Constitution to guarantee the right to adequate food, with an intercultural and territorial focus.",
    status: "passed",
    date: "2025-02-06",
    congress: "2022-2026",
    parties: [
      {
        party: "All benches",
        vote: "unverified",
        note: "Constitutional amendments require eight debates; per-party records weren't published for this one.",
      },
    ],
    score: 55,
    scoreReason:
      "Childhood nutrition is the cheapest human capital a country can buy and it compounds for decades into the workforce that staffs and founds companies — though with no funding mechanism attached, the right is declared rather than delivered.",
    sources: [
      {
        label: "El Tiempo — the laws Congress passed in 2025",
        url: "https://www.eltiempo.com/politica/congreso/las-leyes-y-reformas-que-dejo-el-congreso-este-2025-fueron-aprobadas-114-iniciativas-3518331",
      },
    ],
  },
  {
    slug: "cancer-right-to-be-forgotten-2025",
    lawNumber: "Ley 2475 de 2025",
    title: "Right to be forgotten for cancer survivors",
    summary:
      "Bars banks and insurers from using a past cancer diagnosis against people who have completed treatment, when pricing or refusing financial products.",
    status: "passed",
    date: "2025",
    congress: "2022-2026",
    parties: [
      {
        party: "All benches",
        vote: "unverified",
        note: "No roll call published for this law.",
      },
    ],
    score: 62,
    scoreReason:
      "A survivor refused a loan cannot start or scale a business, so restoring credit access puts working-age people back into the founder pipeline — a small population, but exactly the channel the company-count half of the index depends on.",
    sources: [
      {
        label: "El Tiempo — the laws Congress passed in 2025",
        url: "https://www.eltiempo.com/politica/congreso/las-leyes-y-reformas-que-dejo-el-congreso-este-2025-fueron-aprobadas-114-iniciativas-3518331",
      },
    ],
  },
  {
    slug: "labor-procedural-code-2025",
    lawNumber: "Ley 2452 de 2025",
    title: "Labor and social security procedural code",
    summary:
      "Replaces the procedural code governing labour and social-security disputes, modernising how those cases move through the courts.",
    status: "passed",
    date: "2025",
    congress: "2022-2026",
    parties: [
      {
        party: "All benches",
        vote: "unverified",
        note: "No roll call published for this law.",
      },
    ],
    score: 55,
    scoreReason:
      "A predictable, faster dispute process lowers a fixed legal cost that a ten-person firm feels far more than a listed one, which slightly lowers the risk of taking on the first employees.",
    sources: [
      {
        label: "El Tiempo — the laws Congress passed in 2025",
        url: "https://www.eltiempo.com/politica/congreso/las-leyes-y-reformas-que-dejo-el-congreso-este-2025-fueron-aprobadas-114-iniciativas-3518331",
      },
    ],
  },

  /* ----------------------------- in discussion ---------------------------- */
  {
    slug: "health-reform-2026",
    title: "Health reform",
    summary:
      "Ninety articles creating a single public fund, a strengthened ADRES and new rules for the EPS insurers, moving management of financial risk to the state. Providers would invoice within 8 days and ADRES would pay at least 85% within 30 days; health spending would rise by about one percentage point of GDP between 2026 and 2032.",
    status: "in-discussion",
    date: "2026-07-21",
    congress: "2026-2030",
    sponsor:
      "Pacto Histórico bench and the outgoing government — 60 signatories (22 senators, 38 representatives)",
    sponsorParty: "Pacto Histórico",
    parties: [
      {
        party: "Pacto Histórico",
        vote: "unverified",
        note: "Most of the 60 signatures are from this bench, but no vote has been held.",
      },
    ],
    score: 45,
    scoreReason:
      "Paying providers 85% within 30 days would be a real working-capital gain for the thousands of small clinics and suppliers that are private businesses, but a point of GDP in extra spending with no named funding source pulls hard the other way.",
    sources: [
      {
        label: "Consultorsalud — new health reform filed, 21 July 2026",
        url: "https://consultorsalud.com/gobierno-sali-radica-nueva-reforma-a-la-salud/",
      },
      {
        label: "Infobae — what the new health reform contains",
        url: "https://www.infobae.com/colombia/2026/07/22/el-gobierno-petro-y-la-bancada-del-pacto-historico-radicaron-nueva-reforma-a-la-salud-en-el-congreso-en-que-consiste/",
      },
    ],
  },
  {
    slug: "microcredit-seed-capital-2026",
    title: "Microcredit and seed capital access",
    summary:
      "Expands financing mechanisms for micro and small enterprises, on the argument that more than 90% of Colombia's business fabric is small firms held back by barriers to formality.",
    status: "in-discussion",
    date: "2026-07-20",
    congress: "2026-2030",
    sponsor: "Centro Democrático",
    sponsorParty: "Centro Democrático",
    parties: [],
    score: 78,
    scoreReason:
      "The most direct company-count lever on the page: seed capital and microcredit are the first rung of the ladder that ends in a listing, and Colombia's shortage is at that rung rather than at the top.",
    sources: [
      {
        label: "El Colombiano — seven economic bills opening the new Congress",
        url: "https://www.elcolombiano.com/negocios/proyectos-ley-economicos-congreso-2026-reforma-tributaria-fracking-LL38995925",
      },
    ],
  },
  {
    slug: "small-scale-mining-formalization-2026",
    title: "Small-scale mining formalization",
    summary:
      "Creates a three-phase route for subsistence miners to become legal operations, with environmental compliance, mercury elimination, and mineral traceability through certificates of origin, including central-bank gold purchases from formalized operations.",
    status: "in-discussion",
    date: "2026-07-20",
    congress: "2026-2030",
    sponsor: "Centro Democrático",
    sponsorParty: "Centro Democrático",
    parties: [],
    score: 72,
    scoreReason:
      "Converts informal operations into registered, bankable companies — it adds to the company count directly rather than raising the value of firms that already exist.",
    sources: [
      {
        label: "El Colombiano — seven economic bills opening the new Congress",
        url: "https://www.elcolombiano.com/negocios/proyectos-ley-economicos-congreso-2026-reforma-tributaria-fracking-LL38995925",
      },
    ],
  },
  {
    slug: "agrarian-jurisdiction-2026",
    title: "Agrarian jurisdiction regulation",
    summary:
      "Implements the specialised agrarian courts created by constitutional reform, to resolve disputes over rural property, access, formalization and tenure. Resubmitted after failing on the Senate floor previously.",
    status: "in-discussion",
    date: "2026-07-20",
    congress: "2026-2030",
    sponsor: "Senator Iván Cepeda (Pacto Histórico)",
    sponsorParty: "Pacto Histórico",
    parties: [],
    score: 63,
    scoreReason:
      "Secure title is what a rural business pledges to borrow against, so settling land disputes converts land into collateral and collateral into the capital that lets a farm become a firm.",
    sources: [
      {
        label: "El Colombiano — seven economic bills opening the new Congress",
        url: "https://www.elcolombiano.com/negocios/proyectos-ley-economicos-congreso-2026-reforma-tributaria-fracking-LL38995925",
      },
    ],
  },
  {
    slug: "cadastral-appraisal-limit-2026",
    title: "Cap on cadastral property appraisals",
    summary:
      "Would cap cadastral valuations at 50% of commercial value, in response to sharp property-tax increases following contested reassessments.",
    status: "in-discussion",
    date: "2026-07-20",
    congress: "2026-2030",
    sponsor: "Centro Democrático (former president Álvaro Uribe)",
    sponsorParty: "Centro Democrático",
    parties: [],
    score: 55,
    scoreReason:
      "Caps a fixed cost that small property-holding businesses pay whether or not they turn a profit, while narrowing the municipal revenue that funds local infrastructure — genuinely two-sided.",
    sources: [
      {
        label: "El Colombiano — seven economic bills opening the new Congress",
        url: "https://www.elcolombiano.com/negocios/proyectos-ley-economicos-congreso-2026-reforma-tributaria-fracking-LL38995925",
      },
    ],
  },
  {
    slug: "fracking-ban-2026",
    title: "Permanent fracking ban",
    summary:
      "Would permanently prohibit exploration and exploitation of unconventional hydrocarbon reserves by hydraulic fracturing, as part of the energy-transition agenda. Earlier attempts failed at early legislative stages.",
    status: "in-discussion",
    date: "2026-07-20",
    congress: "2026-2030",
    sponsor: "Government (Ministries of Mines and Energy, and Environment)",
    sponsorParty: "Government (Petro)",
    parties: [
      {
        party: "Pacto Histórico",
        vote: "unverified",
        note: "Backing the bill publicly; no vote has been held.",
      },
    ],
    score: 35,
    scoreReason:
      "Closes a growth avenue for the handful of large hydrocarbon firms that dominate Colombia's market capitalisation, though it barely touches the company count — it hits one half of the index, not both.",
    sources: [
      {
        label: "El Colombiano — seven economic bills opening the new Congress",
        url: "https://www.elcolombiano.com/negocios/proyectos-ley-economicos-congreso-2026-reforma-tributaria-fracking-LL38995925",
      },
    ],
  },
  {
    slug: "tax-reform-2026",
    title: "Tax reform",
    summary:
      "Seeks roughly 23 trillion pesos to close the fiscal deficit, with the government stating the heaviest burden falls on higher-income individuals and companies, including assets held in tax havens. Filed with an urgency designation.",
    status: "in-discussion",
    date: "2026-07-20",
    congress: "2026-2030",
    sponsor: "Government (Ministry of Finance)",
    sponsorParty: "Government (Petro)",
    parties: [],
    score: 35,
    scoreReason:
      "Taxes both the retained earnings that fund company growth and the investors who back new firms, hitting the formation pipeline as well as valuations — though closing the deficit would cut sovereign risk.",
    sources: [
      {
        label: "El Colombiano — seven economic bills opening the new Congress",
        url: "https://www.elcolombiano.com/negocios/proyectos-ley-economicos-congreso-2026-reforma-tributaria-fracking-LL38995925",
      },
    ],
  },
];

/* --------------------------- party scorecards ---------------------------- */

export interface PartyScorecard {
  party: string;
  /** 0-100: how this bench's record on THIS PAGE aligns with raising the index. */
  alignment: number;
  votesCounted: number;
  billsFiled: number;
  /** True for the executive: it files bills but holds no seat and cannot vote. */
  isExecutive: boolean;
  helped: Array<{ title: string; score: number }>;
  hindered: Array<{ title: string; score: number }>;
  summary: string;
}

/**
 * Sponsors that are not parties. The executive files bills and its legislative
 * agenda is worth showing, but it holds no seat, never appears in a roll call,
 * and must never be listed as though it were a party with a voting record.
 */
const NON_VOTING_SPONSORS = new Set<string>(["Government (Petro)"]);

/** How many laws here have any published per-party roll call at all. */
export function lawsWithPartyVotes(laws: Law[]): number {
  return laws.filter((l) =>
    l.parties.some((p) => p.vote === "for" || p.vote === "against"),
  ).length;
}

/**
 * Derives a per-party record from the laws on this page.
 *
 * The arithmetic is deliberately simple and stated in the UI: backing a law
 * scored above 50 counts for the party, backing one below 50 counts against,
 * and opposing is the mirror. Filing a bill counts the same as voting for it.
 * Unverified stances contribute nothing, so a party is only ever judged on
 * what is actually on the record.
 *
 * These inherit the editorial scores wholesale — they are a summary of a
 * judgment, not an independent measurement, and the sample is small. The page
 * prints the counts next to every figure so the thinness is visible.
 */
export function partyScorecards(laws: Law[]): PartyScorecard[] {
  type Acc = {
    contributions: number[];
    votes: number;
    bills: number;
    helped: Array<{ title: string; score: number }>;
    hindered: Array<{ title: string; score: number }>;
  };
  const acc = new Map<string, Acc>();
  const get = (p: string) => {
    let a = acc.get(p);
    if (!a) {
      a = { contributions: [], votes: 0, bills: 0, helped: [], hindered: [] };
      acc.set(p, a);
    }
    return a;
  };
  const record = (a: Acc, title: string, score: number, delta: number) => {
    a.contributions.push(delta);
    (delta >= 0 ? a.helped : a.hindered).push({ title, score });
  };

  for (const law of laws) {
    for (const p of law.parties) {
      // "All benches" is a placeholder for an unpublished roll call, not a party.
      if (p.party === "All benches") continue;
      if (p.vote !== "for" && p.vote !== "against") continue;
      const a = get(p.party);
      a.votes += 1;
      record(
        a,
        law.title,
        law.score,
        p.vote === "for" ? law.score - 50 : 50 - law.score,
      );
    }
    if (law.sponsorParty) {
      const a = get(law.sponsorParty);
      a.bills += 1;
      record(a, law.title, law.score, law.score - 50);
    }
  }

  const cards: PartyScorecard[] = [];
  for (const [party, a] of acc) {
    if (a.contributions.length === 0) continue;
    const mean =
      a.contributions.reduce((s, v) => s + v, 0) / a.contributions.length;
    const alignment = Math.round(Math.min(100, Math.max(0, 50 + mean)));
    const byScore = (x: { score: number }, y: { score: number }) =>
      y.score - x.score;
    const helped = [...a.helped].sort(byScore);
    const hindered = [...a.hindered].sort((x, y) => x.score - y.score);

    // The executive files bills but casts no votes, so its sentence describes
    // an agenda rather than a voting record.
    const subject = NON_VOTING_SPONSORS.has(party)
      ? "What it has filed here"
      : "Its record here";
    const lead =
      alignment >= 60
        ? `${subject} leans toward a bigger public economy`
        : alignment >= 40
          ? `${subject} cuts both ways`
          : `${subject} leans against a bigger public economy`;
    const bits: string[] = [];
    if (helped.length)
      bits.push(
        `counting for it: ${helped
          .slice(0, 2)
          .map((h) => `${h.title} (${h.score})`)
          .join(", ")}`,
      );
    if (hindered.length)
      bits.push(
        `counting against: ${hindered
          .slice(0, 2)
          .map((h) => `${h.title} (${h.score})`)
          .join(", ")}`,
      );

    cards.push({
      party,
      alignment,
      votesCounted: a.votes,
      billsFiled: a.bills,
      isExecutive: NON_VOTING_SPONSORS.has(party),
      helped,
      hindered,
      summary: `${lead} — ${bits.join("; ")}.`,
    });
  }

  return cards.sort((a, b) => b.alignment - a.alignment);
}

/** Parties that appear on the page but have nothing verifiable to judge. */
export function partiesWithoutRecord(laws: Law[]): string[] {
  const judged = new Set(partyScorecards(laws).map((c) => c.party));
  const seen = new Set<string>();
  for (const law of laws)
    for (const p of law.parties)
      if (p.party !== "All benches" && !judged.has(p.party)) seen.add(p.party);
  return [...seen].sort();
}

/* ------------------------------ attribution ------------------------------ */

/**
 * Who made the editorial calls on this page: the 0-100 scores, their one-line
 * reasoning, and the choice of which laws to include. Surfaced in the UI next
 * to every one of those judgments so a reader always knows they are a model's
 * opinion rather than a measurement — and which model, on what date, since a
 * different model or a later date would likely score some of these differently.
 */
export const JUDGED_BY = {
  model: "Claude Opus 5",
  modelId: "claude-opus-5",
  vendor: "Anthropic",
  date: "2026-08-06",
  dateLabel: "6 August 2026",
} as const;
