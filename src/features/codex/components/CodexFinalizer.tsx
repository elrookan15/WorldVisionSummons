import { useMemo, useState } from "react";
import { composeCodex } from "../composition/composeCodex";
import {
  lockCodexSnapshot,
  normalizeSnapshot,
} from "../schema/normalizeSnapshot";
import {
  plateFingerprint,
  type CodexSnapshotV1,
  type WorkshopSheet,
} from "../schema/codexSnapshotV1";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";
import { buildCodexPdf, buildCodexPng, exportCodexJson } from "../export/exportCodex";
import { OUTPUT_PROFILES } from "../export/outputProfiles";
import { CodexPreviewShell } from "./CodexPreviewShell";
import { FinalizeReviewDialog } from "./FinalizeReviewDialog";

export interface CodexFinalizerProps {
  sheet: WorkshopSheet;
  portraitUrl?: string | null;
  sourceSheetId?: string | null;
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

export function CodexFinalizer({ sheet, portraitUrl = null, sourceSheetId = null }: CodexFinalizerProps) {
  const [zoom, setZoom] = useState(0.72);
  const [review, setReview] = useState<CodexSnapshotV1 | null>(null);
  const [locked, setLocked] = useState<CodexSnapshotV1 | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const proof = useMemo(
    () => normalizeSnapshot(sheet, {
      finalizedAt: "UNSEALED",
      portraitUrl,
      sourceSheetId,
      revision: 0,
      locked: false,
    }),
    [sheet, portraitUrl, sourceSheetId],
  );
  const shown = locked ?? proof;
  const model = useMemo(() => composeCodex(shown), [shown]);
  const diverged = locked !== null && plateFingerprint(locked) !== plateFingerprint(proof);

  const openReview = () => {
    setReview(normalizeSnapshot(sheet, {
      finalizedAt: new Date().toISOString(),
      portraitUrl,
      sourceSheetId,
      revision: locked?.revision ?? 0,
      locked: false,
    }));
    setDialogOpen(true);
  };

  const lockPage = () => {
    if (!review) return;
    setLocked(lockCodexSnapshot(review, review.finalizedAt));
    setDialogOpen(false);
  };

  return (
    <section aria-label="Codex page finalizer">
      <div className="codex-preview-chrome" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        <button type="button" onClick={openReview} style={actionButton}>
          Finalize Codex Page
        </button>
        <button
          type="button"
          disabled={!locked}
          onClick={() => locked && downloadBytes("codex-page.json", new TextEncoder().encode(exportCodexJson(locked)), "application/json")}
          style={actionButton}
        >
          Export JSON
        </button>
        <button
          type="button"
          disabled={!locked}
          onClick={() => locked && downloadBytes("codex-page.pdf", buildCodexPdf(composeCodex(locked), OUTPUT_PROFILES.a4), "application/pdf")}
          style={actionButton}
        >
          Export PDF
        </button>
        <button
          type="button"
          disabled={!locked}
          onClick={() => locked && downloadBytes("codex-page.png", buildCodexPng(composeCodex(locked)), "image/png")}
          style={actionButton}
        >
          Export PNG
        </button>
      </div>
      <p style={{ margin: "0 0 8px", color: ILLUMINATED_TOKENS.oxblood, fontFamily: "ui-monospace, monospace", fontSize: 12 }}>
        {locked ? `SEALED REV ${String(locked.revision).padStart(2, "0")}` : "UNSEALED PROOF"}
        {diverged ? " · Workshop diverged. The sealed page is unchanged." : ""}
      </p>
      <CodexPreviewShell model={model} zoom={zoom} onZoomChange={setZoom} />
      <FinalizeReviewDialog open={dialogOpen} snapshot={review} onCancel={() => setDialogOpen(false)} onLock={lockPage} />
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
