import type { CodexRenderModel } from "../composition/types";
import { regionBox } from "../templates/illuminated-codex/ornaments";
import { skinFor } from "../templates/illuminated-codex/skins";

export function CodexPortraitStage({ model }: { model: CodexRenderModel }) {
  const region = model.regions.portrait;
  const crop = model.portraitCrop;
  const skin = skinFor(model.genre);
  return (
    <section style={regionBox(region)} aria-label="Portrait stage">
      <div
        style={{
          position: "absolute",
          inset: "3mm",
          background: skin.mid,
          overflow: "hidden",
          border: `0.8pt solid ${skin.accent}`,
          boxShadow: `inset 0 0 0 1.2mm ${skin.ground}, inset 0 0 0 1.6mm ${skin.rule}`,
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
              filter: skin.portraitFilter,
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
              <path d="M20 2 L36 8 V24 C36 34 28 42 20 44 C12 42 4 34 4 24 V8 Z" fill="none" stroke={skin.accent} strokeWidth="1.1" />
              <path d="M20 8 L30 12 V22 C30 29 25 35 20 37 C15 35 10 29 10 22 V12 Z" fill="none" stroke={skin.rule} strokeWidth="0.6" />
              <text x="20" y="26" textAnchor="middle" fontSize="8" fill={skin.accent} fontFamily="Cinzel, Palatino, serif">
                {model.crest ?? ""}
              </text>
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}
