import type { CodexRenderModel } from "../composition/types";
import { regionBox } from "../templates/illuminated-codex/ornaments";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";
import { PlateText } from "./PlateText";

export function CodexFooterProvenance({ model }: { model: CodexRenderModel }) {
  const region = model.regions.footer;
  return (
    <footer style={{ ...regionBox(region), borderTop: `0.4pt solid ${ILLUMINATED_TOKENS.gildedBronze}` }} aria-label="Provenance">
      <PlateText model={model} id="footer.provenance" origin={region} />
    </footer>
  );
}
