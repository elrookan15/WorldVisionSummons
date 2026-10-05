import { canonicalizeSheetStyle, type CanonicalSheetStyle } from "../themeMap";

export type DesignSheetArchetype = "archival" | "tactical";

const ARCHIVAL_STYLES: ReadonlySet<CanonicalSheetStyle> = new Set([
  "Gothic Dark Fantasy",
  "High Fantasy",
  "Victorian Gothic",
  "Eldritch Arcane",
  "Steampunk",
  "Samurai Era",
]);

const TACTICAL_ACCENT: Partial<Record<CanonicalSheetStyle, string>> = {
  Cyberpunk: "cyan and magenta",
  "Post-Apocalyptic": "hazard amber",
  "8-Bit Retro RPG": "phosphor green",
  BioMechanical: "arterial crimson",
  "1980s 3D Render": "phosphor lime",
  "Cosmic Horror": "ultraviolet",
  "Solarpunk Utopia": "jade and solar amber",
};

/** Shared negative list. Dense copy is excluded on purpose: models render it as gibberish. */
export const DESIGN_SHEET_NEGATIVE = [
  "blurry",
  "low resolution",
  "deformed hands",
  "extra limbs",
  "extra fingers",
  "cropped or headless figure",
  "floating disconnected body parts",
  "gibberish text",
  "misspelled words",
  "watermark",
  "signature",
  "logo",
  "photorealistic photograph",
  "cartoonish",
  "chibi",
  "meme",
  "paragraphs of text",
  "dense fine print",
  "stat blocks",
  "unreadable captions",
].join(", ");

export interface DesignSheetAtmosphere {
  palette: string;
  lighting: string;
  negativeConstraints: string[];
}

export function designSheetArchetype(style: string): DesignSheetArchetype {
  return ARCHIVAL_STYLES.has(canonicalizeSheetStyle(style)) ? "archival" : "tactical";
}

export function shortDesignLabel(raw: string, maxWords = 4): string {
  const head = raw.split(/[—–|]/)[0] ?? raw;
  const words = head.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length === 0) return "";
  return words.slice(0, maxWords).join(" ");
}

function collectGearLabels(char: {
  inventory_items?: unknown;
  equipment?: {
    primaryWeapon?: string;
    secondaryFocus?: string;
    armor?: string;
    utilityTools?: string;
    relics?: string;
    weapons?: string;
  };
}): string[] {
  const raw: string[] = [];
  const equipment = char.equipment;
  if (equipment) {
    for (const value of [
      equipment.primaryWeapon,
      equipment.weapons,
      equipment.secondaryFocus,
      equipment.armor,
      equipment.utilityTools,
      equipment.relics,
    ]) {
      if (typeof value === "string" && value.trim()) raw.push(value);
    }
  }
  const inventory = char.inventory_items;
  if (Array.isArray(inventory)) {
    for (const item of inventory) {
      if (typeof item === "string") raw.push(item);
      else if (item && typeof item === "object" && "name" in item && typeof item.name === "string") {
        raw.push(item.name);
      }
    }
  } else if (typeof inventory === "string") {
    raw.push(...inventory.split(","));
  }

  const seen = new Set<string>();
  const labels: string[] = [];
  for (const entry of raw) {
    const label = shortDesignLabel(entry);
    const key = label.toLowerCase();
    if (!label || seen.has(key)) continue;
    seen.add(key);
    labels.push(label);
    if (labels.length === 5) break;
  }
  return labels;
}

/**
 * One image: central figure, gear callouts, title, short epithet, equipment strip, turnaround.
 * On-image text stays at titles and 1–4 word labels. Stats and lore stay in the Codex renderer.
 */
export function compileDesignSheetPrompt(
  char: any,
  overrideStyle?: string,
  atmosphere?: DesignSheetAtmosphere
): string {
  const esc = (value: unknown) => String(value ?? "").replace(/[\u0000-\u001F]/g, "").trim();
  const name = esc(char?.character_name || char?.name || "Hero");
  const cls = esc(char?.character_class || char?.overview?.classRole || "Adventurer");
  const style = esc(overrideStyle || char?.sheet_style || "Gothic Dark Fantasy");
  const canonical = canonicalizeSheetStyle(style);
  const archetype = designSheetArchetype(canonical);
  const matrix = atmosphere ?? {
    palette: "",
    lighting: "cinematic key light with a genre-matched rim",
    negativeConstraints: [],
  };
  const race = esc(char?.race || char?.physical?.race || "humanoid");
  const pose = esc(char?.pose || "in a relaxed contrapposto, weapon grounded");
  const height = esc(char?.physical?.height || `6'0"`);
  const weight = esc(char?.physical?.weight || "");
  const build = esc(char?.physical?.build || "athletic");
  const feature = esc(char?.physical?.distinguishing_feature || char?.physical?.marks || "weathered battle marks");
  const presence = [height, weight, `${build} build`].filter(Boolean).join(", ");
  const gear = collectGearLabels(char ?? {});
  const primary = gear[0] || "signature weapon";
  const secondary = shortDesignLabel(esc(char?.equipment?.secondaryFocus || ""));
  const armor = esc(char?.equipment?.armor || "wardrobe matched to the genre, with visible material, color, and wear");
  const classLabel = shortDesignLabel(cls, 4);
  const epithetSource = esc(char?.title || char?.epithet || char?.overview?.epithet || "");
  const epithet = shortDesignLabel(epithetSource, 6);
  const dossier = epithet && epithet.toLowerCase() !== classLabel.toLowerCase()
    ? `${classLabel} — ${epithet}`
    : classLabel;
  const panels = [
    "head and face close-up",
    "torso armor or clothing detail",
    `${primary} close-up`,
    "boots or lower gear detail",
  ];
  if (gear[1]) panels.push(`${gear[1]} isolated`);

  const styleOverride = archetype === "archival"
    ? [
        "STYLE OVERRIDE: aged parchment or vellum background with burnt edges and subtle stains;",
        "hand-etched engraving aesthetic with fine ink linework; sepia and oxblood ink palette;",
        "ornate serif title lettering with flourishes; heraldic crest motif in a corner;",
        "margin sketches rendered as antique scientific illustrations;",
        "numbered callout boxes connected by hairline leader lines.",
        matrix.lighting ? `Lighting: ${matrix.lighting}` : "",
        matrix.palette ? `Palette: ${matrix.palette}` : "",
      ].filter(Boolean).join(" ")
    : [
        `STYLE OVERRIDE: matte black background with sharp vector accent lines in ${TACTICAL_ACCENT[canonical] || "a single accent color"};`,
        "infographic layout with clean geometric panels; front and back full-body views;",
        "weapon callouts with short labels; one in-action panel of the character mid-technique;",
        "bold condensed sans-serif title; subtle grid or blueprint texture.",
        matrix.lighting ? `Lighting: ${matrix.lighting}` : "",
        matrix.palette ? `Palette: ${matrix.palette}` : "",
      ].filter(Boolean).join(" ");

  const genreNegatives = matrix.negativeConstraints.filter(Boolean).join(", ");

  return [
    "Create a complete character design sheet — a single composed image in the style of a professional AAA game concept-art portfolio piece.",
    "",
    "CENTRAL FIGURE",
    `- Full-body ${race} ${cls} named ${name}, standing ${pose}, centered and dominant in frame`,
    `- Physical presence: ${presence}; distinguishing features: ${feature}`,
    `- Armor/clothing: ${armor}`,
    `- Weapon(s): ${primary}${secondary && secondary.toLowerCase() !== primary.toLowerCase() ? `; secondary: ${secondary}` : ""}`,
    `- Lighting: ${matrix.lighting || "cinematic key light with a genre-matched rim"}`,
    "- Render quality: ultra-detailed digital painting, sharp focus, coherent humanoid anatomy, cinematic composition",
    "",
    "SHEET LAYOUT (all inside this one image)",
    "- The full-body figure occupies the center of the frame",
    `- Around the figure, arrange ${panels.length} annotated detail panels with thin leader lines: ${panels.map((panel, index) => `(${index + 1}) ${panel}`).join(", ")}`,
    `- Top: a title cartouche bearing the character's name in large display lettering: "${name.toUpperCase()}"`,
    `- One compact dossier block, one short line only: "${dossier}"`,
    `- One equipment strip: ${gear.length > 0 ? gear.join(", ") : primary}, each drawn as an isolated object with that short label`,
    "- Bottom edge: a small turnaround strip showing front, side, and back silhouettes of the same character",
    "- Decorative frame border appropriate to the genre",
    "",
    styleOverride,
    "",
    "TEXT RULE (critical)",
    "- Keep on-image text minimal: the title, the name, and short 1-4 word labels only",
    "- Large, legible lettering. No paragraphs, no fine print, no dense blocks, no stat tables",
    "- Do not letter the backstory, attributes, or long descriptions onto the image. Those stay in the app codex.",
    "",
    `Negative Constraints: ${DESIGN_SHEET_NEGATIVE}${genreNegatives ? `, ${genreNegatives}` : ""}`,
  ].join("\n");
}
