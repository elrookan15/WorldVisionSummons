import { useRef, useState, type CSSProperties } from "react";
import type { UiSheetData } from "../lib/sheetMapper";
import CodexPage from "./CodexPage";
import {
  CODEX_STYLES,
  codexStyleById,
  defaultCodexStyleForGenre,
  type CodexStyleId,
} from "../lib/codexStyles";
import { listSnapshots, mintSnapshot, normalizeSheet, pinPortrait, type CodexSnapshot } from "../lib/codex/finalizer";
import { armPdfTitle, exportSnapshotJson, exportSnapshotPdf, exportSnapshotPng } from "../lib/codex/export";
import "../codex-finalizer.css";

type CodexFinalizerProps = {
  sheet: UiSheetData;
  portraitUrl: string | null;
  sourceKey?: string;
  onClose: () => void;
};

function openPreview(sheet: UiSheetData, portraitUrl: string | null, sourceKey: string): CodexSnapshot {
  const styleId = defaultCodexStyleForGenre(sheet.sheet_style);
  return {
    snapshotId: "draft",
    revision: 0,
    sourceKey,
    createdAt: "",
    contentHash: "",
    styleId,
    pageSize: "A4",
    character: normalizeSheet(sheet),
    assets: {
      portrait: { url: pinPortrait(portraitUrl), fallback: "sigil" },
      crest: { url: null, fallback: "sigil" },
      itemVignettes: {},
    },
  };
}

export default function CodexFinalizer({ sheet, portraitUrl, sourceKey = "current", onClose }: CodexFinalizerProps) {
  const [artifact, setArtifact] = useState<CodexSnapshot>(() => openPreview(sheet, portraitUrl, sourceKey));
  const [portraitBroken, setPortraitBroken] = useState(false);
  const [exportNote, setExportNote] = useState("");
  const plateRef = useRef<HTMLElement>(null);
  const locked = artifact.snapshotId !== "draft";
  const skin = codexStyleById(artifact.styleId);
  const publish = async (next: CodexSnapshot) => {
    setArtifact(next);
    try {
      await fetch("/api/codex/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
    } catch {
      /* local revision remains the artifact */
    }
  };

  const choose = (id: CodexStyleId) => {
    if (locked) return;
    setArtifact((current) => ({ ...current, styleId: id }));
    setExportNote("");
  };

  const confirm = () => {
    if (locked) return;
    void mintSnapshot({
      sheet: artifact.character,
      portraitUrl: artifact.assets.portrait.url,
      styleId: artifact.styleId,
      pageSize: artifact.pageSize,
      sourceKey: artifact.sourceKey,
    }).then(publish);
  };

  const exportJson = () => {
    if (!locked) return;
    exportSnapshotJson(artifact);
  };

  const exportPng = () => {
    if (!locked || !plateRef.current) return;
    setExportNote("");
    void exportSnapshotPng(plateRef.current, artifact).catch(() => {
      setExportNote("PNG export failed. Print PDF still uses this plate.");
    });
  };

  const exportPdf = () => {
    if (!locked) return;
    armPdfTitle(artifact);
    exportSnapshotPdf();
  };

  return (
    <div className="codex-finalizer" data-codex-page="final">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Shippori+Mincho&family=Special+Elite&family=UnifrakturMaguntia&display=swap" />
      <div className="codex-toolbar no-print">
        <button type="button" onClick={onClose}>Return to atelier</button>
        <button
          type="button"
          onClick={() => {
            if (locked) return;
            setArtifact((current) => ({ ...current, pageSize: current.pageSize === "A4" ? "US-Letter" : "A4" }));
          }}
        >{artifact.pageSize}</button>
        {locked ? (
          <span className="codex-lock" data-codex-revision={artifact.revision}>Revision {artifact.revision} · finalized {artifact.createdAt.slice(0, 10)}</span>
        ) : (
          <button type="button" onClick={confirm}>Lock snapshot</button>
        )}
        <button type="button" onClick={exportJson} disabled={!locked}>Export JSON</button>
        <button type="button" onClick={exportPng} disabled={!locked}>Export PNG</button>
        <button type="button" onClick={exportPdf} disabled={!locked}>Print PDF</button>
        {locked ? (
          <label className="codex-lock">
            Revisions
            <select
              aria-label="Saved revisions"
              value={artifact.snapshotId}
              onChange={(event) => {
                const next = listSnapshots(artifact.sourceKey).find((row) => row.snapshotId === event.target.value);
                if (next) setArtifact(next);
              }}
            >
              {listSnapshots(artifact.sourceKey).map((row) => (
                <option key={row.snapshotId} value={row.snapshotId}>Revision {row.revision}</option>
              ))}
            </select>
          </label>
        ) : null}
        {exportNote ? <span className="codex-lock" role="status">{exportNote}</span> : null}
        {!locked && <div className="codex-picker" role="listbox" aria-label="Codex plate style">
          {CODEX_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              className="codex-swatch"
              role="option"
              aria-pressed={style.id === skin.id}
              disabled={locked}
              onClick={() => choose(style.id)}
            >
              <span
                className="codex-swatch-chip"
                style={{ "--swatch-ground": style.ground, "--swatch-ground2": style.ground2, "--swatch-accent": style.accent } as CSSProperties}
              />
              <strong>{style.name}</strong>
              <em>{style.mood}</em>
            </button>
          ))}
        </div>}
      </div>
      <CodexPage
        snapshot={artifact}
        plateRef={plateRef}
        portraitUrl={portraitBroken ? null : artifact.assets.portrait.url}
        onPortraitError={() => setPortraitBroken(true)}
      />
    </div>
  );
}
