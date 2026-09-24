import { buildCodexPageModel, type CodexPageModel } from "../codexPageModel";
import type { CodexSnapshot } from "./finalizer";

/** Pure: same snapshot in, same zones out. No network, no clock, no randomness. */
export function compose(snapshot: CodexSnapshot): CodexPageModel {
  return buildCodexPageModel(snapshot.character);
}

export type { CodexPageModel };
