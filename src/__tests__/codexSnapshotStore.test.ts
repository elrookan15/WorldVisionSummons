import { describe, it, expect } from "vitest";
import { writeCodexSnapshot } from "../lib/codexSnapshotStore";

describe("writeCodexSnapshot", () => {
  it("stores an immutable snapshot and refuses a rewrite", () => {
    const store = new Map<string, unknown>();
    const body = { snapshotId: "s1", character: { name: "Nyx" }, contentHash: "abc" };
    expect(writeCodexSnapshot(store, body).status).toBe(201);
    const again = writeCodexSnapshot(store, body);
    expect(again.ok).toBe(false);
    if (again.ok === false) expect(again.status).toBe(409);
  });

  it("rejects a full store", () => {
    const store = new Map<string, unknown>([["existing", {}]]);
    const result = writeCodexSnapshot(
      store,
      { snapshotId: "s2", character: { name: "Nyx" }, contentHash: "def" },
      1
    );
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.status).toBe(429);
  });
});
