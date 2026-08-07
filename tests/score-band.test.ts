import { describe, expect, it } from "vitest";
import {
  SCORE_MIXED_MAX,
  SCORE_MIXED_MIN,
  scoreBand,
} from "@/lib/score-band";

describe("scoreBand", () => {
  it("uses the shared poor, mixed, and good boundaries", () => {
    expect(scoreBand(SCORE_MIXED_MIN - 1)).toBe("poor");
    expect(scoreBand(SCORE_MIXED_MIN)).toBe("mixed");
    expect(scoreBand(SCORE_MIXED_MAX)).toBe("mixed");
    expect(scoreBand(SCORE_MIXED_MAX + 1)).toBe("good");
  });
});
