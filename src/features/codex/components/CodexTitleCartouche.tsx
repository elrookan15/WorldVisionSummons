import type { CodexRenderModel } from "../composition/types";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";
import { regionBox } from "../templates/illuminated-codex/ornaments";
import { PlateText, textsWithPrefix } from "./PlateText";

export function CodexTitleCartouche({ model }: { model: CodexRenderModel }) {
  const region = model.regions.title;
  return (
    <header style={{ ...regionBox(region) }} aria-label="Title cartouche">
      <svg viewBox={`0 0 ${region.w} ${region.h}`} width="100%" height="100%" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
        <rect x="1" y="1" width={region.w - 2} height={region.h - 2} fill="none" stroke={ILLUMINATED_TOKENS.oxblood} strokeWidth="0.35" />
        <path d={`M8 ${region.h - 2.2} H${region.w - 8}`} stroke={ILLUMINATED_TOKENS.gildedBronze} strokeWidth="0.25" />
      </svg>
      {textsWithPrefix(model, "title.").map((id) => (
        <PlateText key={id} model={model} id={id} origin={region} />
      ))}
    </header>
  );
}
