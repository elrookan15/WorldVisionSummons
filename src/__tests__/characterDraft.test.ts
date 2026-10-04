import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DRAFT_STORAGE_KEY,
  clearSavedDraft,
  createBlankSheetData,
  draftHasContent,
  loadSavedDraft,
  parseSavedDraft,
  persistDraft,
} from "../lib/characterDraft";

function installMemoryStorage() {
  const store = new Map<string, string>();
  const memory = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => {
      store.clear();
    },
  };
  // @ts-expect-error test stub
  globalThis.localStorage = memory;
  return memory;
}

describe("characterDraft", () => {
  beforeEach(() => {
    installMemoryStorage();
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "localStorage");
  });

  it("creates a blank sheet with empty identity and baseline 10s", () => {
    const blank = createBlankSheetData();
    expect(blank.name).toBe("");
    expect(blank.overview.race).toBe("");
    expect(blank.abilities).toEqual([]);
    expect(blank.stats).toHaveLength(6);
    expect(blank.stats.every((stat) => stat.value === 10)).toBe(true);
    expect(blank.skills).toHaveLength(4);
    expect(blank.skills.every((skill) => skill.value === 10)).toBe(true);
    expect(blank.derivedStats.hpMax).toBe(10);
    expect(blank.derivedStats.level).toBe(1);
    expect(draftHasContent({ sheetData: blank, characterName: "", characterClass: "", characterLore: "", inventoryItems: "", activePresetName: "" })).toBe(false);
  });

  it("rejects garbage and empty drafts", () => {
    expect(parseSavedDraft(null)).toBeNull();
    expect(parseSavedDraft({ characterName: "Ada" })).toBeNull();
    const empty = {
      characterName: "   ",
      characterClass: "",
      characterLevel: "",
      characterLore: "",
      inventoryItems: "",
      sheetStyle: "Gothic Dark Fantasy",
      activePresetName: "",
      sheetData: createBlankSheetData(),
    };
    expect(parseSavedDraft(empty)).toBeNull();
  });

  it("round-trips a named draft through localStorage", () => {
    const sheetData = createBlankSheetData();
    sheetData.name = "Ada Voss";
    const written = persistDraft({
      characterName: "Ada Voss",
      characterClass: "Hexblade",
      characterLevel: "7",
      characterLore: "Harbor-born oathbreaker.",
      inventoryItems: "Ashen saber",
      sheetStyle: "Cyberpunk",
      activePresetName: "",
      sheetData,
      imageUrl: null,
      runState: "draft",
      currentStep: 2,
      savedAt: "2026-10-04T04:00:00.000Z",
    });
    expect(written).toBe(true);
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toContain("Ada Voss");

    const loaded = loadSavedDraft();
    expect(loaded?.characterName).toBe("Ada Voss");
    expect(loaded?.characterClass).toBe("Hexblade");
    expect(loaded?.sheetData.name).toBe("Ada Voss");
    expect(loaded?.currentStep).toBe(2);
    expect(loaded?.sheetStyle).toBe("Cyberpunk");

    expect(clearSavedDraft()).toBe(true);
    expect(loadSavedDraft()).toBeNull();
  });
});
