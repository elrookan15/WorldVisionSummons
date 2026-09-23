import { describe, expect, it } from "vitest";
import { composeCodex } from "../composition/composeCodex";
import { normalizeSnapshot } from "../schema/normalizeSnapshot";
import { buildCodexPdf, buildCodexPng } from "../export/exportCodex";
import { OUTPUT_PROFILES } from "../export/outputProfiles";
import { workshopFixture } from "./fixture";

function sameBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

describe("codex composition", () => {
  it("is deterministic for a sealed proof", () => {
    const snapshot = normalizeSnapshot(workshopFixture(), { finalizedAt: "2026-09-23T13:43:00.000Z" });
    const first = composeCodex(snapshot);
    const second = composeCodex(snapshot);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(first.page).toEqual({ widthMm: 210, heightMm: 297 });
    expect(first.texts.find((text) => text.id === "title.name")?.text).toBe("Vaelith Thorn");
    expect(first.callouts).toHaveLength(6);
  });

  it("emits a stable A4 vector pdf that names the summon", () => {
    const model = composeCodex(normalizeSnapshot(workshopFixture(), { finalizedAt: "2026-09-23T13:43:00.000Z" }));
    const first = buildCodexPdf(model, OUTPUT_PROFILES.a4);
    const second = buildCodexPdf(model, OUTPUT_PROFILES.a4);
    expect(sameBytes(first, second)).toBe(true);
    const text = new TextDecoder().decode(first);
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("595.28 841.89");
    expect(text).toContain("Vaelith Thorn");
    const letter = new TextDecoder().decode(buildCodexPdf(model, OUTPUT_PROFILES.usLetter));
    expect(letter).toContain("612 792");
  });

  it("rasterizes a deterministic png and publishes the 300dpi A4 plate size", () => {
    expect(OUTPUT_PROFILES.a4.pngWidth).toBe(2480);
    expect(OUTPUT_PROFILES.a4.pngHeight).toBe(3508);
    const model = composeCodex(normalizeSnapshot(workshopFixture(), { finalizedAt: "2026-09-23T13:43:00.000Z" }));
    const png = buildCodexPng(model, OUTPUT_PROFILES.a4, { width: 48, height: 64 });
    const again = buildCodexPng(model, OUTPUT_PROFILES.a4, { width: 48, height: 64 });
    expect(sameBytes(png, again)).toBe(true);
    expect(png[0]).toBe(137);
    const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
    expect(view.getUint32(16)).toBe(48);
    expect(view.getUint32(20)).toBe(64);
  });
});
