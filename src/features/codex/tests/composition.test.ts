import { describe, expect, it } from "vitest";
import { composeCodex } from "../composition/composeCodex";
import { buildCodexPdf, buildCodexPng } from "../export/exportCodex";
import { OUTPUT_PROFILES } from "../export/outputProfiles";
import { normalizeSnapshot } from "../schema/normalizeSnapshot";
import { workshopFixture } from "./fixture";

const STAMP = "2026-09-23T13:43:00.000Z";
const ID = "00000000-0000-4000-8000-000000000001";

function modelFor(sheet = workshopFixture()) {
  return composeCodex(normalizeSnapshot(sheet, {
    finalizedAt: STAMP,
    snapshotId: ID,
    characterId: "sheet-1",
    portraitUrl: null,
  }));
}

function sameBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  return left.every((byte, index) => byte === right[index]);
}

describe("codex composition", () => {
  it("keeps the A4 regions and the character name", () => {
    const model = modelFor();
    expect(model.page).toEqual({ widthMm: 210, heightMm: 297 });
    expect(model.regions.title.h).toBe(22);
    expect(model.regions.portrait).toMatchObject({ w: 95, h: 188 });
    expect(model.regions.identity.w).toBe(35);
    expect(model.regions.gear.w).toBe(37);
    expect(model.regions.footer.h).toBe(8);
    expect(model.texts.find((text) => text.id === "title.name")?.text).toBe("Vaelith Thorn");
    expect(model.callouts).toHaveLength(6);
    expect(model.leadersDropped).toBe(false);
    const footer = model.texts.find((text) => text.id === "footer.provenance")?.text ?? "";
    expect(footer).toContain("Template: illuminated-codex@1.0.0");
    expect(footer).toContain("Hash: ");
  });

  it("relocates a long motto into the chronicle", () => {
    const motto = "oath ".repeat(30).trim();
    const model = modelFor(workshopFixture({ personality: { speech: motto } }));
    expect(model.texts.some((text) => text.id === "title.motto")).toBe(false);
    expect(model.texts.find((text) => text.id === "chronicle.body")?.text).toContain("oath");
  });

  it("writes a stable PDF and PNG from the same model", () => {
    const model = modelFor();
    const pdf = buildCodexPdf(model, OUTPUT_PROFILES.a4);
    const letter = buildCodexPdf(model, OUTPUT_PROFILES.usLetter);
    const png = buildCodexPng(model, OUTPUT_PROFILES.a4, { width: 48, height: 64 });
    expect(new TextDecoder().decode(pdf.slice(0, 8))).toBe("%PDF-1.4");
    expect(new TextDecoder().decode(pdf)).toContain("595.28 841.89");
    expect(new TextDecoder().decode(pdf)).toContain("Vaelith Thorn");
    expect(new TextDecoder().decode(letter)).toContain("612 792");
    expect(png[0]).toBe(137);
    const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
    expect(view.getUint32(16)).toBe(48);
    expect(view.getUint32(20)).toBe(64);
    expect(sameBytes(pdf, buildCodexPdf(model, OUTPUT_PROFILES.a4))).toBe(true);
    expect(sameBytes(png, buildCodexPng(model, OUTPUT_PROFILES.a4, { width: 48, height: 64 }))).toBe(true);
  });
});
