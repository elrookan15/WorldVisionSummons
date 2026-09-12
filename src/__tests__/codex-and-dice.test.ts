import { describe, it, expect, beforeEach } from "vitest";
import { abilityModifier, formatModifier, parseInitiativeModifier, rollCheck, rollDie } from "../lib/dice";
import { normalizeSheet } from "../lib/normalizeSheet";
import { cloneSheet, DEFAULT_GELBINOR } from "../lib/defaultSheet";
import { resolveThemeId } from "../lib/themeAliases";
import { parseSheetRows } from "../lib/sheetsMapper";
import { CODEX_STORAGE_KEY, deleteCodexEntry, loadCodex, upsertCodexEntry } from "../lib/characterCodex";
import { compilePortraitPrompt } from "../lib/prompts/generators";

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

  it("keeps d6 rolls in range", () => {
    for (let i = 0; i < 40; i++) {
      const n = rollDie(6);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6);
    }
  });
});

describe("sheet normalization & Sheets mapping", () => {
  it("fills missing nested fields so the dossier UI cannot crash", () => {
    const sheet = normalizeSheet({ name: "Nyx", stats: [{ label: "STR", value: 16 }] });
    expect(sheet.name).toBe("Nyx");
    expect(sheet.stats).toHaveLength(6);
    expect(sheet.stats[0].key).toBe("STR");
    expect(sheet.stats[0].value).toBe(16);
    expect(sheet.overview.classRole).toBeTruthy();
    expect(sheet.derivedStats.hpMax).toBeGreaterThan(0);
    expect(sheet.signatureAttributes.vice).toBeTruthy();
  });

  it("round-trips live dossier fields through the Sheets parser", () => {
    const source = cloneSheet(DEFAULT_GELBINOR);
    const rows: string[][] = [
      ["Name", source.name],
      ["Title", source.title],
      ["Class Role", source.overview.classRole],
      ["Style", source.sheet_style],
      ["Alignment", source.overview.alignment],
      ["Level", String(source.derivedStats.level)],
      ["HP", String(source.derivedStats.hpCurrent)],
      ["HP Max", String(source.derivedStats.hpMax)],
      ["AC", String(source.derivedStats.ac)],
      ["Speed", source.derivedStats.speed],
      ["Initiative", source.derivedStats.initiative],
      ["Bio / Lore", source.lore.backstory],
      ["Height", source.physical.height],
      ["Weight", source.physical.weight],
      ["Build", source.physical.build],
      ["Distinguishing Feature", source.physical.marks],
      ["Strength", String(source.stats[0].value)],
      ["Dexterity", String(source.stats[1].value)],
      ["Constitution", String(source.stats[2].value)],
      ["Intelligence", String(source.stats[3].value)],
      ["Wisdom", String(source.stats[4].value)],
      ["Charisma", String(source.stats[5].value)],
      ["Primary Weapon", source.equipment.primaryWeapon],
      ["INVENTORY ITEMS"],
      ["Item 1", "Mister Cracks Grimoire"],
      ["PSYCHOLOGICAL TRAITS (DNA)"],
      ["Vice", source.signatureAttributes.vice],
      ["Blind Spot", source.signatureAttributes.blindSpot]
    ];
    const parsed = normalizeSheet(parseSheetRows(rows));
    expect(parsed.name).toBe("Gelbinor");
    expect(parsed.stats.find((s) => s.key === "INT")?.value).toBe(22);
    expect(parsed.stats.find((s) => s.key === "CHA")?.value).toBe(7);
    expect(parsed.derivedStats.ac).toBe(14);
    expect(parsed.equipment.primaryWeapon).toContain("Mister Cracks");
    expect(parsed.signatureAttributes.blindSpot).toContain("hostility");
  });
});

describe("theme aliases and portrait grounding", () => {
  const themes = [
    { id: "gothicDarkFantasy", alias: "obsidianCult", name: "Gothic Dark Fantasy" },
    { id: "cyberpunk", alias: "neonRonin", name: "Cyberpunk" },
    { id: "postApocalyptic", alias: "wastelandScavenger", name: "Post-Apocalyptic" },
    { id: "highFantasy", alias: "arcaneCodex", name: "High Fantasy" }
  ];

  it("maps preset aliases onto live theme ids", () => {
    expect(resolveThemeId("Obsidian Cult", themes)).toBe("gothicDarkFantasy");
    expect(resolveThemeId("Neon Ronin", themes)).toBe("cyberpunk");
    expect(resolveThemeId("Wasteland Scavenger", themes)).toBe("postApocalyptic");
    expect(resolveThemeId("Feywild Bloom", themes)).toBe("highFantasy");
    expect(resolveThemeId("gothicDarkFantasy", themes)).toBe("gothicDarkFantasy");
  });

  it("grounds portrait prompts in live dossier equipment instead of a generic staff", () => {
    const prompt = compilePortraitPrompt(DEFAULT_GELBINOR);
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

  it("saves, updates, and deletes roster entries", () => {
    const first = upsertCodexEntry({
      sheetData: cloneSheet(DEFAULT_GELBINOR),
      themeId: "gothicDarkFantasy",
      portraitUrl: "https://example.com/gelbinor.jpg"
    });
    expect(first.entry.name).toBe("Gelbinor");
    expect(loadCodex()).toHaveLength(1);
    expect(localStorage.getItem(CODEX_STORAGE_KEY)).toContain("Gelbinor");

    const edited = cloneSheet(DEFAULT_GELBINOR);
    edited.name = "Gelbinor the Named";
    const updated = upsertCodexEntry({
      existingId: first.entry.id,
      sheetData: edited,
      themeId: "gothicDarkFantasy"
    });
    expect(updated.entries).toHaveLength(1);
    expect(updated.entry.name).toBe("Gelbinor the Named");

    const remaining = deleteCodexEntry(first.entry.id);
    expect(remaining).toHaveLength(0);
  });
});
