import { describe, expect, it } from "vitest";
import { composeCodex } from "../composition/composeCodex";
import { fitBlock, fitLine } from "../composition/fitText";
import { normalizeSnapshot } from "../schema/normalizeSnapshot";
import { workshopFixture } from "./fixture";

describe("codex overflow", () => {
  it("clamps a line that cannot fit the measure", () => {
    const fitted = fitLine("Threshold Warden of the Unfinished Vow and the Ash Court Ledger", 28, 8, 80);
    expect(fitted.truncated).toBe(true);
    expect(fitted.text.endsWith("…")).toBe(true);
    expect(fitted.text.length).toBeLessThan(60);
  });

  it("flags chronicle overflow on the plate and records a snapshot warning", () => {
    const backstory = "oath ".repeat(800);
    const snapshot = normalizeSnapshot(workshopFixture({ lore: { backstory } }), { finalizedAt: "UNSEALED" });
    expect(snapshot.warnings.some((warning) => warning.includes("chronicle"))).toBe(true);
    expect(snapshot.chronicle.backstory.length).toBeLessThanOrEqual(2000);
    const block = fitBlock(snapshot.chronicle.backstory, 54, 64, 8, 1.2, 2000);
    expect(block.truncated).toBe(true);
    const model = composeCodex(snapshot);
    expect(model.overflowIds).toContain("chronicle.body");
  });
});
