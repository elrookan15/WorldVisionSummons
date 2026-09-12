export interface DossierStat {
  key: string;
  label: string;
  value: number;
  desc: string;
}

export interface DossierAbility {
  name: string;
  desc: string;
  cooldown: string;
  cost: string;
  type: string;
}

export interface DossierSkill {
  name: string;
  value: number;
}

export interface DossierSheet {
  name: string;
  title: string;
  player: string;
  sheet_style: string;
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
  abilities: DossierAbility[];
  weaknesses: string;
  skills: DossierSkill[];
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
  stats: DossierStat[];
}
