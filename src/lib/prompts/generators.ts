import { archChronologerFieldPreamble } from "./archChronologer";
import { compileDesignSheetPrompt, DESIGN_SHEET_NEGATIVE } from "./designSheet";

export const GENRE_ATMOSPHERIC_MATRICES: Record<string, {
  palette: string;
  lighting: string;
  slotDesign: string;
  mapTreatment: string;
  negativeConstraints: string[];
}> = {
  "Gothic Dark Fantasy": {
    palette: "low-key chiaroscuro, cold moonlight, dim ember highlights, desaturated charcoal, iron, oxblood, sickly gold. Weathered plate, cracked leather, fog, cathedral stone.",
    lighting: "severe directional chiaroscuro, cold moonlight silhouette, flickering crimson ember torchlight",
    slotDesign: "carved black stone slots with tarnished silver frames, dim inner glow, ossuary motifs",
    mapTreatment: "aged parchment, ink shading, cathedral icons, suffocating fog at edges",
    negativeConstraints: ["cheerful ambient light", "modern technology", "neon glow", "oversaturated colors"]
  },
  "Cyberpunk": {
    palette: "rain-slicked megacity pavement, dense neon signage, cybernetic ocular optics, tactical chrome weave, magenta/cyan chromatic dispersion",
    lighting: "high-contrast cyan/magenta rim lighting, deep obsidian shadows, volumetric neon smog",
    slotDesign: "neon-lit translucent panels, holographic labels, cyber-conduit patterns, glowing micro-circuits",
    mapTreatment: "neon district telemetry grid, holographic overlays, corporation zone color codes",
    negativeConstraints: ["medieval armor", "parchment paper", "wooden bows", "magic runes", "historical fantasy"]
  },
  "Steampunk": {
    palette: "warm gaslight, amber highlights, aged brass, clockwork assemblies, steam vents, Victorian-industrial ironwork and riveted leather",
    lighting: "warm gaslight amber glow, polished brass specular flares, industrial furnace undertones",
    slotDesign: "polished brass bevels, parchment dial labels, riveted copper corners, pressure gauge icons",
    mapTreatment: "engraved brass plates, locomotive rail lines, sepia-toned draft paper with drafting compasses",
    negativeConstraints: ["digital displays", "laser sights", "synthetic plastics", "futuristic neon"]
  },
  "8-Bit Retro RPG": {
    palette: "vibrant pixelated dungeon chamber, iconic 16-color palette fidelity, sharp sprite silhouettes, crisp nostalgic dithering",
    lighting: "crisp arcade illumination, high contrast pixel edge highlights, flat pixel shading",
    slotDesign: "pixel-grid tiles, bold chunky color blocks, authentic 8-bit black outlines, retro inventory slots",
    mapTreatment: "pixel-art overworld, tile-based terrain tilesets, retro 8-bit GUI border with pixel font labels",
    negativeConstraints: ["photorealistic blur", "soft bokeh", "modern smooth 3D gradients", "subsurface scattering"]
  },
  "High Fantasy": {
    palette: "golden-hour celestial radiance, jewel tones, radiant mythril armor, heraldic emblems, floating mana motes, refined painterly illustration",
    lighting: "ethereal sunbeams breaking through cumulus clouds, prismatic divine rim illumination",
    slotDesign: "illuminated filigree panels, vellum parchment textures, sculpted gold filigree borders",
    mapTreatment: "illuminated manuscript cartography, painted mountain ranges, heraldic compass rose, sea monsters in bays",
    negativeConstraints: ["sci-fi firearms", "cybernetics", "grunge dirt", "neon glow", "industrial machinery"]
  },
  "Cosmic Horror": {
    palette: "non-Euclidean masonry, weeping obsidian monoliths, abyssal celestial void fog, cyclopean architectural angles, bruised ultraviolet undertones",
    lighting: "sickly viridian luminescence, cold void twilight, bruised ultraviolet accents from unreachable stars",
    slotDesign: "slimy wet basalt frames, writhing tendril borders, disturbing eye-shaped locking sockets",
    mapTreatment: "distorted forbidden grimoire charts, shifting coastlines, sanity-draining coordinate markings",
    negativeConstraints: ["cheerful sunlight", "wholesome landscapes", "bright cartoon style", "clean modern lines"]
  },
  "Samurai Era": {
    palette: "ink-brushed battle banners, falling cherry blossoms, weathered straw armor, blood-streaked tamahagane steel, deep indigo fabrics",
    lighting: "dramatic setting sun, golden rim lighting through morning bamboo mist, stark sumi-e ink shadows",
    slotDesign: "lacquered wood frames with gold kintsugi joinery, silk cords, family kamon wax crests",
    mapTreatment: "traditional Japanese woodblock (ukiyo-e) scroll map, calligraphic province names, stylized wave crests",
    negativeConstraints: ["western knight plate", "firearms", "cybernetic implants", "victorian gears"]
  },
  "Post-Apocalyptic": {
    palette: "irradiated ash dunes, rusted corrugated steel sheets, scavenged vehicular plating, cracked respirator visors, dust vortexes",
    lighting: "harsh midday desert sun, scorched sepia horizon, harsh glare across cracked glass lenses",
    slotDesign: "scavenged sheet metal panels, radioactive hazard stencil marks, electrical tape bindings",
    mapTreatment: "scorched tactical topographic map, radiation fallout boundary markers, scavenged landmark notes",
    negativeConstraints: ["lush green meadows", "spotless fabric", "pristine high-tech", "clean fantasy magic"]
  },
  "Eldritch Arcane": {
    palette: "deep amethyst voids, forbidden astrological glyphs, astral mist, levitating runic shards, dark iridescent velvet robes",
    lighting: "pulsing arcane violet and cyan sorcery light, eerie floating motes, shadowy astral eclipse",
    slotDesign: "carved amethyst crystal frames, glowing runic bindings, floating astral lock seals",
    mapTreatment: "astral plane projection chart, leyline convergence vectors, dimensional rift markers",
    negativeConstraints: ["mundane technology", "guns", "steampunk gears", "cheerful daylight"]
  },
  "Victorian Gothic": {
    palette: "cobblestone alleys under gaslamps, velvet smoking jackets, wrought-iron cemetery gates, mourning lace, tarnished sterling silver",
    lighting: "dim gas lantern glow casting long dramatic shadows across wet cobblestones, foggy twilight",
    slotDesign: "carved mahogany frames with wrought-iron scrollwork, velvet backing, silver filigree borders",
    mapTreatment: "19th-century London municipal ward atlas, faded sepia ink, detailed street names and asylum borders",
    negativeConstraints: ["cybernetics", "alien technology", "modern cars", "high fantasy magic wands"]
  },
  BioMechanical: {
    palette: "ribbed biosteel exoskeleton, synthetic flesh, gunmetal titanium grey (#3a3d45), arterial crimson red (#dc2626), ceremonial gold filigree (#f59e0b), organic cybernetic sinew",
    lighting: "dramatic specular glints on chitinous bio-ribs, arterial crimson bioluminescent conduit glow, warm ceremonial gold edge reflection",
    slotDesign: "chitinous ribbed bio-armor sockets, interlocking titanium bone frames with arterial crimson capillary channels",
    mapTreatment: "biomechanical hive organogram, chitin-veined subterranean conduit map, living bio-architecture schema",
    negativeConstraints: ["steampunk brass gears", "bright anime pastel", "flat cartoony vectors", "clean cheerful plastic"]
  },
  "1980s 3D Render": {
    palette: "early 1980s CGI workstation render, Silicon Graphics IRIS raytracing, vector wireframe phosphor lime green (#39ff14), deep royal blue (#2563eb), electric synth purple (#8b5cf6), chrome sphere specular glints",
    lighting: "early-CGI Gouraud/Phong vector shading, cathode ray phosphor glow, wireframe horizon backlight",
    slotDesign: "orthographic wireframe polygon panels, phosphor lime green coordinate tags, beveled royal blue borders with purple cathode glow",
    mapTreatment: "orthographic 3D vector wireframe landscape, perspective depth grid, royal blue wire terrain with purple horizon void",
    negativeConstraints: ["photorealistic film grain", "grungy medieval dirt", "muddy textures", "parchment paper", "renaissance ink"]
  },
  "Solarpunk Utopia": {
    palette: "verdant living architecture, crystalline solar glass, sunlit alabaster white, jade foliage (#10b981), warm solar amber gold (#f59e0b), clean aerogel sky cyan",
    lighting: "radiant golden-hour solar illumination, dappled sunbeams filtering through living canopies, warm solar flare glow",
    slotDesign: "living curved alabaster frames with inlaid photovoltaic gold traces and interwoven jade botanical tendrils",
    mapTreatment: "canopy-level ecological sector chart, terraced solar biome atlas, clean gilded botanical cartography",
    negativeConstraints: ["dystopian grime", "industrial smog", "rusted metal", "gothic skulls", "radioactive waste"]
  }
};

export function getAtmosphericMatrix(style: string) {
  const match = GENRE_ATMOSPHERIC_MATRICES[style];
  if (match) return match;
  
  // Fuzzy match
  const lower = (style || "").toLowerCase();
  for (const [key, val] of Object.entries(GENRE_ATMOSPHERIC_MATRICES)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return val;
    }
  }
  return GENRE_ATMOSPHERIC_MATRICES["Gothic Dark Fantasy"];
}

export const generateMissingFieldsPrompts = {
  formatNamePrompt: (opts: { sheet_style: string; existing_lore?: string | undefined; existing_class?: string | undefined }) => {
    return `${archChronologerFieldPreamble(opts.sheet_style)}
You are a professional RPG worldbuilder. Generate a single memorable character name (1-4 words) consistent with the following style and any present details.
Style: ${opts.sheet_style}
Existing class (if any): ${opts.existing_class ?? "none"}
Existing lore (if any, short): ${opts.existing_lore ?? "none"}
Rules:
- Output only the name on one line. No explanation.
- Avoid famous character names.
- Tone: evocative and appropriate to style.
`;
  },

  formatClassPrompt: (opts: { sheet_style: string; existing_lore?: string | undefined; existing_name?: string | undefined }) => {
    return `${archChronologerFieldPreamble(opts.sheet_style)}
You are a professional RPG designer. Generate a single class/archetype (2-6 words) suited to the style and any present lore or name.
Style: ${opts.sheet_style}
Existing name: ${opts.existing_name ?? "none"}
Existing lore: ${opts.existing_lore ?? "none"}
Rules:
- Output only the class on one line. No list, no explanation.
- The class must imply equipment, silhouette, and playstyle.
`;
  },

  formatLorePrompt: (opts: { sheet_style: string; existing_name?: string | undefined; existing_class?: string | undefined }) => {
    return `${archChronologerFieldPreamble(opts.sheet_style)}
You are a concise fiction writer tasked with writing a 2-3 sentence background (60-110 words) for a character.
Name: ${opts.existing_name ?? "Unknown"}
Class: ${opts.existing_class ?? "Unknown"}
Style: ${opts.sheet_style}
Guidance:
- Compress Five-Fold substance into prose: origin + sensory texture, formative conflict/sacrifice (GMC), faction/world-seam tie, and a present driving goal or unresolved mystery.
- Use concrete places, artifacts, smells, or forces relevant to the style — never generic "mysterious power."
- Tone: cinematic, specific, lore-rich.
Output:
Return the lore only. Exactly 60-110 words.
`;
  },

  formatInventoryPrompt: (opts: { sheet_style: string; existing_name?: string | undefined; existing_class?: string | undefined; existing_lore?: string | undefined }) => {
    return `${archChronologerFieldPreamble(opts.sheet_style)}
Generate a comma-separated list of exactly 8-12 distinct inventory items for this character. Items must fit the style, class, and lore provided.
Name: ${opts.existing_name ?? "Unknown"}
Class: ${opts.existing_class ?? "Unknown"}
Lore (short): ${opts.existing_lore ?? "none"}
Style: ${opts.sheet_style}
Rules:
- Output a single line, items separated by commas, no numbering, no sentences.
- Include primary weapon, possible secondary/focus, armor/clothing, defensive gear, utility tool, consumable(s), quest object, and 1-2 personal possessions.
- Each item should be specific and visually renderable.
`;
  },

  formatPhysicalPrompt: (opts: { sheet_style: string; character_class: string; character_lore: string; character_name: string }) => {
    return `${archChronologerFieldPreamble(opts.sheet_style)}
Provide four physical attributes for the character as JSON with keys: height (format X'Y"), weight (NNN lbs), build (one of Wiry, Stocky, Lean, Broad-shouldered, Gaunt, Imposing, Compact), distinguishing_feature (short phrase). Ensure consistency with class and lore and style: ${opts.sheet_style}
Character: ${opts.character_name}
Class: ${opts.character_class}
Lore: ${opts.character_lore}
distinguishing_feature must be sensory-concrete (sight/sound/smell tell), not a vague adjective.
Return strictly a JSON object. Example:
{"height":"6'2\"", "weight":"220 lbs", "build":"Imposing", "distinguishing_feature":"tarnished sigil branded on right shoulder"}
`;
  },

  formatSignaturePrompt: (opts: { sheet_style: string; character_name: string; character_class: string; character_lore: string; inventory_items: string }) => {
    return `${archChronologerFieldPreamble(opts.sheet_style)}
Generate 10 short flavour attributes (1-6 words each) as JSON with keys:
reputation, vice, virtue, fear, obsession, tell, loyalty, blind_spot, survival_instinct, legacy_fear.
Ground each value in the following character details. No sentences; just short strings. Keep them distinct.
Map loosely to Five-Fold: reputation/lineage, tell (sensory), obsession/goal, fear/conflict, virtue-vice (cost), loyalty/world-seam.
Name: ${opts.character_name}
Class: ${opts.character_class}
Lore: ${opts.character_lore}
Inventory (comma-list): ${opts.inventory_items}
Style: ${opts.sheet_style}
Example output:
{
  "reputation":"The Ashbringer",
  "vice":"cheap brandy",
  "virtue":"unyielding guardian oath",
  "fear":"abyssal dark",
  "obsession":"collecting names of fallen",
  "tell":"fidgeting with collarbone charm",
  "loyalty":"sworn order of ossuary",
  "blind_spot":"refusal to suspect old mentors",
  "survival_instinct":"feigning death when surrounded",
  "legacy_fear":"being erased from archives"
}
`;
  },
};

/**
 * Compiles the hero image as one character design sheet (figure, callouts, title, turnaround).
 * Long lore and stats stay in the Codex renderer; the image model only gets short labels.
 */
export function compilePortraitPrompt(char: any, overrideStyle?: string): string {
  const style = String(overrideStyle || char?.sheet_style || "Gothic Dark Fantasy");
  const matrix = getAtmosphericMatrix(style);
  return compileDesignSheetPrompt(char, style, {
    palette: matrix.palette,
    lighting: matrix.lighting,
    negativeConstraints: matrix.negativeConstraints,
  });
}

export { DESIGN_SHEET_NEGATIVE };

/**
 * Compiles a top-down flat-lay inventory grid prompt across any of the 13 genre styles.
 */
export function compileInventoryPrompt(char: any): string {
  const esc = (s: string) => (s || "").replace(/[\u0000-\u001F]/g, "").trim();
  const name = esc(char.character_name || char.name || "Hero");
  const cls = esc(char.character_class || char.overview?.classRole || "Adventurer");
  const style = esc(char.sheet_style || "Gothic Dark Fantasy");
  const matrix = getAtmosphericMatrix(style);

  const items = Array.isArray(char.inventory_items) 
    ? char.inventory_items.map((it: any) => esc(it.name || it)).join(", ")
    : (typeof char.inventory_items === "string" ? char.inventory_items : "Primary Weapon, Secondary Focus, Armor Plate, Utility Tools, Relic Vials");

  return `Top-down flat-lay inventory grid array for ${name}, a ${cls}, containing categorized equipment: ${items}.
Slot Architecture: ${matrix.slotDesign}
Atmospheric Ambient: ${matrix.palette}
Arrangement: Even, organized grid matrix with crisp item silhouettes, consistent rim lighting, zero hands or extraneous figures, sharp specular highlights.`;
}

/**
 * Compiles a compact 300x300 isometric map thumbnail prompt across any of the 13 genre styles.
 */
export function compileMapPrompt(char: any): string {
  const esc = (s: string) => (s || "").replace(/[\u0000-\u001F]/g, "").trim();
  const name = esc(char.character_name || char.name || "Hero");
  const cls = esc(char.character_class || char.overview?.classRole || "Adventurer");
  const lore = esc(char.character_lore || char.lore?.backstory || "");
  const style = esc(char.sheet_style || "Gothic Dark Fantasy");
  const matrix = getAtmosphericMatrix(style);
  const location = extractLocationFromLore(lore) || `${style} Frontier`;

  return `Compact top-down isometric tactical map thumbnail for ${name}, ${cls}.
Territory & Sector: ${location}, reflecting lore: ${lore.slice(0, 100)}.
Cartographic Style: ${matrix.mapTreatment}
Visual Rigor: Highly readable at 300x300 px, clear topographical relief, distinct landmarks, bordered cartographic frame.`;
}

/**
 * Legacy router maintained for backward compatibility
 */
export function generateImagePrompt(type: "portrait" | "inventory_grid" | "map_thumbnail" | "sheet_composition" | "gear_closeup", char: any): string {
  if (type === "portrait") {
    return compilePortraitPrompt(char);
  }
  if (type === "inventory_grid") {
    return compileInventoryPrompt(char);
  }
  if (type === "map_thumbnail") {
    return compileMapPrompt(char);
  }
  if (type === "sheet_composition") {
    const esc = (s: string) => (s || "").replace(/[\u0000-\u001F]/g, "").trim();
    const name = esc(char.character_name || char.name || "Hero");
    const cls = esc(char.character_class || char.overview?.classRole || "Adventurer");
    return `Compose a single cohesive character sheet image for ${name}, a ${cls}, in style ${char.sheet_style || 'Gothic Dark Fantasy'}. Place:
- Left half: full-body portrait (head-to-toe).
- Right column: 3-4 stacked zoomed detail panels (armor/weapon/implant).
- Lower middle: inventory grid with each item.
- Footer: 3 lore thumbnails + faction crests.
Unified high-detail RPG codex composition.`;
  }
  if (type === "gear_closeup") {
    const esc = (s: string) => (s || "").replace(/[\u0000-\u001F]/g, "").trim();
    const name = esc(char.character_name || char.name || "Hero");
    const cls = esc(char.character_class || char.overview?.classRole || "Adventurer");
    return `Create a cropped gear close-up for ${name}, a ${cls}. Focus on primary relic. Show materials, inscriptions, mechanisms or enchantments. Style: ${char.sheet_style || 'Gothic Dark Fantasy'}.`;
  }
  return "";
}

export function generateMultiEnginePrompts(char: any) {
  const esc = (s: string) => (s || "").replace(/[\u0000-\u001F]/g, "").trim();
  const name = esc(char.character_name || char.name || "Hero");
  const cls = esc(char.character_class || char.overview?.classRole || "Adventurer");
  const style = esc(char.sheet_style || "Gothic Dark Fantasy");
  const primaryPrompt = compilePortraitPrompt(char);

  return {
    midjourney: `${primaryPrompt} --ar 3:4 --s 350 --v 6.0`,
    leonardo: `Character design sheet, ${name} the ${cls}. ${style} RPG sourcebook art, title and short labels only, clean edges, studio reference lighting --no paragraphs, fine print, watermark`,
    flux: `(masterpiece, high-resolution:1.2), character design sheet, (${name} ${cls}:1.1), ${style} aesthetic, central full-body figure, detail callouts, short labels only, sharp focus`,
    geminiNano: `${name}, ${cls}, ${style}, highly detailed character concept, 8k, Octane render`,
    propCloseup: `Prop concept art, isolated weapon profile, etched steel blade, neutral studio background, highly detailed 3d render aesthetic`
  };
}

function extractLocationFromLore(lore: string): string | null {
  if (!lore) return null;
  const m = lore.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/);
  if (!m) return null;
  const candidates = lore.match(/[A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,})*/g);
  if (!candidates) return null;
  return candidates[0];
}
