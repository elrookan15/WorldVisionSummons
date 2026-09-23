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
      aria-label={model.sealed ? "Sealed codex page" : "Unsealed codex proof"}
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
        {`@page { size: 210mm 297mm; margin: 0; }
          @media print {
            .codex-preview-chrome { display: none !important; }
            .codex-page { box-shadow: none !important; }
          }`}
      </style>
      <CodexOrnamentFrame rules={model.rules} />
      <CodexTitleCartouche model={model} />
      <CodexIdentityRail model={model} />
      <CodexPortraitStage model={model} />
      <CodexGearRail model={model} />
      {model.leadersDropped ? null : <CodexLeaderLines routes={model.callouts} />}
      <CodexBottomSystem model={model} />
      <CodexFooterProvenance model={model} />
    </article>
  );
}
