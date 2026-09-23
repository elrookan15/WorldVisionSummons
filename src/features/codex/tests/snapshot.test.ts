import { describe, expect, it } from "vitest";
import { composeCodex } from "../composition/composeCodex";
import { migrateSnapshot } from "../schema/migrateSnapshot";
import { lockCodexSnapshot, normalizeSnapshot } from "../schema/normalizeSnapshot";
import { sha256Hex } from "../schema/codexSnapshotV1";
import { exportCodexJson } from "../export/exportCodex";
import { workshopFixture } from "./fixture";

const STAMP = "2026-09-23T13:43:00.000Z";

describe("codex snapshot", () => {
  it("hashes the known sha256 test vector", () => {
    expect(sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("seals the same workshop into the same hash", () => {
    const first = normalizeSnapshot(workshopFixture(), { finalizedAt: STAMP, portraitUrl: null, sourceSheetId: "sheet-1" });
    const second = normalizeSnapshot(workshopFixture(), { finalizedAt: STAMP, portraitUrl: null, sourceSheetId: "sheet-1" });
    expect(first.contentHash).toBe(second.contentHash);
    expect(first.locked).toBe(false);
    expect(exportCodexJson(first)).toBe(exportCodexJson(second));
  });

  it("rejects mutation and a second lock", () => {
    const proof = normalizeSnapshot(workshopFixture(), { finalizedAt: STAMP });
    expect(() => {
      (proof.identity as { name: string }).name = "Other";
    }).toThrow(TypeError);
    const locked = lockCodexSnapshot(proof, STAMP);
    expect(locked.locked).toBe(true);
    expect(locked.revision).toBe(proof.revision + 1);
    expect(locked.contentHash).not.toBe(proof.contentHash);
    expect(() => lockCodexSnapshot(locked, STAMP)).toThrow(/immutable/);
  });

  it("migrates a sealed v1 snapshot and rejects a bad hash or future version", () => {
    const sealed = lockCodexSnapshot(normalizeSnapshot(workshopFixture(), { finalizedAt: STAMP }), STAMP);
    const restored = migrateSnapshot(JSON.parse(exportCodexJson(sealed)));
    expect(restored.contentHash).toBe(sealed.contentHash);
    expect(() => migrateSnapshot({ ...sealed, identity: { ...sealed.identity, name: "Forged" } })).toThrow(/hash mismatch/);
    expect(() => migrateSnapshot({ schemaVersion: 2 })).toThrow(/Unsupported codex snapshot version/);
  });

  it("upgrades a versionless workshop record", () => {
    const sheet = workshopFixture();
    const migrated = migrateSnapshot({ version: 0, ...sheet, finalizedAt: STAMP });
    const direct = normalizeSnapshot(sheet, { finalizedAt: STAMP });
    expect(migrated.contentHash).toBe(direct.contentHash);
    expect(composeCodex(migrated).templateId).toBe("illuminated-codex");
  });
});
