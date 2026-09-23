import type { CodexRenderModel } from "../composition/types";
import { CodexMonogram, regionBox } from "../templates/illuminated-codex/ornaments";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";
import { PlateText, textsWithPrefix } from "./PlateText";

export function CodexIdentityRail({ model }: { model: CodexRenderModel }) {
  const region = model.regions.identity;
  return (
    <section style={{ ...regionBox(region), borderRight: `0.4pt solid ${ILLUMINATED_TOKENS.gildedBronze}` }} aria-label="Identity rail">
      <div style={{ position: "absolute", left: "1.5mm", top: "1.5mm" }}>
        <CodexMonogram letters={model.crest} />
      </div>
      {textsWithPrefix(model, "identity.").map((id) => (
        <PlateText key={id} model={model} id={id} origin={region} />
      ))}
    </section>
  );
}
