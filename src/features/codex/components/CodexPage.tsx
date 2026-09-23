import type { CodexRenderModel } from "../composition/types";
import { CodexLeaderLines, CodexOrnamentFrame, CodexParchmentGround } from "../templates/illuminated-codex/ornaments";
import { skinFonts, skinFor } from "../templates/illuminated-codex/skins";
import { CodexBottomSystem } from "./CodexBottomSystem";
import { CodexFooterProvenance } from "./CodexFooterProvenance";
import { CodexGearRail } from "./CodexGearRail";
import { CodexIdentityRail } from "./CodexIdentityRail";
import { CodexPortraitStage } from "./CodexPortraitStage";
import { CodexTitleCartouche } from "./CodexTitleCartouche";

export function CodexPage({ model }: { model: CodexRenderModel }) {
  const skin = skinFor(model.genre);
  const fonts = skinFonts(model.genre);
  return (
    <article
      className="codex-page"
      aria-label={model.sealed ? "Sealed codex page" : "Unsealed codex proof"}
      style={{
        position: "relative",
        width: "210mm",
        height: "297mm",
        background: skin.mid,
        color: skin.ink,
        overflow: "hidden",
        boxSizing: "border-box",
        boxShadow: skin.edgeShadow,
        ["--codex-display" as string]: fonts.display,
        ["--codex-body" as string]: fonts.body,
        ["--codex-label" as string]: fonts.label,
        ["--codex-mono" as string]: fonts.mono,
      }}
    >
      <CodexParchmentGround skin={skin} />
      <style>
        {`@page { size: 210mm 297mm; margin: 0; }
          @media print {
            .codex-preview-chrome { display: none !important; }
            .codex-page { box-shadow: none !important; }
          }`}
      </style>
      <CodexOrnamentFrame rules={model.rules} skin={skin} />
      <CodexTitleCartouche model={model} />
      <CodexIdentityRail model={model} />
      <CodexPortraitStage model={model} />
      <CodexGearRail model={model} />
      {model.leadersDropped ? null : <CodexLeaderLines routes={model.callouts} skin={skin} />}
      <CodexBottomSystem model={model} />
      <CodexFooterProvenance model={model} />
    </article>
  );
}
