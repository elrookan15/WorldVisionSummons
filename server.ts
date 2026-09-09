import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google Gen AI client safely
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// Procedural fallback generator for robust character generation when API key is missing or rate limited
function generateFallbackSheet(params: {
  character_name?: string;
  character_class?: string;
  character_lore?: string;
  inventory_items?: string;
  sheet_style: string;
  character_level?: string | number;
}) {
  const style = params.sheet_style || "Gothic Dark Fantasy";
  const name = params.character_name?.trim() || 
    (style.includes("Cyberpunk") ? "Vex Iron-Sleeve" : 
     style.includes("Steampunk") ? "Cornelius Brasswood" : 
     style.includes("8-Bit") ? "Sir Pixelton" : "Valerius Ashborn");
  
  const charClass = params.character_class?.trim() || 
    (style.includes("Cyberpunk") ? "Netrunner Blade-Courier" : 
     style.includes("Steampunk") ? "Aethercoil Artificer" : 
     style.includes("8-Bit") ? "8-Bit Retro Paladin" : "Gravebound Knight");

  const lore = params.character_lore?.trim() || 
    `Born in the ashes of the fractured veil, ${name} took an unbreakable oath to protect the remaining sanctuaries. Bearing the scars of the great rupture, they walk the borderlands seeking redemption and the truth behind the corrupted glyphs. Their resolve is as unyielding as the armor upon their back.`;

  const rawItems = params.inventory_items?.trim() || 
    "Runebound Broadsword,Tarnished Iron Shield,Vial of Starlight Tears,Magitech Compass,Engraved Leather Journal,Spare Aether Cells,Shattered Amulet Fragment,Worn Traveling Cloak";
  const itemsList = rawItems.split(",").map(i => i.trim()).filter(Boolean);
  while (itemsList.length < 8) {
    itemsList.push(`Relic of the ${style} Era #${itemsList.length + 1}`);
  }

  const levelNum = parseInt(String(params.character_level)) || 5;

  return {
    character_data: {
      character_name: name,
      character_class: charClass,
      character_lore: lore,
      inventory_items: itemsList.join(", "),
      sheet_style: style,
      physical_attributes: {
        height: style.includes("Cyberpunk") ? "5'10\"" : "6'2\"",
        weight: style.includes("Cyberpunk") ? "165 lbs" : "210 lbs",
        build: style.includes("Cyberpunk") ? "Wiry and augmented" : "Imposing and armored",
        distinguishing_feature: "Fading ritual scar across the left ocular ridge"
      }
    },
    signature_attributes: {
      reputation: "Whispered name among desperate outcasts",
      vice: "Compulsive obsession with old debts",
      virtue: "Unflinching loyalty in mortal peril",
      fear: "Dying forgotten in the void",
      obsession: "Recovering the lost cipher keys",
      tell: "Tapping fingers against weapon hilt",
      loyalty: "The fallen order of the crimson spire",
      blind_spot: "Underestimating deceitful patrons",
      survival_instinct: "Strike first and vanish into shadows",
      legacy_fear: "Becoming the monster they hunted"
    },
    rpg_stats: {
      core_attributes: { str: 14 + Math.floor(levelNum / 3), dex: 14, con: 14 + Math.floor(levelNum / 4), int: 12, wis: 13, cha: 12 },
      derived_stats: { hp: 40 + levelNum * 10, ac: 14 + Math.floor(levelNum / 3), initiative: "+3", speed: "30 ft", level: levelNum },
      class_resource: { resource_type: "Grit Points", current_max: `${levelNum * 4} / ${levelNum * 4}` },
      alignment_or_faction: "True Neutral / Order of the Fractured Veil",
      passive_skills: ["Perception +6", "Athletics +7", "Lore & Cryptography +5"]
    },
    personal_quote: {
      text: `"The veil may bleed, but while steel holds and breath remains, the dark shall pay toll."`,
      attribution: `— ${name}, ${charClass}`,
      tone_selected: "Epic"
    },
    visual_prompts: {
      step_2_hero_portrait: `Full-body cinematic character illustration of ${name}, a ${charClass}, set in ${style} aesthetic. Dramatic chiaroscuro lighting, intricate costume detail, highly detailed painterly masterpiece.`,
      step_5_inventory_grid: `Top-down flat-lay inventory grid for ${name}, featuring ${itemsList.slice(0, 8).join(", ")}. Clean slots, matching ${style} theme.`,
      step_6_map_thumbnail: `Top-down tactical region map thumbnail for ${name}'s campaign in ${style} style, showing ruined citadels and ley lines.`,
      step_8_composition_blueprint: {
        left_panel: `Cinematic full-body portrait of ${name}`,
        right_detail_panels: ["Helmet and facial visor close-up", "Pauldron and breastplate etching", "Primary weapon mechanism"],
        lower_middle_grid: `8-slot inventory grid containing ${itemsList.slice(0, 8).join(", ")}`,
        footer_thumbnails: ["Origin ritual at the crimson spire", "Clash in the neon/ash storm", "The final oath"],
        border_and_ui_style: `${style} ornamented tactical borders with runic headers`
      }
    }
  };
}

// API endpoint to generate character sheet
app.post("/api/generate-sheet", async (req, res) => {
  try {
    const { character_name, character_class, character_lore, inventory_items, sheet_style, character_level, high_thinking } = req.body;
    const style = sheet_style || "Gothic Dark Fantasy";

    const ai = getAiClient();
    if (!ai) {
      console.log("No GEMINI_API_KEY found. Using procedural fallback generator.");
      const fallbackResult = generateFallbackSheet({ character_name, character_class, character_lore, inventory_items, sheet_style: style, character_level });
      return res.json(fallbackResult);
    }

    const prompt = `You are the WORLDVISION SUMMONS Generation Engine, operating under Federov's architectural oversight. 
Generate a complete RPG character sheet JSON payload based on these parameters:
- Character Name: ${character_name || "(Inquire/Infer)"}
- Character Class: ${character_class || "(Inquire/Infer)"}
- Character Lore: ${character_lore || "(Inquire/Infer 2-3 sentences)"}
- Inventory Items: ${inventory_items || "(Inquire/Infer 8-12 items)"}
- Sheet Style: ${style}
- Character Level / Tier: ${character_level || "5 (Standard)"}

You MUST output ONLY valid JSON matching this exact structure with no extra markdown blocks or conversational text:
{
  "character_data": {
    "character_name": "string",
    "character_class": "string",
    "character_lore": "string (2-3 sentences)",
    "inventory_items": "string (comma-separated 8-12 items)",
    "sheet_style": "${style}",
    "physical_attributes": {
      "height": "string (X'X\")",
      "weight": "string (XXX lbs)",
      "build": "string",
      "distinguishing_feature": "string"
    }
  },
  "signature_attributes": {
    "reputation": "string (1-6 words)",
    "vice": "string (1-6 words)",
    "virtue": "string (1-6 words)",
    "fear": "string (1-6 words)",
    "obsession": "string (1-6 words)",
    "tell": "string (1-6 words)",
    "loyalty": "string (1-6 words)",
    "blind_spot": "string (1-6 words)",
    "survival_instinct": "string (1-6 words)",
    "legacy_fear": "string (1-6 words)"
  },
  "rpg_stats": {
    "core_attributes": {
      "str": 15, "dex": 12, "con": 14, "int": 10, "wis": 13, "cha": 11
    },
    "derived_stats": {
      "hp": 75, "ac": 16, "initiative": "+1", "speed": "30 ft", "level": 5
    },
    "class_resource": {
      "resource_type": "Mana / Grit / Energy",
      "current_max": "20 / 20"
    },
    "alignment_or_faction": "string",
    "passive_skills": [
      "Skill Name +X",
      "Skill Name +X",
      "Skill Name +X"
    ]
  },
  "personal_quote": {
    "text": "string (4-30 words in quotation marks)",
    "attribution": "— [character_name], [character_class]",
    "tone_selected": "string"
  },
  "visual_prompts": {
    "step_2_hero_portrait": "string",
    "step_5_inventory_grid": "string",
    "step_6_map_thumbnail": "string",
    "step_8_composition_blueprint": {
      "left_panel": "string",
      "right_detail_panels": ["string", "string", "string"],
      "lower_middle_grid": "string",
      "footer_thumbnails": ["string", "string", "string"],
      "border_and_ui_style": "string"
    }
  }
}`;

    const modelName = "models/gemini-3.5-flash";
    const config: any = {};
    if (high_thinking) {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH
      };
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        ...config,
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "";
    // Clean markdown code blocks if any
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonStart = cleanText.indexOf("{");
    const jsonEnd = cleanText.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonString = cleanText.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonString);
      return res.json(parsed);
    } else {
      throw new Error("Failed to parse JSON from Gemini response");
    }
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    // Fall back gracefully
    const fallbackResult = generateFallbackSheet(req.body);
    return res.json({
      ...fallbackResult,
      _warning: "Fell back to procedural generator due to API error: " + (error.message || "Unknown error")
    });
  }
});

// Unified Image Handler for /api/generate-image and /api/summons/image
const handleImageGeneration = async (req: express.Request, res: express.Response) => {
  try {
    const { prompt, style, characterContext, aspectRatio, outputMimeType, referenceImage } = req.body;
    const ai = getAiClient();
    
    const sheetStyle = style || characterContext?.sheet_style || 'Gothic Dark Fantasy';
    const charName = characterContext?.character_name || characterContext?.name || 'Hero';
    const charClass = characterContext?.character_class || characterContext?.overview?.classRole || 'Adventurer';

    let atmosphericTokens = "masterwork character portrait illustration, highly detailed 8k resolution, cinematic lighting, rich textures, volumetric atmosphere, character consistency, sharp focus";
    if (referenceImage) {
      atmosphericTokens += ", incorporating composition and style guidance from uploaded reference image";
    }
    if (sheetStyle.toLowerCase().includes("gothic") || sheetStyle.toLowerCase().includes("dark fantasy")) {
      atmosphericTokens += ", chiaroscuro lighting, desaturated oxblood and charcoal palette, heavy oil brushstrokes, haunting atmospheric depth";
    } else if (sheetStyle.toLowerCase().includes("cyberpunk") || sheetStyle.toLowerCase().includes("neon")) {
      atmosphericTokens += ", neon grid illumination, cybernetic ossuaries, cyan and magenta rim lighting, tactical sci-fi aesthetic";
    } else if (sheetStyle.toLowerCase().includes("comic") || sheetStyle.toLowerCase().includes("retro")) {
      atmosphericTokens += ", dynamic sequential art style, bold ink lines, graphic cel-shading, vibrant high-contrast chromatic inks";
    } else if (sheetStyle.toLowerCase().includes("cosmic") || sheetStyle.toLowerCase().includes("horror")) {
      atmosphericTokens += ", non-Euclidean geometry, ethereal void starlight, abyssal deep tones, eldritch whispers in shadows";
    } else {
      atmosphericTokens += ", majestic archival illumination, intricate gold filigree, epic noble composition";
    }

    // Enhance prompt with Nano Banana portrait synthesis styling & character metadata
    const nanoBananaEnhancedPrompt = `[Nano Banana Engine | Style: ${sheetStyle} | Subject: ${charName}, ${charClass}]: ${prompt}, ${atmosphericTokens}`;

    const getFallbackImageForStyle = (st: string) => {
      const lower = (st || '').toLowerCase();
      if (lower.includes('cyberpunk') || lower.includes('neon')) {
        return "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80";
      } else if (lower.includes('steampunk') || lower.includes('victorian')) {
        return "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80";
      } else if (lower.includes('cosmic') || lower.includes('horror')) {
        return "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80";
      } else if (lower.includes('samurai')) {
        return "https://images.unsplash.com/photo-1528164344705-475426879c0d?w=800&auto=format&fit=crop&q=80";
      } else {
        return "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80";
      }
    };

    if (!ai) {
      return res.json({ 
        imageUrl: getFallbackImageForStyle(sheetStyle), 
        prompt: nanoBananaEnhancedPrompt, 
        engine: "Nano Banana Fallback" 
      });
    }
    
    // Try generating image with Nano Banana / Imagen model
    try {
      const response = await ai.models.generateImages({
        model: 'models/imagen-3.0-generate-002',
        prompt: nanoBananaEnhancedPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: outputMimeType || 'image/jpeg',
          aspectRatio: aspectRatio || '3:4',
        },
      });
      const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
      if (base64Image) {
        return res.json({ imageUrl: `data:image/jpeg;base64,${base64Image}`, prompt: nanoBananaEnhancedPrompt, engine: "Nano Banana AI" });
      }
    } catch (imgErr) {
      // Vertex AI / Imagen not available on standard consumer keys; use style-matched high-end concept art fallback
    }

    return res.json({ imageUrl: getFallbackImageForStyle(sheetStyle), prompt: nanoBananaEnhancedPrompt, engine: "Nano Banana Fallback" });
  } catch (error: any) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: error.message });
  }
};

app.post("/api/generate-image", handleImageGeneration);
app.post("/api/summons/image", handleImageGeneration);

// Deterministic Persona Dialogue Generator for offline/unkeyed environments
function generateFallbackPersonaReply(params: {
  lastUserMessage: string;
  charName: string;
  charClass: string;
  sheetStyle: string;
  lore: string;
  signature?: any;
}) {
  const { lastUserMessage, charName, charClass, sheetStyle, lore, signature } = params;
  const lowerMsg = (lastUserMessage || "").toLowerCase();
  const vice = signature?.vice || "an old debt that will not stay buried";
  const virtue = signature?.virtue || "an unyielding oath of quiet protection";
  const fear = signature?.fear || "that the dark will swallow the memory of our deeds";
  const tell = signature?.tell || "checking the balance of the blade";

  if (lowerMsg.includes("oath") || lowerMsg.includes("vow")) {
    return `My oath is not spoken lightly. In the realm of ${sheetStyle}, oaths are cut into the bone. As a ${charClass}, I swore that ${lore ? lore.slice(0, 80) + "..." : "none under my charge shall fall without retribution"}. My guiding virtue—${virtue}—demands that I stand firm, whatever the cost.`;
  }
  if (lowerMsg.includes("ambush") || lowerMsg.includes("tactic") || lowerMsg.includes("combat") || lowerMsg.includes("attack")) {
    return `An ambush in these sectors is resolved in the first three heartbeats. Notice how I keep ${tell} when the shadows lengthen? I do not fight to display glory—I strike where the armor joints are thinnest and hold the breach until the line is secure. Keep your flank covered and watch my signal.`;
  }
  if (lowerMsg.includes("vice") || lowerMsg.includes("flaw") || lowerMsg.includes("weakness")) {
    return `You ask of my vice? Every wanderer carries their poison. For me, it is ${vice}. When the bells toll, it gnaws at my resolve, but it also reminds me that I am still mortal. Do not mistake a known flaw for a broken shield.`;
  }
  if (lowerMsg.includes("relic") || lowerMsg.includes("pack") || lowerMsg.includes("inventory") || lowerMsg.includes("gear") || lowerMsg.includes("weapon")) {
    return `Every token in my pack was paid for in blood and long vigils. The steel I carry was tempered against the bitter dark, and the relics answer only when treated with due reverence. Speak gently of what you do not yet understand.`;
  }
  if (lowerMsg.includes("fear") || lowerMsg.includes("terror")) {
    return `To fear nothing is to invite ruin. My deepest terror is ${fear}. Yet it is that exact dread that sharpens my senses and keeps my blade unyielding when the night turns cold.`;
  }

  return `I hear your words. As ${charName}, ${charClass} of the ${sheetStyle} borderlands, my path is bound to this road. You ask a question that weighs heavy against my oath—remember that in these lands, answers are bought with steel, vigilance, and unbroken patience. What is our next move?`;
}

// Unified Chat Handler for /api/chat and /api/summons/chat
const handleChatTurn = async (req: express.Request, res: express.Response) => {
  try {
    const { messages, characterContext, stochasticSeed } = req.body;
    const ai = getAiClient();

    const charName = characterContext?.character_name || characterContext?.name || "The Summoned Entity";
    const charClass = characterContext?.character_class || characterContext?.overview?.classRole || "Operative";
    const sheetStyle = characterContext?.sheet_style || "Gothic Dark Fantasy";
    const lore = characterContext?.character_lore || characterContext?.lore?.backstory || "";
    const signature = characterContext?.signature_attributes || characterContext?.personality || {};
    const inventory = characterContext?.inventory_items || characterContext?.equipment?.weapons || "";
    const level = characterContext?.character_level || characterContext?.overview?.level || "16";

    const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1].text : "";

    if (!ai) {
      const fallbackReply = generateFallbackPersonaReply({
        lastUserMessage: lastMsg,
        charName,
        charClass,
        sheetStyle,
        lore,
        signature
      });
      return res.json({
        reply: fallbackReply,
        groundingMetadata: null
      });
    }

    const currentSeed = stochasticSeed || Math.floor(Math.random() * 1000000);
    
    // Build C-TRACES-GOAL system instruction
    const systemInstruction = `[C-TRACES-GOAL PROMPT FRAMEWORK ACTIVE // FEDEROV SUMMONS CODEX]
CONTEXT: You are operating within the WorldVision Summons multiverse under the ${sheetStyle} aesthetic canon.
ROLE: You ARE ${charName}, a Level ${level} ${charClass}. Speak strictly in the FIRST PERSON ("I", "my steel", "my oath"). Never break character or refer to yourself as an artificial model.
LORE GROUNDING: ${lore}
EQUIPMENT: ${typeof inventory === 'string' ? inventory : JSON.stringify(inventory)}

PSYCHOLOGICAL DNA & TONAL MATRIX (Vector #${currentSeed}):
- Reputation: ${signature.reputation || 'Whispered name among desperate outcasts'}
- Virtue: ${signature.virtue || signature.ideals || 'Unflinching loyalty in mortal peril'}
- Vice: ${signature.vice || signature.flaws || 'Compulsive obsession with ancient debts'}
- Fear: ${signature.fear || signature.fears || 'Being forgotten in the boundless dark'}
- Tell: ${signature.tell || signature.mannerisms || 'Checking weapon balances when tense'}
- Speech Cadence: ${signature.speech || 'Evocative, measured, and authentic to genre'}

OPERATIONAL CONSTRAINTS:
1. Speak strictly in character with authentic tactical weight.
2. Incorporate concrete references to your weapons, scars, vices, and sworn faction.
3. Keep replies punchy, evocative, and compelling (2 to 4 paragraphs, 60-180 words).
4. Address tactical inquiries, campaign hooks, or lore secrets directly.`;

    const contents = (messages || []).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "models/gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.94,
        topP: 0.95,
        tools: [{ googleSearch: {} }],
      }
    });

    const reply = response.text || "The codex whispers no further words.";
    let groundingMetadata = null;
    try {
      groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;
    } catch (e) {
      // ignore
    }

    return res.json({ reply, groundingMetadata });
  } catch (error: any) {
    console.error("Chat error:", error);
    // Graceful fallback
    const { messages, characterContext } = req.body;
    const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1].text : "";
    const charName = characterContext?.character_name || characterContext?.name || "The Summoned";
    const charClass = characterContext?.character_class || "Hero";
    const sheetStyle = characterContext?.sheet_style || "Gothic Dark Fantasy";
    const lore = characterContext?.character_lore || "";
    const signature = characterContext?.signature_attributes || {};

    const fallbackReply = generateFallbackPersonaReply({
      lastUserMessage: lastMsg,
      charName,
      charClass,
      sheetStyle,
      lore,
      signature
    });

    return res.json({ reply: fallbackReply, groundingMetadata: null });
  }
};

app.post("/api/chat", handleChatTurn);
app.post("/api/summons/chat", handleChatTurn);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "worldvision-summons-engine" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Worldvision Summons Server running on http://localhost:${PORT}`);
  });
}

startServer();
