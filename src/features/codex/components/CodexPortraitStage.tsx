import type { CodexRenderModel } from "../composition/types";
import { regionBox } from "../templates/illuminated-codex/ornaments";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";

export function CodexPortraitStage({ model }: { model: CodexRenderModel }) {
  const region = model.regions.portrait;
  const crop = model.portraitCrop;
  return (
    <section style={regionBox(region)} aria-label="Portrait stage">
      <div
        style={{
          position: "absolute",
          inset: "3mm",
          background: ILLUMINATED_TOKENS.agedFiber,
          overflow: "hidden",
          border: `0.6pt solid ${ILLUMINATED_TOKENS.gildedBronze}`,
        }}
      >
        {model.portraitUrl ? (
          <img
            src={model.portraitUrl}
            alt=""
            style={{
              width: `${100 / Math.max(crop.width, 0.05)}%`,
              height: `${100 / Math.max(crop.height, 0.05)}%`,
              marginLeft: `${-(crop.x / Math.max(crop.width, 0.05)) * 100}%`,
              marginTop: `${-(crop.y / Math.max(crop.height, 0.05)) * 100}%`,
              objectFit: "cover",
              objectPosition: `${model.focalPoint.x * 100}% ${model.focalPoint.y * 100}%`,
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: ILLUMINATED_TOKENS.oxblood,
              fontFamily: '"Cinzel", "Noto Serif", Palatino, serif',
              textAlign: "center",
              padding: "8mm",
            }}
          >
            <div>
              <div style={{ fontSize: "22pt" }}>{model.crest ?? model.silhouette ?? "WV"}</div>
              <div style={{ marginTop: "4mm", fontSize: "9pt", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Portrait not set
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
