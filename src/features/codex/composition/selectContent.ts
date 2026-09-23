import type { GearSlotId, WorkshopEquipment, WorkshopSheet, WorkshopSignature } from "../schema/codexSnapshotV1";

export interface SelectedTrait {
  key: string;
  label: string;
  value: string;
}

export interface SelectedGear {
  slot: GearSlotId;
  label: string;
  name: string;
  inscribed: boolean;
}

export const TRAIT_PRIORITY: ReadonlyArray<{ key: keyof WorkshopSignature; label: string }> = [
  { key: "reputation", label: "Reputation" },
  { key: "virtue", label: "Virtue" },
  { key: "vice", label: "Vice" },
  { key: "fear", label: "Fear" },
  { key: "obsession", label: "Obsession" },
  { key: "loyalty", label: "Loyalty" },
  { key: "tell", label: "Tell" },
  { key: "blindSpot", label: "Blind Spot" },
  { key: "survivalInstinct", label: "Survival" },
  { key: "legacyFear", label: "Legacy Fear" },
];

const GEAR_FIELDS: ReadonlyArray<{ slot: GearSlotId; label: string; key: keyof WorkshopEquipment }> = [
  { slot: "primaryWeapon", label: "Primary", key: "primaryWeapon" },
  { slot: "secondaryFocus", label: "Focus", key: "secondaryFocus" },
  { slot: "armor", label: "Armor", key: "armor" },
  { slot: "utilityTools", label: "Utility", key: "utilityTools" },
  { slot: "consumables", label: "Consumable", key: "consumables" },
  { slot: "relics", label: "Relic", key: "relics" },
];

export const ATTRIBUTE_ORDER = [
  { key: "STR", label: "Strength" },
  { key: "DEX", label: "Dexterity" },
  { key: "CON", label: "Constitution" },
  { key: "INT", label: "Intelligence" },
  { key: "WIS", label: "Wisdom" },
  { key: "CHA", label: "Charisma" },
] as const;

export function selectTraits(signature: WorkshopSignature, limit = 6): SelectedTrait[] {
  const chosen: SelectedTrait[] = [];
  for (const trait of TRAIT_PRIORITY) {
    if (chosen.length >= limit) break;
    const value = signature[trait.key].replace(/\s+/g, " ").trim();
    if (!value) continue;
    chosen.push({ key: trait.key, label: trait.label, value });
  }
  return chosen;
}

export function selectGear(equipment: WorkshopEquipment): SelectedGear[] {
  return GEAR_FIELDS.map((field) => {
    const name = equipment[field.key].replace(/\s+/g, " ").trim();
    return {
      slot: field.slot,
      label: field.label,
      name: name || "Uninscribed",
      inscribed: name.length > 0,
    };
  });
}

export function selectAttributes(stats: WorkshopSheet["stats"]): Array<{ key: string; label: string; value: number; filled: boolean }> {
  return ATTRIBUTE_ORDER.map((slot) => {
    const match = stats.find((stat) => stat.key.toUpperCase() === slot.key);
    if (!match || !Number.isFinite(match.value)) {
      return { key: slot.key, label: slot.label, value: 10, filled: false };
    }
    return { key: slot.key, label: match.label.trim() || slot.label, value: match.value, filled: true };
  });
}
