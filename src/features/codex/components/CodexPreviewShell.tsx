import type { CodexRenderModel } from "../composition/types";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";
import { CodexPage } from "./CodexPage";

export interface CodexPreviewShellProps {
  model: CodexRenderModel;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 1.4;

export function CodexPreviewShell({ model, zoom, onZoomChange }: CodexPreviewShellProps) {
  const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
  return (
    <div>
      <div className="codex-preview-chrome" style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button type="button" onClick={() => onZoomChange(Math.max(MIN_ZOOM, Math.round((clamped - 0.1) * 100) / 100))} style={zoomButton}>
          Zoom out
        </button>
        <button type="button" onClick={() => onZoomChange(0.72)} style={zoomButton}>
          Fit
        </button>
        <button type="button" onClick={() => onZoomChange(Math.min(MAX_ZOOM, Math.round((clamped + 0.1) * 100) / 100))} style={zoomButton}>
          Zoom in
        </button>
      </div>
      <div style={{ overflow: "auto", background: "#1c140e", padding: 16 }}>
        <div style={{ width: `calc(210mm * ${clamped})`, height: `calc(297mm * ${clamped})` }}>
          <div style={{ transform: `scale(${clamped})`, transformOrigin: "top left", width: "210mm", height: "297mm" }}>
            <CodexPage model={model} />
          </div>
        </div>
      </div>
    </div>
  );
}

const zoomButton = {
  minHeight: 44,
  minWidth: 44,
  padding: "0 12px",
  border: `1px solid ${ILLUMINATED_TOKENS.gildedBronze}`,
  background: ILLUMINATED_TOKENS.ink,
  color: ILLUMINATED_TOKENS.parchment,
} as const;
