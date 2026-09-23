import type { CodexRenderModel } from "../composition/types";
import { regionBox } from "../templates/illuminated-codex/ornaments";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";
import { PlateText, textsWithPrefix } from "./PlateText";

function Band({ model, regionKey, label, ids }: { model: CodexRenderModel; regionKey: "vitals" | "attributes" | "chronicle"; label: string; ids: string[] }) {
  const region = model.regions[regionKey];
  return (
    <section style={{ ...regionBox(region), borderTop: `0.8pt solid ${ILLUMINATED_TOKENS.oxblood}` }} aria-label={label}>
      {ids.map((id) => (
        <PlateText key={id} model={model} id={id} origin={region} />
      ))}
    </section>
  );
}

export function CodexBottomSystem({ model }: { model: CodexRenderModel }) {
  return (
    <>
      <Band model={model} regionKey="vitals" label="Vitals" ids={textsWithPrefix(model, "vitals.")} />
      <Band model={model} regionKey="attributes" label="Attributes" ids={textsWithPrefix(model, "attr.")} />
      <Band model={model} regionKey="chronicle" label="Chronicle" ids={["chronicle.body"]} />
    </>
  );
}
