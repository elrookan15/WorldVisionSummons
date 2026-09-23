import { describe, expect, it } from "vitest";
import { composeCodex } from "../composition/composeCodex";
import { fitLine } from "../composition/fitText";
import { normalizeSnapshot } from "../schema/normalizeSnapshot";
import { workshopFixture } from "./fixture";

describe("codex overflow", () => {
  it("clamps a name to 42 characters and a chronicle to 720", () => {
    expect(fitLine("Vaelith Thornkeeper", 22, 18, 80).text.endsWith("…")).toBe(true);
    const sheet = workshopFixture({
      name: "A".repeat(80),
      lore: { backstory: `She kept the oath ${"without pause ".repeat(80)}` },
    });
    const model = composeCodex(normalizeSnapshot(sheet, {
      finalizedAt: "2026-09-23T13:43:00.000Z",
      snapshotId: "00000000-0000-4000-8000-000000000001",
      characterId: "sheet-1",
      portraitUrl: null,
    }));
    const name = model.texts.filter((text) => text.id.startsWith("title.name")).map((text) => text.text).join("");
    expect([...name].length).toBeLessThanOrEqual(43);
    const story = model.texts.find((text) => text.id === "chronicle.body");
    expect(story?.text.length).toBeLessThanOrEqual(720);
    expect(model.overflowIds).toContain("chronicle.body");
  });
});
