import { afterEach, describe, expect, it } from "vitest";
import {
  generateFedorovInstantCharacter,
  getCryptoRandomInt,
  pickCryptoRandom,
  resetFedorovInstantHistory,
} from "../lib/fedorovInstantGenerator";
import { canonicalizeSheetStyle } from "../lib/themeMap";
import { SheetPreset } from "../types";

afterEach(() => {
  resetFedorovInstantHistory();
});

describe("fedorovInstantGenerator", () => {
  it("rejects an empty pick list", () => {
    expect(() => pickCryptoRandom([])).toThrow(/non-empty/);
  });

  it("returns the inclusive bounds for a single-value range", () => {
    expect(getCryptoRandomInt(7, 7)).toBe(7);
  });

  it("emits a complete sheet-shaped character with bounded stats", () => {
    const generated = generateFedorovInstantCharacter();
    expect(generated.characterName.length).toBeGreaterThan(2);
    expect(generated.characterClass.length).toBeGreaterThan(2);
    expect(generated.overview.race).toBe(generated.characterRace);
    expect(generated.abilities).toHaveLength(3);
    expect(generated.stats).toHaveLength(6);
    for (const stat of generated.stats) {
      expect(stat.value).toBeGreaterThanOrEqual(1);
      expect(stat.value).toBeLessThanOrEqual(24);
    }
    const level = Number(generated.characterLevel);
    expect(level).toBeGreaterThanOrEqual(3);
    expect(level).toBeLessThanOrEqual(18);
    expect(generated.derivedStats.hpMax).toBe(generated.derivedStats.hpCurrent);
    expect(generated.derivedStats.level).toBe(level);
    expect(canonicalizeSheetStyle(generated.sheetStyle)).toMatch(
      /Gothic Dark Fantasy|Cyberpunk|Steampunk|High Fantasy|Cosmic Horror/
    );
  });

  it("avoids repeating name, race, or class across the last five rolls", () => {
    const batch = Array.from({ length: 6 }, () => generateFedorovInstantCharacter());
    const window = batch.slice(-5);
    const names = window.map((c) => c.characterName.toLowerCase());
    const races = window.map((c) => c.characterRace.toLowerCase());
    const classes = window.map((c) => c.characterClass.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
    expect(new Set(races).size).toBe(races.length);
    expect(new Set(classes).size).toBe(classes.length);
  });

  it("does not reuse a reserved preset name", () => {
    const reserved: SheetPreset[] = [{
      name: "Locked",
      style: "Gothic Dark Fantasy",
      category: "test",
      charName: "Aelindor Sunweaver",
      charClass: "Locked Class",
      lore: "reserved",
      items: "none",
    }];
    for (let i = 0; i < 20; i += 1) {
      const generated = generateFedorovInstantCharacter(reserved);
      expect(generated.characterName.toLowerCase()).not.toBe("aelindor sunweaver");
    }
  });

  it("caps Thorn-Pixie Strength at 9 when that race is rolled", () => {
    let pixie: ReturnType<typeof generateFedorovInstantCharacter> | undefined;
    for (let i = 0; i < 80; i += 1) {
      resetFedorovInstantHistory();
      const generated = generateFedorovInstantCharacter();
      if (generated.characterRace === "Thorn-Pixie Sprite") {
        pixie = generated;
        break;
      }
    }
    expect(pixie).toBeDefined();
    const str = pixie?.stats.find((s) => s.key === "STR")?.value ?? 99;
    expect(str).toBeLessThanOrEqual(9);
    expect(str).toBeGreaterThanOrEqual(1);
  });
});
