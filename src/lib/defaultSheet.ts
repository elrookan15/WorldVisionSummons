import { DossierSheet } from "../types/dossier";

export const DEFAULT_GELBINOR: DossierSheet = {
  name: "Gelbinor",
  title: "The Shy Grave • Reluctant Necromancer / Ossuary Librarian",
  player: "Keeper of Quiet",
  sheet_style: "Gothic Dark Fantasy",
  overview: {
    race: "Human Hollowed",
    age: "28 winters",
    gender: "Male (he/him, avoids eye contact)",
    alignment: "True Neutral — shy, not cruel",
    classRole: "Necromancer 16 — School of Quiet",
    level: "16 — Keeper of Unclaimed Dead",
    origin: "Charnel Library of Karst — city over mass grave",
    faction: "Keeper of Unclaimed Dead — Ossuary Librarian"
  },
  physical: {
    height: '6\'1" (hunches to 5\'9")',
    weight: "130 lbs, lanky, translucent",
    build: "Lanky, pale translucent, greyish-blue veins visible, cold to touch. Bone charms sewn at collarbone.",
    eyes: "Milky white with pinprick pupils, avoids eye contact, stares at floor.",
    hair: "Long stringy black, covers face like curtain, never cut.",
    skin: "Pale translucent, greyish, blue veins like river map.",
    marks: "Bone charms sewn at collarbone — finger bones, teeth, tiny warding sigils.",
    scars: "Self-stitched warding sigils around collarbone and throat.",
    clothing: "Tattered oversized funeral shroud robe, patches warding sigils.",
    voice: "Mumbles, apologizes to corpses, doors, chairs.",
    posture: "Hunches to be smaller, fidgets hem, hides behind Mister Cracks."
  },
  lore: {
    backstory: "Born in Karst — a city built over a mass grave that never stopped whispering. The ground is paper-thin veil. Other kids heard wind; Gelbinor heard names. Raised by the Charnel Librarians who catalog the unclaimed dead.",
    childhood: "Raised among shelves of unclaimed dead. Taught to write names so no one is forgotten.",
    formative: "Age 12 — Warlord burned the Charnel Library. Gelbinor went silent for 3 days and whispered apologies, causing the army to peacefully walk away.",
    motivations: "Wants a quiet corner, cold tea that never goes cold, and to finish cataloging the 10,000 nameless.",
    secrets: "Mister Cracks is a child lich who stayed as a book. Deranged form: hair floats, eyes twin moons, too-wide smile.",
    world: "Karst — city built over mass grave, streets whisper at dusk. Charnel Library vaulted ossuary."
  },
  abilities: [
    { name: "Shy Ward", desc: "Undead refuse to harm him unless directly controlled. Skeletons step aside, zombies bow heads.", cooldown: "Passive", cost: "Being small", type: "Passive" },
    { name: "Whisper Catalog", desc: "Holds a bone, hears its final memory and gives them a name.", cooldown: "At will", cost: "1 min + apology", type: "Primary" },
    { name: "Mister Cracks Grimoire", desc: "Cracked skull grimoire containing 10,000 names. Casts necromancy up to 6th level when asked nicely.", cooldown: "Ask nicely", cost: "Politeness", type: "Primary" }
  ],
  weaknesses: "Loud noises cause anxiety disadvantage, crowds cause stammer. Sunlight migraines. Iron Sanctum bells stun for 1 round.",
  skills: [
    { name: "Ossuary Catalog / True Names", value: 98 },
    { name: "Listening to Final Memories", value: 94 },
    { name: "Apologetic Diplomacy", value: 89 },
    { name: "Being Small / Unnoticed", value: 87 },
    { name: "Containing The Quiet", value: 68 }
  ],
  magic: "School of Quiet — necromancy by asking, not commanding. Veil is paper-thin where he stands.",
  equipment: {
    primaryWeapon: "Mister Cracks — cracked skull grimoire, child lich who stayed as book",
    secondaryFocus: "Bone-carved chime of quiet warding",
    armor: "Bone tassel robe — tattered oversized funeral shroud",
    utilityTools: "Cataloging quill, jar of grave-binding wax, iron shears, bone needle",
    consumables: "Satchel of grave dirt, cold tea thermos, 12 pre-written apology notes",
    relics: "Three duckling skulls, shard of Karst foundation stone, finger-bone rosary",
    currency: "No coin — trades in burials and names",
    weapons: "Mister Cracks — cracked skull grimoire",
    items: "Satchel of grave dirt, cold tea thermos"
  },
  signatureAttributes: {
    reputation: "The Shy Grave — whispered legend of the Karst ossuary",
    vice: "Compulsive, paralyzing apologies to the dead",
    virtue: "Refuses to raise corpses as thralls; remembers the forgotten",
    fear: "That Mister Cracks will finally close and leave him alone",
    obsession: "Cataloging every soul among the 10,000 nameless dead",
    tell: "Counting finger-bone tassels sewn along his collar",
    loyalty: "The Charnel Librarians and the peaceful dead",
    blindSpot: "Cannot perceive living hostility until struck physically",
    survivalInstinct: "Playing dead and fading into background dust",
    legacyFear: "Being erased from the library records without a true name"
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
    passives: [
      "School of Quiet: Undead refuse to initiate attacks",
      "Ossuary Recall: Touch bones to witness final memories",
      "Apologetic Aura: Hostile humanoids pause before striking"
    ]
  },
  personality: {
    traits: "Shy, stammers, fidgets hem, hides behind Mister Cracks, apologizes to doors and chairs.",
    ideals: "Everyone deserves a name. Remembering is kinder than raising.",
    flaws: "Would rather die than be rude — cannot say no, easily exploited.",
    fears: "That he is actually a monster. That Mister Cracks will finally leave.",
    mannerisms: "Pulls sleeves over hands, hides face with hair, counts bone tassels when nervous.",
    speech: "Mumbles, stammers 'S-sorry— may I—?', long pauses, asks permission from corpses."
  },
  relationships: {
    allies: "Mister Cracks, 3 Floating Skulls, Children's Wing skulls, Archivist Mirren.",
    enemies: "Warlord who burned library, Sanctum of Iron Bell.",
    mentors: "Charnel Librarians, The Dead Themselves, Mister Cracks.",
    family: "Found as baby on shelf 0. Considers all unclaimed dead family."
  },
  stats: [
    { key: "STR", label: "Strength", value: 8, desc: "130lbs, lanky, can't lift heavy coffins" },
    { key: "DEX", label: "Dexterity", value: 12, desc: "Precise with bone beads, clumsy when stared at" },
    { key: "CON", label: "Constitution", value: 14, desc: "Cold tea and grave dust diet" },
    { key: "INT", label: "Intelligence", value: 22, desc: "Knows 7,341 names and last memories" },
    { key: "WIS", label: "Wisdom", value: 19, desc: "Listens to dead, hears unfinished business" },
    { key: "CHA", label: "Charisma", value: 7, desc: "Shy 7, Deranged 18" }
  ]
};

export function cloneSheet(sheet: DossierSheet): DossierSheet {
  return JSON.parse(JSON.stringify(sheet)) as DossierSheet;
}
