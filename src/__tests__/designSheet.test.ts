import { describe, expect, it } from "vitest";
import { NanoBananaProvider } from "../lib/providers/NanoBananaProvider";
import { compilePortraitPrompt } from "../lib/prompts/generators";
import {
  compileDesignSheetPrompt,
  designSheetArchetype,
  shortDesignLabel,
} from "../lib/prompts/designSheet";
import { CANONICAL_SHEET_STYLES } from "../lib/themeMap";

const LONG_LORE = "A quiet, apologetic archivist who tends to the nameless bones in a cathedral that forgot its saints. ".repeat(4);

describe("character design sheet prompt", () => {
  it("keeps labels to four words", () => {
    expect(shortDesignLabel("Mister Cracks Skull Grimoire of the Ossuary")).toBe("Mister Cracks Skull Grimoire");
  });

  it("assigns archival plates to manuscript genres and tactical dossiers to the rest", () => {
    expect(designSheetArchetype("Gothic Dark Fantasy")).toBe("archival");
    expect(designSheetArchetype("Samurai Era")).toBe("archival");
    expect(designSheetArchetype("Victorian Gothic")).toBe("archival");
    expect(designSheetArchetype("Cyberpunk")).toBe("tactical");
    expect(designSheetArchetype("Post-Apocalyptic")).toBe("tactical");
    expect(designSheetArchetype("8-Bit Retro RPG")).toBe("tactical");
    expect(designSheetArchetype("Solarpunk Utopia")).toBe("tactical");
    for (const style of CANONICAL_SHEET_STYLES) {
      expect(["archival", "tactical"]).toContain(designSheetArchetype(style));
    }
  });

  it("asks for a sheet layout and refuses to letter the backstory onto the image", () => {
    const prompt = compileDesignSheetPrompt({
      character_name: "Vexania Ashborne",
      character_class: "Hollowed Shadow Knight",
      title: "The Ash-Penitent",
      character_lore: LONG_LORE,
      sheet_style: "Gothic Dark Fantasy",
      physical: {
        height: "6'1\"",
        build: "lanky",
        distinguishing_feature: "smoldering collarbone cracks",
      },
      equipment: {
        primaryWeapon: "Cinderbrand Greatsword",
        armor: "obsidian plate with oxblood leather straps",
      },
      inventory_items: "Cinderbrand Greatsword, Obsidian Plate, Warding Bell",
    });

    expect(prompt).toContain("VEXANIA ASHBORNE");
    expect(prompt).toContain("Cinderbrand Greatsword");
    expect(prompt).toContain("obsidian plate");
    expect(prompt).toContain("turnaround");
    expect(prompt).toContain("TEXT RULE");
    expect(prompt).toContain("parchment");
    expect(prompt).toContain("deformed hands");
    expect(prompt).toContain("no stat tables");
    expect(prompt).not.toContain("apologetic archivist");
    expect(prompt.toLowerCase()).not.toContain("radar chart");
  });

  it("uses the tactical dossier for cyberpunk and names the accent", () => {
    const prompt = compilePortraitPrompt({
      character_name: "Iron Ronin",
      character_class: "Ronin",
      sheet_style: "Cyberpunk",
      inventory_items: "Kage, Tetsu",
    });
    expect(prompt).toContain("matte black");
    expect(prompt).toContain("cyan and magenta");
    expect(prompt).toContain("IRON RONIN");
    expect(designSheetArchetype("Cyberpunk")).toBe("tactical");
  });

  it("does not fill an empty prompt with stat-chart overlays", () => {
    const built = NanoBananaProvider.buildCharacterPrompt({
      characterName: "Gelbinor",
      characterClass: "Ossuary Necromancer",
      characterLore: LONG_LORE,
      primaryWeapon: "Mister Cracks",
      height: "5'11\"",
      build: "Gaunt",
      distinguishingFeature: "bone tassels",
      sheetStyle: "Gothic Dark Fantasy",
    });
    expect(built.prompt).toContain("GELBINOR");
    expect(built.prompt).toContain("Mister Cracks");
    expect(built.prompt).not.toContain("apologetic archivist");
    expect(built.prompt).not.toContain("Stat Radar");
    expect(built.negativePrompt).toContain("gibberish text");
    expect(built.negativePrompt).not.toContain("text labels");
  });
});
