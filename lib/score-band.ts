export const SCORE_MIXED_MIN = 45;
export const SCORE_MIXED_MAX = 55;

export type ScoreBand = "good" | "mixed" | "poor";

export function scoreBand(score: number): ScoreBand {
  if (score > SCORE_MIXED_MAX) return "good";
  if (score >= SCORE_MIXED_MIN) return "mixed";
  return "poor";
}
