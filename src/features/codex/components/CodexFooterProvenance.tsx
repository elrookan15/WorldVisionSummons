import type { CodexRenderModel } from "../composition/types";
import { regionBox } from "../templates/illuminated-codex/ornaments";
import { skinFor } from "../templates/illuminated-codex/skins";
import { PlateText } from "./PlateText";

export function CodexFooterProvenance({ model }: { model: CodexRenderModel }) {
  const region = model.regions.footer;
  const skin = skinFor(model.genre);
  return (
    <footer style={{ ...regionBox(region), borderTop: `0.4pt solid ${skin.rule}` }} aria-label="Provenance">
      <PlateText model={model} id="footer.provenance" origin={region} />
    </footer>
  );
}
