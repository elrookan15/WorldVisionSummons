/** In-memory Codex snapshot store. Immutable writes; bounded so a public process cannot grow without limit. */

export const CODEX_SNAPSHOT_LIMIT = 200;

export type SnapshotBody = {
  snapshotId?: string;
  character?: unknown;
  contentHash?: string;
};

export type SnapshotWrite =
  | { ok: true; status: 201; body: SnapshotBody }
  | { ok: false; status: 400 | 409 | 429; error: string };

export function writeCodexSnapshot(
  store: Map<string, unknown>,
  body: SnapshotBody,
  limit = CODEX_SNAPSHOT_LIMIT
): SnapshotWrite {
  if (!body?.snapshotId || body.character == null || !body.contentHash) {
    return {
      ok: false,
      status: 400,
      error: "snapshot requires snapshotId, character, and contentHash",
    };
  }
  if (store.has(body.snapshotId)) {
    return { ok: false, status: 409, error: "snapshot is immutable" };
  }
  if (store.size >= limit) {
    return { ok: false, status: 429, error: "snapshot store is full" };
  }
  store.set(body.snapshotId, body);
  return { ok: true, status: 201, body };
}
