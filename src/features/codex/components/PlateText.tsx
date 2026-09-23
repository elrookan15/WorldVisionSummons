import type { CodexRenderModel, RectMm } from "../composition/types";
import { plateFont } from "../templates/illuminated-codex/ornaments";

export function PlateText({ model, id, origin }: { model: CodexRenderModel; id: string; origin: RectMm }) {
  const run = model.texts.find((text) => text.id === id);
  if (!run || run.text.length === 0) return null;
  return (
    <p
      style={{
        position: "absolute",
        left: `${run.x - origin.x}mm`,
        top: `${run.y - origin.y}mm`,
        width: `${run.maxWidthMm}mm`,
        margin: 0,
        fontSize: `${run.fontPt}pt`,
        lineHeight: run.wrap ? 1.2 : 1.1,
        color: run.color,
        letterSpacing: run.role === "label" || run.id.startsWith("title.") ? "0.06em" : "0",
        textTransform: run.role === "label" ? "uppercase" : "none",
        textAlign: run.id.startsWith("title.") ? "center" : run.wrap ? "justify" : "left",
        fontStyle: run.id === "footer.provenance" || run.id === "title.motto" ? "italic" : "normal",
        fontFamily: run.id === "footer.provenance" || run.id === "title.motto" ? '"Newsreader", "Cormorant Garamond", Palatino, serif' : plateFont(run.role),
        whiteSpace: run.wrap ? "pre-wrap" : "nowrap",
        overflow: "hidden",
      }}
    >
      {run.text}
    </p>
  );
}

export function textsWithPrefix(model: CodexRenderModel, prefix: string): string[] {
  return model.texts.filter((text) => text.id.startsWith(prefix)).map((text) => text.id);
}
