import type { CodexRenderModel } from "../composition/types";
import { CodexCrest, regionBox } from "../templates/illuminated-codex/ornaments";
import { skinFor } from "../templates/illuminated-codex/skins";
import { PlateText, textsWithPrefix } from "./PlateText";

export function CodexIdentityRail({ model }: { model: CodexRenderModel }) {
  const region = model.regions.identity;
  const skin = skinFor(model.genre);
  return (
    <section style={{ ...regionBox(region), borderRight: `0.4pt solid ${skin.rule}` }} aria-label="Identity rail">
      <div style={{ position: "absolute", left: "8mm", top: "1mm" }}>
        <CodexCrest letters={model.crest} size={34} skin={skin} />
      </div>
      {textsWithPrefix(model, "identity.").map((id) => (
        <PlateText key={id} model={model} id={id} origin={region} />
      ))}
    </section>
  );
}
