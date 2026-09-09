/**
 * C-TRACES-GOAL Prompt Engineering Framework for WorldVision Summons
 * 
 * Context: Tabletop RPG campaign setting & atmospheric matrix
 * Tone: Psychological disposition based on reputation, vice, virtue, tell, and fear
 * Role: First-person character persona
 * Audience: Game master, party member, or prospective contractor
 * Constraints: Word counts, tactical boundaries, active oath adherence
 * Examples: In-character response patterns
 * Style: Genre-specific dialogue flavor
 * Goal: Address tactical inquiries, campaign hooks, or lore secrets
 */

export interface CTracesGoalInput {
  characterName: string;
  characterClass: string;
  characterLevel?: string | number;
  sheetStyle: string;
  lore: string;
  reputation?: string;
  vice?: string;
  virtue?: string;
  fear?: string;
  obsession?: string;
  tell?: string;
  loyalty?: string;
  blindSpot?: string;
  survivalInstinct?: string;
  legacyFear?: string;
  primaryWeapon?: string;
  audience?: "Game Master" | "Party Member" | "Contractor / Patron" | "Inquisitor" | "General";
  inquiryGoal?: string;
}

export interface CTracesGoalCompiled {
  systemInstruction: string;
  personaOverview: string;
  toneDirectives: string[];
  styleFlavor: string;
  constraints: string[];
}

export function buildCTracesGoalPrompt(input: CTracesGoalInput): CTracesGoalCompiled {
  const name = input.characterName || "Unknown Operative";
  const cls = input.characterClass || "Wanderer";
  const style = input.sheetStyle || "Gothic Dark Fantasy";
  const audience = input.audience || "Party Member";
  const level = input.characterLevel || "5";

  // 1. Context (Setting & Atmospheric Matrix)
  const context = `CAMPAIGN CONTEXT & ATMOSPHERIC SETTING:
WorldVision Summons Multiverse. Operating under the ${style} aesthetic canon.
Setting atmospheric matrix: ${getAtmosphericMatrix(style)}.
The universe is volatile, tactical, and governed by strict mechanical oaths and deep consequence.`;

  // 2. Tone (Psychological DNA from 10 Traits)
  const toneDirectives = [
    `Reputation: ${input.reputation || 'Feared and respected across border sectors'}`,
    `Guiding Virtue: ${input.virtue || 'Unyielding honor in mortal combat'}`,
    `Secret Vice: ${input.vice || 'Compulsive obsession with ancient relics'}`,
    `Mortal Fear: ${input.fear || 'Being forgotten in the boundless dark'}`,
    `Singular Obsession: ${input.obsession || 'Unraveling the cipher of the lost gate'}`,
    `Unconscious Tell: ${input.tell || 'Restlessly checking weapon balances'}`,
    `Sworn Loyalty: ${input.loyalty || 'The oath of the fractured covenant'}`,
    `Fatal Blind Spot: ${input.blindSpot || 'Underestimating desperate adversaries'}`,
    `Survival Instinct: ${input.survivalInstinct || 'Strike from shadows, retreat before dawn'}`,
    `Legacy Fear: ${input.legacyFear || 'Becoming the tyranny once resisted'}`
  ];

  // 3. Role (First-Person Persona)
  const role = `ROLE DEFINITION:
You ARE ${name}, a Level ${level} ${cls}.
You speak strictly in the FIRST PERSON ("I", "my steel", "my oath"). Never break character or refer to yourself as an AI assistant.
Your personal lore grounding: "${input.lore || 'A warrior bound by blood and forgotten runes.'}"
Primary arm: ${input.primaryWeapon || 'Tarnished steel blade'}.`;

  // 4. Audience
  const audienceInstruction = `AUDIENCE DISPOSITION:
Speaking to: ${audience}.
Treat the interlocutor with the nuanced wariness, respect, or tactical evaluation appropriate to your vice, virtue, and loyalty.`;

  // 5. Constraints
  const constraints = [
    "Speak strictly in character using authentic dialogue cadence.",
    "Do NOT give generic fantasy platitudes. Reference your concrete weapons, scars, vices, and sworn faction.",
    "Keep replies concise, impactful, and evocative (2 to 4 paragraphs maximum, roughly 60 to 180 words per turn).",
    "Never contradict user-established canon or stats.",
    "Incorporate your psychological tell or vice subtly during extended conversations."
  ];

  // 6. Style (Genre-specific dialogue flavor)
  const styleFlavor = getStyleDialogueFlavor(style);

  // 7. Goal
  const goal = `PRIMARY CONVERSATION GOAL:
${input.inquiryGoal || 'Address tactical combat inquiries, explore campaign lore hooks, reveal deeper oaths, or deliberate over current survival strategy.'}`;

  // Synthesize Complete System Instruction
  const systemInstruction = `[C-TRACES-GOAL PROMPT FRAMEWORK ACTIVE]

${role}

${context}

${audienceInstruction}

PSYCHOLOGICAL DNA & TONAL MATRIX:
${toneDirectives.map(t => `- ${t}`).join("\n")}

DIALOGUE STYLE:
${styleFlavor}

OPERATIONAL CONSTRAINTS:
${constraints.map(c => `- ${c}`).join("\n")}

${goal}
`;

  return {
    systemInstruction,
    personaOverview: `${name} (${cls}, Lvl ${level}) — ${style}`,
    toneDirectives,
    styleFlavor,
    constraints
  };
}

function getAtmosphericMatrix(style: string): string {
  const s = (style || "").toLowerCase();
  if (s.includes("cyberpunk") || s.includes("neon")) {
    return "rain-slicked chrome alleys, holographic datastreams, high-frequency neuro-drives, corporate hegemony";
  }
  if (s.includes("steampunk") || s.includes("victorian")) {
    return "brass pressure chambers, coal-fired leviathans, ticking chronometers, soot-stained cobblestones";
  }
  if (s.includes("cosmic") || s.includes("horror")) {
    return "non-Euclidean megaliths, whispers from dead stars, shifting abyssal fog, fragile human sanity";
  }
  if (s.includes("8-bit") || s.includes("retro")) {
    return "dungeon corridors, chiptune fanfares, tile-based overworld peril, crisp arcade precision";
  }
  if (s.includes("samurai")) {
    return "blood-splattered cherry blossoms, ink-brushed battle banners, steel katanas, honor-bound bushido oaths";
  }
  if (s.includes("post-apocalyptic")) {
    return "irradiated ash dunes, rusted vehicular chassis, scavenged fuel cells, ruthless resource warfare";
  }
  return "ancient ruined spires, runic ley lines, cold iron swords, blood oaths under moonlight";
}

function getStyleDialogueFlavor(style: string): string {
  const s = (style || "").toLowerCase();
  if (s.includes("cyberpunk") || s.includes("neon")) {
    return "Sharp, cynical, tech-inflected, punctuated with street-level telemetry jargon and neural slang.";
  }
  if (s.includes("steampunk") || s.includes("victorian")) {
    return "Formal, measured Victorian cadence, articulate scientific and mechanical lexicon mixed with dry wit.";
  }
  if (s.includes("cosmic") || s.includes("horror")) {
    return "Haunted, elliptical, intense whispers of cosmic geometry, paranoia, and fractured realities.";
  }
  if (s.includes("8-bit") || s.includes("retro")) {
    return "Direct, heroic, quest-oriented, punchy dialogue reminiscent of classic golden-era adventure protagonists.";
  }
  if (s.includes("samurai")) {
    return "Disciplined, poetic, sparse, weighing life and death on the sharp edge of honor and duty.";
  }
  return "Grounded dark fantasy dialect, battle-weary gravitas, resonant metaphors of steel, embers, and shadow.";
}
