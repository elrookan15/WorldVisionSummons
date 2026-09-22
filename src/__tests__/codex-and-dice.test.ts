import { describe, it, expect, beforeEach } from "vitest";
import { abilityModifier, formatModifier, parseInitiativeModifier, rollCheck, rollDie } from "../lib/dice";
import { CODEX_STORAGE_KEY, deleteCodexEntry, duplicateCodexEntry, loadCodex, upsertCodexEntry } from "../lib/characterCodex";
import { compilePortraitPrompt } from "../lib/prompts/generators";
import type { UiSheetData } from "../lib/sheetMapper";
import { themeIdForStyle, canonicalizeSheetStyle } from "../lib/themeMap";

const FIXTURE_GELBINOR: UiSheetData = {
  name: "Gelbinor",
  title: "The Shy Grave",
  player: "Keeper of Quiet",
  sheet_style: "Gothic Dark Fantasy",
  overview: {
    race: "Human Hollowed",
    age: "28 winters",
    gender: "Male",
    alignment: "True Neutral",
    classRole: "Necromancer 16 — School of Quiet",
    level: "16",
    origin: "Charnel Library of Karst",
    faction: "Keeper of Unclaimed Dead"
  },
  physical: {
    height: '6\'1"',
    weight: "130 lbs",
    build: "Lanky",
    eyes: "Milky white",
    hair: "Long stringy black",
    skin: "Pale translucent",
    marks: "Bone charms sewn at collarbone",
    scars: "Self-stitched warding sigils",
    clothing: "Funeral shroud robe",
    voice: "Mumbles",
    posture: "Hunches"
  },
  signatureAttributes: {
    reputation: "The Shy Grave",
    vice: "Compulsive apologies",
    virtue: "Remembers the forgotten",
    fear: "Mister Cracks leaving",
    obsession: "Cataloging the nameless",
    tell: "Counting finger-bone tassels",
    loyalty: "Charnel Librarians",
    blindSpot: "Cannot perceive living hostility until struck",
    survivalInstinct: "Playing dead",
    legacyFear: "Being erased without a true name"
  },
  derivedStats: {
    hpCurrent: 74,
    hpMax: 74,
    ac: 14,
    initiative: "+1",
    speed: "30 ft",
    level: 16,
    resourceName: "Quiet Solace",
    resourceCurrent: 6,
    resourceMax: 6,
    passives: ["School of Quiet"]
  },
  lore: {
    backstory: "Born in Karst over a mass grave.",
    childhood: "Raised among shelves of unclaimed dead.",
    formative: "Warlord burned the library.",
    motivations: "Finish cataloging the nameless.",
    secrets: "Mister Cracks is a child lich.",
    world: "Karst — city over a mass grave."
  },
  abilities: [
    { name: "Shy Ward", desc: "Undead refuse to harm him.", cooldown: "Passive", cost: "Being small", type: "Passive" }
  ],
  weaknesses: "Loud noises.",
  skills: [{ name: "Ossuary Catalog", value: 98 }],
  magic: "School of Quiet",
  equipment: {
    primaryWeapon: "Mister Cracks — cracked skull grimoire, child lich who stayed as book",
    secondaryFocus: "Bone-carved chime",
    armor: "Bone tassel robe",
    utilityTools: "Cataloging quill",
    consumables: "Cold tea thermos",
    relics: "Finger-bone rosary",
    currency: "No coin",
    weapons: "Mister Cracks — cracked skull grimoire",
    items: "Satchel of grave dirt, cold tea thermos"
  },
  personality: {
    traits: "Shy",
    ideals: "Everyone deserves a name.",
    flaws: "Cannot say no.",
    fears: "That he is a monster.",
    mannerisms: "Pulls sleeves over hands.",
    speech: "Mumbles apologies."
  },
  relationships: {
    allies: "Mister Cracks",
    enemies: "Warlord",
    mentors: "Charnel Librarians",
    family: "Unclaimed dead"
  },
  stats: [
    { key: "STR", label: "Strength", value: 8, desc: "Lanky" },
    { key: "DEX", label: "Dexterity", value: 12, desc: "Precise" },
    { key: "CON", label: "Constitution", value: 14, desc: "Cold tea diet" },
    { key: "INT", label: "Intelligence", value: 22, desc: "Knows names" },
    { key: "WIS", label: "Wisdom", value: 19, desc: "Listens to dead" },
    { key: "CHA", label: "Charisma", value: 7, desc: "Shy" }
  ]
};

function cloneFixture(): UiSheetData {
  return JSON.parse(JSON.stringify(FIXTURE_GELBINOR)) as UiSheetData;
}

describe("ability checks and dice tray", () => {
  it("computes D&D ability modifiers", () => {
    expect(abilityModifier(1)).toBe(-5);
    expect(abilityModifier(8)).toBe(-1);
    expect(abilityModifier(10)).toBe(0);
    expect(abilityModifier(11)).toBe(0);
    expect(abilityModifier(12)).toBe(1);
    expect(abilityModifier(22)).toBe(6);
    expect(formatModifier(-1)).toBe("-1");
    expect(formatModifier(3)).toBe("+3");
  });

  it("parses initiative strings from the live dossier", () => {
    expect(parseInitiativeModifier("+1")).toBe(1);
    expect(parseInitiativeModifier("-2")).toBe(-2);
    expect(parseInitiativeModifier("Dex +3")).toBe(3);
    expect(parseInitiativeModifier(undefined)).toBe(0);
  });

  it("rolls a deterministic d20 check with advantage", () => {
    const seq = [0.05, 0.99]; // -> 2, 20 on d20
    const rng = () => seq.shift() ?? 0;
    const result = rollCheck({ label: "STR check", sides: 20, modifier: -1, mode: "advantage", rng });
    expect(result.dice).toEqual([2, 20]);
    expect(result.chosen).toBe(20);
    expect(result.total).toBe(19);
    expect(result.natural).toBe("crit");
  });

  it("rolls disadvantage and keeps polyhedral dice in range", () => {
    const seq = [0.99, 0.05]; // -> 20, 2
    const rng = () => seq.shift() ?? 0;
    const result = rollCheck({ label: "DEX check", sides: 20, modifier: 1, mode: "disadvantage", rng });
    expect(result.chosen).toBe(2);
    expect(result.total).toBe(3);

    for (let i = 0; i < 40; i++) {
      const n = rollDie(6);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6);
    }
  });

  it("uses loaded sheet modifiers for ability and initiative checks", () => {
    const sheet = cloneFixture();
    const str = sheet.stats.find((s) => s.key === "STR")!;
    const int = sheet.stats.find((s) => s.key === "INT")!;
    expect(abilityModifier(str.value)).toBe(-1);
    expect(abilityModifier(int.value)).toBe(6);
    expect(parseInitiativeModifier(sheet.derivedStats.initiative)).toBe(1);
  });
});

describe("theme aliases already on main", () => {
  it("maps preset aliases onto live theme ids", () => {
    expect(themeIdForStyle("Obsidian Cult")).toBe("gothicDarkFantasy");
    expect(themeIdForStyle("Neon Ronin")).toBe("cyberpunk");
    expect(themeIdForStyle("Wasteland Scavenger")).toBe("postApocalyptic");
    expect(themeIdForStyle("Feywild Bloom")).toBe("highFantasy");
    expect(canonicalizeSheetStyle("gothicDarkFantasy")).toBe("Gothic Dark Fantasy");
  });
});

describe("portrait grounding", () => {
  it("grounds portrait prompts in live dossier equipment instead of a generic staff", () => {
    const prompt = compilePortraitPrompt({
      character_name: FIXTURE_GELBINOR.name,
      character_class: FIXTURE_GELBINOR.overview.classRole,
      character_lore: FIXTURE_GELBINOR.lore.backstory,
      sheet_style: FIXTURE_GELBINOR.sheet_style,
      equipment: FIXTURE_GELBINOR.equipment,
      physical: {
        height: FIXTURE_GELBINOR.physical.height,
        weight: FIXTURE_GELBINOR.physical.weight,
        build: FIXTURE_GELBINOR.physical.build,
        distinguishing_feature: FIXTURE_GELBINOR.physical.marks
      }
    });
    expect(prompt).toContain("Gelbinor");
    expect(prompt).toContain("Mister Cracks");
    expect(prompt).not.toContain("Obsidian Catalyst Staff");
  });
});

describe("character Codex persistence", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    const memory = {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => { store.set(k, String(v)); },
      removeItem: (k: string) => { store.delete(k); },
      clear: () => { store.clear(); }
    };
    // @ts-expect-error test stub
    globalThis.localStorage = memory;
    localStorage.clear();
  });

  it("saves, updates, duplicates, and deletes roster entries", () => {
    const first = upsertCodexEntry({
      sheetData: cloneFixture(),
      themeId: "gothicDarkFantasy",
      portraitUrl: "https://example.com/gelbinor.jpg"
    });
    expect(first.entry.name).toBe("Gelbinor");
    expect(loadCodex()).toHaveLength(1);
    expect(localStorage.getItem(CODEX_STORAGE_KEY)).toContain("Gelbinor");

    const edited = cloneFixture();
    edited.name = "Gelbinor the Named";
    const updated = upsertCodexEntry({
      existingId: first.entry.id,
      sheetData: edited,
      themeId: "gothicDarkFantasy"
    });
    expect(updated.entries).toHaveLength(1);
    expect(updated.entry.name).toBe("Gelbinor the Named");

    const dup = duplicateCodexEntry(first.entry.id);
    expect(dup.entry?.name).toBe("Gelbinor the Named (Copy)");
    expect(dup.entries).toHaveLength(2);

    const remaining = deleteCodexEntry(first.entry.id);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toContain("Copy");
  });

  it("survives a simulated refresh by reloading from localStorage", () => {
    upsertCodexEntry({
      sheetData: cloneFixture(),
      themeId: "cyberpunk",
      portraitUrl: null
    });
    expect(loadCodex()).toHaveLength(1);
    expect(loadCodex()[0].themeId).toBe("cyberpunk");
    expect(loadCodex()[0].sheetData.stats.find((s) => s.key === "INT")?.value).toBe(22);
  });
});
