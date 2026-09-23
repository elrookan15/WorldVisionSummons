import type { CodexRenderModel } from "../composition/types";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";
import { regionBox } from "../templates/illuminated-codex/ornaments";
import { PlateText } from "./PlateText";

export function CodexTitleCartouche({ model }: { model: CodexRenderModel }) {
  const region = model.regions.title;
  return (
    <header style={{ ...regionBox(region), borderBottom: `0.8pt solid ${ILLUMINATED_TOKENS.gildedBronze}` }} aria-label="Title cartouche">
      <PlateText model={model} id="title.name" origin={region} />
      <PlateText model={model} id="title.epithet" origin={region} />
      <PlateText model={model} id="title.rank" origin={region} />
      <PlateText model={model} id="title.motto" origin={region} />
    </header>
  );
}
