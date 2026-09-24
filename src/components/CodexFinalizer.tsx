import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { UiSheetData } from "../lib/sheetMapper";
import { compose } from "../lib/codex/compose";
import type { CodexCallout, DnaLine } from "../lib/codexPageModel";
import {
  CODEX_STYLES,
  codexStyleById,
  defaultCodexStyleForGenre,
  type CodexStyleId,
} from "../lib/codexStyles";
import { mintSnapshot, normalizeSheet, pinPortrait, type CodexSnapshot } from "../lib/codex/finalizer";
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

function Corner() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M6 58 V14 H50" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M12 52 V20 H44" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="14" cy="14" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14 8 V4 M8 14 H4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function Crest({ initials }: { initials: string }) {
  const mark = initials || "—";
  return (
    <svg viewBox="0 0 88 104" role="img" aria-label="Heraldic crest">
      <path d="M44 4 L80 18 V52 C80 74 64 90 44 100 C24 90 8 74 8 52 V18 Z" fill="rgba(255,244,220,0.18)" stroke="currentColor" strokeWidth="2" />
      <path d="M44 14 L70 24 V50 C70 66 58 78 44 86 C30 78 18 66 18 50 V24 Z" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M44 28 V62 M30 46 H58" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="44" cy="46" r="10" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <text x="44" y="50" textAnchor="middle" fontFamily="Cinzel, Palatino, serif" fontSize="11" fill="currentColor">{mark}</text>
    </svg>
  );
}

function Vignette({ kind }: { kind: CodexCallout["vignette"] }) {
  const common = { fill: "none" as const, stroke: "currentColor", strokeWidth: 1.6 };
  let drawing: ReactNode = null;
  if (kind === "weapon") {
    drawing = <path d="M18 78 L48 14 L54 20 L28 78 Z M22 78 H40 M48 14 L58 8" {...common} />;
  } else if (kind === "focus") {
    drawing = (
      <>
        <path d="M36 80 V28" {...common} />
        <circle cx="36" cy="20" r="8" {...common} />
        <path d="M28 36 H44" {...common} />
      </>
    );
  } else if (kind === "armor") {
    drawing = <path d="M22 22 H50 L56 40 V62 H16 V40 Z M36 22 V62 M16 44 H56" {...common} />;
  } else if (kind === "consumable") {
    drawing = <path d="M28 28 H44 V36 L50 70 H22 L28 36 Z M26 28 H46" {...common} />;
  } else if (kind === "relic") {
    drawing = <path d="M36 12 L44 28 L62 30 L48 42 L52 60 L36 50 L20 60 L24 42 L10 30 L28 28 Z" {...common} />;
  } else if (kind === "ability") {
    drawing = <path d="M36 14 L42 32 H60 L46 42 L52 62 L36 50 L20 62 L26 42 L12 32 H30 Z" {...common} />;
  } else {
    drawing = (
      <>
        <rect x="16" y="24" width="40" height="28" {...common} />
        <path d="M16 52 H56 M24 62 H48" {...common} />
      </>
    );
  }
  return (
    <div className="codex-vignette" aria-hidden="true">
      <svg viewBox="0 0 72 84">{drawing}</svg>
    </div>
  );
}

function SpecList({ lines, limit }: { lines: DnaLine[]; limit: number }) {
  const shown = lines.slice(0, limit);
  if (!shown.length) return null;
  return (
    <dl className="codex-spec">
      {shown.map((line) => (
        <div key={line.label} style={{ display: "contents" }}>
          <dt>{line.label}</dt>
          <dd className="codex-clip-2">{line.text}</dd>
        </div>
      ))}
    </dl>
  );
}

function CalloutList({ items, side }: { items: CodexCallout[]; side: "left" | "right" }) {
  if (!items.length) return null;
  return (
    <>
      {items.map((item) => (
        <article key={item.id} className={`codex-callout codex-callout--${side}`} data-codex-callout={item.id}>
          <Vignette kind={item.vignette} />
          <div>
            <div className="codex-kicker">{item.kicker}</div>
            <h3 className="codex-clip-2">{item.title}</h3>
            {item.body ? <p className="codex-clip-3">{item.body}</p> : null}
          </div>
        </article>
      ))}
    </>
  );
}

function EmptyPlate({ initials, name }: { initials: string; name: string }) {
  return (
    <div className="codex-empty-plate" data-codex-portrait="empty" style={{ width: "100%", height: "100%" }}>
      <svg viewBox="0 0 240 420" role="img" aria-label="Empty portrait sigil">
        <rect x="16" y="16" width="208" height="388" fill="rgba(255,244,220,0.12)" stroke="currentColor" strokeWidth="2" />
        <rect x="26" y="26" width="188" height="368" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="120" cy="168" r="54" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="120" cy="168" r="36" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M120 114 V222 M66 168 H174" stroke="currentColor" strokeWidth="1" />
        <text x="120" y="174" textAnchor="middle" fontFamily="Cinzel, Palatino, serif" fontSize="22" fill="currentColor">{initials || "WV"}</text>
        <text x="120" y="300" textAnchor="middle" fontFamily="Cormorant Garamond, Palatino, serif" fontSize="13" fontStyle="italic" fill="currentColor">
          {name ? name.slice(0, 28) : "Unsealed"}
        </text>
        <text x="120" y="322" textAnchor="middle" fontFamily="Cinzel, Palatino, serif" fontSize="8" letterSpacing="2" fill="currentColor">PORTRAIT SEAL</text>
      </svg>
    </div>
  );
}

export default function CodexFinalizer({ sheet, portraitUrl, sourceKey = "current", onClose }: CodexFinalizerProps) {
  const [artifact, setArtifact] = useState<CodexSnapshot>(() => openPreview(sheet, portraitUrl, sourceKey));
  const [portraitBroken, setPortraitBroken] = useState(false);
  const [exportNote, setExportNote] = useState("");
  const plateRef = useRef<HTMLElement>(null);
  const locked = artifact.snapshotId !== "draft";
  const page = compose(artifact);
  const sourcePortrait = portraitBroken ? null : artifact.assets.portrait.url;
  const displayName = page.name || "Unnamed Summon";
  const leftCallouts = page.abilities.slice(0, 3);
  const rightCallouts = page.callouts;
  const skin = codexStyleById(artifact.styleId);
  const skinVars = {
    "--codex-ground": skin.ground,
    "--codex-ground2": skin.ground2,
    "--codex-ink": skin.ink,
    "--codex-accent": skin.accent,
    "--codex-accent2": skin.accent2,
    "--codex-display": skin.display,
    "--codex-body": skin.body,
    "--codex-caps": skin.caps,
    "--codex-portrait": skin.portrait,
    color: skin.ink,
  } as CSSProperties;

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
        {exportNote ? <span className="codex-lock" role="status">{exportNote}</span> : null}
        <div className="codex-picker" role="listbox" aria-label="Codex plate style">
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
        </div>
      </div>
      <div className="codex-stage">
        <article
          ref={plateRef}
          className="codex-sheet"
          data-codex-style={skin.id}
          data-codex-style-name={skin.name}
          data-page-size={artifact.pageSize}
          data-codex-locked={locked ? "true" : "false"}
          style={skinVars}
          aria-label={`${displayName} codex page`}
        >
          <div className="codex-frame">
            <span className="codex-corner codex-corner--tl"><Corner /></span>
            <span className="codex-corner codex-corner--tr"><Corner /></span>
            <span className="codex-corner codex-corner--bl"><Corner /></span>
            <span className="codex-corner codex-corner--br"><Corner /></span>

            <header className="codex-title" data-codex-zone="title">
              <div className="codex-crest codex-crest--high" data-codex-zone="heraldry-high">
                <Crest initials={page.initials} />
              </div>
              <div>
                {page.style ? <p className="codex-kicker">{page.style}</p> : null}
                <h1 className={displayName.length > 18 ? "codex-name codex-name--long" : "codex-name"}>{displayName}</h1>
                {page.subtitle ? <p className="codex-subtitle codex-clip-2">{page.subtitle}</p> : null}
              </div>
              <div className="codex-style-seal">{page.initials || "WV"}</div>
            </header>

            <div className="codex-body">
              <div className="codex-col" data-codex-zone="lore">
                {page.roleLines.length > 0 && (
                  <section className="codex-panel">
                    <h2 className="codex-label">Role & Purpose</h2>
                    <SpecList lines={page.roleLines} limit={8} />
                  </section>
                )}
                {page.loreParagraphs.length > 0 && (
                  <section className="codex-panel">
                    <h2 className="codex-label">Lore</h2>
                    <div className="codex-prose codex-clip-8">
                      {page.loreParagraphs.join(" ")}
                    </div>
                  </section>
                )}
                {page.dna.length > 0 && (
                  <section className="codex-panel">
                    <h2 className="codex-label">Psychological Seal</h2>
                    <SpecList lines={page.dna} limit={8} />
                  </section>
                )}
                {page.relationships.length > 0 && (
                  <section className="codex-panel" data-codex-zone="bonds">
                    <h2 className="codex-label">Bonds</h2>
                    <SpecList lines={page.relationships} limit={4} />
                  </section>
                )}
                {page.physicalLines.length > 0 && (
                  <section className="codex-panel">
                    <h2 className="codex-label">The Figure</h2>
                    <SpecList lines={page.physicalLines} limit={6} />
                  </section>
                )}
                <CalloutList items={leftCallouts} side="left" />
              </div>

              <div className="codex-portrait-well" data-codex-zone="portrait">
                {sourcePortrait ? (
                  <img src={sourcePortrait} alt="" data-codex-portrait="live" onError={() => setPortraitBroken(true)} />
                ) : (
                  <EmptyPlate initials={page.initials} name={displayName} />
                )}
              </div>

              <div className="codex-col" data-codex-zone="callouts">
                <CalloutList items={rightCallouts} side="right" />
                {page.weakness ? (
                  <section className="codex-panel">
                    <h2 className="codex-label">Vulnerability</h2>
                    <p className="codex-prose codex-clip-4">{page.weakness}</p>
                  </section>
                ) : null}
                {page.magic ? (
                  <section className="codex-panel">
                    <h2 className="codex-label">Arcana</h2>
                    <p className="codex-prose codex-clip-3">{page.magic}</p>
                  </section>
                ) : null}
              </div>
            </div>

            <footer className="codex-bottom" data-codex-zone="bottom">
                {page.attributes.length > 0 && (
                  <section className="codex-panel" data-codex-zone="attributes">
                    <h2 className="codex-label">Attributes</h2>
                    <div className="codex-attrs">
                      {page.attributes.slice(0, 6).map((stat) => (
                        <div key={stat.key} className="codex-attr">
                          <b>{stat.value}</b>
                          <span>{stat.key}</span>
                          <small>{stat.label}</small>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {page.combat.length > 0 && (
                  <section className="codex-panel" data-codex-zone="combat">
                    <h2 className="codex-label">Combat Matrix</h2>
                    <SpecList lines={page.combat} limit={6} />
                  </section>
                )}
                {page.skills.length > 0 && (
                  <section className="codex-panel" data-codex-zone="skills">
                    <h2 className="codex-label">Proficiencies</h2>
                    <SpecList
                      lines={page.skills.slice(0, 6).map((skill) => ({ label: skill.name, text: String(skill.value) }))}
                      limit={6}
                    />
                  </section>
                )}
                <section className="codex-panel codex-crest-panel" data-codex-zone="heraldry">
                  <h2 className="codex-label">Heraldry</h2>
                  <div className="codex-crest">
                    <Crest initials={page.initials} />
                  </div>
                </section>
              </footer>

            <p className="codex-footer" data-codex-zone="footer">
              {page.quote ? <span className="codex-clip-3">“{page.quote}”</span> : null}
              {page.quote && page.quoteAttribution ? <cite>— {page.quoteAttribution}</cite> : null}
              <span className="codex-colophon">Recorded in the codex · {skin.name}</span>
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
