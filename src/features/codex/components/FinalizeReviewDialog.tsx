import { useEffect } from "react";
import type { ReviewIssue } from "../schema/normalizeSnapshot";
import type { FinalizePhase } from "../schema/reviewCodex";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";

export interface FinalizeReviewDialogProps {
  open: boolean;
  phase: FinalizePhase;
  issues: readonly ReviewIssue[];
  onCancel: () => void;
  onFinalize: () => void;
  onEditSection: (section: ReviewIssue["section"]) => void;
}

export function FinalizeReviewDialog({ open, phase, issues, onCancel, onFinalize, onEditSection }: FinalizeReviewDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;
  const blocking = issues.filter((issue) => issue.severity === "blocking");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return (
    <div
      className="codex-preview-chrome"
      role="presentation"
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(33, 24, 19, 0.72)",
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
          width: "min(480px, 100%)",
          background: ILLUMINATED_TOKENS.parchment,
          color: ILLUMINATED_TOKENS.ink,
          border: `1.2pt solid ${ILLUMINATED_TOKENS.oxblood}`,
          padding: 20,
          fontFamily: '"Noto Serif", Palatino, serif',
        }}
      >
        <p style={{ margin: 0, fontFamily: '"Noto Sans", sans-serif', fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: ILLUMINATED_TOKENS.oxblood }}>
          {phase}
        </p>
        <h2 id="codex-lock-title" style={{ margin: "6px 0 0", fontFamily: '"Cinzel", Palatino, serif', fontSize: 22 }}>
          Finalize Codex Page
        </h2>
        <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.4 }}>
          The workshop stays editable. Finalizing writes the next immutable revision.
        </p>
        <ul style={{ margin: "12px 0", paddingLeft: 18, minHeight: 48, fontSize: 14 }}>
          {issues.length === 0 ? <li>No plate warnings. This revision can finalize.</li> : null}
          {blocking.map((issue) => (
            <li key={issue.message}>
              {issue.message}{" "}
              <button type="button" onClick={() => onEditSection(issue.section)} style={linkButton}>
                Edit section
              </button>
            </li>
          ))}
          {warnings.map((issue) => (
            <li key={issue.message}>
              {issue.message}{" "}
              <button type="button" onClick={() => onEditSection(issue.section)} style={linkButton}>
                Edit section
              </button>
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button type="button" onClick={onCancel} style={quietButton}>
            Return to workshop
          </button>
          <button type="button" onClick={onFinalize} disabled={blocking.length > 0} style={lockButton}>
            Finalize
          </button>
        </div>
      </div>
    </div>
  );
}

const linkButton = {
  minHeight: 44,
  minWidth: 44,
  padding: "0 8px",
  border: "none",
  background: "transparent",
  color: ILLUMINATED_TOKENS.oxblood,
  textDecoration: "underline",
} as const;

const quietButton = {
  minHeight: 44,
  minWidth: 44,
  padding: "0 16px",
  border: `1px solid ${ILLUMINATED_TOKENS.ink}`,
  background: "transparent",
  color: ILLUMINATED_TOKENS.ink,
} as const;

const lockButton = {
  minHeight: 44,
  minWidth: 44,
  padding: "0 16px",
  border: "none",
  background: ILLUMINATED_TOKENS.oxblood,
  color: ILLUMINATED_TOKENS.parchment,
} as const;
