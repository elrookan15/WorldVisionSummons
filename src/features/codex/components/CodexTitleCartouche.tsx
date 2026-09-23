import type { CodexRenderModel } from "../composition/types";
import { skinFor } from "../templates/illuminated-codex/skins";
import { regionBox } from "../templates/illuminated-codex/ornaments";
import { PlateText, textsWithPrefix } from "./PlateText";

export function CodexTitleCartouche({ model }: { model: CodexRenderModel }) {
  const region = model.regions.title;
  const skin = skinFor(model.genre);
  return (
    <header style={{ ...regionBox(region) }} aria-label="Title cartouche">
      <svg viewBox={`0 0 ${region.w} ${region.h}`} width="100%" height="100%" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
        <rect x="1" y="1" width={region.w - 2} height={region.h - 2} fill="none" stroke={skin.accent} strokeWidth="0.35" />
        <path d={`M8 ${region.h - 2.2} H${region.w - 8}`} stroke={skin.rule} strokeWidth="0.25" />
      </svg>
      {textsWithPrefix(model, "title.").map((id) => (
        <PlateText key={id} model={model} id={id} origin={region} />
      ))}
    </header>
  );
}
