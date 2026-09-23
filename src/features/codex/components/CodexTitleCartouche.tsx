import type { CodexRenderModel } from "../composition/types";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";
import { regionBox } from "../templates/illuminated-codex/ornaments";
import { PlateText, textsWithPrefix } from "./PlateText";

export function CodexTitleCartouche({ model }: { model: CodexRenderModel }) {
  const region = model.regions.title;
  return (
    <header style={{ ...regionBox(region), borderBottom: `0.8pt solid ${ILLUMINATED_TOKENS.gildedBronze}` }} aria-label="Title cartouche">
      {textsWithPrefix(model, "title.").map((id) => (
        <PlateText key={id} model={model} id={id} origin={region} />
      ))}
    </header>
  );
}
