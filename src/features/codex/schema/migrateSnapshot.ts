import { z } from "zod";
import { CodexSnapshotV1Schema, deepFreeze, type CodexSnapshotV1, type WorkshopSheet, hashSnapshotBody, snapshotBody } from "./codexSnapshotV1";
import { normalizeSnapshot } from "./normalizeSnapshot";

const LegacyWorkshopSchema = z.object({
  name: z.string(),
  title: z.string(),
  sheet_style: z.string(),
  overview: z.object({
    classRole: z.string(),
    faction: z.string(),
    alignment: z.string(),
  }),
  physical: z.object({
    height: z.string(),
    weight: z.string(),
    build: z.string(),
    marks: z.string(),
    scars: z.string(),
  }),
  signatureAttributes: z.object({
    reputation: z.string(),
    vice: z.string(),
    virtue: z.string(),
    fear: z.string(),
    obsession: z.string(),
    tell: z.string(),
    loyalty: z.string(),
    blindSpot: z.string(),
    survivalInstinct: z.string(),
    legacyFear: z.string(),
  }),
  derivedStats: z.object({
    hpCurrent: z.number(),
    hpMax: z.number(),
    ac: z.number(),
    initiative: z.string(),
    speed: z.string(),
    level: z.number(),
    resourceName: z.string(),
    resourceCurrent: z.number(),
    resourceMax: z.number(),
  }),
  lore: z.object({ backstory: z.string() }),
  equipment: z.object({
    primaryWeapon: z.string(),
    secondaryFocus: z.string(),
    armor: z.string(),
    utilityTools: z.string(),
    consumables: z.string(),
    relics: z.string(),
  }),
  personality: z.object({ speech: z.string() }),
  stats: z.array(z.object({ key: z.string(), label: z.string(), value: z.number() })),
});

function asRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Codex snapshot must be an object");
  }
  return input as Record<string, unknown>;
}

function verifyHash(snapshot: CodexSnapshotV1): CodexSnapshotV1 {
  const expected = hashSnapshotBody(snapshotBody(snapshot));
  if (expected !== snapshot.contentHash) throw new Error("Codex snapshot hash mismatch");
  return deepFreeze(snapshot);
}

export function migrateSnapshot(input: unknown, finalizedAt = "UNSEALED"): CodexSnapshotV1 {
  const record = asRecord(input);
  const version = record.schemaVersion ?? record.version ?? 0;
  if (version === 1) {
    return verifyHash(CodexSnapshotV1Schema.parse(record));
  }
  if (version === 0) {
    const sheet = LegacyWorkshopSchema.parse(record.sheet ?? record) as WorkshopSheet;
    return normalizeSnapshot(sheet, {
      finalizedAt: typeof record.finalizedAt === "string" ? record.finalizedAt : finalizedAt,
      revision: typeof record.revision === "number" ? record.revision : 0,
      sourceSheetId: typeof record.sourceSheetId === "string" ? record.sourceSheetId : null,
      portraitUrl: typeof record.portraitUrl === "string" ? record.portraitUrl : null,
      locked: false,
    });
  }
  throw new Error(`Unsupported codex snapshot version: ${String(version)}`);
}
