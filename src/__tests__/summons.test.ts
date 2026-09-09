import { describe, it, expect } from "vitest";
import { compilePortraitPrompt, compileInventoryPrompt, getAtmosphericMatrix, GENRE_ATMOSPHERIC_MATRICES } from "../lib/prompts/generators";

describe("WorldVision Summons Visual Codex & Prompt Compilation Engine", () => {
  it("should provide atmospheric matrices for all 10 genres", () => {
    const genres = [
      "Gothic Dark Fantasy", "Cyberpunk", "Steampunk", "8-Bit Retro RPG",
      "High Fantasy", "Cosmic Horror", "Samurai Era", "Post-Apocalyptic",
      "Eldritch Arcane", "Victorian Gothic"
    ];
    for (const genre of genres) {
      const matrix = getAtmosphericMatrix(genre);
      expect(matrix).toBeDefined();
      expect(matrix.palette).toBeTruthy();
      expect(matrix.lighting).toBeTruthy();
      expect(matrix.negativeConstraints.length).toBeGreaterThan(0);
    }
  });

  it("should compile C-TRACES-GOAL portrait prompt with correct styling and physical grounding", () => {
    const mockCharacter = {
      character_name: "Gelbinor",
      character_class: "Ossuary Necromancer",
      character_lore: "A quiet, apologetic archivist who tends to the nameless bones.",
      sheet_style: "Gothic Dark Fantasy",
      physical: {
        height: "5'11\"",
        weight: "135 lbs",
        build: "Gaunt",
        distinguishing_feature: "Finger-bone tassels sewn into collar"
      },
      inventory_items: "Mister Cracks Skull Grimoire, Bone Needle, Satchel of Grave Dust"
    };

    const prompt = compilePortraitPrompt(mockCharacter);
    expect(prompt).toContain("Gelbinor");
    expect(prompt).toContain("Ossuary Necromancer");
    expect(prompt).toContain("Mister Cracks Skull Grimoire");
    expect(prompt).toContain("5'11\"");
    expect(prompt).toContain("Gaunt");
    expect(prompt).toContain("Finger-bone tassels");
  });

  it("should compile categorized inventory grid prompt", () => {
    const mockCharacter = {
      character_name: "Gelbinor",
      character_class: "Ossuary Necromancer",
      sheet_style: "Gothic Dark Fantasy",
      inventory_items: ["Mister Cracks Grimoire", "Bone needle", "Satchel of dust"]
    };

    const prompt = compileInventoryPrompt(mockCharacter);
    expect(prompt).toContain("Gelbinor");
    expect(prompt).toContain("Slot Architecture");
    expect(prompt).toContain("Mister Cracks Grimoire");
  });

  it("should sort favorited archetype presets to the top of the list", () => {
    const mockPresets = [
      { name: "Alpha Warrior", category: "Melee" },
      { name: "Beta Rogue", category: "Stealth" },
      { name: "Gamma Mage", category: "Arcane" }
    ];
    const favorites = ["Gamma Mage"];

    const sorted = [...mockPresets].sort((a, b) => {
      const aFav = favorites.includes(a.name) ? 1 : 0;
      const bFav = favorites.includes(b.name) ? 1 : 0;
      return bFav - aFav;
    });

    expect(sorted[0].name).toBe("Gamma Mage");
    expect(sorted[1].name).toBe("Alpha Warrior");
    expect(sorted[2].name).toBe("Beta Rogue");
  });

  it("should serialize full character sheet data to JSON string for backup/sharing", () => {
    const mockSheet = {
      name: "Gelbinor",
      title: "Necromancer • Tier 16",
      sheet_style: "Gothic Dark Fantasy",
      stats: [{ key: "STR", name: "Strength", value: 10, mod: "+0" }],
      derivedStats: { hpCurrent: 74, hpMax: 74, ac: 14, initiative: "+1", speed: "30 ft" }
    };

    const serialized = JSON.stringify(mockSheet, null, 2);
    expect(serialized).toContain('"name": "Gelbinor"');
    expect(serialized).toContain('"hpCurrent": 74');
    const parsed = JSON.parse(serialized);
    expect(parsed.name).toBe("Gelbinor");
    expect(parsed.derivedStats.ac).toBe(14);
  });

  it("should calculate accurate baseline stats and comparison deltas for archetypes", async () => {
    const { getArchetypeBaseline } = await import("../lib/statBaselines");

    // Explicit preset match
    const gelbinorBaseline = getArchetypeBaseline("Gelbinor — The Shy Grave");
    expect(gelbinorBaseline.INT).toBe(20);
    expect(gelbinorBaseline.STR).toBe(8);

    const vaelinBaseline = getArchetypeBaseline("Vaelin the Gravebound");
    expect(vaelinBaseline.STR).toBe(18);
    expect(vaelinBaseline.CON).toBe(16);

    // Procedural category/class fallback
    const customNetrunner = getArchetypeBaseline("Sector-7 Netrunner", "Tech & Cyber");
    expect(customNetrunner.INT).toBe(20);
    expect(customNetrunner.DEX).toBe(18);

    // Delta calculation
    const currentSTR = 14;
    const delta = currentSTR - gelbinorBaseline.STR;
    expect(delta).toBe(6);
  });
});
