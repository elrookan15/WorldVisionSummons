import type { CodexSnapshotV1 } from "./codexSnapshotV1";
import type { ReviewIssue } from "./normalizeSnapshot";

export type FinalizePhase = "editing" | "reviewing" | "snapshotting" | "composing" | "ready" | "exporting";

export type FinalizeEvent = "review" | "snapshot" | "compose" | "ready" | "export" | "exported" | "cancel";

const TRANSITIONS: Record<FinalizePhase, Partial<Record<FinalizeEvent, FinalizePhase>>> = {
  editing: { review: "reviewing" },
  reviewing: { snapshot: "snapshotting", cancel: "editing" },
  snapshotting: { compose: "composing", cancel: "editing" },
  composing: { ready: "ready", cancel: "editing" },
  ready: { export: "exporting", review: "reviewing", cancel: "editing" },
  exporting: { exported: "ready", cancel: "editing" },
};

export function nextFinalizePhase(phase: FinalizePhase, event: FinalizeEvent): FinalizePhase {
  const next = TRANSITIONS[phase][event];
  if (!next) throw new Error(`Codex phase ${phase} cannot accept ${event}`);
  return next;
}

export function assessCodex(snapshot: CodexSnapshotV1, sourceIssues: readonly ReviewIssue[] = []): ReviewIssue[] {
  const issues: ReviewIssue[] = [...sourceIssues];
  if (!snapshot.identity.name) {
    issues.push({ severity: "blocking", section: "identity", message: "Name is required before the page can finalize." });
  }
  if (!snapshot.identity.classTitle) {
    issues.push({ severity: "blocking", section: "class", message: "Class or title is required before the page can finalize." });
  }
  if (!snapshot.identity.faction) {
    issues.push({ severity: "warning", section: "crest", message: "Crest is not set." });
  }
  if (snapshot.psychology.length === 0) {
    issues.push({ severity: "warning", section: "psychology", message: "Optional traits are empty." });
  }
  if (!snapshot.portrait) {
    issues.push({ severity: "warning", section: "portrait", message: "Portrait is not set." });
  } else if (snapshot.portrait.width < 800 || snapshot.portrait.height < 800) {
    issues.push({ severity: "warning", section: "portrait", message: "Portrait is below print resolution." });
  }
  return issues;
}

export function blockingIssues(issues: readonly ReviewIssue[]): ReviewIssue[] {
  return issues.filter((issue) => issue.severity === "blocking");
}
