import { UiSheetData } from "./sheetMapper";

export const DRAFT_STORAGE_KEY = "worldvision_character_draft_v1";

export interface SavedDraft {
  characterName: string;
  characterClass: string;
  characterLevel: string;
  characterLore: string;
  inventoryItems: string;
  sheetStyle: string;
  activePresetName: string;
  sheetData: UiSheetData;
  imageUrl?: string | null;
  savedAt?: string;
  runState?: string;
  currentStep?: number;
}

export function createBlankSheetData(): UiSheetData {
  return {
    name: "",
    title: "",
    player: "",
    sheet_style: "Gothic Dark Fantasy",
    overview: {
      race: "",
      age: "",
      gender: "",
      alignment: "",
      classRole: "",
      level: "",
      origin: "",
      faction: ""
    },
    physical: {
      height: "",
      weight: "",
      build: "",
      eyes: "",
      hair: "",
      skin: "",
      marks: "",
      scars: "",
      clothing: "",
      voice: "",
      posture: ""
    },
    lore: {
      backstory: "",
      childhood: "",
      formative: "",
      motivations: "",
      secrets: "",
      world: ""
    },
    abilities: [],
    weaknesses: "",
    skills: [
      { name: "Combat & Arms", value: 10 },
      { name: "Lore & Arcana", value: 10 },
      { name: "Stealth & Evasion", value: 10 },
      { name: "Willpower", value: 10 }
    ],
    magic: "",
    equipment: {
      primaryWeapon: "",
      secondaryFocus: "",
      armor: "",
      utilityTools: "",
      consumables: "",
      relics: "",
      currency: "",
      weapons: "",
      items: ""
    },
    signatureAttributes: {
      reputation: "",
      vice: "",
      virtue: "",
      fear: "",
      obsession: "",
      tell: "",
      loyalty: "",
      blindSpot: "",
      survivalInstinct: "",
      legacyFear: ""
    },
    derivedStats: {
      hpCurrent: 10,
      hpMax: 10,
      ac: 10,
      initiative: "+0",
      speed: "30 ft",
      level: 1,
      resourceName: "Energy / Focus",
      resourceCurrent: 10,
      resourceMax: 10,
      passives: []
    },
    personality: {
      traits: "",
      ideals: "",
      flaws: "",
      fears: "",
      mannerisms: "",
      speech: ""
    },
    relationships: {
      allies: "",
      enemies: "",
      mentors: "",
      family: ""
    },
    stats: [
      { key: "STR", label: "Strength", value: 10, desc: "" },
      { key: "DEX", label: "Dexterity", value: 10, desc: "" },
      { key: "CON", label: "Constitution", value: 10, desc: "" },
      { key: "INT", label: "Intelligence", value: 10, desc: "" },
      { key: "WIS", label: "Wisdom", value: 10, desc: "" },
      { key: "CHA", label: "Charisma", value: 10, desc: "" }
    ]
  };
}

export function draftHasContent(draft: {
  characterName?: string;
  characterClass?: string;
  characterLore?: string;
  inventoryItems?: string;
  sheetData?: { name?: string };
  activePresetName?: string;
}): boolean {
  return Boolean(
    draft.characterName?.trim() ||
      draft.characterClass?.trim() ||
      draft.characterLore?.trim() ||
      draft.inventoryItems?.trim() ||
      draft.sheetData?.name?.trim() ||
      draft.activePresetName?.trim()
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isUiSheetData(value: unknown): value is UiSheetData {
  if (!isPlainObject(value)) return false;
  if (typeof value.name !== "string") return false;
  if (!isPlainObject(value.overview) || !isPlainObject(value.physical)) return false;
  if (!isPlainObject(value.lore) || !isPlainObject(value.equipment)) return false;
  if (!isPlainObject(value.signatureAttributes) || !isPlainObject(value.derivedStats)) return false;
  if (!isPlainObject(value.personality) || !isPlainObject(value.relationships)) return false;
  if (!Array.isArray(value.stats) || !Array.isArray(value.skills) || !Array.isArray(value.abilities)) return false;
  return true;
}

export function parseSavedDraft(raw: unknown): SavedDraft | null {
  if (!isPlainObject(raw)) return null;
  if (typeof raw.characterName !== "string") return null;
  if (typeof raw.characterClass !== "string") return null;
  if (typeof raw.characterLevel !== "string") return null;
  if (typeof raw.characterLore !== "string") return null;
  if (typeof raw.inventoryItems !== "string") return null;
  if (typeof raw.sheetStyle !== "string") return null;
  if (typeof raw.activePresetName !== "string") return null;
  if (!isUiSheetData(raw.sheetData)) return null;
  if (!draftHasContent(raw)) return null;

  const draft: SavedDraft = {
    characterName: raw.characterName,
    characterClass: raw.characterClass,
    characterLevel: raw.characterLevel,
    characterLore: raw.characterLore,
    inventoryItems: raw.inventoryItems,
    sheetStyle: raw.sheetStyle,
    activePresetName: raw.activePresetName,
    sheetData: raw.sheetData,
  };
  if (typeof raw.imageUrl === "string") {
    draft.imageUrl = raw.imageUrl;
  } else if (raw.imageUrl === null) {
    draft.imageUrl = null;
  }
  if (typeof raw.savedAt === "string") draft.savedAt = raw.savedAt;
  if (typeof raw.runState === "string") draft.runState = raw.runState;
  if (typeof raw.currentStep === "number" && Number.isFinite(raw.currentStep)) {
    draft.currentStep = raw.currentStep;
  }
  return draft;
}

export function loadSavedDraft(): SavedDraft | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return parseSavedDraft(JSON.parse(raw));
  } catch (e) {
    console.error("Failed to load draft from localStorage:", e);
    return null;
  }
}

export function persistDraft(draft: SavedDraft): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch (e) {
    console.error("Auto-save draft error:", e);
    return false;
  }
}

export function clearSavedDraft(): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    return true;
  } catch (e) {
    console.error("Failed to remove draft:", e);
    return false;
  }
}
