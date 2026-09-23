import { regionBox } from "../templates/illuminated-codex/ornaments";
import { ILLUMINATED_TOKENS } from "../templates/illuminated-codex/tokens";
import type { CodexRenderModel } from "../composition/types";

export function CodexPortraitStage({ model }: { model: CodexRenderModel }) {
  const region = model.regions.portrait;
  const crop = model.portraitCrop;
  return (
    <section style={regionBox(region)} aria-label="Portrait stage">
      <div
        style={{
          position: "absolute",
          inset: "2mm",
          background: ILLUMINATED_TOKENS.parchmentDeep,
          WebkitMaskImage: "radial-gradient(ellipse at center, #000 62%, transparent 100%)",
          maskImage: "radial-gradient(ellipse at center, #000 62%, transparent 100%)",
          overflow: "hidden",
        }}
      >
        {model.portraitUrl ? (
          <img
            src={model.portraitUrl}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: `${crop.x / 10}% ${crop.y / 10}%`,
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
              fontFamily: '"Cinzel", Palatino, serif',
              fontSize: "22pt",
            }}
          >
            {model.crest}
          </div>
        )}
      </div>
    </section>
  );
}
