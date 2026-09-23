import type { CodexRenderModel } from "../composition/types";
import { plateFont, regionBox } from "../templates/illuminated-codex/ornaments";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";

export function CodexGearRail({ model }: { model: CodexRenderModel }) {
  const region = model.regions.gear;
  const cardH = region.h / Math.max(1, model.callouts.length);
  return (
    <section style={{ ...regionBox(region), borderLeft: `0.4pt solid ${ILLUMINATED_TOKENS.gildedBronze}` }} aria-label="Gear rail">
      {model.callouts.map((callout, index) => (
        <div
          key={callout.id}
          style={{
            position: "absolute",
            left: "1.5mm",
            top: `${index * cardH + 1}mm`,
            width: `${region.w - 3}mm`,
          }}
        >
          <div style={{ fontFamily: plateFont("body"), fontSize: "8pt", color: ILLUMINATED_TOKENS.ink, overflow: "hidden" }}>
            {callout.annotation || callout.name}
          </div>
        </div>
      ))}
    </section>
  );
}
