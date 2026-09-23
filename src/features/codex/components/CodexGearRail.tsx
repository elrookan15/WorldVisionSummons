import type { CalloutRoute, CodexRenderModel } from "../composition/types";
import { CodexItemVignette, plateFont, regionBox } from "../templates/illuminated-codex/ornaments";
import { skinFor } from "../templates/illuminated-codex/skins";

function blurb(callout: CalloutRoute): string {
  const prefix = `${callout.name} `;
  if (callout.annotation.startsWith(prefix)) return callout.annotation.slice(prefix.length);
  if (callout.annotation === callout.name) return "";
  return callout.annotation;
}

export function CodexGearRail({ model }: { model: CodexRenderModel }) {
  const region = model.regions.gear;
  const skin = skinFor(model.genre);
  const cardH = region.h / Math.max(1, model.callouts.length);
  return (
    <section style={{ ...regionBox(region), borderLeft: `0.4pt solid ${skin.rule}` }} aria-label="Gear rail">
      {model.callouts.map((callout, index) => {
        const note = blurb(callout);
        return (
          <div
            key={callout.id}
            style={{
              position: "absolute",
              left: "1.2mm",
              top: `${index * cardH + 1.2}mm`,
              width: `${region.w - 2.4}mm`,
              height: `${Math.max(0, cardH - 2)}mm`,
              overflow: "hidden",
              borderBottom: `0.4pt solid ${skin.rule}`,
            }}
          >
            <div style={{ display: "flex", gap: "1.4mm", alignItems: "flex-start" }}>
              <div style={{ flex: "0 0 auto" }}>
                <CodexItemVignette target={callout.target} skin={skin} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: plateFont("label"),
                    fontSize: "7.5pt",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: skin.accent,
                    lineHeight: 1.15,
                  }}
                >
                  {callout.name}
                </div>
                {note ? (
                  <div
                    style={{
                      marginTop: "0.6mm",
                      fontFamily: plateFont("body"),
                      fontStyle: "italic",
                      fontSize: "8pt",
                      lineHeight: 1.15,
                      color: skin.ink,
                    }}
                  >
                    {note}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
