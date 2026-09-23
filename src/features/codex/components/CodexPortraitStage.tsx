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
          background: "#CDB892",
          overflow: "hidden",
          border: `0.8pt solid ${ILLUMINATED_TOKENS.oxblood}`,
          boxShadow: `inset 0 0 0 1.2mm ${ILLUMINATED_TOKENS.agedFiber}, inset 0 0 0 1.6mm ${ILLUMINATED_TOKENS.gildedBronze}`,
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
              filter: "grayscale(0.42) sepia(0.38) contrast(1.08) saturate(0.72)",
            }}
          />
        ) : (
          <div
            aria-label="Portrait not set"
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              background:
                "repeating-linear-gradient(135deg, rgba(107,51,36,0.08) 0 0.4mm, transparent 0.4mm 2.4mm)",
            }}
          >
            <svg width="36mm" height="42mm" viewBox="0 0 40 46" aria-hidden="true">
              <path d="M20 2 L36 8 V24 C36 34 28 42 20 44 C12 42 4 34 4 24 V8 Z" fill="none" stroke={ILLUMINATED_TOKENS.oxblood} strokeWidth="1.1" />
              <path d="M20 8 L30 12 V22 C30 29 25 35 20 37 C15 35 10 29 10 22 V12 Z" fill="none" stroke={ILLUMINATED_TOKENS.gildedBronze} strokeWidth="0.6" />
              <text x="20" y="26" textAnchor="middle" fontSize="8" fill={ILLUMINATED_TOKENS.oxblood} fontFamily="Cinzel, Palatino, serif">
                {model.crest ?? ""}
              </text>
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}
