import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, Sword, Sparkles, Compass, Scroll, User, Skull, BookOpen, 
  Download, RefreshCw, Sliders, Zap, Copy, Check, 
  Bookmark, Eye, Terminal, Flame, Award, Heart, ShieldAlert,
  BookMarked, Beaker, ChartColumn, Cog, Crown, EyeOff, Feather,
  Moon, Truck, Users, FileSpreadsheet, LogIn, LogOut,
  Star, Dices
} from "lucide-react";
import { CharacterSheetData, SheetPreset } from "./types";
import StatsRadarComparison from "./components/StatsRadarComparison";
import CharacterCodex from "./components/CharacterCodex";
import { CodexFinalizer } from "./features/codex";
import DiceTray from "./components/DiceTray";
import { StatBaseline } from "./lib/statBaselines";
import ImageEditorModal from "./components/ImageEditorModal";
import GeminiChatModal from "./components/GeminiChatModal";
import { nanoBananaProvider } from "./lib/providers/NanoBananaProvider";
import { googleSignIn, initAuth, logout } from "./lib/workspaceAuth";
import { exportCharacterToGoogleSheet, importCharacterFromGoogleSheet } from "./lib/sheetsService";
import { compilePortraitPrompt } from "./lib/prompts/generators";
import { CANONICAL_SHEET_STYLES, canonicalizeSheetStyle, themeIdForStyle } from "./lib/themeMap";
import { sheetPageBackgroundCssVars } from "./lib/sheetPageBackgrounds";
import { clampResource, mapGeneratedSheetToUi, mergeImportedSheet, portraitPromptContext, UiSheetData } from "./lib/sheetMapper";
import { buildProceduralPortrait } from "./lib/portraitFallback";
import {
  CodexEntry,
  deleteCodexEntry,
  duplicateCodexEntry,
  loadCodex,
  upsertCodexEntry
} from "./lib/characterCodex";

const THEMES = [
  // clash = complementary opposite of the genre's core accent (sparks, not recolor)
  {id:"gothicDarkFantasy", alias:"obsidianCult", name:"Gothic Dark Fantasy", short:"GTH", icon:Flame, desc:"Cold moonlight, charcoal & blood runes — clash: electric teal", texture:"obsidian", chrome:"arch", radius:"4px",
    tokens:{bg:"#070708",bg2:"#121212",card:"#111010",card2:"#1a1414",border:"#2a1a1a",borderStrong:"#8b0000",text:"#d8c9c9",muted:"#8a6a6a",muted2:"#5a4040",accent:"#8b0000",accent2:"#ff1a1a",accentText:"#f5d0d0",clash:"#00e8a8",clashText:"#041510",shadow:"rgba(0,0,0,0.9)"},
    fonts:{display:"'Cinzel Decorative', serif",body:"'Cinzel', serif",mono:"'Cinzel', serif"}},
  {id:"cyberpunk", alias:"neonRonin", name:"Cyberpunk", short:"CYB", icon:Zap, desc:"Neon grid, chrome & rain-slicked streets — clash: toxic chartreuse", texture:"neon", chrome:"hud", radius:"0px",
    tokens:{bg:"#0c0a14",bg2:"#171222",card:"#1a1426",card2:"#221a32",border:"#3a2d4f",borderStrong:"#ff2a8a",text:"#e9ddff",muted:"#9d8ab8",muted2:"#6b5a85",accent:"#ff2a8a",accent2:"#00f0ff",accentText:"#0c0a14",clash:"#d4ff00",clashText:"#101400",shadow:"rgba(255,42,138,0.22)"},
    fonts:{display:"'Orbitron', sans-serif",body:"'IBM Plex Mono', monospace",mono:"'Orbitron', monospace"}},
  {id:"steampunkTinkerer", alias:"steampunk", name:"Steampunk", short:"STM", icon:Cog, desc:"Brass gears, gaslight & riveted copper — clash: turquoise", texture:"steampunk", chrome:"rivet", radius:"10px",
    tokens:{bg:"#e8ddd0",bg2:"#d9cbb8",card:"#f5efe6",card2:"#efe6d6",border:"#c9b8a0",borderStrong:"#b87333",text:"#2e2118",muted:"#7a6654",muted2:"#a89886",accent:"#b87333",accent2:"#8a5a2b",accentText:"#fdf6ec",clash:"#14b8a6",clashText:"#04201c",shadow:"rgba(46,33,24,0.15)"},
    fonts:{display:"'Philosopher', serif",body:"'Newsreader', serif",mono:"'Special Elite', monospace"}},
  {id:"retro8Bit", alias:"8bitRetro", name:"8-Bit Retro RPG", short:"8BT", icon:Terminal, desc:"16-color dungeon chamber, arcade pixel glow — clash: hot magenta", texture:"retro", chrome:"pixel", radius:"0px",
    tokens:{bg:"#0d1117",bg2:"#161b22",card:"#1b222d",card2:"#212836",border:"#30363d",borderStrong:"#2ea043",text:"#e6edf3",muted:"#8b949e",muted2:"#6e7681",accent:"#2ea043",accent2:"#f0883e",accentText:"#0d1117",clash:"#ff2bd6",clashText:"#1a0014",shadow:"rgba(46,160,67,0.2)"},
    fonts:{display:"'JetBrains Mono', monospace",body:"'JetBrains Mono', monospace",mono:"'JetBrains Mono', monospace"}},
  {id:"highFantasy", alias:"arcaneCodex", name:"High Fantasy", short:"HFA", icon:Crown, desc:"Gilded mythril, celestial radiance & grimoires — clash: royal indigo", texture:"arcane", chrome:"filigree", radius:"22px",
    tokens:{bg:"#0d0c0b",bg2:"#1a1620",card:"#151412",card2:"#1e1b2e",border:"#2a2438",borderStrong:"#d9c5a0",text:"#e8e1d3",muted:"#8a847a",muted2:"#5a5752",accent:"#d9c5a0",accent2:"#bfa67a",accentText:"#0d0c0b",clash:"#6366f1",clashText:"#f5f3ff",shadow:"rgba(0,0,0,0.5)"},
    fonts:{display:"'Fraunces', serif",body:"'Newsreader', serif",mono:"'IBM Plex Mono', monospace"}},
  {id:"cosmicHorror", alias:"cosmic", name:"Cosmic Horror", short:"CSM", icon:Eye, desc:"Non-Euclidean basalt, abyssal void & viridian — clash: molten amber", texture:"cosmic", chrome:"rift", radius:"28px",
    tokens:{bg:"#06080d",bg2:"#0d121c",card:"#0f1724",card2:"#141f32",border:"#1c2d44",borderStrong:"#38bdf8",text:"#cbd5e1",muted:"#64748b",muted2:"#475569",accent:"#38bdf8",accent2:"#a855f7",accentText:"#06080d",clash:"#fb923c",clashText:"#1a0a00",shadow:"rgba(56,189,248,0.2)"},
    fonts:{display:"'Fraunces', serif",body:"'Newsreader', serif",mono:"'IBM Plex Mono', monospace"}},
  {id:"samuraiEra", alias:"samurai", name:"Samurai Era", short:"SAM", icon:Sword, desc:"Sumi-e ink, bamboo mist & tamahagane steel — clash: jade teal", texture:"samurai", chrome:"scroll", radius:"2px",
    tokens:{bg:"#121010",bg2:"#1c1717",card:"#221d1d",card2:"#2c2424",border:"#423636",borderStrong:"#dc2626",text:"#f3ecec",muted:"#a89a9a",muted2:"#756767",accent:"#dc2626",accent2:"#eab308",accentText:"#ffffff",clash:"#2dd4bf",clashText:"#04201c",shadow:"rgba(220,38,38,0.2)"},
    fonts:{display:"'Philosopher', serif",body:"'Newsreader', serif",mono:"'IBM Plex Mono', monospace"}},
  {id:"postApocalyptic", alias:"wastelandScavenger", name:"Post-Apocalyptic", short:"PST", icon:Truck, desc:"Treasure-map parchment, rust & hazard stencils — clash: lime green", texture:"wasteland", chrome:"stencil", radius:"0px",
    tokens:{bg:"#d8c9a7",bg2:"#c9b896",card:"#e8dcc0",card2:"#e0d0a8",border:"#b89a6a",borderStrong:"#b8451b",text:"#2b1f14",muted:"#6b5a42",muted2:"#8a7a64",accent:"#b8451b",accent2:"#ff6b2a",accentText:"#fff0d6",clash:"#a3e635",clashText:"#142000",shadow:"rgba(43,31,20,0.18)"},
    fonts:{display:"'Anton', sans-serif",body:"'Special Elite', cursive",mono:"'Special Elite', monospace"}},
  {id:"eldritchArcane", alias:"eldritch", name:"Eldritch Arcane", short:"ELD", icon:BookOpen, desc:"Amethyst voids, floating runic shards & astral mist — clash: chartreuse", texture:"eldritch", chrome:"crystal", radius:"26px",
    tokens:{bg:"#0b0813",bg2:"#151024",card:"#1b152e",card2:"#241c3d",border:"#3b2d61",borderStrong:"#c084fc",text:"#f3e8ff",muted:"#a855f7",muted2:"#7e22ce",accent:"#c084fc",accent2:"#38bdf8",accentText:"#0b0813",clash:"#84cc16",clashText:"#142000",shadow:"rgba(192,132,252,0.25)"},
    fonts:{display:"'Cinzel Decorative', serif",body:"'Cinzel', serif",mono:"'IBM Plex Mono', monospace"}},
  {id:"victorianGothic", alias:"victorian", name:"Victorian Gothic", short:"VIC", icon:Feather, desc:"Cobblestone alleys, gaslamps & mourning lace — clash: rose vermillion", texture:"victorian", chrome:"gazette", radius:"0px",
    tokens:{bg:"#0e1013",bg2:"#171a1f",card:"#1d2127",card2:"#252a32",border:"#333945",borderStrong:"#cbd5e1",text:"#e2e8f0",muted:"#94a3b8",muted2:"#64748b",accent:"#cbd5e1",accent2:"#f59e0b",accentText:"#0e1013",clash:"#f43f5e",clashText:"#ffffff",shadow:"rgba(0,0,0,0.7)"},
    fonts:{display:"'Newsreader', serif",body:"'Newsreader', serif",mono:"'Special Elite', monospace"}}
];

const NAV_TABS = [
  {id:"overview", label:"Overview", icon:User},
  {id:"physical", label:"Physical", icon:Heart},
  {id:"lore", label:"Lore", icon:Feather},
  {id:"abilities", label:"Abilities", icon:Skull},
  {id:"equipment", label:"Gear", icon:Sword},
  {id:"personality", label:"Psyche", icon:Users},
  {id:"relationships", label:"Bonds", icon:Bookmark},
  {id:"stats", label:"Stats", icon:ChartColumn}
];

const PRESETS: SheetPreset[] = [
  {
    name: "Gelbinor — The Shy Grave",
    style: "Gothic Dark Fantasy",
    category: "Dark & Necrotic",
    charName: "Gelbinor",
    charClass: "Reluctant Necromancer / Ossuary Librarian",
    lore: "Born in Karst, a city built over a mass grave that never stopped whispering. Raised by Charnel Librarians who catalog unclaimed dead. Profoundly shy—corpses don't judge, so he prefers them.",
    items: "Mister Cracks Grimoire,Bone Tassel Shroud,Cold Tea Thermos,Grave Dirt Satchel,3 Duckling Skulls"
  },
  {
    name: "Vaelin the Gravebound",
    style: "High Fantasy",
    category: "Combat & Martial",
    charName: "Vaelin Ashborn",
    charClass: "Gravebound Knight",
    lore: "Excommunicated from the Cathedral of Thorns after refusing to slaughter innocents in the Bleeding March, Vaelin wanders the ash-choked valleys as an oath-bound warden.",
    items: "Sanctified Bastard Sword,Iron Heater Shield,Vial of consecrated ash,Worn rosary beads"
  },
  {
    name: "Kaelen Vex - Netrunner",
    style: "Cyberpunk",
    category: "Tech & Cyber",
    charName: "Kaelen 'Zero-Day' Vex",
    charClass: "Cybernetic Netrunner Assassin",
    lore: "Once a corporate data-savant for Arasaka-Nexus, Kaelen's neural architecture was fried during a rogue AI containment breach in Neo-Shinjuku.",
    items: "Monomolecular Katana,Smart-Link Heavy Pistol,Neural Deck Mk.IV,Stim-Injectors"
  },
  {
    name: "Lyra Vane — Void Alchemist",
    style: "Cosmic Horror",
    category: "Arcane & Cosmic",
    charName: "Lyra Vane",
    charClass: "Void Alchemist",
    lore: "Studying the celestial tides at the observatory of Carcosa, Lyra brewed a draught from fallen meteorite glass that permanently unlocked her peripheral vision to things that crawl between stars.",
    items: "Stellar Astrolabe,Vial of Star-Ichors,Obsidian Mortar,Telescopic Lenses"
  },
  {
    name: "Kenshiro — Rust-Blade Ronin",
    style: "Samurai Era",
    category: "Combat & Martial",
    charName: "Kenshiro",
    charClass: "Wasteland Ronin",
    lore: "A masterless warrior wandering the scorched plains of the Shattered Empire, carrying a blade forged from ancient rail tracks and bound by an unyielding bushido of survival.",
    items: "Rail-Steel Katana,Tattered Haori,Whetstone of Iron,Dried Plum Flask"
  },
  {
    name: "Orlaith — Ironclad Artificer",
    style: "Steampunk Tinkerer",
    category: "Science & Lab",
    charName: "Orlaith",
    charClass: "Master Artificer",
    lore: "Chief engineer of the Albion Steamworks, Orlaith replaced her own right arm with a steam-driven piston gauntlet after an industrial blast in Sector 4.",
    items: "Piston Gauntlet,Brass Wrench,Blueprint Codex,Aether-Torch"
  },
  {
    name: "Balthazar Crown — Clockwork Magistrate",
    style: "Steampunk Tinkerer",
    category: "Science & Lab",
    charName: "Balthazar Crown",
    charClass: "Clockwork Magistrate",
    lore: "Enforcing the Great Meridian Accord with absolute algorithmic precision, Balthazar's mechanical monocle calculates ballistic trajectories and heartbeat fluctuations in real-time.",
    items: "Clockwork Monocle,Aether-Pistol,Legal Codex,Pocket Chronometer"
  },
  {
    name: "Nyx Talon — Neon Courier",
    style: "Cyberpunk",
    category: "Tech & Cyber",
    charName: "Nyx Talon",
    charClass: "Underground Courier",
    lore: "The fastest data-runner in the Sprawl, Nyx plugs directly into fiber-optic grids and jumps rooftop to rooftop across Neo-London while corporate drones hunt her encrypted cargo.",
    items: "Fiber-Optic Jack,EMP Grenades,Anti-Gravity Boots,Encrypted Data-Drive"
  },
  {
    name: "Aethelgard — Sunken Paladin",
    style: "High Fantasy",
    category: "Combat & Martial",
    charName: "Aethelgard",
    charClass: "Sunken Paladin",
    lore: "Sworn to protect the submerged ruins of Atlantis Minor, Aethelgard breathes the dark ocean abysses and wields a coral-encrusted greatsword blessed by forgotten tides.",
    items: "Coral Greatsword,Abyssal Plate Armor,Pearl of Water Breathing,Tide-Chime"
  },
  {
    name: "Evelyn Sterling — Solar Archivist",
    style: "Starship Log",
    category: "Arcane & Cosmic",
    charName: "Evelyn Sterling",
    charClass: "Solar Archivist",
    lore: "Aboard the exploration vessel Vanguard, Evelyn records dying stars and catalogs anomalous alien transmissions from the edge of the Perseus Arm.",
    items: "LCARS Datapad,Quantum Scanner,Plasma Torch,Stellar Chart"
  },
  {
    name: "Ignis Thorne — Pyre Inquisitor",
    style: "Gothic Dark Fantasy",
    category: "Dark & Necrotic",
    charName: "Ignis Thorne",
    charClass: "Pyre Inquisitor",
    lore: "A zealous hunter of heretics and shape-shifters across the Mist-Veiled Duchies, Ignis carries a silver censer that burns with cold blue sanctified flame.",
    items: "Sanctified Censer,Inquisitor Crossbow,Silver Stakes,Vial of Holy Oil"
  },
  {
    name: "Silas Moore — 8-Bit Hero",
    style: "8-Bit Retro RPG",
    category: "Combat & Martial",
    charName: "Silas Moore",
    charClass: "Chiptune Adventurer",
    lore: "Pulled straight from a legendary 1985 cartridge into physical reality, Silas perceives the world in pixelated grids and solves every problem with 8-bit sword swings.",
    items: "Pixel Sword,Wooden Shield,16 HP Potions,8-Bit Key"
  },
  {
    name: "Mirela — Thornwood Druid",
    style: "Feywild Bloom",
    category: "Nature & Wild",
    charName: "Mirela",
    charClass: "Thornwood Druid",
    lore: "Guardian of the Deep Glimmerwood, Mirela speaks in rustling leaves and commands ancient briars to swallow trespassers who disrespect the forest canopy.",
    items: "Staff of Living Oak,Moonpetal Tea,Fey-Dust Pouch,Carved Wooden Mask"
  },
  {
    name: "Cain — Sector 9 Enforcer",
    style: "Shadow Protocol",
    category: "Stealth & Rogue",
    charName: "Cain",
    charClass: "Blacksite Enforcer",
    lore: "Operating in absolute secrecy under Sector 9 jurisdiction, Cain sanitizes compromised facilities and eliminates liabilities before dawn.",
    items: "Suppressed SMG,Blacksite Pass,Thermal Goggles,Bio-Lock Cuffs"
  },
  {
    name: "Zephyrine — Void Stalker",
    style: "Cosmic Horror",
    category: "Arcane & Cosmic",
    charName: "Zephyrine",
    charClass: "Void Stalker",
    lore: "An operative touched by the Great Old Ones, Zephyrine bends shadow and reality to slip through dimensional rifts unnoticed.",
    items: "Dagger of Whispers,Void-Silk Cloak,Eldritch Compass,Sanity Amulet"
  },
  {
    name: "Gideon Vance — Alchemist of Ashes",
    style: "Wasteland Scavenger",
    category: "Science & Lab",
    charName: "Gideon Vance",
    charClass: "Scavenger Alchemist",
    lore: "Scouring the nuclear craters of Old Chicago, Gideon distills high-octane fuel and medicinal tonics from toxic fallout and rusted engine blocks.",
    items: "Gas Mask,Acid Sprayer,Geiger Counter,Scrap-Metal Shield"
  },
  {
    name: "Morrigan — Bloodroot Witch",
    style: "Victorian Gothic",
    category: "Dark & Necrotic",
    charName: "Morrigan",
    charClass: "Bloodroot Witch",
    lore: "Dwelling in the foggy cobblestone alleys of 1888 London, Morrigan brews potions from belladonna and communicates with Victorian street ghosts.",
    items: "Cauldron Pendant,Belladonna Vial,Bone Needle,Gaslamp"
  },
  {
    name: "Tariq — Silk Road Assassin",
    style: "High Fantasy",
    category: "Stealth & Rogue",
    charName: "Tariq ibn-Ziyad",
    charClass: "Desert Assassin",
    lore: "Master of the dunes and winds, Tariq dances across shifting sands with twin curved scimitars dipped in scorpion venom.",
    items: "Twin Scimitars,Desert Cloak,Venom Vial,Throwing Darts"
  },
  {
    name: "Valeria — Star-Drift Captain",
    style: "Starship Log",
    category: "Tech & Cyber",
    charName: "Valeria Vance",
    charClass: "Free-Captain",
    lore: "Commander of the rogue freighter Nebula Hawk, Valeria smuggling contraband past Imperial blockades across three planetary systems.",
    items: "Heavy Blaster Pistol,Navigation Rig,Smuggler's Pass,Plasma Flask"
  },
  {
    name: "Dmitri — Neon Street Samurai",
    style: "Neon Ronin",
    category: "Combat & Martial",
    charName: "Dmitri",
    charClass: "Neon Mercenary",
    lore: "Armed with a glowing plasma katana and chrome ocular implants, Dmitri protects the neon-lit slums of Neo-Moscow from syndicate thugs.",
    items: "Plasma Katana,Chrome Arm,Holo-Visor,Stun Baton"
  },
  {
    name: "Seraphina — Gilded Empress",
    style: "Royal Court",
    category: "Royal & Noble",
    charName: "Seraphina III",
    charClass: "Gilded Empress",
    lore: "Ruling from the Sapphire Throne of Oria, Seraphina commands supreme legal authority and wields the Scepter of Eternal Decrees.",
    items: "Scepter of Decrees,Velvet Crown,Signet Ring,Royal Seal"
  },
  {
    name: "Grimm — Sump Diver",
    style: "Wasteland Scavenger",
    category: "Stealth & Rogue",
    charName: "Grimm",
    charClass: "Sump Diver",
    lore: "Navigating the toxic underground drainage tunnels beneath the mega-cities, Grimm salvages pristine pre-war tech from forgotten subterranean bunkers.",
    items: "Water-Filter Mask,Magnetic Grappler,Rusted Crowbar,Scrap-LED Torch"
  },
  {
    name: "Lyra-9 — Bio-Synthetic Infiltrator",
    style: "BioHacker",
    category: "Tech & Cyber",
    charName: "Lyra-9",
    charClass: "Bio-Synthetic Agent",
    lore: "Engineered in a clandestine sub-ocean laboratory, Lyra-9 possesses chameleon skin pigmentation and synthetic neural pathways optimized for infiltration.",
    items: "Chameleon Suit,Neural Interface,Synthetic Scalpel,Toxin Injector"
  },
  {
    name: "Thorne — Hollowed Executioner",
    style: "Obsidian Cult",
    category: "Dark & Necrotic",
    charName: "Thorne",
    charClass: "Obsidian Executioner",
    lore: "Serving the blood-priests of the Black Altar, Thorne swings a heavy obsidian cleaver that drinks the vitality of condemned heretics.",
    items: "Obsidian Cleaver,Iron Mask,Blood-Chalice,Executioner Hood"
  },
  {
    name: "Aria — Moonlit Bard",
    style: "Feywild Bloom",
    category: "Nature & Wild",
    charName: "Aria",
    charClass: "Moonlit Bard",
    lore: "Traveling across enchanted glades with her silver lute, Aria sings ancient fey ballads that can charm wild beasts and soothe raging storms.",
    items: "Silver Lute,Enchanted Sheet Music,Fey Sparkles Vial,Silk Robes"
  },
  {
    name: "Zane — Ether-Engine Pilot",
    style: "Steampunk Tinkerer",
    category: "Science & Lab",
    charName: "Zane",
    charClass: "Airship Pilot",
    lore: "Soaring above the cloud-seas in his armored dirigible 'The Iron Albatross', Zane navigates fierce tempest gales and fights sky-pirates with a brass blunderbuss.",
    items: "Brass Blenderbuss,Aviator Goggles,Airship Compass,Hook & Cable"
  },
  {
    name: "Cassian — Classified Operative",
    style: "Shadow Protocol",
    category: "Stealth & Rogue",
    charName: "Cassian",
    charClass: "Covert Operative",
    lore: "His file does not exist in central government databases. When impossible crises emerge, Cassian arrives unannounced and resolves them before dawn.",
    items: "Matrix Keycard,Silenced Pistol,Encrypted Radio,Counter-Surveillance Rig"
  },
  {
    name: "Xylar — Arcane Archivist",
    style: "Arcane Codex",
    category: "Arcane & Cosmic",
    charName: "Xylar",
    charClass: "Arcane Archivist",
    lore: "Keeper of the Vault of Whispers, Xylar preserves forbidden spells and ancient prophecies written on the skin of celestial beasts.",
    items: "Grimoire of Whispers,Quill of Light,Pendulum,Crystal Monocle"
  },
  // 25 Brand New Unique Entries Below
  {
    name: "Valerius — Solar Paladin",
    style: "High Fantasy",
    category: "Combat & Martial",
    charName: "Valerius Dawnseeker",
    charClass: "Solar Paladin",
    lore: "Knight commander of the Golden Sunburst Order, Valerius radiates blazing solar energy that melts shadow fiends and restores hope to besieged bastions.",
    items: "Sun-Forged Greatsword,Solar Crest Shield,Vial of Dawnlight,Sunstone Pendant"
  },
  {
    name: "Soren — Frost-Vein Berserker",
    style: "High Fantasy",
    category: "Combat & Martial",
    charName: "Soren Iron-Tooth",
    charClass: "Glacial Berserker",
    lore: "Hailing from the frozen peaks of Jotunheim, Soren channels the biting frost storms into his battleaxe, roaring defiance against winter giants.",
    items: "Glacial Greataxe,Bear-Hide Cloak,Rune of Winter,Frost Mead Flask"
  },
  {
    name: "Nyxara — Shadow Weaver",
    style: "Gothic Dark Fantasy",
    category: "Dark & Necrotic",
    charName: "Nyxara",
    charClass: "Umbral Weaver",
    lore: "Weaving garments from pure midnight shadow and spider silk, Nyxara slips through royal courts and catacombs without casting a reflection.",
    items: "Shadow Loom Dagger,Spider-Silk Shroud,Obsidian Spindle,Veil of Silence"
  },
  {
    name: "Malakor — Abyssal Warlock",
    style: "Cosmic Horror",
    category: "Arcane & Cosmic",
    charName: "Malakor",
    charClass: "Abyssal Pact-Bound",
    lore: "Bound by blood-pact to an entity sleeping in the Mariana Trench of stars, Malakor summons crushing pressure tentacles to pulverize foes.",
    items: "Tome of Deep Woe,Tentacle Rod,Abyssal Pearl,Chanting Beads"
  },
  {
    name: "Vespera — Neon Gunslinger",
    style: "Cyberpunk",
    category: "Tech & Cyber",
    charName: "Vespera",
    charClass: "Neon Street Gunslinger",
    lore: "Operating in the underbelly of Neon City, Vespera fires custom magnetic rounds that lock onto bio-signatures through solid steel bulkheads.",
    items: "Mag-Pistol Pairs,Cyber-Optic HUD,Holo-Cigars,Smart-Bullets"
  },
  {
    name: "Zephyr — Cyber-Monk",
    style: "Cyberpunk",
    category: "Tech & Cyber",
    charName: "Zephyr-7",
    charClass: "Bio-Electric Ascetic",
    lore: "Blending ancient martial monastery discipline with high-voltage cybernetic implants, Zephyr channels lightning through bare carbon-fiber fists.",
    items: "Carbon Knuckles,Neural Tap,Energy Cell Pack,Meditation Chip"
  },
  {
    name: "Tetsuya — Cherry-Blossom Assassin",
    style: "Samurai Era",
    category: "Stealth & Rogue",
    charName: "Tetsuya",
    charClass: "Shinobi Master",
    lore: "A legendary phantom of feudal Kyoto who vanishes in a swirling vortex of falling cherry petals while leaving behind a folded origami crane.",
    items: "Ninjakto Blade,Smoke Pellets,Origami Paper,Grappling Iron"
  },
  {
    name: "Aiko — Shogun Vanguard",
    style: "Samurai Era",
    category: "Combat & Martial",
    charName: "Lady Aiko",
    charClass: "Imperial Vanguard",
    lore: "Commander of the Emperor's personal cavalry guard, Aiko wields a gleaming naginata that has turned the tide of countless clan wars.",
    items: "Imperial Naginata,Lacquer Armor,Banner of the Sun,Tea Ceremony Set"
  },
  {
    name: "Ignatius — Galvanic Alchemist",
    style: "Steampunk Tinkerer",
    category: "Science & Lab",
    charName: "Ignatius Vance",
    charClass: "Galvanic Chemist",
    lore: "Experimenting with volatile chemical mixtures and Tesla coils in his subterranean Victorian laboratory, Ignatius seeks the formula for perpetual lightning.",
    items: "Tesla Coil Rod,Chemical Vials,Copper Goggles,Leaded Apron"
  },
  {
    name: "Beatrice — Clockwork Nurse",
    style: "Steampunk Tinkerer",
    category: "Science & Lab",
    charName: "Beatrice Cogsworth",
    charClass: "Clockwork Medic",
    lore: "Tending to wounded soldiers across industrial frontlines with spring-loaded scalpel fingers and automated adrenaline injectors built into her corset.",
    items: "Clockwork Scalpels,Adrenaline Pump,Aether-Bandages,Nurse's Satchel"
  },
  {
    name: "Cassian — Deep-Space Navigator",
    style: "Starship Log",
    category: "Tech & Cyber",
    charName: "Cassian Drake",
    charClass: "Star-Navigator",
    lore: "Charting hyperspace lanes aboard the cruiser Odyssey, Cassian calculates quantum gravitational anomalies before they tear his vessel apart.",
    items: "Quantum Sextant,Holo-Map Projector,Grav-Booties,Emergency Beacon"
  },
  {
    name: "Lyra-X — Android Pilot",
    style: "Starship Log",
    category: "Tech & Cyber",
    charName: "Lyra-X",
    charClass: "Synthetic Flight Officer",
    lore: "An advanced combat android designed for extreme atmospheric entry, Lyra-X pilots interceptor craft through asteroid fields at sub-light velocities.",
    items: "Pilot Visor,Thruster Pack,Data-Link Tether,Alloy Wrench"
  },
  {
    name: "Cyrus — Pixel Knight",
    style: "8-Bit Retro RPG",
    category: "Combat & Martial",
    charName: "Cyrus",
    charClass: "8-Bit Paladin",
    lore: "Guarding the 8-Bit Kingdom against Glitch Dragons and pixelated bandits, Cyrus fights with unwavering blocky honor.",
    items: "Retro Broadsword,Blocky Shield,Heart Container,8-Bit Potion"
  },
  {
    name: "Pixelia — Chiptune Sorceress",
    style: "8-Bit Retro RPG",
    category: "Arcane & Cosmic",
    charName: "Pixelia",
    charClass: "Chiptune Mage",
    lore: "Casting spells synthesized from 4-channel square wave audio frequencies that stun enemies with pure nostalgic frequency power.",
    items: "Wand of Beeps,Floppy Disk Tome,Pixel Dust,Mana Crystal"
  },
  {
    name: "Sylvia — Glade Ranger",
    style: "Feywild Bloom",
    category: "Nature & Wild",
    charName: "Sylvia Greenbriar",
    charClass: "Fey Ranger",
    lore: "Tracking poachers and shadow beasts through the eternal twilight of the Feywild with arrows fletched from shimmering hummingbird feathers.",
    items: "Yew Longbow,Quiver of Star-Arrows,Cloak of Leaves,Hunting Horn"
  },
  {
    name: "Oberon — Autumn Wardens",
    style: "Feywild Bloom",
    category: "Nature & Wild",
    charName: "Oberon Vane",
    charClass: "Autumn Warden",
    lore: "Embodied spirit of falling leaves and crisp harvest winds, protecting the sacred boundaries between the mortal realm and Faerie.",
    items: "Staff of Amber Leaves,Acorn Grenades,Frost-Ivy Crown,Woven Basket"
  },
  {
    name: "Raven — Shadow Extraction",
    style: "Shadow Protocol",
    category: "Stealth & Rogue",
    charName: "Raven",
    charClass: "Extraction Specialist",
    lore: "Extracting high-value informants from heavily fortified black sites under cover of absolute radio silence and artificial darkness.",
    items: "Grapple Launcher,Suppressor Pistol,Encrypted Terminal,Smoke Canister"
  },
  {
    name: "Viper — Ghost Infiltrator",
    style: "Shadow Protocol",
    category: "Stealth & Rogue",
    charName: "Viper",
    charClass: "Ghost Operative",
    lore: "Equipped with active camouflage netting and silent monofilament wire, Viper is the unseen whisper that eliminates syndicate kingpins.",
    items: "Cammo Suit,Monofilament Wire,Night-Vision Shroud,Silent Blade"
  },
  {
    name: "Krynn — Cursed Scavenger",
    style: "Wasteland Scavenger",
    category: "Science & Lab",
    charName: "Krynn",
    charClass: "Fallout Scrapper",
    lore: "Surviving the irradiated badlands of Sector 7 by turning rusted car chassis into functional plasma rifles and makeshift armor plating.",
    items: "Scrap-Metal Rifle,Geiger Counter,Filtered Canteen,Welders Mask"
  },
  {
    name: "RUST — Junk-Pile Automaton",
    style: "Wasteland Scavenger",
    category: "Tech & Cyber",
    charName: "RUST-01",
    charClass: "Sentient Scrapyard Golem",
    lore: "Awakened in a mountain of discarded electronics, RUST-01 defends nomadic desert caravans using hydraulic arms built from excavator scrap.",
    items: "Hydraulic Claw,Solar Recharger,Scrap Armor,Core Beacon"
  },
  {
    name: "Evangeline — Sepulcher Undertaker",
    style: "Victorian Gothic",
    category: "Dark & Necrotic",
    charName: "Evangeline Frost",
    charClass: "Gothic Undertaker",
    lore: "Managing the gaslit catacombs beneath St. Jude's Cathedral, Evangeline ensures restless spirits remain safely entombed with silver pins.",
    items: "Silver Coffin Nails,Embalming Kit,Gaslamp of Souls,Mourning Veil"
  },
  {
    name: "Alistair — Ravenwood Aristocrat",
    style: "Victorian Gothic",
    category: "Royal & Noble",
    charName: "Lord Alistair",
    charClass: "Nocturnal Aristocrat",
    lore: "Hosting lavish masquerade balls in his crumbling moorland estate while secretly leading a coven of midnight aristocrats.",
    items: "Ivory Cane,Masquerade Mask,Signet Ring,Pocket Watch"
  },
  {
    name: "Genevieve — High Chancellor",
    style: "Royal Court",
    category: "Royal & Noble",
    charName: "Genevieve du Pont",
    charClass: "Royal Chancellor",
    lore: "Wielding absolute political leverage across the Imperial Senate through meticulous record-keeping, razor-sharp wit, and poisoned wine.",
    items: "Imperial Seal Stamp,Silk Scroll,Poison Ring,Golden Quill"
  },
  {
    name: "Bio-Vex — Gene-Hacker",
    style: "BioHacker",
    category: "Science & Lab",
    charName: "Dr. Vex",
    charClass: "Genetic Splicer",
    lore: "Modifying his own cellular structure in an underground bio-lab to grow chitinous armor plating and venom-secreting dermal glands.",
    items: "Gene-Sequencer,Mutagen Vials,Bio-Injector,Surgical Lasers"
  },
  {
    name: "Kuro — Obsidian Zealot",
    style: "Obsidian Cult",
    category: "Dark & Necrotic",
    charName: "Kuro",
    charClass: "Obsidian Zealot",
    lore: "Fasting for forty days inside the volcanic caldera of Mount Ash, Kuro forged his flesh into an unyielding conduit for black basalt magic.",
    items: "Basalt Staff,Obsidian Dagger,Vial of Magma,Cindershroud"
  }
];

export default function App() {
  const [themeId, setThemeId] = useState("gothicDarkFantasy");
  const currentTheme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const c = currentTheme.tokens;

  const [activeTab, setActiveTab] = useState("overview");

  // Input states for AI generation / Summon
  const [characterName, setCharacterName] = useState("");
  const [characterClass, setCharacterClass] = useState("");
  const [characterLevel, setCharacterLevel] = useState("16");
  const [characterLore, setCharacterLore] = useState("");
  const [inventoryItems, setInventoryItems] = useState("");
  const [sheetStyle, setSheetStyle] = useState("Gothic Dark Fantasy");
  const [presetStyleFilter, setPresetStyleFilter] = useState("All");
  const [presetCategoryFilter, setPresetCategoryFilter] = useState("All");
  const [presetSearchQuery, setPresetSearchQuery] = useState("");
  const [favoritesOnlyFilter, setFavoritesOnlyFilter] = useState(false);

  // Pinned favorites persisted in localStorage with safe in-memory fallback
  const [favoritePresets, setFavoritePresets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("worldvision_favorite_presets");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // safe fallback for restricted iframe environments
    }
    // Default 2 popular archetypes pinned initially for immediate UX feedback
    return ["Gelbinor — The Shy Grave", "Kaelen Vex - Netrunner"];
  });

  const toggleFavoritePreset = (presetName: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setFavoritePresets(prev => {
      const next = prev.includes(presetName)
        ? prev.filter(name => name !== presetName)
        : [...prev, presetName];
      try {
        localStorage.setItem("worldvision_favorite_presets", JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const uniquePresetStyles = Array.from(new Set(PRESETS.map(p => p.style)));
  const uniquePresetCategories = Array.from(new Set(PRESETS.map(p => p.category)));
  const filteredPresets = PRESETS.filter(p => {
    let matchStyle = presetStyleFilter === "All" || p.style === presetStyleFilter;
    let matchCat = presetCategoryFilter === "All" || p.category === presetCategoryFilter;
    let q = presetSearchQuery.toLowerCase().trim();
    let matchSearch = !q || p.name.toLowerCase().includes(q) || p.charClass.toLowerCase().includes(q) || p.lore.toLowerCase().includes(q) || p.style.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    let matchFav = !favoritesOnlyFilter || favoritePresets.includes(p.name);
    return matchStyle && matchCat && matchSearch && matchFav;
  }).sort((a, b) => {
    const aFav = favoritePresets.includes(a.name) ? 1 : 0;
    const bFav = favoritePresets.includes(b.name) ? 1 : 0;
    if (bFav !== aFav) {
      return bFav - aFav; // Pinned favorites always float to the top
    }
    return 0;
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageEngine, setImageEngine] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [activePresetName, setActivePresetName] = useState<string>("Gelbinor — The Shy Grave");
  const [showStatsRadarOverlay, setShowStatsRadarOverlay] = useState<boolean>(false);

  // Google Workspace & Sheets state
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [, setGoogleToken] = useState<string | null>(null);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [sheetsStatusMsg, setSheetsStatusMsg] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [spreadsheetIdInput, setSpreadsheetIdInput] = useState("");

  useEffect(() => {
    const unsub = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsSigningInGoogle(true);
    setSheetsStatusMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        setSheetsStatusMsg("Successfully connected to Google Workspace & Sheets!");
      }
    } catch (err: any) {
      setSheetsStatusMsg(`Sign-in failed: ${err.message}`);
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleExportSheets = async () => {
    setSheetsStatusMsg("Exporting character record to Google Sheets...");
    try {
      const { spreadsheetId, spreadsheetUrl } = await exportCharacterToGoogleSheet(sheetData);
      setSheetsStatusMsg(`Export successful! ID: ${spreadsheetId}`);
      window.open(spreadsheetUrl, "_blank");
    } catch (err: any) {
      setSheetsStatusMsg(`Export failed: ${err.message}`);
    }
  };

  const handleImportSheets = async () => {
    if (!spreadsheetIdInput.trim()) return;
    setSheetsStatusMsg("Importing character record from Google Sheets...");
    try {
      const data = await importCharacterFromGoogleSheet(spreadsheetIdInput.trim());
      setSheetData((prev) => mergeImportedSheet(prev as UiSheetData, data));
      const importedStyle = canonicalizeSheetStyle(data.sheet_style);
      setSheetStyle(importedStyle);
      setThemeId(themeIdForStyle(importedStyle));
      setSheetsStatusMsg("Character imported successfully from Google Sheet!");
      setShowImportModal(false);
      setSpreadsheetIdInput("");
    } catch (err: any) {
      setSheetsStatusMsg(`Import failed: ${err.message}`);
    }
  };
  const [runState, setRunState] = useState<string>("draft"); // draft | validating | generating_text | generating_portrait | generating_inventory | generating_map | composing | awaiting_approval | revised | approved | exporting | completed
  const [codexEntries, setCodexEntries] = useState<CodexEntry[]>(() => loadCodex());
  const [activeCodexId, setActiveCodexId] = useState<string | null>(null);
  const [showCodex, setShowCodex] = useState(false);
  const [showDiceTray, setShowDiceTray] = useState(false);
  const [showPlate, setShowPlate] = useState(false);

  const persistToCodex = (asNew: boolean) => {
    const result = upsertCodexEntry({
      existingId: asNew ? null : activeCodexId,
      sheetData: sheetData as UiSheetData,
      themeId: currentTheme.id,
      portraitUrl: imageUrl
    });
    setCodexEntries(result.entries);
    setActiveCodexId(result.entry.id);
    setSheetsStatusMsg(
      result.droppedPortraits
        ? `Saved ${result.entry.name} to the Codex (portrait omitted — storage limit).`
        : `Saved ${result.entry.name} to the Codex.`
    );
  };

  const loadFromCodex = (entry: CodexEntry) => {
    setSheetData(entry.sheetData);
    setActiveCodexId(entry.id);
    setImageUrl(entry.portraitUrl);
    const resolvedTheme = THEMES.some((t) => t.id === entry.themeId)
      ? entry.themeId
      : themeIdForStyle(entry.sheetStyle || entry.sheetData.sheet_style);
    setThemeId(resolvedTheme);
    setSheetStyle(canonicalizeSheetStyle(entry.sheetStyle || entry.sheetData.sheet_style));
    setShowCodex(false);
    setSheetsStatusMsg(`Loaded ${entry.name} from the Codex.`);
  };

  // Default editable character state initialized with Gelbinor
  const [sheetData, setSheetData] = useState({
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
  });

  const idempotencyKey = `worldvision_run_${btoa(encodeURIComponent(`${characterName || "Gelbinor"}-${characterClass || "Necromancer"}-${sheetStyle}`))}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(idempotencyKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep);
        if (parsed.sheetData) setSheetData(parsed.sheetData);
        if (parsed.runState) setRunState(parsed.runState);
      }
    } catch (e) {
      console.error("Failed to load persistence run:", e);
    }
  }, [idempotencyKey]);

  useEffect(() => {
    try {
      localStorage.setItem(idempotencyKey, JSON.stringify({
        currentStep,
        sheetData,
        runState,
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.error("Failed to persist run to localStorage:", e);
    }
  }, [currentStep, sheetData, runState, idempotencyKey]);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    let obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    }, { rootMargin: "-40% 0px -50% 0px" });

    Object.keys(sectionRefs.current).forEach((key) => {
      let el = sectionRefs.current[key];
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const updateField = (path: string, val: any) => {
    setSheetData((prev) => {
      let copy = JSON.parse(JSON.stringify(prev));
      let parts = path.split(".");
      let curr = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = val;
      return copy;
    });
  };

  /** Functional adjust so rapid +/- clicks don't collapse on a stale sheetData closure. */
  const adjustDerivedResource = (
    currentKey: "hpCurrent" | "resourceCurrent",
    maxKey: "hpMax" | "resourceMax",
    delta: number,
    fallbackCurrent: number,
    fallbackMax: number
  ) => {
    setSheetData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as typeof prev & {
        derivedStats?: Record<string, number | string | string[]>;
      };
      if (!copy.derivedStats) copy.derivedStats = {};
      const cur = Number(copy.derivedStats[currentKey] ?? fallbackCurrent);
      const max = Number(copy.derivedStats[maxKey] ?? fallbackMax);
      copy.derivedStats[currentKey] = clampResource(cur, max, delta);
      return copy;
    });
  };

  const handleStatChange = (idx: number, val: number) => {
    let stats = [...sheetData.stats];
    stats[idx] = { ...stats[idx], value: Math.max(1, Math.min(24, val)) };
    updateField("stats", stats);
  };

  const handleSkillChange = (idx: number, val: number) => {
    let skills = [...sheetData.skills];
    skills[idx] = { ...skills[idx], value: Math.max(0, Math.min(100, val)) };
    updateField("skills", skills);
  };

  const applyPreset = (preset: SheetPreset) => {
    const style = canonicalizeSheetStyle(preset.style);
    setActivePresetName(preset.name);
    setCharacterName(preset.charName);
    setCharacterClass(preset.charClass);
    setCharacterLore(preset.lore);
    setInventoryItems(preset.items);
    setSheetStyle(style);
    setThemeId(themeIdForStyle(style));
  };

  const handleApplyBaselineToSheet = (baseline: StatBaseline) => {
    const updatedStats = sheetData.stats.map(st => {
      const key = st.key as keyof StatBaseline;
      if (baseline[key] !== undefined) {
        return { ...st, value: baseline[key] };
      }
      return st;
    });
    updateField("stats", updatedStats);
  };

  // Summon / Generate via Gemini API backend
  const handleSummon = async () => {
    setLoading(true);
    setRunState("validating");
    setCurrentStep(1);
    setImageError(null);
    setActiveCodexId(null);
    setSheetsStatusMsg(null);

    const timers = [
      setTimeout(() => setRunState("generating_text"), 300),
      setTimeout(() => setRunState("generating_portrait"), 1200),
      setTimeout(() => setRunState("generating_inventory"), 2000),
      setTimeout(() => setRunState("generating_map"), 2800),
    ];

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < 8 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await fetch("/api/generate-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character_name: characterName,
          character_class: characterClass,
          character_level: characterLevel,
          character_lore: characterLore,
          inventory_items: inventoryItems,
          sheet_style: canonicalizeSheetStyle(sheetStyle)
        })
      });
      if (!res.ok) {
        throw new Error(`Summoner returned HTTP ${res.status}`);
      }
      const data: CharacterSheetData = await res.json();
      clearInterval(interval);
      timers.forEach(clearTimeout);
      setCurrentStep(9);
      setLoading(false);
      setRunState("completed");

      if (data && data.character_data) {
        const nextSheet = mapGeneratedSheetToUi(data, {
          characterLevel,
          playerName: characterName,
          sheetStyle,
        });
        setSheetData(nextSheet);
        setSheetStyle(nextSheet.sheet_style);
        setThemeId(themeIdForStyle(nextSheet.sheet_style));

        const portraitPrompt = [
          compilePortraitPrompt(portraitPromptContext(nextSheet), nextSheet.sheet_style),
          data.visual_prompts?.step_2_hero_portrait
            ? `Director notes: ${data.visual_prompts.step_2_hero_portrait}`
            : "",
        ].filter(Boolean).join("\n");
        generatePortraitImage(portraitPrompt, nextSheet.sheet_style, undefined, nextSheet);
      }
    } catch (e) {
      console.error(e);
      clearInterval(interval);
      timers.forEach(clearTimeout);
      setLoading(false);
      setRunState("draft");
      const msg = "Sheet generation failed. Check the summoner service and try again.";
      setImageError(msg);
      setSheetsStatusMsg(msg);
    }
  };

  const generatePortraitImage = async (
    prompt: string,
    style: string,
    referenceImage?: string,
    contextOverride?: UiSheetData
  ) => {
    setGeneratingImage(true);
    setImageError(null);
    const startedAt = Date.now();
    try {
      const contextSheet = contextOverride || (sheetData as UiSheetData);
      const result = await nanoBananaProvider.generateImage({
        prompt,
        style: canonicalizeSheetStyle(style),
        aspectRatio: "3:4",
        imageSize: "2K",
        outputMimeType: "image/png",
        characterContext: portraitPromptContext(contextSheet),
        referenceImage
      });
      if (result.imageUrl) {
        setImageUrl(result.imageUrl);
        setImageEngine(result.engine || "Nano Banana");
        // Server may return a procedural SVG with fallback:true — surface why live raster failed.
        if (result.fallback || (result.engine || "").includes("Procedural")) {
          setImageError(
            result.error?.message ||
              "Live portrait unavailable (quota/billing or model). Showing dossier plate — enable Gemini image billing, then reroll."
          );
        }
      } else {
        const fallback = buildProceduralPortrait({
          name: contextSheet.name,
          charClass: contextSheet.overview?.classRole,
          style,
          distinguishingFeature: contextSheet.physical?.marks,
        });
        setImageUrl(fallback);
        setImageEngine("WorldVision Procedural Codex");
        setImageError(result.error?.message || "Portrait model returned no image; showing dossier plate.");
      }
    } catch (e) {
      console.error("Portrait generation error:", e);
      setImageError("Portrait synthesis failed. You can reroll or edit the asset.");
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed < 500) {
        await new Promise((resolve) => setTimeout(resolve, 500 - elapsed));
      }
      setGeneratingImage(false);
    }
  };

  const handleRerollPortrait = () => {
    const style = canonicalizeSheetStyle((sheetData as UiSheetData).sheet_style || sheetStyle);
    const prompt = compilePortraitPrompt(portraitPromptContext(sheetData as UiSheetData), style);
    generatePortraitImage(prompt, style, undefined, sheetData as UiSheetData);
  };

  const handleRandomizeStats = () => {
    const rnd = () => Math.floor(Math.random() * 11) + 10;
    let newStats = sheetData.stats.map(s => ({
      ...s,
      value: rnd()
    }));
    updateField("stats", newStats);
  };

  const [copiedJson, setCopiedJson] = useState(false);

  const handleCopyCharacterJson = async () => {
    try {
      const jsonString = JSON.stringify(sheetData, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonString);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = jsonString;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch (err) {
      console.error("Failed to copy character JSON:", err);
    }
  };

  const portraitSrc = imageUrl || buildProceduralPortrait({
    name: sheetData.name,
    charClass: sheetData.overview.classRole,
    style: (sheetData as UiSheetData).sheet_style || sheetStyle,
    distinguishingFeature: sheetData.physical.marks,
  });

  const themeVars = {
    ["--wv-bg"]: c.bg,
    ["--wv-bg2"]: c.bg2,
    ["--wv-card"]: c.card,
    ["--wv-card2"]: c.card2,
    ["--wv-border"]: c.border,
    ["--wv-border-strong"]: c.borderStrong,
    ["--wv-text"]: c.text,
    ["--wv-muted"]: c.muted,
    ["--wv-muted2"]: c.muted2,
    ["--wv-accent"]: c.accent,
    ["--wv-accent2"]: c.accent2,
    ["--wv-accent-text"]: c.accentText,
    ["--wv-clash"]: c.clash,
    ["--wv-clash-text"]: c.clashText,
    ["--wv-shadow"]: c.shadow,
    ["--wv-radius"]: (currentTheme as any).radius || "18px",
    ...sheetPageBackgroundCssVars(currentTheme.id),
  } as React.CSSProperties;

  return (
    <div
      className="sheet-app min-h-screen selection:bg-black/20"
      data-sheet={currentTheme.id}
      data-chrome={(currentTheme as any).chrome}
      style={{ ...themeVars, backgroundColor: c.bg, color: c.text, fontFamily: currentTheme.fonts.body }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Cinzel+Decorative:wght@700&family=Cinzel:wght@400;600&family=Cormorant+Garamond:wght@400;600;700&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600&family=IBM+Plex+Mono:wght@400;500&family=JetBrains+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300&family=Orbitron:wght@400;600&family=Philosopher:wght@400;700&family=Pirata+One&family=Quicksand:wght@400;600&family=Share+Tech+Mono&family=Special+Elite&display=swap');
        .display { font-family: ${currentTheme.fonts.display}; }
        .mono { font-family: ${currentTheme.fonts.mono}; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: ${c.border}; border-radius: 99px; }
        input, textarea { background: transparent; color: inherit; }
        input:focus, textarea:focus { outline: none; border-color: ${c.clash}; box-shadow: 0 0 0 1px ${c.clash}55; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media print { .no-print { display: none !important; } }
        .texture-obsidian { background-image: linear-gradient(30deg, transparent 48%, ${c.border} 49%, ${c.border} 51%, transparent 52%), linear-gradient(-30deg, transparent 48%, ${c.border} 49%, ${c.border} 51%, transparent 52%); background-size: 80px 80px; opacity: 0.18; }
        .texture-arcane { background-image: radial-gradient(ellipse at 30% 20%, rgba(217,197,160,0.12), transparent 60%); }
        .texture-neon { background-image: linear-gradient(${c.border} 1px, transparent 1px); background-size: 100% 48px; opacity: 0.28; }
        .texture-steampunk { background-image: linear-gradient(${c.border}40 1px, transparent 1px), linear-gradient(90deg, ${c.border}40 1px, transparent 1px); background-size: 32px 32px; }
        .texture-retro { background-image: repeating-linear-gradient(90deg, transparent 0 7px, ${c.accent}22 7px 8px); opacity: 0.25; }
        .texture-cosmic { background-image: radial-gradient(circle at 20% 30%, ${c.accent}33, transparent 18%), radial-gradient(circle at 80% 70%, ${c.accent2}22, transparent 16%); }
        .texture-samurai { background-image: radial-gradient(circle at 90% 8%, ${c.accent}55, transparent 16%); }
        .texture-wasteland { background-image: repeating-linear-gradient(-32deg, ${c.accent}14 0 10px, transparent 10px 22px); }
        .texture-eldritch { background-image: radial-gradient(circle at 40% 20%, ${c.accent}28, transparent 24%); }
        .texture-victorian { background-image: repeating-linear-gradient(90deg, transparent 0 16px, ${c.accent}10 16px 17px); }
      `}</style>

      <div className={`pointer-events-none fixed inset-0 z-0 texture-${currentTheme.texture}`} />
      <div className="sheet-bezel">

      {/* Top Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ backgroundColor: `${c.bg}F2`, borderColor: c.border }}>
        <div className="max-w-[1600px] mx-auto px-5 md:px-10 min-h-[72px] py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full grid place-items-center display font-bold tracking-tight shadow-lg" style={{ backgroundColor: c.text, color: c.bg }}>
              WV
            </div>
            <div>
              <div className="display text-lg font-bold tracking-tight" style={{ fontFamily: currentTheme.fonts.display }}>
                WORLDVISION SUMMONS
              </div>
              <div className="mono text-[10px] tracking-widest" style={{ color: c.muted }}>
                DETERMINISTIC RPG LORE & CHARACTER SHEET ENGINE
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {!googleUser ? (
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningInGoogle}
                className="no-print shrink-0 flex items-center gap-2 px-4 h-9 rounded-full font-semibold border transition hover:opacity-90 shadow-sm"
                style={{ backgroundColor: c.card, borderColor: c.border, color: c.text }}
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                <span className="mono text-[11px]">{isSigningInGoogle ? "Connecting..." : "Sign in with Google"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportSheets}
                  className="no-print shrink-0 flex items-center gap-1.5 px-3.5 h-9 rounded-full font-semibold border transition hover:scale-[1.02]"
                  style={{ backgroundColor: c.card, borderColor: c.border, color: c.text }}
                  title="Export Character to Google Sheets"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="mono text-[11px]">Export Sheets</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="no-print shrink-0 flex items-center gap-1.5 px-3.5 h-9 rounded-full font-semibold border transition hover:scale-[1.02]"
                  style={{ backgroundColor: c.card, borderColor: c.border, color: c.text }}
                  title="Import Character from Google Sheets"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                  <span className="mono text-[11px]">Import Sheets</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    setGoogleUser(null);
                    setGoogleToken(null);
                    setSheetsStatusMsg("Signed out of Google Workspace.");
                  }}
                  className="no-print shrink-0 flex items-center gap-1.5 px-3.5 h-9 rounded-full font-semibold border transition hover:opacity-90"
                  style={{ backgroundColor: c.card, borderColor: c.border, color: c.text }}
                  title={googleUser?.email || "Sign out"}
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="mono text-[11px]">Sign out</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowCodex(true)}
              className="no-print shrink-0 flex items-center gap-1.5 px-3.5 h-9 rounded-full font-semibold border transition hover:scale-[1.02]"
              style={{ backgroundColor: c.card, borderColor: c.border, color: c.text }}
              title="Open Character Codex"
            >
              <BookMarked className="w-3.5 h-3.5" style={{ color: c.clash || c.accent }} />
              <span className="mono text-[11px]">Codex{codexEntries.length ? ` (${codexEntries.length})` : ""}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPlate(true)}
              className="no-print shrink-0 flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-full font-semibold border transition hover:scale-[1.02]"
              style={{ backgroundColor: showPlate ? c.accent : c.card, borderColor: c.border, color: showPlate ? c.accentText : c.text }}
              title="Finalize the illuminated Codex page"
            >
              <Scroll className="w-3.5 h-3.5" />
              <span className="mono text-[11px]">Seal Page</span>
            </button>


            <button
              type="button"
              onClick={() => setShowDiceTray((v) => !v)}
              className="no-print shrink-0 flex items-center gap-1.5 px-3.5 h-9 rounded-full font-semibold border transition hover:scale-[1.02]"
              style={{
                backgroundColor: showDiceTray ? c.accent : c.card,
                borderColor: showDiceTray ? (c.clash || c.borderStrong) : c.border,
                color: showDiceTray ? c.accentText : c.text
              }}
              title="Open tabletop dice tray"
              aria-expanded={showDiceTray}
            >
              <Dices className="w-3.5 h-3.5" />
              <span className="mono text-[11px]">Dice Tray</span>
            </button>

            <button
              id="copy-character-json-btn"
              onClick={handleCopyCharacterJson}
              className="no-print shrink-0 flex items-center gap-1.5 px-3.5 h-9 rounded-full font-semibold border transition hover:scale-[1.02] shadow-sm"
              style={{
                backgroundColor: copiedJson ? "rgba(16, 185, 129, 0.15)" : c.card,
                borderColor: copiedJson ? "#10b981" : c.border,
                color: copiedJson ? "#10b981" : c.text
              }}
              title="Copy entire character sheet JSON to clipboard"
              aria-label="Copy Character JSON"
            >
              {copiedJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="mono text-[11px] text-emerald-400 font-bold">JSON Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" style={{ color: c.accent }} />
                  <span className="mono text-[11px]">Copy Character JSON</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowChatModal(true)}
              className="no-print shrink-0 flex items-center gap-2 px-4 h-9 rounded-full border transition hover:scale-[1.02]"
              style={{ backgroundColor: c.card, borderColor: c.border, color: c.text }}
            >
              <Terminal className="w-3.5 h-3.5" style={{ color: c.accent }} />
              <span className="mono text-[11px] font-semibold">Ask Federov AI</span>
            </button>

            <button
              onClick={() => window.print()}
              className="no-print shrink-0 flex items-center gap-2 px-4 h-9 rounded-full font-bold shadow-md transition hover:opacity-90"
              style={{ backgroundColor: c.accent, color: c.accentText }}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="mono text-[11px]">Export / Print</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sheets Status Banner */}
      {sheetsStatusMsg && (
        <div className="max-w-[1600px] mx-auto px-5 md:px-10 pt-3 no-print">
          <div className="p-3 rounded-xl border flex items-center justify-between text-xs mono" style={{ backgroundColor: c.card, borderColor: c.border, color: c.text }}>
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: c.accent }} />
              {sheetsStatusMsg}
            </span>
            <button onClick={() => setSheetsStatusMsg(null)} className="text-stone-400 hover:text-stone-200">Dismiss</button>
          </div>
        </div>
      )}

      {/* Import Spreadsheet Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full rounded-2xl border p-6 shadow-2xl flex flex-col gap-4" style={{ backgroundColor: c.card, borderColor: c.border, color: c.text }}>
            <h3 className="text-lg font-bold display" style={{ fontFamily: currentTheme.fonts.display }}>Import from Google Sheets</h3>
            <p className="text-xs" style={{ color: c.muted }}>Enter the Google Sheets Spreadsheet ID to load character attributes and lore:</p>
            <input
              type="text"
              placeholder="Paste Google Spreadsheet ID here..."
              value={spreadsheetIdInput}
              onChange={(e) => setSpreadsheetIdInput(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none mono"
              style={{ backgroundColor: c.bg2, borderColor: c.border, color: c.text }}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border"
                style={{ borderColor: c.border, color: c.muted }}
              >
                Cancel
              </button>
              <button
                onClick={handleImportSheets}
                className="px-4 py-2 rounded-xl text-xs font-bold shadow-md transition"
                style={{ backgroundColor: c.accent, color: c.accentText }}
              >
                Import Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Bar */}
      <div className="max-w-[1600px] mx-auto px-5 md:px-10 pt-6">
        <div className="rounded-[20px] border p-4 md:p-5" style={{ backgroundColor: c.card, borderColor: c.border, boxShadow: `0 12px 40px ${c.shadow}` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4" style={{ color: c.accent }} />
              <span className="mono text-[11px] tracking-[0.18em] uppercase font-semibold" style={{ color: c.muted }}>
                Theme Engine — Cinematic Origins
              </span>
            </div>
            <span className="mono text-[10px]" style={{ color: c.muted2 }}>Click any theme to instantly restyle the entire dossier</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {THEMES.map((item) => {
              let isSelected = themeId === item.id;
              let IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setThemeId(item.id);
                    setSheetStyle(item.name);
                    setSheetData((prev) => ({ ...prev, sheet_style: item.name }));
                  }}
                  className="relative group p-3 rounded-[14px] border text-left transition-all duration-200 flex flex-col justify-between"
                  style={{
                    backgroundColor: isSelected ? item.tokens.card2 : item.tokens.card,
                    borderColor: isSelected ? item.tokens.borderStrong : item.tokens.border,
                    color: item.tokens.text,
                    boxShadow: isSelected ? `0 0 0 2px ${item.tokens.borderStrong}, 0 8px 24px ${item.tokens.shadow}` : "none",
                    transform: isSelected ? "translateY(-1px)" : "none"
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <IconComp className="w-4 h-4" style={{ color: item.tokens.accent }} />
                    <span className="mono text-[9px] px-1.5 py-0.5 rounded border" style={{ borderColor: item.tokens.border, color: item.tokens.muted }}>
                      {item.short}
                    </span>
                  </div>
                  <div>
                    <div className="display text-[13px] font-semibold leading-tight truncate" style={{ fontFamily: item.fonts.display }}>
                      {item.name}
                    </div>
                    <div className="mono text-[9px] mt-1 opacity-70 truncate">{item.desc}</div>
                  </div>
                  <div className="mt-2 flex items-center gap-1" aria-hidden="true">
                    <span className="h-1.5 w-4 rounded-sm" style={{ backgroundColor: item.tokens.accent }} title="Primary accent" />
                    <span className="h-1.5 w-4 rounded-sm" style={{ backgroundColor: item.tokens.clash }} title="Opposite clash" />
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: item.tokens.clash }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Presets & AI Summoner Configuration Bar */}
      <div className="max-w-[1600px] mx-auto px-5 md:px-10 pt-6">
        <div className="rounded-[20px] border p-5 md:p-6" style={{ backgroundColor: c.card, borderColor: c.border }}>
          <div className="flex items-center justify-between mb-4 border-b pb-3" style={{ borderColor: c.border }}>
            <h2 className="text-lg font-serif font-bold flex items-center gap-2" style={{ color: c.text }}>
              <Sliders className="w-5 h-5" style={{ color: c.accent }} /> Parameter Configuration & AI Summoner
            </h2>
            <span className="mono text-[11px]" style={{ color: c.muted }}>Fill parameters or pick a preset to synthesize character</span>
          </div>

          {/* Categorized & Tabbed Preset Library Browser */}
          <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: c.bg2, borderColor: c.border }}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: c.text }}>
                  <Sparkles className="w-4 h-4" style={{ color: c.accent }} /> Quick Presets Library ({filteredPresets.length} of {PRESETS.length} available)
                </h3>
                <p className="text-xs" style={{ color: c.muted }}>Select an archetype tab or search to instantly populate character parameters</p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search 50+ presets..."
                  value={presetSearchQuery}
                  onChange={(e) => setPresetSearchQuery(e.target.value)}
                  className="px-3 py-1.5 text-xs border rounded-lg w-full md:w-48 focus:outline-none"
                  style={{ backgroundColor: c.card, borderColor: c.border, color: c.text }}
                />
                <select
                  value={presetStyleFilter}
                  onChange={(e) => setPresetStyleFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs border rounded-lg focus:outline-none"
                  style={{ backgroundColor: c.card, borderColor: c.border, color: c.text }}
                >
                  <option value="All">All Styles</option>
                  {uniquePresetStyles.map((st, idx) => (
                    <option key={idx} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  setFavoritesOnlyFilter(!favoritesOnlyFilter);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 border ${favoritesOnlyFilter ? "shadow-sm font-semibold" : "opacity-80 hover:opacity-100"}`}
                style={{
                  backgroundColor: favoritesOnlyFilter ? "rgba(245, 158, 11, 0.18)" : c.card,
                  borderColor: favoritesOnlyFilter ? "#f59e0b" : c.border,
                  color: favoritesOnlyFilter ? "#f59e0b" : c.text
                }}
                title={favoritesOnlyFilter ? "Show all archetypes" : "Show pinned favorite archetypes only"}
              >
                <Star className={`w-3.5 h-3.5 ${favoritesOnlyFilter ? "fill-amber-400 text-amber-400" : "text-amber-400"}`} />
                <span>Favorites ({favoritePresets.length})</span>
              </button>
              <button
                onClick={() => {
                  setFavoritesOnlyFilter(false);
                  setPresetCategoryFilter("All");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${!favoritesOnlyFilter && presetCategoryFilter === "All" ? "shadow-sm font-semibold" : "opacity-75 hover:opacity-100"}`}
                style={{
                  backgroundColor: !favoritesOnlyFilter && presetCategoryFilter === "All" ? c.accent : c.card,
                  color: !favoritesOnlyFilter && presetCategoryFilter === "All" ? c.accentText : c.text,
                  borderColor: c.border,
                  borderWidth: '1px'
                }}
              >
                All Categories ({PRESETS.length})
              </button>
              {uniquePresetCategories.map((cat, idx) => {
                const count = PRESETS.filter(p => p.category === cat).length;
                const isSelected = !favoritesOnlyFilter && presetCategoryFilter === cat;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setFavoritesOnlyFilter(false);
                      setPresetCategoryFilter(cat);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${isSelected ? "shadow-sm font-semibold" : "opacity-75 hover:opacity-100"}`}
                    style={{
                      backgroundColor: isSelected ? c.accent : c.card,
                      color: isSelected ? c.accentText : c.text,
                      borderColor: c.border,
                      borderWidth: '1px'
                    }}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Scrollable Preset Cards Grid */}
            <div className="max-h-56 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {filteredPresets.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs" style={{ color: c.muted }}>
                  {favoritesOnlyFilter ? "No pinned favorites yet. Click the star on any preset card to pin it." : "No presets found matching your filter or search query."}
                </div>
              ) : (
                filteredPresets.map((p, idx) => {
                  const isCurrent = characterName === p.charName;
                  const isFavorited = favoritePresets.includes(p.name);
                  return (
                    <div
                      key={p.name || idx}
                      onClick={() => applyPreset(p)}
                      className="p-3 rounded-xl border text-left cursor-pointer transition hover:scale-[1.01] flex flex-col justify-between group relative"
                      style={{
                        backgroundColor: isCurrent ? c.bg : (isFavorited ? c.card2 : c.card),
                        borderColor: isCurrent ? c.accent : (isFavorited ? c.borderStrong : c.border),
                        boxShadow: isFavorited ? `0 2px 10px ${c.shadow || 'rgba(0,0,0,0.12)'}` : "none"
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1 gap-1">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={(e) => toggleFavoritePreset(p.name, e)}
                              className={`p-1 -ml-1 rounded-md transition shrink-0 hover:scale-110 active:scale-95 ${
                                isFavorited 
                                  ? "text-amber-400" 
                                  : "text-neutral-500 hover:text-amber-400 opacity-60 hover:opacity-100"
                              }`}
                              title={isFavorited ? "Unpin archetype from top" : "Pin archetype to top (Favorite)"}
                              aria-label={isFavorited ? `Unpin ${p.name}` : `Pin ${p.name} to top`}
                            >
                              <Star className={`w-3.5 h-3.5 transition ${isFavorited ? "fill-amber-400 text-amber-400" : ""}`} />
                            </button>
                            <span className="text-xs font-bold truncate" style={{ color: c.text }}>{p.name}</span>
                          </div>
                          <span className="mono text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0" style={{ backgroundColor: c.bg2, color: c.muted }}>
                            {p.category}
                          </span>
                        </div>
                        <div className="text-[11px] font-medium mb-1 truncate flex items-center justify-between" style={{ color: c.accent }}>
                          <span className="truncate">{p.charClass}</span>
                          {isFavorited && (
                            <span className="mono text-[8px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 flex items-center gap-1 shrink-0 ml-1">
                              <span>★</span> PINNED
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] line-clamp-2 leading-relaxed" style={{ color: c.muted }}>
                          {p.lore}
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t flex items-center justify-between text-[10px] mono" style={{ borderColor: c.border }}>
                        <span className="truncate opacity-75">{p.style}</span>
                        <span className="font-bold underline group-hover:translate-x-0.5 transition" style={{ color: c.accent }}>
                          {isCurrent ? "Active ✓" : "Apply →"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

            <div>
              <label className="block mono text-[10px] uppercase font-semibold mb-1.5" style={{ color: c.muted }}>Character Name (Optional)</label>
              <input
                type="text"
                value={characterName}
                onChange={e => setCharacterName(e.target.value)}
                placeholder="e.g. Vaelin Ashborn"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: c.bg2, borderColor: c.border, color: c.text }}
              />
            </div>

            <div>
              <label className="block mono text-[10px] uppercase font-semibold mb-1.5" style={{ color: c.muted }}>Visual Codex Genre (10 Styles)</label>
              <select
                value={sheetStyle}
                onChange={e => {
                  const newStyle = canonicalizeSheetStyle(e.target.value);
                  setSheetStyle(newStyle);
                  setThemeId(themeIdForStyle(newStyle));
                  setSheetData((prev) => ({ ...prev, sheet_style: newStyle }));
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: c.bg2, borderColor: c.border, color: c.text }}
              >
                {CANONICAL_SHEET_STYLES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mono text-[10px] uppercase font-semibold mb-1.5" style={{ color: c.muted }}>Character Class / Archetype</label>
              <input
                type="text"
                value={characterClass}
                onChange={e => setCharacterClass(e.target.value)}
                placeholder="e.g. Gravebound Knight"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: c.bg2, borderColor: c.border, color: c.text }}
              />
            </div>

            <div>
              <label className="block mono text-[10px] uppercase font-semibold mb-1.5" style={{ color: c.muted }}>Level / Tier (1-30)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={characterLevel}
                onChange={e => setCharacterLevel(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: c.bg2, borderColor: c.border, color: c.text }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mono text-[10px] uppercase font-semibold mb-1.5" style={{ color: c.muted }}>Character Lore (2-3 sentences)</label>
              <textarea
                value={characterLore}
                onChange={e => setCharacterLore(e.target.value)}
                rows={2}
                placeholder="Describe origin, conflict, and oath..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
                style={{ backgroundColor: c.bg2, borderColor: c.border, color: c.text }}
              />
            </div>

            <div>
              <label className="block mono text-[10px] uppercase font-semibold mb-1.5" style={{ color: c.muted }}>Inventory Items (Comma separated)</label>
              <input
                type="text"
                value={inventoryItems}
                onChange={e => setInventoryItems(e.target.value)}
                placeholder="Sword, Shield, Potion, Relic..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: c.bg2, borderColor: c.border, color: c.text }}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSummon}
                disabled={loading}
                className="w-full h-10 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: c.accent, color: c.accentText }}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Summoning (Step {currentStep}/9)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Summon / Generate Sheet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dossier Header */}
      <div className="max-w-[1600px] mx-auto px-5 md:px-10 pt-8 pb-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-end border-b pb-10" style={{ borderColor: c.border }}>
          <div className="hero-cameo no-print">
            <div className="portrait-frame">
              <img src={portraitSrc} alt={`${sheetData.name} cameo`} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="mono text-[11px] tracking-[0.18em] uppercase mb-4 flex items-center gap-2" style={{ color: c.muted }}>
              <span className="w-8 h-px" style={{ background: c.border }} />
              Character Dossier • {currentTheme.name} Style
            </div>
            <input
              value={sheetData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Character Name"
              className="display text-[36px] md:text-[64px] leading-[0.9] tracking-[-0.03em] w-full placeholder:opacity-30 font-light min-w-0"
              style={{ fontFamily: currentTheme.fonts.display, color: c.text }}
            />
            <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-6">
              <div className="flex-1 min-w-0">
                <label className="block mono text-[10px] tracking-[0.15em] uppercase mb-1" style={{ color: c.muted }}>Title / Epithet</label>
                <input
                  value={sheetData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="w-full text-[18px] border-b pb-2 placeholder:opacity-30 transition min-w-0"
                  style={{ borderColor: c.border, color: c.text }}
                />
              </div>
              <div className="w-full sm:w-[180px] shrink-0">
                <label className="block mono text-[10px] tracking-[0.15em] uppercase mb-1" style={{ color: c.muted }}>Keeper / Player</label>
                <input
                  value={sheetData.player}
                  onChange={(e) => updateField("player", e.target.value)}
                  className="w-full text-[18px] border-b pb-2 placeholder:opacity-30 transition min-w-0"
                  style={{ borderColor: c.border, color: c.text }}
                />
              </div>
            </div>
          </div>

          <div className="md:text-right lg:max-w-[38ch]">
            <div className="inline-flex flex-col items-start md:items-end gap-2">
              <p className="text-[16px] md:text-[17px] leading-[1.5] font-light text-left md:text-right line-clamp-5" style={{ color: c.muted }}>
                {sheetData.lore.backstory}
              </p>
              <div className="flex gap-2 mono text-[9px]">
                <span className="px-2 py-1 rounded border" style={{ borderColor: c.borderStrong, color: c.accent }}>
                  {sheetData.overview.alignment}
                </span>
                <span className="px-2 py-1 rounded bg-black text-white/60">
                  {sheetData.overview.level}
                </span>
              </div>
            </div>
            <div className="mt-6 inline-flex gap-2 mono text-[10px]">
              <span className="px-3 py-1.5 rounded-full tracking-wide font-medium flex items-center gap-1.5" style={{ backgroundColor: c.accent, color: c.accentText }}>
                <Sparkles className="w-3 h-3" /> CANON VERIFIED
              </span>
              <span className="px-3 py-1.5 rounded-full border tracking-wide" style={{ borderColor: c.border, color: c.muted }}>
                {currentTheme.name.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Workspace with Sticky Sidebar Nav */}
      <div className="max-w-[1600px] mx-auto px-5 md:px-10 grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-6 lg:gap-10 pb-24">
        
        {/* Navigation Sidebar */}
        <aside className="no-print lg:sticky lg:top-[104px] self-start z-10">
          <div className="flex lg:flex-col gap-2 overflow-auto lg:overflow-visible -mx-5 px-5 lg:mx-0 lg:px-0 pb-3 no-scrollbar">
            {NAV_TABS.map((tab) => {
              let IconC = tab.icon;
              let isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className="group shrink-0 flex items-center gap-3 px-4 h-10 rounded-full lg:rounded-xl border text-left whitespace-nowrap transition"
                  style={{
                    backgroundColor: isSelected ? c.text : c.card,
                    color: isSelected ? c.bg : c.muted,
                    borderColor: isSelected ? c.text : c.border,
                    boxShadow: isSelected ? `0 6px 24px ${c.shadow}` : "none"
                  }}
                >
                  <IconC className="w-4 h-4" style={{ opacity: isSelected ? 1 : 0.6 }} />
                  <span className="text-[13px]" style={{ fontWeight: isSelected ? 600 : 400 }}>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:block mt-8 p-4 rounded-2xl border" style={{ backgroundColor: c.card, borderColor: c.border }}>
            <div className="mono text-[10px] tracking-[0.15em] uppercase mb-2 flex items-center gap-2" style={{ color: c.muted2 }}>
              <Terminal className="w-3 h-3" /> Quick Stat Reroll
            </div>
            <button
              onClick={handleRandomizeStats}
              className="w-full mt-2 py-2 px-3 rounded-lg border text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition"
              style={{ backgroundColor: c.bg2, borderColor: c.border, color: c.accent }}
            >
              <RefreshCw className="w-3 h-3" /> Reroll D20 Stats
            </button>
          </div>
        </aside>

        {/* Sections Workspace */}
        <main className="space-y-12 md:space-y-14 min-w-0">

          {/* Overview */}
          <section ref={(el) => { sectionRefs.current.overview = el; }} id="overview" className="sheet-page sheet-page--overview scroll-mt-[88px]">
            <SectionHeader k="01" title="Identity Dossier" subtitle="Lineage, allegiance, and public face" c={c} currentTheme={currentTheme} />
            <div className="overview-mosaic">
              {Object.entries({
                race: "Race / Lineage",
                age: "Age",
                gender: "Gender / Pronouns",
                alignment: "Alignment",
                classRole: "Class / Role",
                level: "Level / Tier",
                origin: "Origin",
                faction: "Faction / Order"
              }).map(([key, label]) => (
                <div key={key} className="overview-tile sheet-card border p-5 transition" style={{ backgroundColor: c.card, borderColor: c.border }}>
                  <div className="mono text-[10px] tracking-[0.14em] uppercase mb-3" style={{ color: c.muted }}>{label}</div>
                  <input
                    value={(sheetData.overview as any)[key]}
                    onChange={(e) => updateField(`overview.${key}`, e.target.value)}
                    className="w-full text-[16px] placeholder:opacity-30 border-b pb-1"
                    style={{ borderColor: c.border, color: c.text }}
                  />
                </div>
              ))}
              <div className="overview-quote sheet-card border" style={{ backgroundColor: c.card2, borderColor: c.borderStrong, color: c.text }}>
                <div className="mono text-[10px] tracking-[0.18em] uppercase mb-2" style={{ color: c.clash }}>Pull quote</div>
                <textarea
                  value={sheetData.personality.speech}
                  onChange={(e) => updateField("personality.speech", e.target.value)}
                  rows={2}
                  className="w-full bg-transparent resize-none leading-relaxed"
                  style={{ color: c.text }}
                />
              </div>
            </div>
          </section>

          {/* Physical */}
          <section ref={(el) => { sectionRefs.current.physical = el; }} id="physical" className="sheet-page sheet-page--physical scroll-mt-[88px]">
            <SectionHeader k="02" title="The Figure" subtitle="Cinematic silhouette — the sheet exists to frame this body" c={c} currentTheme={currentTheme} />
            <div className="hero-spread">
              <div className="portrait-stage space-y-3">
                <div className="flex items-center justify-between gap-2 px-1">
                  <span className="mono text-[9px] tracking-[0.18em] uppercase flex items-center gap-1.5" style={{ color: c.muted }}>
                    Hero portrait
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleRerollPortrait}
                      disabled={generatingImage}
                      className="mono text-[9px] px-2.5 py-1 rounded border transition hover:opacity-80 font-bold flex items-center gap-1 shadow-sm"
                      style={{ borderColor: c.borderStrong, color: c.accentText || '#000', backgroundColor: c.accent }}
                    >
                      <RefreshCw className={`w-3 h-3 ${generatingImage ? 'animate-spin' : ''}`} />
                      <span>Reroll Portrait</span>
                    </button>
                    <button
                      onClick={() => setShowImageEditor(true)}
                      className="mono text-[9px] px-2 py-0.5 rounded border transition hover:opacity-80"
                      style={{ borderColor: c.borderStrong, color: c.accent, backgroundColor: c.bg2 }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <div className="portrait-frame relative bg-black">
                  <img src={portraitSrc} alt="Hero Portrait" />
                  {generatingImage && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                      <span className="mono text-xs text-stone-200">Rendering 2K portrait...</span>
                    </div>
                  )}
                  {imageError && !generatingImage && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/75 px-3 py-2">
                      <p className="mono text-[10px] text-amber-200 leading-snug">{imageError}</p>
                    </div>
                  )}
                  {imageEngine && !generatingImage && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 border border-white/10">
                      <span className="mono text-[9px] text-amber-200">{imageEngine}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldBox label="Height" value={sheetData.physical.height} onChange={(v: string) => updateField("physical.height", v)} c={c} />
                  <FieldBox label="Weight" value={sheetData.physical.weight} onChange={(v: string) => updateField("physical.weight", v)} c={c} />
                </div>
              </div>

              <div className="trait-rail">
                {Object.entries({
                  build: "Build",
                  eyes: "Eyes",
                  hair: "Hair",
                  skin: "Skin",
                  marks: "Distinguishing Marks",
                  scars: "Scars / Tattoos",
                  clothing: "Clothing Style",
                  voice: "Voice",
                  posture: "Posture / Movement"
                }).map(([key, label]) => {
                  const isAiPrioritized = ["build", "eyes", "hair", "marks", "clothing"].includes(key);
                  return (
                    <div
                      key={key}
                      className="trait-chip sheet-card border relative"
                      style={{
                        backgroundColor: c.card,
                        borderColor: isAiPrioritized ? c.accent : c.border,
                        boxShadow: isAiPrioritized ? `0 0 20px ${c.accent}15` : undefined
                      }}
                    >
                      <div>
                        <div className="mono text-[10px] tracking-[0.14em] uppercase" style={{ color: c.muted }}>{label}</div>
                        {isAiPrioritized && (
                          <span className="mono text-[8px] mt-1 inline-block px-2 py-0.5 rounded-full font-bold tracking-wider" style={{ backgroundColor: c.accent, color: c.accentText || '#000' }}>
                            ANCHOR
                          </span>
                        )}
                      </div>
                      <textarea
                        value={(sheetData.physical as any)[key]}
                        onChange={(e) => updateField(`physical.${key}`, e.target.value)}
                        rows={2}
                        className="w-full text-[15px] leading-[1.45] resize-none placeholder:opacity-30 bg-transparent"
                        style={{ color: c.text }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Lore */}
          <section ref={(el) => { sectionRefs.current.lore = el; }} id="lore" className="sheet-page sheet-page--lore scroll-mt-[88px]">
            <SectionHeader k="03" title="Lore & Backstory" subtitle="A manuscript of origin, conflict, and oath" c={c} currentTheme={currentTheme} />
            <div className="lore-manuscript">
              <div className="lore-backstory sheet-card border" style={{ backgroundColor: c.card2, borderColor: c.borderStrong, color: c.text, boxShadow: `0 24px 70px ${c.shadow}` }}>
                <p className="lore-kicker mono text-[10px] tracking-[0.28em] uppercase mb-4" style={{ color: c.clash }}>Folio I · Recorded history</p>
                <TextAreaField label="Detailed Backstory" value={sheetData.lore.backstory} onChange={(v: string) => updateField("lore.backstory", v)} rows={10} c={c} />
              </div>
              <div className="lore-stack">
                <div className="sheet-card border p-5" style={{ backgroundColor: c.card, borderColor: c.border }}>
                  <TextAreaField label="Childhood" value={sheetData.lore.childhood} onChange={(v: string) => updateField("lore.childhood", v)} rows={3} c={c} />
                </div>
                <div className="sheet-card border p-5" style={{ backgroundColor: c.card, borderColor: c.border }}>
                  <TextAreaField label="Formative Events" value={sheetData.lore.formative} onChange={(v: string) => updateField("lore.formative", v)} rows={3} c={c} />
                </div>
              </div>
            </div>
            <div className="lore-footer">
              <div className="sheet-card border p-5" style={{ backgroundColor: c.card, borderColor: c.border }}>
                <TextAreaField label="Motivations" value={sheetData.lore.motivations} onChange={(v: string) => updateField("lore.motivations", v)} rows={3} c={c} />
              </div>
              <div className="sheet-card border p-5" style={{ backgroundColor: c.card, borderColor: c.border }}>
                <TextAreaField label="Secrets" value={sheetData.lore.secrets} onChange={(v: string) => updateField("lore.secrets", v)} rows={3} c={c} />
              </div>
              <div className="sheet-card border p-5" style={{ backgroundColor: c.card, borderColor: c.border }}>
                <TextAreaField label="World Context" value={sheetData.lore.world} onChange={(v: string) => updateField("lore.world", v)} rows={3} c={c} />
              </div>
            </div>
          </section>

          {/* Abilities */}
          <section ref={(el) => { sectionRefs.current.abilities = el; }} id="abilities" className="sheet-page sheet-page--abilities scroll-mt-[88px]">
            <SectionHeader k="04" title="Abilities & Skills" subtitle="Spell cards, proficiencies, and system mechanics" c={c} currentTheme={currentTheme} />
            <div className="ability-layout">
              <div className="ability-stack">
                {sheetData.abilities.map((ability, idx) => (
                  <div key={idx} className="ability-card sheet-card border" style={{ backgroundColor: c.card, borderColor: c.border }}>
                    <div className="ability-rail" aria-hidden="true" />
                    <div className="ability-body">
                      <div className="flex items-center justify-between mb-3">
                        <span className="mono text-[10px] tracking-[0.22em] uppercase" style={{ color: c.muted }}>Manifestation {String(idx + 1).padStart(2, "0")}</span>
                        <input
                          value={ability.type}
                          onChange={(e) => {
                            let ab = [...sheetData.abilities];
                            ab[idx] = { ...ab[idx], type: e.target.value };
                            updateField("abilities", ab);
                          }}
                          className="mono text-[10px] border rounded-full px-2.5 py-0.5"
                          style={{ backgroundColor: c.bg2, borderColor: c.border, color: c.accent }}
                        />
                      </div>
                      <input
                        value={ability.name}
                        onChange={(e) => {
                          let ab = [...sheetData.abilities];
                          ab[idx] = { ...ab[idx], name: e.target.value };
                          updateField("abilities", ab);
                        }}
                        className="w-full display text-[22px] mb-2 border-b pb-1"
                        style={{ fontFamily: currentTheme.fonts.display, borderColor: c.border, color: c.text }}
                      />
                      <textarea
                        value={ability.desc}
                        onChange={(e) => {
                          let ab = [...sheetData.abilities];
                          ab[idx] = { ...ab[idx], desc: e.target.value };
                          updateField("abilities", ab);
                        }}
                        rows={2}
                        className="w-full text-[14px] leading-[1.55] resize-none bg-transparent"
                        style={{ color: c.muted }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="skill-column">
                <div className="skill-panel sheet-card border" style={{ backgroundColor: c.card, borderColor: c.border }}>
                  <div className="mono text-[10px] tracking-[0.14em] uppercase mb-4 flex items-center gap-2" style={{ color: c.muted }}>
                    <ChartColumn className="w-3.5 h-3.5" /> Skill Proficiencies
                  </div>
                  <div className="space-y-4">
                    {sheetData.skills.map((sk, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-1">
                          <input
                            value={sk.name}
                            onChange={(e) => {
                              let sks = [...sheetData.skills];
                              sks[idx] = { ...sks[idx], name: e.target.value };
                              updateField("skills", sks);
                            }}
                            className="text-[13px] font-medium w-[160px] border-b pb-0.5"
                            style={{ borderColor: c.border, color: c.text }}
                          />
                          <span className="mono text-[11px]" style={{ color: c.accent }}>{sk.value}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={sk.value}
                          onChange={(e) => handleSkillChange(idx, Number(e.target.value))}
                          className="w-full h-1 mt-2"
                          style={{ accentColor: c.accent }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="skill-panel sheet-card border" style={{ backgroundColor: c.card2, borderColor: c.border }}>
                  <div className="mono text-[10px] tracking-[0.14em] uppercase mb-3" style={{ color: c.muted }}>System & Magic Rules</div>
                  <textarea
                    value={sheetData.magic}
                    onChange={(e) => updateField("magic", e.target.value)}
                    rows={4}
                    className="w-full text-[14px] leading-[1.6] resize-none bg-transparent"
                    style={{ color: c.text }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Equipment */}
          <section ref={(el) => { sectionRefs.current.equipment = el; }} id="equipment" className="sheet-page sheet-page--equipment scroll-mt-[88px]">
            <SectionHeader k="05" title="Equipment & Inventory Architecture" subtitle="Loadout slots — weapons, foci, armor, kits, and relics" c={c} currentTheme={currentTheme} />
            <div className="gear-grid">
              {[
                { k: "primaryWeapon", fallbackKey: "weapons", label: "Primary Weapons & Catalysts", icon: Sword, desc: "Main offensive arms, staves, or focus implements" },
                { k: "secondaryFocus", fallbackKey: "weapons", label: "Secondary Foci & Off-Hand", icon: Zap, desc: "Shields, spell foci, parrying daggers, or sidearms" },
                { k: "armor", fallbackKey: "armor", label: "Armor, Robes & Chassis", icon: Shield, desc: "Body protection, defensive apparel, or reinforced weave" },
                { k: "utilityTools", fallbackKey: "items", label: "Utility Tools & Field Kits", icon: Cog, desc: "Lockpicks, climbing gear, alchemical apparatus, or kits" },
                { k: "consumables", fallbackKey: "items", label: "Consumables & Elixirs", icon: Beaker, desc: "Potions, serums, rations, ammo, or field bandages" },
                { k: "relics", fallbackKey: "items", label: "Relics & Quest Artifacts", icon: Scroll, desc: "Attuned magical items, ancient sigils, or lore charms" },
                { k: "currency", fallbackKey: "currency", label: "Currency, Barter & Debts", icon: BookMarked, desc: "Coins, credits, soul gems, promissory notes, or debts" }
              ].map((item, i) => {
                let IconC = item.icon;
                const val = (sheetData.equipment as any)[item.k] || (item.fallbackKey ? (sheetData.equipment as any)[item.fallbackKey] : "") || "";
                return (
                  <div key={item.k} className="gear-slot sheet-card border p-5 flex flex-col justify-between" style={{ backgroundColor: c.card, borderColor: c.border }}>
                    <span className="slot-index" style={{ color: i % 2 === 0 ? c.accent : c.clash, fontFamily: currentTheme.fonts.display }}>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="flex items-center justify-between mb-1.5 pr-8">
                        <div className="flex items-center gap-2 mono text-[10px] tracking-[0.14em] uppercase font-bold" style={{ color: c.text }}>
                          <IconC className="w-3.5 h-3.5" style={{ color: c.accent }} /> {item.label}
                        </div>
                      </div>
                      <div className="mono text-[9px] mb-3" style={{ color: c.muted2 }}>{item.desc}</div>
                    </div>
                    <textarea
                      value={val}
                      onChange={(e) => updateField(`equipment.${item.k}`, e.target.value)}
                      rows={3}
                      className="w-full text-[14px] leading-[1.6] resize-none bg-transparent"
                      style={{ color: c.text }}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Personality */}
          <section ref={(el) => { sectionRefs.current.personality = el; }} id="personality" className="sheet-page sheet-page--personality scroll-mt-[88px]">
            <SectionHeader k="06" title="Personality & Psychology" subtitle="Sealed DNA traits, ideals, flaws, and mannerisms" c={c} currentTheme={currentTheme} />

            <div className="dna-banner sheet-card border p-5 mb-2" style={{ backgroundColor: c.card2, borderColor: c.border }}>
              <div className="mono text-[11px] tracking-[0.18em] uppercase font-bold flex items-center justify-between" style={{ color: c.accent }}>
                <span>10 Psychological DNA Traits</span>
                <span className="mono text-[9px] px-2 py-0.5 rounded border" style={{ borderColor: c.borderStrong, color: c.text }}>IMMUTABLE CANON</span>
              </div>
            </div>
            <div className="dna-grid">
              {[
                { k: "reputation", label: "Reputation", sub: "Public myth or infamy", icon: Award },
                { k: "vice", label: "Vice", sub: "Moral flaw / craving", icon: Flame },
                { k: "virtue", label: "Virtue", sub: "Unwavering principle", icon: Heart },
                { k: "fear", label: "Fear", sub: "Paralyzing primal terror", icon: Skull },
                { k: "obsession", label: "Obsession", sub: "Compulsive fixation", icon: Eye },
                { k: "tell", label: "Tell", sub: "Involuntary physical tic", icon: Zap },
                { k: "loyalty", label: "Loyalty", sub: "Sworn faction / mentor", icon: Bookmark },
                { k: "blindSpot", label: "Blind Spot", sub: "Perceptual blind spot", icon: EyeOff },
                { k: "survivalInstinct", label: "Survival Instinct", sub: "Reflex under mortal threat", icon: ShieldAlert },
                { k: "legacyFear", label: "Legacy Fear", sub: "Existential oblivion", icon: Moon }
              ].map((trait, i) => {
                const TraitIcon = trait.icon;
                const val = (sheetData as any).signatureAttributes?.[trait.k] || "";
                return (
                  <div key={trait.k} className="dna-seal sheet-card border p-3.5 transition" style={{ backgroundColor: c.card, borderColor: c.border }}>
                    <div className="dna-index" style={{ color: c.accent }}>{String(i + 1).padStart(2, "0")}</div>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <TraitIcon className="w-3.5 h-3.5 shrink-0" style={{ color: c.accent }} />
                      <div className="mono text-[10px] font-bold uppercase tracking-wider truncate" style={{ color: c.text }}>{trait.label}</div>
                    </div>
                    <div className="mono text-[8px] mb-2" style={{ color: c.muted2 }}>{trait.sub}</div>
                    <textarea
                      value={val}
                      onChange={e => updateField(`signatureAttributes.${trait.k}`, e.target.value)}
                      rows={2}
                      className="w-full text-[13px] leading-tight resize-none bg-transparent text-center"
                      style={{ color: c.text }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="persona-grid">
              {[
                { k: "traits", label: "Core Traits" },
                { k: "ideals", label: "Ideals & Axioms" },
                { k: "flaws", label: "Flaws & Fatal Errors" },
                { k: "fears", label: "Fears & Triggers" },
                { k: "mannerisms", label: "Mannerisms & Habits" },
                { k: "speech", label: "First-Person Quote & Voice" }
              ].map((item) => (
                <div key={item.k} className="sheet-card border p-5" style={{ backgroundColor: c.card, borderColor: c.border }}>
                  <div className="mono text-[10px] tracking-[0.14em] uppercase mb-3 font-semibold" style={{ color: c.muted }}>{item.label}</div>
                  <textarea
                    value={(sheetData.personality as any)[item.k]}
                    onChange={(e) => updateField(`personality.${item.k}`, e.target.value)}
                    rows={4}
                    className="w-full text-[14px] leading-[1.6] resize-none bg-transparent"
                    style={{ color: c.text }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Relationships */}
          <section ref={(el) => { sectionRefs.current.relationships = el; }} id="relationships" className="sheet-page sheet-page--relationships scroll-mt-[88px]">
            <SectionHeader k="07" title="Relationships & Bonds" subtitle="Case files for allies, rivals, mentors, and kin" c={c} currentTheme={currentTheme} />
            <div className="bond-grid">
              {[
                { k: "allies", label: "Allies & Companions", tab: "ALLY" },
                { k: "enemies", label: "Enemies & Rivals", tab: "RIVAL" },
                { k: "mentors", label: "Mentors & Patrons", tab: "PATRON" },
                { k: "family", label: "Family, Kin & Sworn Oaths", tab: "KIN" }
              ].map((item) => (
                <div key={item.k} className="bond-file sheet-card border p-5" style={{ backgroundColor: c.card, borderColor: c.border }}>
                  <span className="bond-tab mono" style={{ backgroundColor: c.accent, color: c.accentText }}>{item.tab}</span>
                  <div className="mono text-[10px] tracking-[0.14em] uppercase mb-3 font-semibold" style={{ color: c.muted }}>{item.label}</div>
                  <textarea
                    value={(sheetData.relationships as any)[item.k]}
                    onChange={(e) => updateField(`relationships.${item.k}`, e.target.value)}
                    rows={5}
                    className="w-full text-[14px] leading-[1.6] resize-none bg-transparent"
                    style={{ color: c.text }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section ref={(el) => { sectionRefs.current.stats = el; }} id="stats" className="sheet-page sheet-page--stats scroll-mt-[88px]">
            <SectionHeader k="08" title="Stats & Attributes" subtitle="Combat HUD, core attributes, and class resources" c={c} currentTheme={currentTheme} />
            <div className="stat-hud">

            {/* Derived Combat Matrix */}
            <div className="combat-orbs">
              {/* HP */}
              <div className="orb sheet-card border p-4 flex flex-col justify-between" style={{ backgroundColor: c.card, borderColor: c.border }}>
                <div className="mono text-[10px] uppercase tracking-wider mb-1 flex items-center justify-between" style={{ color: c.muted }}>
                  <span>Hit Points (HP)</span>
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div className="flex items-center justify-between gap-1 my-1">
                  <span className="display text-2xl font-bold" style={{ color: c.text }}>
                    {(sheetData as any).derivedStats?.hpCurrent ?? 74}
                  </span>
                  <span className="mono text-xs" style={{ color: c.muted2 }}>
                    / {(sheetData as any).derivedStats?.hpMax ?? 74}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Decrease hit points"
                      onClick={() => adjustDerivedResource("hpCurrent", "hpMax", -1, 74, 74)}
                      className="w-6 h-6 rounded border flex items-center justify-center font-bold text-xs hover:opacity-80"
                      style={{ borderColor: c.border, color: c.text, backgroundColor: c.bg2 }}
                    >-</button>
                    <button
                      type="button"
                      aria-label="Increase hit points"
                      onClick={() => adjustDerivedResource("hpCurrent", "hpMax", 1, 74, 74)}
                      className="w-6 h-6 rounded border flex items-center justify-center font-bold text-xs hover:opacity-80"
                      style={{ borderColor: c.border, color: c.text, backgroundColor: c.bg2 }}
                    >+</button>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: c.bg2 }}>
                  <div
                    className="h-full bg-rose-500 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(0, (((sheetData as any).derivedStats?.hpCurrent ?? 74) / Math.max(1, ((sheetData as any).derivedStats?.hpMax ?? 74))) * 100))}%`
                    }}
                  />
                </div>
              </div>

              {/* Armor Class */}
              <div className="orb sheet-card border p-4 flex flex-col justify-between" style={{ backgroundColor: c.card, borderColor: c.border }}>
                <div className="mono text-[10px] uppercase tracking-wider mb-1 flex items-center justify-between" style={{ color: c.muted }}>
                  <span>Armor Class (AC)</span>
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="display text-2xl font-bold my-1" style={{ color: c.text }}>
                  {(sheetData as any).derivedStats?.ac ?? 14}
                </div>
                <div className="mono text-[9px]" style={{ color: c.muted2 }}>Base Defensive Matrix</div>
              </div>

              {/* Initiative */}
              <div className="orb sheet-card border p-4 flex flex-col justify-between" style={{ backgroundColor: c.card, borderColor: c.border }}>
                <div className="mono text-[10px] uppercase tracking-wider mb-1 flex items-center justify-between" style={{ color: c.muted }}>
                  <span>Initiative</span>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="display text-2xl font-bold my-1" style={{ color: c.text }}>
                  {(sheetData as any).derivedStats?.initiative ?? "+1"}
                </div>
                <div className="mono text-[9px]" style={{ color: c.muted2 }}>Turn Order Modifier</div>
              </div>

              {/* Speed */}
              <div className="orb sheet-card border p-4 flex flex-col justify-between" style={{ backgroundColor: c.card, borderColor: c.border }}>
                <div className="mono text-[10px] uppercase tracking-wider mb-1 flex items-center justify-between" style={{ color: c.muted }}>
                  <span>Movement Speed</span>
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="display text-2xl font-bold my-1" style={{ color: c.text }}>
                  {(sheetData as any).derivedStats?.speed ?? "30 ft"}
                </div>
                <div className="mono text-[9px]" style={{ color: c.muted2 }}>Tactical Grid Velocity</div>
              </div>

              {/* Class Resource Tracker */}
              <div className="orb sheet-card border p-4 flex flex-col justify-between" style={{ backgroundColor: c.card, borderColor: c.border }}>
                <div className="mono text-[10px] uppercase tracking-wider mb-1 flex items-center justify-between" style={{ color: c.muted }}>
                  <span className="truncate">{(sheetData as any).derivedStats?.resourceName ?? "Class Resource"}</span>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: c.accent }} />
                </div>
                <div className="flex items-center justify-between gap-1 my-1">
                  <span className="display text-2xl font-bold" style={{ color: c.text }}>
                    {(sheetData as any).derivedStats?.resourceCurrent ?? 6}
                  </span>
                  <span className="mono text-xs" style={{ color: c.muted2 }}>
                    / {(sheetData as any).derivedStats?.resourceMax ?? 6}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Decrease class resource"
                      onClick={() => adjustDerivedResource("resourceCurrent", "resourceMax", -1, 6, 6)}
                      className="w-6 h-6 rounded border flex items-center justify-center font-bold text-xs hover:opacity-80"
                      style={{ borderColor: c.border, color: c.text, backgroundColor: c.bg2 }}
                    >-</button>
                    <button
                      type="button"
                      aria-label="Increase class resource"
                      onClick={() => adjustDerivedResource("resourceCurrent", "resourceMax", 1, 6, 6)}
                      className="w-6 h-6 rounded border flex items-center justify-center font-bold text-xs hover:opacity-80"
                      style={{ borderColor: c.border, color: c.text, backgroundColor: c.bg2 }}
                    >+</button>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: c.bg2 }}>
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      backgroundColor: c.accent,
                      width: `${Math.min(100, Math.max(0, (((sheetData as any).derivedStats?.resourceCurrent ?? 6) / Math.max(1, ((sheetData as any).derivedStats?.resourceMax ?? 6))) * 100))}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Archetype Baseline Radar Chart Comparison Overlay */}
            <StatsRadarComparison
              currentStats={sheetData.stats}
              activePresetName={activePresetName}
              allPresets={PRESETS}
              c={c}
              currentTheme={currentTheme}
              isOpen={showStatsRadarOverlay}
              onToggle={() => setShowStatsRadarOverlay(prev => !prev)}
              onApplyBaselineToSheet={handleApplyBaselineToSheet}
            />

            <div className="attr-grid">
              {sheetData.stats.map((st, idx) => (
                <div key={st.key} className="attr-cell sheet-card border p-5 relative overflow-hidden group" style={{ backgroundColor: c.card, borderColor: c.border }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="mono text-[10px] tracking-[0.2em] uppercase" style={{ color: c.muted }}>{st.key}</div>
                      <div className="display text-[22px] tracking-tight" style={{ fontFamily: currentTheme.fonts.display }}>{st.label}</div>
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={st.value}
                      onChange={(e) => handleStatChange(idx, Number(e.target.value))}
                      className="w-14 h-10 rounded-full border text-center mono text-[16px] font-medium"
                      style={{ backgroundColor: c.bg2, borderColor: c.border, color: c.text }}
                    />
                  </div>
                  <div className="h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: c.bg2 }}>
                    <div className="h-full transition-all duration-500" style={{ width: `${(st.value / 24) * 100}%`, backgroundColor: c.text }} />
                  </div>
                  <div className="flex justify-between mono text-[10px]" style={{ color: c.muted2 }}>
                    <span>1</span>
                    <span>Mod: {Math.floor((st.value - 10) / 2) >= 0 ? `+${Math.floor((st.value - 10) / 2)}` : Math.floor((st.value - 10) / 2)}</span>
                    <span>24</span>
                  </div>
                  <input
                    value={st.desc}
                    onChange={(e) => {
                      let stats = [...sheetData.stats];
                      stats[idx] = { ...stats[idx], desc: e.target.value };
                      updateField("stats", stats);
                    }}
                    className="mt-3 w-full text-[12px] placeholder:opacity-30 bg-transparent border-b pb-1"
                    style={{ borderColor: c.border, color: c.muted }}
                  />
                </div>
              ))}
            </div>

            {/* Passive Skills and Class Specialization */}
            {((sheetData as any).derivedStats?.passives || []).length > 0 && (
              <div className="sheet-card border p-5" style={{ backgroundColor: c.card, borderColor: c.border }}>
                <div className="mono text-[10px] tracking-[0.14em] uppercase font-bold mb-3 flex items-center gap-2" style={{ color: c.accent }}>
                  <Award className="w-4 h-4" /> PASSIVE SKILLS & SPECIALIZATIONS
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  {((sheetData as any).derivedStats?.passives || []).map((p: string, i: number) => (
                    <div key={i} className="rounded-xl border p-3 mono text-xs leading-relaxed" style={{ backgroundColor: c.bg2, borderColor: c.border, color: c.text }}>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          </section>

        </main>
      </div>

      {/* Footer */}
      <footer className="pt-10 pb-12 border-t text-center mono text-[11px] tracking-wider" style={{ borderColor: c.border, color: c.muted2 }}>
        WORLDVISION SUMMONS ENGINE • RUNNING WITH PRISMA PERSISTENCE & GEMINI AI
      </footer>
      </div>

      {showImageEditor && (
        <ImageEditorModal
          imageUrl={portraitSrc}
          characterName={sheetData.name}
          sheetStyle={canonicalizeSheetStyle((sheetData as UiSheetData).sheet_style || sheetStyle)}
          onClose={() => setShowImageEditor(false)}
          onSave={(newUrl) => setImageUrl(newUrl)}
          onGenerateSimilar={async (customPrompt, refImage) => {
            const style = canonicalizeSheetStyle((sheetData as UiSheetData).sheet_style || sheetStyle);
            const promptText = customPrompt
              ? `${compilePortraitPrompt(portraitPromptContext(sheetData as UiSheetData), style)} Additional direction: ${customPrompt}`
              : compilePortraitPrompt(portraitPromptContext(sheetData as UiSheetData), style);
            await generatePortraitImage(promptText, style, refImage || undefined, sheetData as UiSheetData);
          }}
        />
      )}

      {showChatModal && (
        <GeminiChatModal
          onClose={() => setShowChatModal(false)}
          characterContext={{
            ...sheetData,
            imageUrl: portraitSrc,
            character_name: sheetData.name,
            character_class: sheetData.overview.classRole,
            character_lore: sheetData.lore.backstory,
            signature_attributes: (sheetData as UiSheetData).signatureAttributes,
          }}
        />
      )}

      {showPlate && (
        <div className="no-print fixed inset-0 z-[70] overflow-auto p-4" style={{ backgroundColor: "#211813" }}>
          <div className="mx-auto max-w-[1100px]">
            <button
              type="button"
              onClick={() => setShowPlate(false)}
              className="mb-3 min-h-[44px] min-w-[44px] px-4 rounded-full border"
              style={{ color: "#F2E7CF", borderColor: "#B37B3D", background: "transparent" }}
            >
              Close plate
            </button>
            <CodexFinalizer
              sheet={sheetData as UiSheetData}
              portraitUrl={imageUrl}
              characterId={activeCodexId}
              onEditSection={() => setShowPlate(false)}
            />
          </div>
        </div>
      )}

      <CharacterCodex
        open={showCodex}
        onClose={() => setShowCodex(false)}
        entries={codexEntries}
        activeId={activeCodexId}
        c={c}
        fonts={currentTheme.fonts}
        onSaveCurrent={() => persistToCodex(false)}
        onSaveAsNew={() => persistToCodex(true)}
        onLoad={loadFromCodex}
        onDelete={(id) => {
          const next = deleteCodexEntry(id);
          setCodexEntries(next);
          if (activeCodexId === id) setActiveCodexId(null);
        }}
        onDuplicate={(id) => {
          const { entries, entry } = duplicateCodexEntry(id);
          setCodexEntries(entries);
          if (entry) setSheetsStatusMsg(`Duplicated ${entry.name} in the Codex.`);
        }}
      />

      <DiceTray
        sheet={sheetData as UiSheetData}
        open={showDiceTray}
        onToggle={() => setShowDiceTray((v) => !v)}
        c={c}
        fonts={currentTheme.fonts}
      />
    </div>
  );
}

function SectionHeader({ k, title, subtitle, c, currentTheme }: { k: string; title: string; subtitle: string; c: any; currentTheme: any }) {
  return (
    <div className="section-kicker">
      <span className="mono text-[11px] tracking-[0.18em] border px-2.5 py-1 rounded-full" style={{ color: c.clashText, borderColor: c.clash, backgroundColor: c.clash }}>
        {k}
      </span>
      <h2 className="display text-[28px] md:text-[32px] tracking-[-0.02em] font-light" style={{ fontFamily: currentTheme.fonts.display, color: c.text }}>
        {title}
      </h2>
      <span className="hidden md:inline mono text-[11px] tracking-wide" style={{ color: c.muted2 }}>— {subtitle}</span>
    </div>
  );
}

function FieldBox({ label, value, onChange, c }: { label: string; value: string; onChange: any; c: any }) {
  return (
    <div className="rounded-[12px] border p-3" style={{ backgroundColor: c.bg2, borderColor: c.border }}>
      <div className="mono text-[9px] uppercase tracking-wide mb-1" style={{ color: c.muted2 }}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[13px] placeholder:opacity-30 bg-transparent"
        style={{ color: c.text }}
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, rows, c }: { label: string; value: string; onChange: any; rows: number; c: any }) {
  return (
    <div>
      <div className="mono text-[10px] tracking-[0.14em] uppercase opacity-60 mb-2" style={{ color: c.muted }}>{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full text-[15px] leading-[1.6] placeholder:opacity-30 resize-none bg-transparent border rounded-lg p-3"
        style={{ borderColor: c.border, color: c.text }}
      />
    </div>
  );
}
