import { useEffect } from "react";
import type { CodexSnapshotV1 } from "../schema/codexSnapshotV1";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";

export interface FinalizeReviewDialogProps {
  open: boolean;
  snapshot: CodexSnapshotV1 | null;
  onCancel: () => void;
  onLock: () => void;
}

export function FinalizeReviewDialog({ open, snapshot, onCancel, onLock }: FinalizeReviewDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open || !snapshot) return null;
  const warnings = snapshot.warnings;

  return (
    <div
      className="codex-preview-chrome"
      role="presentation"
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(18, 10, 8, 0.72)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="codex-lock-title"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(440px, 100%)",
          background: ILLUMINATED_TOKENS.parchment,
          color: ILLUMINATED_TOKENS.ink,
          border: `1.2pt solid ${ILLUMINATED_TOKENS.oxblood}`,
          padding: 20,
          fontFamily: '"IM Fell English", Palatino, serif',
        }}
      >
        <p style={{ margin: 0, fontFamily: "ui-monospace, monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: ILLUMINATED_TOKENS.oxblood }}>
          Illuminated plate
        </p>
        <h2 id="codex-lock-title" style={{ margin: "6px 0 0", fontFamily: '"Cinzel", Palatino, serif', fontSize: 22 }}>
          Lock Codex Page
        </h2>
        <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.4 }}>
          The workshop stays editable. This page becomes a sealed revision. Later edits do not rewrite it.
        </p>
        <ul style={{ margin: "12px 0", paddingLeft: 18, minHeight: 48, fontSize: 14 }}>
          {warnings.length === 0 ? (
            <li>No plate warnings. The revision can lock.</li>
          ) : (
            warnings.map((warning) => <li key={warning}>{warning}</li>)
          )}
        </ul>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ minHeight: 44, minWidth: 44, padding: "0 16px", border: `1px solid ${ILLUMINATED_TOKENS.ink}`, background: "transparent", color: ILLUMINATED_TOKENS.ink }}
          >
            Return to workshop
          </button>
          <button
            type="button"
            onClick={onLock}
            style={{ minHeight: 44, minWidth: 44, padding: "0 16px", border: "none", background: ILLUMINATED_TOKENS.oxblood, color: ILLUMINATED_TOKENS.parchment }}
          >
            Lock page
          </button>
        </div>
      </div>
    </div>
  );
}
