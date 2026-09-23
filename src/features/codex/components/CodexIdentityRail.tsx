import type { CodexRenderModel } from "../composition/types";
import { CodexMonogram, regionBox } from "../templates/illuminated-codex/ornaments";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";
import { PlateText, textsWithPrefix } from "./PlateText";

export function CodexIdentityRail({ model }: { model: CodexRenderModel }) {
  const region = model.regions.identity;
  return (
    <section style={{ ...regionBox(region), borderRight: `0.4pt solid ${ILLUMINATED_TOKENS.gildedBronze}` }} aria-label="Identity rail">
      <PlateText model={model} id="identity.kicker" origin={region} />
      <PlateText model={model} id="identity.role" origin={region} />
      <div style={{ position: "absolute", left: "2mm", top: "14mm" }}>
        <CodexMonogram letters={model.crest} />
      </div>
      {textsWithPrefix(model, "identity.mark.").map((id) => (
        <PlateText key={id} model={model} id={id} origin={region} />
      ))}
      {textsWithPrefix(model, "identity.trait.").map((id) => (
        <PlateText key={id} model={model} id={id} origin={region} />
      ))}
    </section>
  );
}
