/**
 * FEDOROV Instant Character Creator
 *
 * Cryptographically secure, collision-avoiding procedural generator for
 * WorldVision Summons characters. Produces high-fidelity fantasy/sci-fi
 * characters with sensible stat biases, authentic cultural name syllables,
 * race-appropriate attributes, lore seeds, and inventory packages.
 */

import { SheetPreset } from "../types";

export interface GeneratedFedorovCharacter {
  characterName: string;
  characterRace: string;
  characterClass: string;
  characterLevel: string;
  characterLore: string;
  inventoryItems: string;
  sheetStyle: string;
  stats: { key: string; label: string; value: number; desc: string }[];
  overview: {
    race: string;
    age: string;
    gender: string;
    alignment: string;
    classRole: string;
    level: string;
    origin: string;
    faction: string;
  };
  physical: {
    height: string;
    weight: string;
    build: string;
    eyes: string;
    hair: string;
    skin: string;
    marks: string;
    scars: string;
    clothing: string;
    voice: string;
    posture: string;
  };
  lore: {
    backstory: string;
    childhood: string;
    formative: string;
    motivations: string;
    secrets: string;
    world: string;
  };
  abilities: {
    name: string;
    desc: string;
    cooldown: string;
    cost: string;
    type: string;
  }[];
  weaknesses: string;
  skills: { name: string; value: number }[];
  magic: string;
  equipment: {
    primaryWeapon: string;
    secondaryFocus: string;
    armor: string;
    utilityTools: string;
    consumables: string;
    relics: string;
    currency: string;
    weapons: string;
    items: string;
  };
  signatureAttributes: {
    reputation: string;
    vice: string;
    virtue: string;
    fear: string;
    obsession: string;
    tell: string;
    loyalty: string;
    blindSpot: string;
    survivalInstinct: string;
    legacyFear: string;
  };
  derivedStats: {
    hpCurrent: number;
    hpMax: number;
    ac: number;
    initiative: string;
    speed: string;
    level: number;
    resourceName: string;
    resourceCurrent: number;
    resourceMax: number;
    passives: string[];
  };
  personality: {
    traits: string;
    ideals: string;
    flaws: string;
    fears: string;
    mannerisms: string;
    speech: string;
  };
  relationships: {
    allies: string;
    enemies: string;
    mentors: string;
    family: string;
  };
}

const RECENT_GENERATIONS_KEY = "worldvision_fedorov_history";
const MAX_COLLISION_HISTORY = 16;
const COLLISION_WINDOW = 5;

type HistoryEntry = { name: string; race: string; charClass: string };

const inMemoryHistory: HistoryEntry[] = [];
let historyHydrated = false;

function readSessionStorage(): string | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage.getItem(RECENT_GENERATIONS_KEY);
  } catch {
    return null;
  }
}

function writeSessionStorage(entries: HistoryEntry[]): void {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(RECENT_GENERATIONS_KEY, JSON.stringify(entries));
  } catch {
    // ignore quota / private-mode
  }
}

function hydrateHistory(): void {
  if (historyHydrated) return;
  historyHydrated = true;
  const raw = readSessionStorage();
  if (!raw) return;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    const cleaned: HistoryEntry[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const rec = row as Record<string, unknown>;
      if (typeof rec.name !== "string" || typeof rec.race !== "string" || typeof rec.charClass !== "string") {
        continue;
      }
      cleaned.push({ name: rec.name, race: rec.race, charClass: rec.charClass });
    }
    inMemoryHistory.splice(0, inMemoryHistory.length, ...cleaned.slice(0, MAX_COLLISION_HISTORY));
  } catch {
    // ignore corrupt history
  }
}

function getRecentHistory(): HistoryEntry[] {
  hydrateHistory();
  return inMemoryHistory;
}

function recordGeneration(entry: HistoryEntry): void {
  hydrateHistory();
  inMemoryHistory.unshift(entry);
  if (inMemoryHistory.length > MAX_COLLISION_HISTORY) {
    inMemoryHistory.length = MAX_COLLISION_HISTORY;
  }
  writeSessionStorage(inMemoryHistory);
}

/** Test hook — clears collision history. */
export function resetFedorovInstantHistory(): void {
  inMemoryHistory.length = 0;
  historyHydrated = true;
  writeSessionStorage([]);
}

export function getCryptoRandomInt(min: number, max: number): number {
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
    throw new Error(`Invalid integer range ${min}..${max}`);
  }
  const range = max - min + 1;
  const rng = globalThis.crypto;
  if (!rng?.getRandomValues) {
    throw new Error("crypto.getRandomValues is not available");
  }
  const array = new Uint32Array(1);
  const maxUnbiased = Math.floor(0x100000000 / range) * range;
  let value = 0;
  do {
    rng.getRandomValues(array);
    value = array[0];
  } while (value >= maxUnbiased);
  return min + (value % range);
}

export function pickCryptoRandom<T>(items: readonly T[] | T[]): T {
  if (items.length === 0) {
    throw new Error("pickCryptoRandom requires a non-empty list");
  }
  return items[getCryptoRandomInt(0, items.length - 1)];
}

interface RaceDefinition {
  raceName: string;
  genre: string;
  style: string;
  namePrefixes: string[];
  nameRoots: string[];
  nameSuffixes: string[];
  titles: string[];
  curatedFirstNames: string[];
  curatedLastNames: string[];
  heightRange: [string, string];
  weightRange: [string, string];
  builds: string[];
  eyeColors: string[];
  skinTones: string[];
  origins: string[];
  factions: string[];
  statModifiers: {
    minStr?: number; maxStr?: number;
    minDex?: number; maxDex?: number;
    minCon?: number; maxCon?: number;
    minInt?: number; maxInt?: number;
    minWis?: number; maxWis?: number;
    minCha?: number; maxCha?: number;
  };
}

const RACE_DEFINITIONS: RaceDefinition[] = [
  {
    raceName: "High Elf (Sun-Blessed)",
    genre: "High Fantasy",
    style: "High Fantasy",
    namePrefixes: ["Ael", "Syl", "Faer", "Cael", "Thas", "Elys", "Val", "Illy", "Lyr"],
    nameRoots: ["ar", "en", "eth", "in", "al", "on", "iel"],
    nameSuffixes: ["drin", "ion", "elor", "wen", "riel", "vanna", "anor", "ith"],
    titles: ["of the Silver Spire", "Sunstrider", "the Gilded", "Star-Singer", "of House Lunaria"],
    curatedFirstNames: ["Aelindor", "Sylvaris", "Faeren", "Caeloria", "Valenor", "Elysia", "Lyrion", "Thalindra"],
    curatedLastNames: ["Sunweaver", "Moonstrider", "Starwhisper", "Silverveil", "Dawnspire", "Goldleaf"],
    heightRange: ["5'11\"", "6'5\""],
    weightRange: ["140 lbs", "175 lbs"],
    builds: ["Slender, graceful, towering and regal", "Ethereal, tall with poised aristocratic bearing"],
    eyeColors: ["Brilliant liquid gold", "Luminescent violet", "Star-flecked emerald"],
    skinTones: ["Warm porcelain with golden sheen", "Radiant alabaster"],
    origins: ["The Gilded Spires of Aethelgard", "The Sun-Tree Cathedral", "The High Sunder Realms"],
    factions: ["Order of the Solar Veil", "Lumina Concordat", "Wardens of the First Star"],
    statModifiers: { minDex: 14, maxDex: 20, minInt: 14, maxInt: 22, minCha: 12, maxCha: 20 }
  },
  {
    raceName: "Deepforged Dwarf",
    genre: "High Fantasy",
    style: "High Fantasy",
    namePrefixes: ["Thor", "Bal", "Krag", "Brom", "Durn", "Thra", "Grum", "Grim", "Brog"],
    nameRoots: ["in", "ar", "or", "un", "uk"],
    nameSuffixes: ["din", "gar", "grim", "bur", "rak", "sturm", "morn", "krag"],
    titles: ["Anvil-Breaker", "Ironfoot", "Lord of the Deeps", "Runebound", "Forge-Master"],
    curatedFirstNames: ["Thorgrim", "Balthor", "Kragmar", "Bromdurn", "Thrain", "Grumli", "Durgar", "Vondur"],
    curatedLastNames: ["Ironclad", "Stoneforge", "Deepanvil", "Orebrow", "Firevein", "Granitefist"],
    heightRange: ["4'4\"", "4'10\""],
    weightRange: ["180 lbs", "230 lbs"],
    builds: ["Massive broad shoulders, dense muscle like solid bedrock", "Stocky, indestructible frame with iron sinews"],
    eyeColors: ["Molten amber", "Faceted obsidian", "Deep coal grey"],
    skinTones: ["Weathered stone grey", "Ruddy bronze from forge heat"],
    origins: ["The Deepest Kilns of Karak-Zhul", "The Adamant Mines of Undermountain", "Basalt Hollows"],
    factions: ["Grand Guild of Adamantine Smiths", "Iron Vanguard Syndicate", "Keepers of the First Anvil"],
    statModifiers: { minStr: 14, maxStr: 22, minCon: 15, maxCon: 22, minWis: 11, maxWis: 18 }
  },
  {
    raceName: "Human Hollowed",
    genre: "Gothic Dark Fantasy",
    style: "Gothic Dark Fantasy",
    namePrefixes: ["Mor", "Sepul", "Grave", "Vane", "Mal", "Oss", "Cor", "Kael"],
    nameRoots: ["or", "ath", "in", "is", "el"],
    nameSuffixes: ["binor", "grave", "wick", "thorne", "rost", "mourn", "vow"],
    titles: ["the Unclaimed", "Keeper of Whispers", "the Pale", "Ossuary Warden", "of Karst"],
    curatedFirstNames: ["Gelbinor", "Maldor", "Corvus", "Vane", "Sepulcher", "Kaelen", "Moros", "Osric"],
    curatedLastNames: ["Ashborn", "Grave-Binder", "Hollow-Vein", "Blackthorn", "Pale-Song", "Cindershroud"],
    heightRange: ["5'9\"", "6'2\""],
    weightRange: ["125 lbs", "165 lbs"],
    builds: ["Gaunt, translucent skin showing dark veins, solemn demeanor", "Lanky and frail, haunted composure"],
    eyeColors: ["Milky grey with pinpoint pupils", "Pale bone white", "Flickering ghost candle blue"],
    skinTones: ["Ash pale, cold to touch", "Translucent alabaster with blue-grey veins"],
    origins: ["The Karst Catacombs Beneath the Citadel", "The Whispering Fen of Weeping Willows", "Sepulcher Nine"],
    factions: ["The Ossuary Librarians", "Brotherhood of the Silent Shroud", "Order of the Unclaimed Dead"],
    statModifiers: { minInt: 14, maxInt: 22, minWis: 14, maxWis: 22, maxStr: 14 }
  },
  {
    raceName: "Obsidian Dragonborn",
    genre: "High Fantasy",
    style: "Obsidian Cult",
    namePrefixes: ["Drak", "Ignis", "Balth", "Verm", "Rath", "Pyra", "Scor", "Vael"],
    nameRoots: ["ath", "or", "un", "ax", "ar"],
    nameSuffixes: ["thar", "zhor", "drak", "kahn", "vash", "kor", "goth"],
    titles: ["the Wyrm-Heart", "Cinder-Claw", "Basalt Maw", "the Unquenched", "Breath of Ash"],
    curatedFirstNames: ["Drakzhor", "Ignithar", "Balthorax", "Rathvash", "Vermikhan", "Pyrakor", "Vaelgoth"],
    curatedLastNames: ["Cinderfang", "Obsidianscale", "Flameforged", "Ashscourge", "Drakebound", "Pyreclaw"],
    heightRange: ["6'6\"", "7'2\""],
    weightRange: ["250 lbs", "330 lbs"],
    builds: ["Gigantic draconic physique covered in jagged obsidian scales, smoke drifting from nostrils", "Hulking draconian juggernaut"],
    eyeColors: ["Smoldering magma orange", "Sulfuric burning yellow", "Glowing crimson coal"],
    skinTones: ["Gleaming volcanic obsidian black", "Chapped basalt charcoal"],
    origins: ["Mount Ash Caldera Sanctuary", "The Dragon-Tooth Spire", "The Brimstone Rift"],
    factions: ["Cult of the Black Basalt Dragon", "Wyrm-Lords Vanguard", "Order of the Pyre-Breathers"],
    statModifiers: { minStr: 16, maxStr: 24, minCon: 15, maxCon: 22, minCha: 12, maxCha: 20 }
  },
  {
    raceName: "Thorn-Pixie Sprite",
    genre: "Feywild Bloom",
    style: "Feywild Bloom",
    namePrefixes: ["Pip", "Briar", "Nix", "Tink", "Fawn", "Glim", "Whis", "Twig"],
    nameRoots: ["el", "in", "y", "a", "or"],
    nameSuffixes: ["le", "wick", "kin", "bell", "sprout", "petal", "wing", "thorn"],
    titles: ["the Nimble", "Whisper-Wing", "Court Jester of Twilight", "the Prankster", "Bramble-Bound"],
    curatedFirstNames: ["Briarwick", "Pipinelle", "Nixikin", "Glimmerwing", "Fawnsprout", "Twigglethorn", "Zephyrbell"],
    curatedLastNames: ["Dewdrop", "Thornwhisper", "Gossamer", "Pollenflight", "Bramblefoot", "Starpetal"],
    heightRange: ["1'8\"", "2'6\""],
    weightRange: ["18 lbs", "28 lbs"],
    builds: ["Tiny, hyper-agile with translucent dragonfly wings and luminous gossamer clothing", "Pocket-sized fey with impossible agility"],
    eyeColors: ["Prismatic iridescent emerald", "Pollen gold", "Starlight violet"],
    skinTones: ["Soft moss green", "Petal blush peach", "Bioluminescent pale"],
    origins: ["The Heart of the Briarwood Maze", "The Twilight Blossom Glade", "Court of Falling Dew"],
    factions: ["The Autumn Seelie Court", "Bramblefoot Scouts", "Sprite Vanguard"],
    statModifiers: { minStr: 4, maxStr: 9, minDex: 18, maxDex: 24, minCha: 16, maxCha: 22, minInt: 12, maxInt: 18 }
  },
  {
    raceName: "Bloodbound Orc",
    genre: "High Fantasy",
    style: "Gothic Dark Fantasy",
    namePrefixes: ["Grom", "Krag", "Mok", "Thok", "Ur", "Drak", "Vok", "Gorg", "Borg"],
    nameRoots: ["rash", "nak", "gash", "thar", "vash"],
    nameSuffixes: ["gor", "nak", "mash", "kull", "jaw", "blood", "rend"],
    titles: ["Skull-Cleaver", "the Unbroken", "Warlord of Ash", "Blood-Fist", "Ironhide"],
    curatedFirstNames: ["Grommash", "Kragthor", "Mokgash", "Thoknak", "Urgor", "Drakjaw", "Vokrend", "Borgkull"],
    curatedLastNames: ["Ironhide", "Bloodfang", "Bonecrusher", "Ashcleaver", "Warhound", "Thunderstrike"],
    heightRange: ["6'4\"", "7'0\""],
    weightRange: ["260 lbs", "340 lbs"],
    builds: ["Towering mountain of corded muscle, war tattoos and ritual scarification", "Colossal brute frame forged by tribal war"],
    eyeColors: ["Savage amber", "Blood crimson", "Piercing ochre"],
    skinTones: ["Deep olive green", "Ash-grey with crimson war paint"],
    origins: ["The Jagged Blood-Ridge Steppes", "The Shattered Crater Clan", "Wastes of Grom-Var"],
    factions: ["The Blood-Axe Warlord Horde", "Iron-Tusk Vanguard", "Circle of Ancestral Fury"],
    statModifiers: { minStr: 17, maxStr: 24, minCon: 16, maxCon: 24, maxInt: 12, minDex: 11, maxDex: 16 }
  },
  {
    raceName: "Aetherium Golem (Construct)",
    genre: "Tech & Cyber",
    style: "Steampunk",
    namePrefixes: ["Unit-", "Chrono-", "Apex-", "Vector-", "Forge-", "Omni-", "Aegis-"],
    nameRoots: ["0", "7", "9", "IV", "VII", "X"],
    nameSuffixes: ["-Prime", "-Alpha", "-Omega", "-Delta", "-Titan", "-Kore"],
    titles: ["the Awakened", "Clockwork Vanguard", "the Eternal Servitor", "Keeper of the Steam Core"],
    curatedFirstNames: ["Chrono-7X", "Apex-Prime", "Vector-IV", "Forge-Omega", "Aegis-Titan", "Omni-IX", "Unit-Zero"],
    curatedLastNames: ["Brassworks", "Steamforge", "Gearsoul", "Clockmaker", "Aether-Core", "Pistonheart"],
    heightRange: ["6'7\"", "7'6\""],
    weightRange: ["400 lbs", "600 lbs"],
    builds: ["Machined brass, heavy interlocking steel gears, glowing pressurized pressure valves", "Heavy hydraulic chassis with steam exhaust vents"],
    eyeColors: ["Glowing cobalt optical lenses", "Furnace amber lenses", "Electric cyan reticles"],
    skinTones: ["Burnished riveted brass", "Tempered blackened steel with bronze filigree"],
    origins: ["The Clockwork Citadel of Cogsworth", "The Great Imperial Forge", "The Automated Foundry"],
    factions: ["The Awakened Automata Enclave", "Imperial Steam Guild", "Order of Chronos"],
    statModifiers: { minStr: 16, maxStr: 24, minCon: 16, maxCon: 24, maxCha: 10, minInt: 10, maxInt: 18 }
  },
  {
    raceName: "Void-Touched Starfarer",
    genre: "Cosmic Horror",
    style: "Cosmic Horror",
    namePrefixes: ["Nyx", "Xylar", "Azath", "Kzhal", "Thul", "Yogg", "Vhol", "Mor"],
    nameRoots: ["or", "iss", "oth", "aris", "un"],
    nameSuffixes: ["aris", "goth", "oth", "kash", "vorn", "veil", "void"],
    titles: ["the Star-Eater", "Herald of the Black Sun", "Abyssal Dreamer", "Mind-Gazer", "of the Deep"],
    curatedFirstNames: ["Nyxaris", "Xylaroth", "Azathvorn", "Kzhaloth", "Thulvorn", "Yoggoth", "Vholkash"],
    curatedLastNames: ["Voidwhisper", "Stardevourer", "Abysswalker", "Blackorbit", "Nebulashade", "Eventhorizon"],
    heightRange: ["5'10\"", "6'4\""],
    weightRange: ["140 lbs", "180 lbs"],
    builds: ["Unsettlingly fluid silhouette, subtle star-matter drift around fingers and collarbone", "Slender, hypnotic presence with floating void dust"],
    eyeColors: ["Vantablack with swirling galaxies", "Pulsing quasar violet", "Twin eclipse rings"],
    skinTones: ["Deep indigo nebula tint", "Starless void ash"],
    origins: ["The Shattered Orbit of Yuggoth", "The Deep Black Beyond the Rim", "The Bleeding Monolith"],
    factions: ["Disciples of the Event Horizon", "Order of the Black Sun", "The Stargazers Coven"],
    statModifiers: { minInt: 16, maxInt: 24, minWis: 14, maxWis: 22, maxStr: 12, minCha: 12, maxCha: 20 }
  },
  {
    raceName: "Cyber-Augmented Netrunner",
    genre: "Tech & Cyber",
    style: "Cyberpunk",
    namePrefixes: ["Kael", "Vex", "Zero", "Cipher", "Glitch", "Nyx", "Echo", "Flux"],
    nameRoots: ["en", "or", "in", "ex", "is"],
    nameSuffixes: ["runner", "net", "wire", "chip", "byte", "pulse", "ghost"],
    titles: ["Ghost in the Sprawl", "Grid-Breaker", "Sub-Zero Deckmaster", "Black-ICE Hunter"],
    curatedFirstNames: ["Kaelen Vex", "Cipher Zero", "Nyx Wire", "Echo Flux", "Glitch Vance", "Jaxon Cyber"],
    curatedLastNames: ["Overdrive", "Neuro-Link", "Gridrunner", "Synapse", "Black-ICE", "Neon-Drift"],
    heightRange: ["5'8\"", "6'1\""],
    weightRange: ["150 lbs", "190 lbs"],
    builds: ["Wired with chrome dermal ports, fiber-optic neural jacks running down spine, reinforced tendons", "Athletic street frame with synthetic muscle grafts"],
    eyeColors: ["HUD-projecting cyan cyber-optics", "Neon magenta reticles", "Infrared gold scanning lenses"],
    skinTones: ["Fluorescent alley pale with sub-dermal glowing fiber lines", "Matte synth-skin"],
    origins: ["Neo-Kowloon Lower Grid Sub-Level 4", "The Silicon Undercity", "Sector 9 Data Vaults"],
    factions: ["The Zero-Day Syndicate", "Ghost-Protocol Infiltrators", "Decentralized Net Collective"],
    statModifiers: { minDex: 16, maxDex: 22, minInt: 16, maxInt: 24, minCon: 12, maxCon: 18 }
  },
  {
    raceName: "Solar Seraph Aasimar",
    genre: "High Fantasy",
    style: "High Fantasy",
    namePrefixes: ["Aure", "Seraph", "Cael", "Lumin", "Astra", "Sol", "Vael", "Dawn"],
    nameRoots: ["an", "iel", "or", "ius", "aris"],
    nameSuffixes: ["iel", "ion", "aniel", "ius", "vow", "light", "star"],
    titles: ["the Radiant", "Sword of the Dawn", "Bearer of the Eternal Hearth", "the Unyielding Halo"],
    curatedFirstNames: ["Aurelius", "Seraphiel", "Caelaniel", "Luminor", "Astrian", "Solvow", "Vaeliel"],
    curatedLastNames: ["Dawnseeker", "Sunshield", "Brightblade", "Heavensworn", "Goldhalo", "Morningstar"],
    heightRange: ["6'1\"", "6'8\""],
    weightRange: ["190 lbs", "240 lbs"],
    builds: ["Statuesque divine warrior, faint golden halo pulsing above temples, iridescent feathered wings", "Heroic athletic frame glowing with holy warmth"],
    eyeColors: ["Blinding molten sunlight", "Pure iridescent white", "Golden solar flares"],
    skinTones: ["Warm radiant bronze", "Polished marble with golden shimmer"],
    origins: ["The High Empyrean Citadel", "The First Temple of Morning Light", "Sanctuary of the Solar Gate"],
    factions: ["The Dawn-Watch Paladins", "Angelic Host of the Seraphim", "Order of the Sun-Shield"],
    statModifiers: { minCha: 16, maxCha: 24, minWis: 14, maxWis: 20, minStr: 14, maxStr: 20, minCon: 14, maxCon: 20 }
  }
];

interface ClassDefinition {
  className: string;
  role: string;
  primaryStat: "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";
  secondaryStat: "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";
  statBiases: {
    STR: [number, number];
    DEX: [number, number];
    CON: [number, number];
    INT: [number, number];
    WIS: [number, number];
    CHA: [number, number];
  };
  resourceName: string;
  resourceMax: number;
  abilities: {
    name: string;
    desc: string;
    cooldown: string;
    cost: string;
    type: string;
  }[];
  weaponOptions: string[];
  armorOptions: string[];
  utilityOptions: string[];
  consumableOptions: string[];
  relicOptions: string[];
  loreSeeds: string[];
}

const CLASS_DEFINITIONS: ClassDefinition[] = [
  {
    className: "Gravebound Necromancer",
    role: "Spellcaster / Ossuary Scholar",
    primaryStat: "INT",
    secondaryStat: "WIS",
    statBiases: {
      STR: [6, 11],
      DEX: [10, 15],
      CON: [12, 17],
      INT: [17, 24],
      WIS: [14, 20],
      CHA: [8, 15]
    },
    resourceName: "Soul Slates",
    resourceMax: 8,
    abilities: [
      { name: "Whisper Catalog", desc: "Channels the final memories of nearby fallen ancestors to manifest defensive bone barriers.", cooldown: "At will", cost: "1 Soul Slate", type: "Primary" },
      { name: "Ossuary Resonator", desc: "Causes dead matter to vibrate at harmonic pitch, disorienting living foes and nullifying necrotic damage.", cooldown: "3 rounds", cost: "2 Soul Slates", type: "Active" },
      { name: "Manticore of Karst", desc: "Summons a towering construct of interlocking skulls that shields allies and strikes with spectral frost.", cooldown: "1/day", cost: "5 Soul Slates", type: "Ultimate" }
    ],
    weaponOptions: ["Skull-Carved Chime Staff", "Ritual Bone Athame", "Spectral Tome of Lost Epitaphs", "Silver Grave Needle"],
    armorOptions: ["Shroud of the Catacomb Keeper", "Ossuary Silk Robes", "Warded Finger-Bone Hauberk"],
    utilityOptions: ["Quill of True Names, Embalming Wax, Iron Bell of Repose", "Bone Chisel, Grave Dust Satchel, Warding Chalk"],
    consumableOptions: ["Elixir of Silent Breath, Vial of Grave Oil, 3x Healing Salves", "Flask of Cold Ash Tea, Soul-Binding Incense"],
    relicOptions: ["Shard of the Karst Keystone", "Three Whispering Vertebrae", "Cracked Child-Lich Medallion"],
    loreSeeds: [
      "Raised inside the sunken vaults where the unclaimed dead whispered their true names into the walls.",
      "Bound by an iron vow never to enslave the fallen, only granting them voice to complete their unfinished business.",
      "Hunted by imperial inquisitors who mistake reverent bone-song for dark blasphemy, seeking peace in forgotten ruins."
    ]
  },
  {
    className: "Oath of Dawn Paladin",
    role: "Frontline Holy Tank / Healer",
    primaryStat: "CHA",
    secondaryStat: "STR",
    statBiases: {
      STR: [15, 22],
      DEX: [9, 14],
      CON: [14, 20],
      INT: [8, 14],
      WIS: [12, 18],
      CHA: [16, 24]
    },
    resourceName: "Solar Radiance",
    resourceMax: 6,
    abilities: [
      { name: "Sun-Break Smite", desc: "Infuses weapon with solar fire, searing undead and fiends while granting temporary hit points to companions.", cooldown: "At will", cost: "1 Solar Radiance", type: "Primary" },
      { name: "Aegis of the Morning Star", desc: "Projects a shimmering golden barrier that absorbs all incoming projectile fire for two rounds.", cooldown: "4 rounds", cost: "2 Solar Radiance", type: "Active" },
      { name: "Dawn's Wrath Verdict", desc: "Calls down a column of incandescent celestial fire that incinerates heretics and cleanses all curses within 30 feet.", cooldown: "1/day", cost: "4 Solar Radiance", type: "Ultimate" }
    ],
    weaponOptions: ["Gilded Sun-Blade Claymore", "Dawn-Forged Warhammer", "Solar Halberd of the First Dawn"],
    armorOptions: ["Mirror-Polished Full Plate with Gold Trim", "Empyrean Bastion Shield & Chain", "Aegis Hauberk"],
    utilityOptions: ["Consecrated Holy Water, Prayer Scrolls, Golden Censer", "Whetstone of Radiance, Signet of the Solar Gate"],
    consumableOptions: ["3x Solar Draughts, Flask of Sanctified Wine, Balm of Restitution"],
    relicOptions: ["Splinter of the First Sun-Altar", "Feather of the Solar Seraph", "Embossed Dawn Medallion"],
    loreSeeds: [
      "Swore an inviolable oath at the summit of Mount Solaria during the darkest solar eclipse in three centuries.",
      "Carries the sacred burning ember of their destroyed monastery inside the pommel of their greatsword.",
      "Travels the shattered borderlands defending peasant hamlets against creeping shadow horrors without asking for coin."
    ]
  },
  {
    className: "Shadow Protocol Infiltrator",
    role: "Stealth Rogue / Saboteur",
    primaryStat: "DEX",
    secondaryStat: "INT",
    statBiases: {
      STR: [8, 13],
      DEX: [17, 24],
      CON: [11, 16],
      INT: [14, 20],
      WIS: [12, 17],
      CHA: [10, 16]
    },
    resourceName: "Adrenaline Shards",
    resourceMax: 5,
    abilities: [
      { name: "Ghost Veil Strike", desc: "Vanishes into ambient shadows and strikes the target's vital artery from behind with lethal critical precision.", cooldown: "At will", cost: "1 Shard", type: "Primary" },
      { name: "Monofilament Tripwire", desc: "Lays down microscopic carbon wire that shears limbs and trips charging adversaries instantly.", cooldown: "2 rounds", cost: "1 Shard", type: "Active" },
      { name: "Shadow Overclock", desc: "Accelerates neural reflexes by 400%, dodging all attacks and delivering five rapid-fire strikes in one heartbeat.", cooldown: "1/day", cost: "3 Shards", type: "Ultimate" }
    ],
    weaponOptions: ["Twin Blackened Mithril Daggers", "Silenced Pneumatic Hand-Crossbow", "Monomolecular Shortsword"],
    armorOptions: ["Chameleon Leather Jerkin with Sound-Dampening Pads", "Reinforced Shadow Cloak"],
    utilityOptions: ["Grapple Wire Spool, Masterwork Lockpicks, Smoke Canisters, Infrared Goggles"],
    consumableOptions: ["Venom Vials of Midnight Belladonna, 3x Flash Pellets, Pain-Numbing Elixir"],
    relicOptions: ["Coin of the Faceless Guild", "Glass Eye of the Master Spymaster", "Encrypted Cipher Stone"],
    loreSeeds: [
      "Trained by an autonomous black-ops guild that erased their official identity from every registry across the realm.",
      "Operates purely by contract code, extracting defectors and sabotaging tyrant warlords in total silence.",
      "Has survived twelve assassination attempts by their former syndicate handlers, always striking first from the gloom."
    ]
  },
  {
    className: "Berserker Juggernaut",
    role: "Melee Berserker / Unstoppable Bruiser",
    primaryStat: "STR",
    secondaryStat: "CON",
    statBiases: {
      STR: [18, 24],
      DEX: [11, 16],
      CON: [16, 24],
      INT: [6, 11],
      WIS: [9, 14],
      CHA: [8, 13]
    },
    resourceName: "Rage Fury",
    resourceMax: 10,
    abilities: [
      { name: "Skull-Shattering Cleave", desc: "Swings a massive weapon in a wide arc, pulverizing armor and knocking back up to three foes.", cooldown: "At will", cost: "2 Fury", type: "Primary" },
      { name: "Blood-Frenzy Roar", desc: "Issues a terrifying war cry that breaks all fear and mind-control effects on allies while frightening enemies.", cooldown: "3 rounds", cost: "3 Fury", type: "Active" },
      { name: "Cataclysmic Earth-Slam", desc: "Leaps into the sky and crashes into the earth, opening a fissure of crushed stone that swallows enemy ranks.", cooldown: "1/day", cost: "6 Fury", type: "Ultimate" }
    ],
    weaponOptions: ["Double-Bitted Titan Greataxe", "Colossal Basalt Spiked Maul", "Dual Jagged War-Cleavers"],
    armorOptions: ["Beast-Bone Studded Leather & Iron Pauldron", "Spiked Berserker Harness"],
    utilityOptions: ["Climbing Spikes, Heavy Iron Chain, Hunting Horn, Flint and Tinder"],
    consumableOptions: ["Keg of Fermented Fire-Water, Raw Meat Rations, Bone Salve"],
    relicOptions: ["Tooth of the Great Mammoth King", "War Totem of the Crimson Clan", "Bloody Bearclaw Amulet"],
    loreSeeds: [
      "Fought alone in the Ash Wastes against an entire vanguard battalion until the warlord sued for peace.",
      "Channels the primal fury of extinct apex beasts, refusing to wear full plate armor that would restrict savage movement.",
      "Seeks a battle worthy of song, bound by an ancient debt to protect a young scholar who once saved their life."
    ]
  },
  {
    className: "Spellblade Arcanist",
    role: "Hybrid Arcane Striker / Warder",
    primaryStat: "INT",
    secondaryStat: "DEX",
    statBiases: {
      STR: [10, 15],
      DEX: [15, 21],
      CON: [12, 17],
      INT: [17, 24],
      WIS: [12, 18],
      CHA: [10, 16]
    },
    resourceName: "Arcane Spellsurge",
    resourceMax: 8,
    abilities: [
      { name: "Arcane Edge Spellstrike", desc: "Channels elemental lightning or fire through blade strikes, ignoring physical armor resistances.", cooldown: "At will", cost: "1 Surge", type: "Primary" },
      { name: "Blink Step Riposte", desc: "Teleports five paces behind an attacking foe as their weapon strikes empty air, countering instantly.", cooldown: "2 rounds", cost: "2 Surge", type: "Active" },
      { name: "Blade-Storm Singularity", desc: "Unleashes twelve holographic spectral swords that orbit rapidly in a vortex of cutting arcane force.", cooldown: "1/day", cost: "5 Surge", type: "Ultimate" }
    ],
    weaponOptions: ["Runic Estoc of Star-Silver", "Spell-Forged Scimitar", "Crystal-Edged Rapier"],
    armorOptions: ["Woven Mithril Coat with Rune Inlays", "Arcane Warder Robes"],
    utilityOptions: ["Mana Focusing Prism, Ink of Luminescence, Grimoire Ring, Teleport Rune Chalk"],
    consumableOptions: ["3x Concentrated Mana Draughts, Ether Flask, Potion of Haste"],
    relicOptions: ["Core of a Shattered Arcane Monolith", "Archmage's Silver Signet", "Prismatic Focusing Orb"],
    loreSeeds: [
      "Graduated at the top of the Imperial Mage-Knight Academy before burning their commission to defend rogue hedgemages.",
      "Infused their own rapier with the trapped essence of a falling comet, granting them effortless spatial stepping.",
      "Walks the borderlands between high academic wizardry and gritty street fencing, taking on impossible bounties."
    ]
  },
  {
    className: "Neural Cyber-Hacker",
    role: "Tech Specialist / Drone Commander",
    primaryStat: "INT",
    secondaryStat: "DEX",
    statBiases: {
      STR: [8, 12],
      DEX: [16, 22],
      CON: [11, 16],
      INT: [18, 24],
      WIS: [13, 19],
      CHA: [10, 16]
    },
    resourceName: "RAM Buffers",
    resourceMax: 16,
    abilities: [
      { name: "Overheat ICE Breach", desc: "Hacks target cyberware or neural implants, sending thermal feedback that causes paralysis and system panic.", cooldown: "At will", cost: "2 RAM", type: "Primary" },
      { name: "Combat Drone Deployment", desc: "Deploys a spider-drone with suppressive laser turret that provides covering fire and telemetry tracking.", cooldown: "3 rounds", cost: "4 RAM", type: "Active" },
      { name: "Neural Reboot Malicious Ping", desc: "Broadcasts a catastrophic blackout virus across all enemy communication channels and automated turrets.", cooldown: "1/day", cost: "8 RAM", type: "Ultimate" }
    ],
    weaponOptions: ["Smart-Linked Silenced Machine Pistol", "Monofilament Shock Whip", "Sub-Dermal Wrist Laser"],
    armorOptions: ["Graphene Armored Trenchcoat with Faraday Weave", "Sub-Dermal Kevlar Weave"],
    utilityOptions: ["Military Cyberdeck Mk. VII, Signal Jammer, Data Tap Cables, Biometric Bypass"],
    consumableOptions: ["3x Neuro-Stim Stims, Cooling Gel Canisters, Nano-Repair Injector"],
    relicOptions: ["Black-Box Fragment from Sector 0 Crash", "Uncracked Syndicate Cryptex", "Neural Chip with Sentient AI Fragment"],
    loreSeeds: [
      "Infiltrated Megacorp servers at age fourteen, surviving with a high-grade neural jack that glows with stolen algorithms.",
      "Hosts a rogue fragment of a sentient AI inside their cyberdeck that gives tactical advice in exchange for processing cores.",
      "Wages a lone shadow war against the oligarchs of the Upper Sprawl, redistributing corporate slush funds to slums."
    ]
  },
  {
    className: "Thorn-Weaver Druid",
    role: "Nature Controller / Healer",
    primaryStat: "WIS",
    secondaryStat: "CON",
    statBiases: {
      STR: [9, 14],
      DEX: [12, 17],
      CON: [14, 20],
      INT: [11, 16],
      WIS: [17, 24],
      CHA: [10, 16]
    },
    resourceName: "Sylvan Prana",
    resourceMax: 8,
    abilities: [
      { name: "Verdant Entangle", desc: "Causes ironwood vines and brambles to erupt from stone, rooting hostile units and siphoning life force.", cooldown: "At will", cost: "1 Prana", type: "Primary" },
      { name: "Primal Beast Metamorphosis", desc: "Channels ancient apex beast forms, gaining temporary armor and ripping through armor with savage claws.", cooldown: "3 rounds", cost: "2 Prana", type: "Active" },
      { name: "Wrath of the Ancient Grove", desc: "Summons a torrential storm of razor leaves and lightning that rejuvenates companions and crushes adversaries.", cooldown: "1/day", cost: "5 Prana", type: "Ultimate" }
    ],
    weaponOptions: ["Gnarled Ironwood Staff", "Obsidian Scythe", "Thorn-Woven Sickle"],
    armorOptions: ["Bark-Skin Hide Mantle", "Living Ivy Robes"],
    utilityOptions: ["Bag of Rare Sylvan Seeds, Mist Horn, Carved Wooden Totems"],
    consumableOptions: ["Flask of Dew-Wine, 3x Healing Salves, Bark Ointment"],
    relicOptions: ["Heart-Seed of the World Tree", "Fossilized Amber Scarab", "Antler of the White Stag"],
    loreSeeds: [
      "Attuned to the ancient roots beneath the forest floor, feeling every axe strike against the realm's sacred groves.",
      "Speaks the forgotten sylvan tongue of the first blossoms, mediating disputes between vengeful treants and mortal pilgrims.",
      "Guards the boundary where the mortal world bleeds into the wild dreaming forest of the Fey."
    ]
  },
  {
    className: "Void Astrologer",
    role: "Cosmic Occultist / Reality Bender",
    primaryStat: "INT",
    secondaryStat: "WIS",
    statBiases: {
      STR: [6, 10],
      DEX: [11, 16],
      CON: [11, 16],
      INT: [18, 24],
      WIS: [15, 21],
      CHA: [11, 17]
    },
    resourceName: "Cosmic Alignments",
    resourceMax: 6,
    abilities: [
      { name: "Gravitational Singularity", desc: "Creates a microscopic black hole that pulls nearby enemies toward its event horizon.", cooldown: "At will", cost: "1 Alignment", type: "Primary" },
      { name: "Cosmic Paradox Shield", desc: "Bends spacetime around their body so incoming projectiles are displaced into parallel dimensions.", cooldown: "3 rounds", cost: "2 Alignments", type: "Active" },
      { name: "Supernova Reversal", desc: "Ignites a blinding flare of collapsed starlight that incinerates aberrant horrors and warps reality.", cooldown: "1/day", cost: "4 Alignments", type: "Ultimate" }
    ],
    weaponOptions: ["Star-Metal Astrolabe Wand", "Telescopic Obsidian Focus", "Void-Glass Dagger"],
    armorOptions: ["Constellation-Embroidered Velvet Shroud", "Nebula Silk Vestments"],
    utilityOptions: ["Star Charts, Brass Sextant, Void Sand Hourglass, Quicksilver Vials"],
    consumableOptions: ["Elixir of Astral Clarity, 2x Void Draughts, Quasar Dust"],
    relicOptions: ["Fragment of a Dead Moon", "Meteorite Prism", "Star-Cartographer's Compass"],
    loreSeeds: [
      "Spent seven years in the highest observatory gazing into the black void between galaxies until the silence answered back.",
      "Tracks the movements of dead gods across the night sky, predicting catastrophes with unsettling, perfect precision.",
      "Uses brass armillary spheres to manipulate local probability lines and cheat fatal outcomes."
    ]
  },
  {
    className: "Clockwork Artificer",
    role: "Technomancer / Field Engineer",
    primaryStat: "INT",
    secondaryStat: "DEX",
    statBiases: {
      STR: [10, 15],
      DEX: [14, 20],
      CON: [13, 18],
      INT: [17, 24],
      WIS: [11, 16],
      CHA: [8, 14]
    },
    resourceName: "Steam Pressure",
    resourceMax: 10,
    abilities: [
      { name: "Pneumatic Rivet Barrage", desc: "Fires superheated brass rivets that pin enemy armor to floors and walls with concussive force.", cooldown: "At will", cost: "2 Pressure", type: "Primary" },
      { name: "Automaton Sentry Deployment", desc: "Constructs an autonomous brass turret with rotating barrels that covers tactical choke points.", cooldown: "3 rounds", cost: "3 Pressure", type: "Active" },
      { name: "Overclocked Steam Core Meltdown", desc: "Releases an explosive cloud of scalding aether steam that blinds enemies and propels the artificer safely away.", cooldown: "1/day", cost: "6 Pressure", type: "Ultimate" }
    ],
    weaponOptions: ["Multi-Caliber Pneumatic Rifle", "Steam-Powered War Pick", "Electric Arc Wrench"],
    armorOptions: ["Riveted Copper & Leather Workshop Apron", "Reinforced Brass Pauldrons"],
    utilityOptions: ["Precision Tool Kit, Pressure Gauges, Spring Wire, Oil Canister, Soldering Torch"],
    consumableOptions: ["Vial of Volatile Aether Fuel, 3x Flash Powder Cartridges, Repair Salve"],
    relicOptions: ["Perpetual Motion Spring-Core", "Master Maker's Brass Monocle", "Golden Caliper of Cogsworth"],
    loreSeeds: [
      "Apprenticed to the legendary steam guilds of New Ironport before striking out to build self-sustaining clockwork sanctuaries.",
      "Refuses to accept natural physical limitations, augmenting their mechanical tools with precision pneumatic pistons.",
      "Carries the master schematics for an automated steam titan that could either save or raze the continent."
    ]
  },
  {
    className: "Horizon Ranger",
    role: "Wilderness Tracker / Sniper",
    primaryStat: "DEX",
    secondaryStat: "WIS",
    statBiases: {
      STR: [11, 16],
      DEX: [17, 24],
      CON: [13, 18],
      INT: [10, 15],
      WIS: [15, 21],
      CHA: [8, 13]
    },
    resourceName: "Focus Marks",
    resourceMax: 5,
    abilities: [
      { name: "Heart-Seeker Arrow", desc: "Fires an arrow that traces thermal wind currents, piercing through light cover to strike enemy weak spots.", cooldown: "At will", cost: "1 Focus", type: "Primary" },
      { name: "Camouflage Ambush Veil", desc: "Blends seamlessly into natural terrain, gaining guaranteed critical strikes on the next ranged attack.", cooldown: "2 rounds", cost: "1 Focus", type: "Active" },
      { name: "Hail of the Horizon Tempest", desc: "Rains down a storm of thirty arrows in seconds, creating an impassable lethal perimeter zone.", cooldown: "1/day", cost: "3 Focus", type: "Ultimate" }
    ],
    weaponOptions: ["Yew Composite Recurve Longbow", "Twin Hunting Kukris", "Centaury Scout Crossbow"],
    armorOptions: ["Stalker Leather Coat with Moss Camo", "Reinforced Ranger Jerkin"],
    utilityOptions: ["Trail Snare Wires, Map Case, Climbing Crampons, Wind Gauge, Survival Knife"],
    consumableOptions: ["3x Antidote Vials, Jerky Rations, Quiver of Special Arrowheads (Fire, Frost, Smoke)"],
    relicOptions: ["Eagle-Eye Scope Lens", "Feather of the Roc Vanguard", "Carved Bone Hunting Compass"],
    loreSeeds: [
      "Knows every hidden canyon path and river ford from the Northern Glaciers to the Southern Sand Seas.",
      "Tracks dangerous rogue beasts and monstrous incursions before they ever reach peaceful frontier settlements.",
      "Bound by a solemn oath to never sleep twice under the same roof until the Great Shadow Beast is slain."
    ]
  },
  {
    className: "Samurai Blademaster",
    role: "Precision Duelist / Martial Paragon",
    primaryStat: "DEX",
    secondaryStat: "WIS",
    statBiases: {
      STR: [13, 18],
      DEX: [17, 24],
      CON: [13, 18],
      INT: [10, 15],
      WIS: [14, 20],
      CHA: [11, 17]
    },
    resourceName: "Ki Stance",
    resourceMax: 6,
    abilities: [
      { name: "Iaijutsu Flash Draw", desc: "Draws and sheathes blade in a single blinding motion, cutting down an incoming strike and countering.", cooldown: "At will", cost: "1 Ki", type: "Primary" },
      { name: "Steel-Cutting Meditation", desc: "Enters a state of hyper-zen where physical armor and magical shields offer no resistance to strikes.", cooldown: "3 rounds", cost: "2 Ki", type: "Active" },
      { name: "Ten-Thousand Petal Slash", desc: "Dashes forward through enemy ranks in a flash of cherry blossoms, leaving all adversaries severed.", cooldown: "1/day", cost: "4 Ki", type: "Ultimate" }
    ],
    weaponOptions: ["Folded Tamahagane Katana", "Black-Lacquer Wakizashi", "Nodachi Greatsword"],
    armorOptions: ["Lacquered Iron Lamellar Armor with Silk Cord", "Ronin Traveling Robes"],
    utilityOptions: ["Whetstone of River-Jade, Calligraphy Brush, Ink Stone, Tea Ceremonial Set"],
    consumableOptions: ["Flask of Rice Wine, 3x Lotus Salves, Restorative Ginger Tonic"],
    relicOptions: ["Ancestral Clan Tsuba (Handguard)", "Broken Blade of the Master", "Scroll of the Five Rings"],
    loreSeeds: [
      "Wanders the road of the sword after their lord was dishonorably slain, seeking justice with razor precision.",
      "Follows an unbending bushido code that places honor and defense of the defenseless above personal survival.",
      "Can hear the heartbeat of an adversary through the whisper of steel slicing the evening breeze."
    ]
  }
];

function clampStat(val: number, minMod?: number, maxMod?: number): number {
  let res = val;
  if (minMod !== undefined) res = Math.max(minMod, res);
  if (maxMod !== undefined) res = Math.min(maxMod, res);
  return Math.max(1, Math.min(24, res));
}

function buildName(raceDef: RaceDefinition): string {
  const useCurated = getCryptoRandomInt(0, 100) < 55;
  if (useCurated && raceDef.curatedFirstNames.length > 0 && raceDef.curatedLastNames.length > 0) {
    return `${pickCryptoRandom(raceDef.curatedFirstNames)} ${pickCryptoRandom(raceDef.curatedLastNames)}`;
  }
  return `${pickCryptoRandom(raceDef.namePrefixes)}${pickCryptoRandom(raceDef.nameRoots)}${pickCryptoRandom(raceDef.nameSuffixes)} ${pickCryptoRandom(raceDef.titles)}`;
}

export function generateFedorovInstantCharacter(
  existingPresets: SheetPreset[] = []
): GeneratedFedorovCharacter {
  const last5 = getRecentHistory().slice(0, COLLISION_WINDOW);
  const reservedNames = new Set(
    existingPresets
      .map((p) => p.charName.trim().toLowerCase())
      .filter(Boolean)
  );

  let raceDef = RACE_DEFINITIONS[0];
  let classDef = CLASS_DEFINITIONS[0];
  let generatedName = "";

  let attempts = 0;
  while (attempts < 60) {
    attempts += 1;
    raceDef = pickCryptoRandom(RACE_DEFINITIONS);
    classDef = pickCryptoRandom(CLASS_DEFINITIONS);
    generatedName = buildName(raceDef);

    const collision = last5.some(
      (h) =>
        h.name.toLowerCase() === generatedName.toLowerCase() ||
        h.race.toLowerCase() === raceDef.raceName.toLowerCase() ||
        h.charClass.toLowerCase() === classDef.className.toLowerCase()
    ) || reservedNames.has(generatedName.toLowerCase());

    if (!collision || attempts >= 50) {
      break;
    }
  }

  recordGeneration({
    name: generatedName,
    race: raceDef.raceName,
    charClass: classDef.className
  });

  const rawStr = getCryptoRandomInt(classDef.statBiases.STR[0], classDef.statBiases.STR[1]);
  const rawDex = getCryptoRandomInt(classDef.statBiases.DEX[0], classDef.statBiases.DEX[1]);
  const rawCon = getCryptoRandomInt(classDef.statBiases.CON[0], classDef.statBiases.CON[1]);
  const rawInt = getCryptoRandomInt(classDef.statBiases.INT[0], classDef.statBiases.INT[1]);
  const rawWis = getCryptoRandomInt(classDef.statBiases.WIS[0], classDef.statBiases.WIS[1]);
  const rawCha = getCryptoRandomInt(classDef.statBiases.CHA[0], classDef.statBiases.CHA[1]);

  const finalStr = clampStat(rawStr, raceDef.statModifiers.minStr, raceDef.statModifiers.maxStr);
  const finalDex = clampStat(rawDex, raceDef.statModifiers.minDex, raceDef.statModifiers.maxDex);
  const finalCon = clampStat(rawCon, raceDef.statModifiers.minCon, raceDef.statModifiers.maxCon);
  const finalInt = clampStat(rawInt, raceDef.statModifiers.minInt, raceDef.statModifiers.maxInt);
  const finalWis = clampStat(rawWis, raceDef.statModifiers.minWis, raceDef.statModifiers.maxWis);
  const finalCha = clampStat(rawCha, raceDef.statModifiers.minCha, raceDef.statModifiers.maxCha);

  const primaryWeapon = pickCryptoRandom(classDef.weaponOptions);
  const armor = pickCryptoRandom(classDef.armorOptions);
  const utility = pickCryptoRandom(classDef.utilityOptions);
  const consumable = pickCryptoRandom(classDef.consumableOptions);
  const relic = pickCryptoRandom(classDef.relicOptions);
  const inventoryCombined = `${primaryWeapon}, ${armor}, ${utility}, ${consumable}, ${relic}`;

  const generatedLevel = getCryptoRandomInt(3, 18);
  const hpBase = 20 + (finalCon * 3) + (generatedLevel * 4);
  const acBase = 10 + Math.floor((finalDex - 10) / 2) + (finalCon > 15 ? 3 : 2);
  const dexMod = Math.floor((finalDex - 10) / 2);
  const initiative = dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;

  const loreSeed = pickCryptoRandom(classDef.loreSeeds);
  const origin = pickCryptoRandom(raceDef.origins);
  const faction = pickCryptoRandom(raceDef.factions);
  const build = pickCryptoRandom(raceDef.builds);
  const eyeColor = pickCryptoRandom(raceDef.eyeColors);
  const skinTone = pickCryptoRandom(raceDef.skinTones);
  const height = pickCryptoRandom(raceDef.heightRange);
  const weight = pickCryptoRandom(raceDef.weightRange);

  const fullLore = `${generatedName} is a ${raceDef.raceName} ${classDef.className} hailing from ${origin}. ${loreSeed} Sworn to ${faction}, their legend continues to echo across the realm.`;

  return {
    characterName: generatedName,
    characterRace: raceDef.raceName,
    characterClass: classDef.className,
    characterLevel: String(generatedLevel),
    characterLore: fullLore,
    inventoryItems: inventoryCombined,
    sheetStyle: raceDef.style,
    stats: [
      { key: "STR", label: "Strength", value: finalStr, desc: `${finalStr >= 16 ? "Formidable muscle and power" : "Standard strength"}` },
      { key: "DEX", label: "Dexterity", value: finalDex, desc: `${finalDex >= 16 ? "Cat-like reflexes and balance" : "Balanced agility"}` },
      { key: "CON", label: "Constitution", value: finalCon, desc: `${finalCon >= 16 ? "Indomitable stamina and fortitude" : "Hardy physical health"}` },
      { key: "INT", label: "Intelligence", value: finalInt, desc: `${finalInt >= 16 ? "Razor-sharp arcane and tactical acuity" : "Practical intellect"}` },
      { key: "WIS", label: "Wisdom", value: finalWis, desc: `${finalWis >= 16 ? "Deep instinct, perception and insight" : "Sound awareness"}` },
      { key: "CHA", label: "Charisma", value: finalCha, desc: `${finalCha >= 16 ? "Commanding presence and magnetic resonance" : "Approachable composure"}` }
    ],
    overview: {
      race: raceDef.raceName,
      age: `${getCryptoRandomInt(22, 180)} winters`,
      gender: pickCryptoRandom(["Non-binary (they/them)", "Female (she/her)", "Male (he/him)", "Androgynous Divine (they/it)"]),
      alignment: pickCryptoRandom(["Lawful Neutral", "Chaotic Good", "True Neutral", "Neutral Good", "Chaotic Neutral"]),
      classRole: `${classDef.className} Tier ${generatedLevel}`,
      level: `Level ${generatedLevel}`,
      origin,
      faction
    },
    physical: {
      height,
      weight,
      build,
      eyes: eyeColor,
      hair: pickCryptoRandom(["Raven black with silver streaks", "Wild woven platinum", "Braided copper cords", "Shaved with runic brands", "Floating shadow tendrils"]),
      skin: skinTone,
      marks: pickCryptoRandom(["Runic constellation brands along forearms", "Tribal war tattoos", "Faint sub-dermal glowing circuits", "Ritual scars of passage"]),
      scars: pickCryptoRandom(["Trophy claw scar across jawline", "Clean rapier puncture mark near heart", "Lightning arc mark from magical duel"]),
      clothing: `${raceDef.style} tailored attire adorned with ${faction} insignia`,
      voice: pickCryptoRandom(["Resonant, calm baritone with quiet authority", "Melodic, star-clear timbre", "Gravelly, battle-tested whisper", "Sharp, electric cadence"]),
      posture: pickCryptoRandom(["Poised with predatory grace", "Upright, unyielding martial stance", "Relaxed street-smart slouch, ready to draw"])
    },
    lore: {
      backstory: fullLore,
      childhood: `Raised among the sanctuaries of ${origin}, taught that discipline and survival are two sides of the same coin.`,
      formative: `Awakened to their true calling during the Siege of ${origin.split(" ")[1] || "the Citadel"}, defending innocents single-handedly.`,
      motivations: `To uphold the honor of ${faction} and uncover the truth behind the cosmic convergence.`,
      secrets: `Carries an uncracked cipher key that could destabilize the three ruling dynasties.`,
      world: `The high realm of ${raceDef.genre}`
    },
    abilities: classDef.abilities,
    weaknesses: `Vulnerable to prolonged sensory isolation and bound by the sworn sacred code of ${faction}.`,
    skills: [
      { name: "Combat Proficiency", value: Math.min(99, 50 + finalStr + generatedLevel * 2) },
      { name: "Acrobatics & Evasion", value: Math.min(99, 45 + finalDex + generatedLevel * 2) },
      { name: "Arcana & Lore Analysis", value: Math.min(99, 40 + finalInt + generatedLevel * 2) },
      { name: "Perception & Insight", value: Math.min(99, 45 + finalWis + generatedLevel * 2) },
      { name: "Presence & Willpower", value: Math.min(99, 40 + finalCha + generatedLevel * 2) }
    ],
    magic: `${raceDef.style} harmonic resonance`,
    equipment: {
      primaryWeapon,
      secondaryFocus: pickCryptoRandom(["Engraved Focus Charm", "Buckler Shield", "Tether Wire", "Warding Bell"]),
      armor,
      utilityTools: utility,
      consumables: consumable,
      relics: relic,
      currency: `${getCryptoRandomInt(45, 650)} Imperial Gold Crowns`,
      weapons: primaryWeapon,
      items: inventoryCombined
    },
    signatureAttributes: {
      reputation: `${generatedName} — Champion of ${faction}`,
      vice: pickCryptoRandom(["Compulsive risk-taker when friends are threatened", "Pride in martial mastery", "Addicted to uncovering forbidden archives"]),
      virtue: pickCryptoRandom(["Refuses to strike an unarmed foe", "Unshakeable loyalty to companions", "Mercy to the defenseless"]),
      fear: pickCryptoRandom(["The silent void of oblivion", "Betrayal by sworn mentors", "Failing those under their protection"]),
      obsession: pickCryptoRandom(["Perfecting the ultimate blade form", "Collecting lost ancient artifacts", "Cataloging fallen hero epitaphs"]),
      tell: pickCryptoRandom(["Tapping fingers rhythmically on scabbard", "Checking perimeter shadows twice", "Adjusting collarbone ward charm"]),
      loyalty: faction,
      blindSpot: pickCryptoRandom(["Overestimates the honor of treacherous adversaries", "Reluctant to ask for healing"]),
      survivalInstinct: pickCryptoRandom(["Feigning retreat into prepared ambush points", "Ducking into blind spots"]),
      legacyFear: "Being erased from the histories without having protected their people"
    },
    derivedStats: {
      hpCurrent: hpBase,
      hpMax: hpBase,
      ac: acBase,
      initiative,
      speed: "30 ft",
      level: generatedLevel,
      resourceName: classDef.resourceName,
      resourceCurrent: classDef.resourceMax,
      resourceMax: classDef.resourceMax,
      passives: [
        `${classDef.className} Core Focus`,
        `${raceDef.raceName} Innate Heritage`,
        "Combat Mastery"
      ]
    },
    personality: {
      traits: pickCryptoRandom([
        "Calm under fire, razor-sharp focus, speaks with quiet conviction.",
        "Witty, observant, moves with graceful economy of motion.",
        "Stoic, patient, fiercely loyal to their sworn band."
      ]),
      ideals: "Protection of the defenseless and relentless pursuit of mastery.",
      flaws: "Hesitant to trust new authority figures; carries burdens in silence.",
      fears: "A realm consumed by creeping dark with no heroes left to stand.",
      mannerisms: "Subtly tests the weight of weapons when entering a room.",
      speech: "Concise, articulate, rich in metaphors of the wilderness and sky."
    },
    relationships: {
      allies: `${faction}, Veteran Vanguard Companions, The Circle of Keepers`,
      enemies: "The Shadow Syndicate, Corrupt Inquisitors, Abyssal Warmongers",
      mentors: "The Grand Master of the Spire, Elder Runesmith",
      family: "Clan elders who forged their first blade upon their naming day"
    }
  };
}
