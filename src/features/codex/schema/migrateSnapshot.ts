import {
  SnapshotBodySchema,
  canonicalJson,
  deepFreeze,
  hashableSnapshot,
  type CodexSnapshotV1,
  type WorkshopSheet,
} from "./codexSnapshotV1";
import { normalizeSnapshot, sealImportedSnapshot } from "./normalizeSnapshot";

interface LegacyWorkshopRecord extends WorkshopSheet {
  version: 0;
  finalizedAt: string;
  snapshotId: string;
  characterId: string;
  portraitUrl?: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function migrateSnapshot(input: unknown): CodexSnapshotV1 {
  if (!isRecord(input)) throw new Error("Unsupported codex snapshot");
  if (input.version === 0) {
    const record = input as unknown as LegacyWorkshopRecord;
    return normalizeSnapshot(record, {
      finalizedAt: record.finalizedAt,
      snapshotId: record.snapshotId,
      characterId: record.characterId,
      portraitUrl: record.portraitUrl ?? null,
      revision: 0,
    });
  }
  if (input.schemaVersion !== "codex.snapshot.v1") {
    throw new Error(`Unsupported codex snapshot version: ${String(input.schemaVersion ?? input.version)}`);
  }
  const parsed = SnapshotBodySchema.parse(input);
  const expected = hashableSnapshot(parsed);
  if (parsed.provenance.sourceHash !== expected) {
    throw new Error("Codex snapshot hash mismatch");
  }
  return sealImportedSnapshot(parsed);
}

export function snapshotEquals(left: CodexSnapshotV1, right: CodexSnapshotV1): boolean {
  return canonicalJson(left) === canonicalJson(right);
}
