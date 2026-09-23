import type { CodexRenderModel } from "../composition/types";
import { CodexLeaderLines, CodexOrnamentFrame } from "../templates/illuminated-codex/ornaments";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";
import { CodexBottomSystem } from "./CodexBottomSystem";
import { CodexFooterProvenance } from "./CodexFooterProvenance";
import { CodexGearRail } from "./CodexGearRail";
import { CodexIdentityRail } from "./CodexIdentityRail";
import { CodexPortraitStage } from "./CodexPortraitStage";
import { CodexTitleCartouche } from "./CodexTitleCartouche";

export function CodexPage({ model }: { model: CodexRenderModel }) {
  return (
    <article
      className="codex-page"
      aria-label={model.locked ? "Sealed codex page" : "Unsealed codex proof"}
      style={{
        position: "relative",
        width: "210mm",
        height: "297mm",
        background: ILLUMINATED_TOKENS.parchment,
        color: ILLUMINATED_TOKENS.ink,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <style>
        {`@page { size: A4 portrait; margin: 0; }
          @media print {
            .codex-preview-chrome { display: none !important; }
            .codex-page { box-shadow: none !important; }
          }`}
      </style>
      <CodexOrnamentFrame />
      <CodexTitleCartouche model={model} />
      <CodexIdentityRail model={model} />
      <CodexPortraitStage model={model} />
      <CodexGearRail model={model} />
      <CodexLeaderLines
        lines={model.callouts.map((callout) => ({
          x1: callout.anchorPoint.x,
          y1: callout.anchorPoint.y,
          x2: callout.calloutPoint.x,
          y2: callout.calloutPoint.y,
        }))}
      />
      <CodexBottomSystem model={model} />
      <CodexFooterProvenance model={model} />
    </article>
  );
}
