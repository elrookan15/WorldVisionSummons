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
    expect(prompt).toContain("Generate a single high-fidelity image");
    expect(prompt).toContain("2K resolution");
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

  it("should canonicalize preset aliases onto the 10 visual genres", async () => {
    const { canonicalizeSheetStyle, themeIdForStyle, primaryItemFromInventory } = await import("../lib/themeMap");

    expect(canonicalizeSheetStyle("Steampunk Tinkerer")).toBe("Steampunk");
    expect(canonicalizeSheetStyle("Neon Ronin")).toBe("Cyberpunk");
    expect(canonicalizeSheetStyle("Wasteland Scavenger")).toBe("Post-Apocalyptic");
    expect(canonicalizeSheetStyle("Obsidian Cult")).toBe("Gothic Dark Fantasy");
    expect(themeIdForStyle("High Fantasy")).toBe("highFantasy");
    expect(primaryItemFromInventory("Runebound Broadsword, Tarnished Iron Shield")).toBe("Runebound Broadsword");
    expect(primaryItemFromInventory(["Rail-Steel Katana", "Tattered Haori"])).toBe("Rail-Steel Katana");
  });

  it("should clamp resource widgets and merge imported sheets without dropping nested fields", async () => {
    const { clampResource, mergeImportedSheet } = await import("../lib/sheetMapper");
    expect(clampResource(74, 74, 1)).toBe(74);
    expect(clampResource(0, 74, -1)).toBe(0);
    expect(clampResource(10, 20, 3)).toBe(13);

    const current = {
      name: "Gelbinor",
      title: "Keeper",
      player: "Keeper of Quiet",
      sheet_style: "Gothic Dark Fantasy",
      overview: { race: "Human", age: "28", gender: "Male", alignment: "TN", classRole: "Necromancer", level: "16", origin: "Karst", faction: "Ossuary" },
      physical: { height: "6'1\"", weight: "130 lbs", build: "Lanky", eyes: "Milky", hair: "Black", skin: "Pale", marks: "Bone charms", scars: "Sigils", clothing: "Shroud", voice: "Mumbles", posture: "Hunched" },
      signatureAttributes: { reputation: "Shy Grave", vice: "Apologies", virtue: "Mercy", fear: "Silence", obsession: "Names", tell: "Tassels", loyalty: "Dead", blindSpot: "Hostility", survivalInstinct: "Play dead", legacyFear: "Erasure" },
      derivedStats: { hpCurrent: 74, hpMax: 74, ac: 14, initiative: "+1", speed: "30 ft", level: 16, resourceName: "Quiet", resourceCurrent: 6, resourceMax: 6, passives: ["Quiet"] },
      lore: { backstory: "Born in Karst", childhood: "Library", formative: "Fire", motivations: "Catalog", secrets: "Lich book", world: "Karst" },
      abilities: [{ name: "Shy Ward", desc: "Undead refuse", cooldown: "Passive", cost: "None", type: "Passive" }],
      weaknesses: "Loud noises",
      skills: [{ name: "Catalog", value: 98 }],
      magic: "School of Quiet",
      equipment: { primaryWeapon: "Mister Cracks", secondaryFocus: "Chime", armor: "Shroud", utilityTools: "Quill", consumables: "Tea", relics: "Skulls", currency: "Names", weapons: "Mister Cracks", items: "Tea" },
      personality: { traits: "Shy", ideals: "Names", flaws: "Cannot say no", fears: "Alone", mannerisms: "Sleeves", speech: "Sorry" },
      relationships: { allies: "Mirren", enemies: "Warlord", mentors: "Librarians", family: "Dead" },
      stats: [
        { key: "STR", label: "Strength", value: 8, desc: "Lanky" },
        { key: "INT", label: "Intelligence", value: 22, desc: "Names" }
      ]
    };

    const merged = mergeImportedSheet(current as any, {
      name: "Vaelin",
      sheet_style: "High Fantasy",
      overview: { classRole: "Knight", hp: 90, ac: 18 },
      stats: [{ key: "STR", value: 18 }],
      inventory: ["Sanctified Bastard Sword", "Iron Heater Shield"]
    });

    expect(merged.name).toBe("Vaelin");
    expect(merged.sheet_style).toBe("High Fantasy");
    expect(merged.abilities[0].name).toBe("Shy Ward");
    expect(merged.stats.find(s => s.key === "STR")?.value).toBe(18);
    expect(merged.equipment.primaryWeapon).toBe("Sanctified Bastard Sword");
    expect(merged.derivedStats.hpCurrent).toBe(90);
  });

  it("should emit a character-specific SVG plate instead of a stock photo", async () => {
    const { buildProceduralPortrait } = await import("../lib/portraitFallback");
    const svg = buildProceduralPortrait({
      name: "Kaelen Vex",
      charClass: "Netrunner",
      style: "Cyberpunk",
      distinguishingFeature: "Chrome ocular implant"
    });
    expect(svg.startsWith("data:image/svg+xml")).toBe(true);
    expect(decodeURIComponent(svg)).toContain("Kaelen Vex");
    expect(decodeURIComponent(svg)).toContain("Netrunner");
  });

  it("should build blended local SVG atmospheres for every dossier page × genre", async () => {
    const {
      SHEET_PAGE_IDS,
      SHEET_THEME_IDS,
      buildSheetPageBackground,
      sheetPageBackgroundCssVars,
    } = await import("../lib/sheetPageBackgrounds");

    expect(SHEET_PAGE_IDS).toHaveLength(8);
    expect(SHEET_THEME_IDS).toHaveLength(10);

    for (const theme of SHEET_THEME_IDS) {
      const vars = sheetPageBackgroundCssVars(theme);
      for (const page of SHEET_PAGE_IDS) {
        const url = buildSheetPageBackground(page, theme);
        expect(url.startsWith("data:image/svg+xml")).toBe(true);
        expect(url.toLowerCase()).not.toContain("unsplash");
        expect(url).not.toContain("http://");
        expect(url).not.toContain("https://");

        const decoded = decodeURIComponent(url);
        expect(decoded).toContain(`data-sheet-bg="${theme}"`);
        expect(decoded).toContain(`data-page-bg="${page}"`);
        expect(decoded).toContain("data-artifact=");
        expect(decoded).toContain("data-metaphor=");

        expect(vars[`--sheet-bg-${page}`]).toContain("data:image/svg+xml");
      }
    }

    const gothic = decodeURIComponent(buildSheetPageBackground("lore", "gothicDarkFantasy"));
    const cyber = decodeURIComponent(buildSheetPageBackground("lore", "cyberpunk"));
    const eightBit = decodeURIComponent(buildSheetPageBackground("stats", "retro8Bit"));
    const samurai = decodeURIComponent(buildSheetPageBackground("overview", "samuraiEra"));
    expect(gothic).toContain('data-artifact="cathedral-stone"');
    expect(cyber).toContain('data-artifact="neon-hud"');
    expect(eightBit).toContain('data-artifact="pixel-grid"');
    expect(samurai).toContain('data-artifact="sumi-washi"');

    const overview = decodeURIComponent(buildSheetPageBackground("overview", "gothicDarkFantasy"));
    const physical = decodeURIComponent(buildSheetPageBackground("physical", "gothicDarkFantasy"));
    expect(overview).toContain('data-metaphor="identity-seal"');
    expect(physical).toContain('data-metaphor="figure-stage"');
    expect(overview).not.toBe(physical);

    // Lore/Stats louder presence; Physical stays quiet (PR #8 blend feedback)
    const { sheetPageBackgroundOpacity } = await import("../lib/sheetPageBackgrounds");
    expect(sheetPageBackgroundOpacity("lore")).toBeGreaterThanOrEqual(0.45);
    expect(sheetPageBackgroundOpacity("stats")).toBeGreaterThanOrEqual(0.45);
    expect(sheetPageBackgroundOpacity("physical")).toBeLessThanOrEqual(0.16);
    expect(sheetPageBackgroundOpacity("overview")).toBeLessThan(sheetPageBackgroundOpacity("lore"));

    const loreSvg = decodeURIComponent(buildSheetPageBackground("lore", "gothicDarkFantasy"));
    const statsSvg = decodeURIComponent(buildSheetPageBackground("stats", "cyberpunk"));
    const physicalSvg = decodeURIComponent(buildSheetPageBackground("physical", "gothicDarkFantasy"));
    expect(loreSvg).toContain("stop-opacity=\"0.42\"");
    expect(statsSvg).toContain("stop-opacity=\"0.42\"");
    expect(physicalSvg).toContain("stop-opacity=\"0.28\"");
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
