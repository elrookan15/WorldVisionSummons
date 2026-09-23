import { useMemo, useState } from "react";
import { composeCodex } from "../composition/composeCodex";
import { codexExportBasename, exportCodexJson, buildCodexPdf, buildCodexPng } from "../export/exportCodex";
import { OUTPUT_PROFILES } from "../export/outputProfiles";
import {
  lockCodexSnapshot,
  normalizeSnapshot,
  sourceStatIssues,
  type ReviewIssue,
} from "../schema/normalizeSnapshot";
import {
  plateFingerprint,
  type CodexSnapshotV1,
  type WorkshopSheet,
} from "../schema/codexSnapshotV1";
import { assessCodex, nextFinalizePhase, type FinalizePhase } from "../schema/reviewCodex";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";
import { CodexPreviewShell } from "./CodexPreviewShell";
import { FinalizeReviewDialog } from "./FinalizeReviewDialog";

export interface CodexFinalizerProps {
  sheet: WorkshopSheet;
  portraitUrl?: string | null;
  portraitWidth?: number | null;
  portraitHeight?: number | null;
  characterId?: string | null;
  onEditSection?: (section: ReviewIssue["section"]) => void;
}

function downloadBytes(filename: string, bytes: Uint8Array, mime: string): void {
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function CodexFinalizer({
  sheet,
  portraitUrl = null,
  portraitWidth = null,
  portraitHeight = null,
  characterId = null,
  onEditSection,
}: CodexFinalizerProps) {
  const [phase, setPhase] = useState<FinalizePhase>("editing");
  const [locked, setLocked] = useState<CodexSnapshotV1 | null>(null);
  const [review, setReview] = useState<CodexSnapshotV1 | null>(null);

  const proof = useMemo(
    () => normalizeSnapshot(sheet, {
      finalizedAt: "UNSEALED",
      snapshotId: "00000000-0000-4000-8000-000000000000",
      characterId: characterId ?? "workshop",
      portraitUrl,
      portraitWidth,
      portraitHeight,
      revision: locked?.revision ?? 0,
    }),
    [sheet, portraitUrl, portraitWidth, portraitHeight, characterId, locked],
  );
  const shown = locked ?? proof;
  const model = useMemo(() => composeCodex(shown), [shown]);
  const diverged = locked !== null && plateFingerprint(locked) !== plateFingerprint(proof);
  const issues = assessCodex(review ?? proof, sourceStatIssues(sheet));

  const openReview = () => {
    setReview(normalizeSnapshot(sheet, {
      finalizedAt: new Date().toISOString(),
      snapshotId: crypto.randomUUID(),
      characterId: characterId ?? "workshop",
      portraitUrl,
      portraitWidth,
      portraitHeight,
      revision: locked?.revision ?? 0,
    }));
    setPhase((current) => nextFinalizePhase(current === "ready" ? "ready" : "editing", "review"));
  };

  const finalize = () => {
    if (!review || assessCodex(review, sourceStatIssues(sheet)).some((issue) => issue.severity === "blocking")) return;
    setPhase((current) => nextFinalizePhase(current, "snapshot"));
    const sealed = lockCodexSnapshot(review, review.finalizedAt);
    setPhase((current) => nextFinalizePhase(current, "compose"));
    composeCodex(sealed);
    setLocked(sealed);
    setPhase((current) => nextFinalizePhase(current, "ready"));
  };

  const exportAs = (kind: "json" | "pdf" | "png") => {
    if (!locked) return;
    setPhase((current) => nextFinalizePhase(current, "export"));
    const composed = composeCodex(locked);
    const base = codexExportBasename(locked);
    if (kind === "json") downloadBytes(`${base}.json`, new TextEncoder().encode(exportCodexJson(locked)), "application/json");
    if (kind === "pdf") downloadBytes(`${base}.pdf`, buildCodexPdf(composed, OUTPUT_PROFILES.a4), "application/pdf");
    if (kind === "png") downloadBytes(`${base}.png`, buildCodexPng(composed), "image/png");
    setPhase((current) => nextFinalizePhase(current, "exported"));
  };

  return (
    <section aria-label="Codex page finalizer">
      <div className="codex-preview-chrome" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        <button type="button" onClick={openReview} style={actionButton}>Review Codex Page</button>
        <button type="button" disabled={phase !== "ready"} onClick={() => exportAs("json")} style={actionButton}>Export JSON</button>
        <button type="button" disabled={phase !== "ready"} onClick={() => exportAs("pdf")} style={actionButton}>Export PDF</button>
        <button type="button" disabled={phase !== "ready"} onClick={() => exportAs("png")} style={actionButton}>Export PNG</button>
      </div>
      <p style={{ margin: "0 0 8px", color: ILLUMINATED_TOKENS.oxblood, fontFamily: '"Noto Sans", sans-serif', fontSize: 12 }}>
        {phase === "ready" && locked ? `SEALED REVISION ${locked.revision}` : phase.toUpperCase()}
        {diverged ? " · Workshop diverged. The sealed page is unchanged." : ""}
      </p>
      <CodexPreviewShell model={model} />
      <FinalizeReviewDialog
        open={phase === "reviewing"}
        phase={phase}
        issues={issues}
        onCancel={() => setPhase("editing")}
        onFinalize={finalize}
        onEditSection={(section) => {
          setPhase("editing");
          onEditSection?.(section);
        }}
      />
    </section>
  );
}

const actionButton = {
  minHeight: 44,
  minWidth: 44,
  padding: "0 14px",
  border: "none",
  background: ILLUMINATED_TOKENS.oxblood,
  color: ILLUMINATED_TOKENS.parchment,
  fontFamily: '"Cinzel", Palatino, serif',
} as const;
