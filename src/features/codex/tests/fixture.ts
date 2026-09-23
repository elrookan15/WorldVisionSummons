import type { WorkshopSheet } from "../schema/codexSnapshotV1";

export function workshopFixture(overrides: Partial<WorkshopSheet> = {}): WorkshopSheet {
  const base: WorkshopSheet = {
    name: "Vaelith Thorn",
    title: "Warden of the Threshold",
    sheet_style: "Gothic Dark Fantasy",
    overview: {
      classRole: "Hexblade",
      faction: "Ash Court",
      alignment: "Lawful Neutral",
    },
    physical: {
      height: "6'1\"",
      weight: "168 lbs",
      build: "Lean",
      marks: "Silver fracture across the brow",
      scars: "Brand on the left palm",
    },
    signatureAttributes: {
      reputation: "The quiet oathkeeper",
      vice: "Keeps names that are not hers",
      virtue: "Stands the last watch",
      fear: "A door that opens from both sides",
      obsession: "Cataloguing unfinished vows",
      tell: "Touches the brand before she speaks",
      loyalty: "The living, not the throne",
      blindSpot: "Trusts written law over witnesses",
      survivalInstinct: "Goes still until the room decides",
      legacyFear: "Being remembered as the lock",
    },
    derivedStats: {
      hpCurrent: 48,
      hpMax: 52,
      ac: 16,
      initiative: "+3",
      speed: "30 ft",
      level: 7,
      resourceName: "Pact",
      resourceCurrent: 3,
      resourceMax: 4,
    },
    lore: {
      backstory: "Vaelith keeps the threshold between the ash court and the unnamed road. She records every oath that fails to close.",
    },
    equipment: {
      primaryWeapon: "Threshold Blade",
      secondaryFocus: "Ash Signet",
      armor: "Warden Coat",
      utilityTools: "Wax ledger",
      consumables: "Black salt",
      relics: "Unfinished Key",
    },
    personality: { speech: "A door is a promise with hinges." },
    stats: [
      { key: "STR", label: "Strength", value: 12 },
      { key: "DEX", label: "Dexterity", value: 16 },
      { key: "CON", label: "Constitution", value: 14 },
      { key: "INT", label: "Intelligence", value: 13 },
      { key: "WIS", label: "Wisdom", value: 15 },
      { key: "CHA", label: "Charisma", value: 17 },
    ],
  };
  return {
    ...base,
    ...overrides,
    overview: { ...base.overview, ...overrides.overview },
    physical: { ...base.physical, ...overrides.physical },
    signatureAttributes: { ...base.signatureAttributes, ...overrides.signatureAttributes },
    derivedStats: { ...base.derivedStats, ...overrides.derivedStats },
    lore: { ...base.lore, ...overrides.lore },
    equipment: { ...base.equipment, ...overrides.equipment },
    personality: { ...base.personality, ...overrides.personality },
    stats: overrides.stats ?? base.stats,
  };
}
