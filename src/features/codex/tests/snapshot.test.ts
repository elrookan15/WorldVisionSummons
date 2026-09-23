import { describe, expect, it } from "vitest";
import { composeCodex } from "../composition/composeCodex";
import { codexExportBasename, exportCodexJson } from "../export/exportCodex";
import { migrateSnapshot } from "../schema/migrateSnapshot";
import { assessCodex, blockingIssues, nextFinalizePhase } from "../schema/reviewCodex";
import { lockCodexSnapshot, normalizeSnapshot, sourceStatIssues } from "../schema/normalizeSnapshot";
import { sha256Hex } from "../schema/codexSnapshotV1";
import { workshopFixture } from "./fixture";

const STAMP = "2026-09-23T13:43:00.000Z";
const ID = "00000000-0000-4000-8000-000000000001";

function sealOptions(overrides: Partial<Parameters<typeof normalizeSnapshot>[1]> = {}) {
  return {
    finalizedAt: STAMP,
    snapshotId: ID,
    characterId: "sheet-1",
    portraitUrl: null,
    ...overrides,
  };
}

describe("codex snapshot", () => {
  it("hashes the known sha256 test vector", () => {
    expect(sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("seals the same workshop into the same source hash", () => {
    const first = normalizeSnapshot(workshopFixture(), sealOptions());
    const second = normalizeSnapshot(workshopFixture(), sealOptions());
    expect(first.schemaVersion).toBe("codex.snapshot.v1");
    expect(first.provenance.sourceHash).toBe(second.provenance.sourceHash);
    expect(first.attributes.dex).toEqual({ score: 16, modifier: 3 });
    expect(exportCodexJson(first)).toBe(exportCodexJson(second));
  });

  it("turns blank strings into null and drops blob portraits", () => {
    const sheet = workshopFixture({ name: "  ", personality: { speech: "" } });
    const snapshot = normalizeSnapshot(sheet, sealOptions({ portraitUrl: "blob:http://local/portrait" }));
    expect(snapshot.identity.name).toBeNull();
    expect(snapshot.identity.motto).toBeNull();
    expect(snapshot.portrait).toBeNull();
  });

  it("rejects mutation and a second lock", () => {
    const proof = normalizeSnapshot(workshopFixture(), sealOptions());
    expect(() => {
      (proof.identity as { name: string | null }).name = "Other";
    }).toThrow(TypeError);
    const locked = lockCodexSnapshot(proof, STAMP);
    expect(locked.revision).toBe(1);
    expect(locked.provenance.sourceHash).not.toBe(proof.provenance.sourceHash);
    expect(() => lockCodexSnapshot(locked, STAMP)).toThrow(/immutable/);
    expect(codexExportBasename(locked)).toBe("worldvision-vaelith-thorn-codex-r1-2026-09-23");
  });

  it("blocks a missing name and invalid attribute", () => {
    const sheet = workshopFixture({ name: "", stats: [{ key: "STR", label: "Strength", value: Number.NaN }] });
    const snapshot = normalizeSnapshot(sheet, sealOptions());
    const issues = assessCodex(snapshot, sourceStatIssues(sheet));
    expect(blockingIssues(issues).length).toBeGreaterThan(0);
    expect(nextFinalizePhase("reviewing", "snapshot")).toBe("snapshotting");
  });

  it("migrates a sealed v1 snapshot and rejects a bad hash or future version", () => {
    const sealed = lockCodexSnapshot(normalizeSnapshot(workshopFixture(), sealOptions()), STAMP);
    const restored = migrateSnapshot(JSON.parse(exportCodexJson(sealed)));
    expect(restored.provenance.sourceHash).toBe(sealed.provenance.sourceHash);
    expect(() => migrateSnapshot({ ...sealed, identity: { ...sealed.identity, name: "Forged" } })).toThrow(/hash mismatch/);
    expect(() => migrateSnapshot({ schemaVersion: "codex.snapshot.v2" })).toThrow(/Unsupported/);
    const fromWorkshop = migrateSnapshot({ version: 0, ...workshopFixture(), finalizedAt: STAMP, snapshotId: ID, characterId: "sheet-1" });
    expect(fromWorkshop.provenance.sourceHash).toBe(normalizeSnapshot(workshopFixture(), sealOptions()).provenance.sourceHash);
    expect(composeCodex(sealed).sealed).toBe(true);
    expect(composeCodex(restored).sealed).toBe(true);
  });
});
