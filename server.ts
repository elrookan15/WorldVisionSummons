import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";
import { compilePortraitPrompt } from "./src/lib/prompts/generators";
import { canonicalizeSheetStyle } from "./src/lib/themeMap";
import { buildProceduralPortrait } from "./src/lib/portraitFallback";
import { buildCTracesGoalPrompt } from "./src/lib/prompts/cTracesGoal";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "16mb" }));

// Initialize Google Gen AI client safely
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

function parseJsonPayload(text: string): Record<string, unknown> | null {
  if (!text) return null;
  const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const jsonStart = cleanText.indexOf("{");
  const jsonEnd = cleanText.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) return null;
  try {
    return JSON.parse(cleanText.substring(jsonStart, jsonEnd + 1));
  } catch {
    return null;
  }
}

function parseDataUrl(value?: string): { mimeType: string; data: string } | null {
  if (!value || typeof value !== "string") return null;
  const match = /^data:([^;]+);base64,(.+)$/s.exec(value.trim());
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

function extractInlineImage(response: any): string | null {
  const parts = response?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    const inline = part?.inlineData || part?.inline_data;
    if (inline?.data) {
      const mime = inline.mimeType || inline.mime_type || "image/png";
      return `data:${mime};base64,${inline.data}`;
    }
  }
  return null;
}

function portraitContextFromBody(body: any) {
  const ctx = body?.characterContext || {};
  const style = canonicalizeSheetStyle(body?.style || ctx.sheet_style || ctx.sheetStyle || "Gothic Dark Fantasy");
  return {
    name: ctx.character_name || ctx.name || "Hero",
    charClass: ctx.character_class || ctx.overview?.classRole || "Adventurer",
    lore: ctx.character_lore || ctx.lore?.backstory || ctx.overview?.bio || "",
    style,
    height: ctx.physical?.height || "6'0\"",
    build: ctx.physical?.build || "Athletic",
    feature: ctx.physical?.distinguishing_feature || ctx.physical?.marks || "",
    inventory: ctx.inventory_items || ctx.equipment?.items || ctx.equipment?.primaryWeapon || "",
  };
}

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
    const config: Record<string, unknown> = {
      responseMimeType: "application/json",
      temperature: 0.85,
    };
    if (high_thinking) {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH
      };
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config
    });

    const text = response.text || "";
    const parsed = parseJsonPayload(text);
    if (!parsed) {
      throw new Error("Failed to parse JSON from Gemini response");
    }
    return res.json(parsed);
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
  const ctx = portraitContextFromBody(req.body);
  const incomingPrompt = String(req.body?.prompt || "").trim();
  const negativePrompt = String(req.body?.negativePrompt || req.body?.negative_prompt || "").trim();
  const aspectRatio = req.body?.aspectRatio || "3:4";
  const imageSize = req.body?.imageSize || req.body?.quality || "2K";
  const referenceImage = req.body?.referenceImage as string | undefined;
  const referenceStrength = Number(req.body?.referenceStrength ?? 0.65);

  const compiledPrompt = incomingPrompt || compilePortraitPrompt({
    character_name: ctx.name,
    character_class: ctx.charClass,
    character_lore: ctx.lore,
    sheet_style: ctx.style,
    inventory_items: ctx.inventory,
    physical: {
      height: ctx.height,
      build: ctx.build,
      distinguishing_feature: ctx.feature,
    },
  }, ctx.style);

  const qualityDirective = [
    "Generate exactly one finished character portrait image.",
    "Do not return UI mockups, stat panels, watermarks, captions, or split-screen collages.",
    `Use a vertical ${aspectRatio} composition at ${imageSize} fidelity.`,
    "Keep the full figure in frame, anatomically correct hands and feet, sharp costume detail.",
    negativePrompt ? `Avoid: ${negativePrompt}` : "",
    referenceImage ? `Honor the uploaded reference at strength ${Math.round(referenceStrength * 100)}% while remaining faithful to the character description.` : "",
  ].filter(Boolean).join(" ");

  const nanoBananaEnhancedPrompt = `${compiledPrompt}\n${qualityDirective}`;
  const fallbackImage = buildProceduralPortrait({
    name: ctx.name,
    charClass: ctx.charClass,
    style: ctx.style,
    distinguishingFeature: ctx.feature,
  });

  try {
    const ai = getAiClient();
    if (!ai) {
      return res.json({
        imageUrl: fallbackImage,
        prompt: nanoBananaEnhancedPrompt,
        engine: "WorldVision Procedural Codex",
        fallback: true,
      });
    }

    const refPart = parseDataUrl(referenceImage);
    const userParts: Array<Record<string, unknown>> = [{ text: nanoBananaEnhancedPrompt }];
    if (refPart) {
      userParts.unshift({
        inlineData: {
          mimeType: refPart.mimeType,
          data: refPart.data,
        },
      });
    }

    const nanoBananaModels = [
      { model: "gemini-3.1-flash-image", imageSize },
      { model: "gemini-2.5-flash-image", imageSize: undefined },
    ];

    for (const candidate of nanoBananaModels) {
      try {
        const response = await ai.models.generateContent({
          model: candidate.model,
          contents: [{ role: "user", parts: userParts }],
          config: {
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: {
              aspectRatio,
              ...(candidate.imageSize ? { imageSize: candidate.imageSize } : {}),
            },
          },
        });
        const imageUrl = extractInlineImage(response);
        if (imageUrl) {
          return res.json({
            imageUrl,
            prompt: nanoBananaEnhancedPrompt,
            engine: candidate.model.includes("3.1") ? "Nano Banana 2" : "Nano Banana",
            model: candidate.model,
            fallback: false,
          });
        }
      } catch (modelErr: any) {
        console.warn(`Image model ${candidate.model} failed:`, modelErr?.message || modelErr);
      }
    }

    const imagenModels = ["imagen-4.0-generate-001", "imagen-3.0-generate-002"];
    for (const model of imagenModels) {
      try {
        const response = await ai.models.generateImages({
          model,
          prompt: nanoBananaEnhancedPrompt,
          config: {
            numberOfImages: 1,
            outputMimeType: req.body?.outputMimeType || "image/png",
            aspectRatio,
          },
        });
        const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
        if (base64Image) {
          return res.json({
            imageUrl: `data:image/png;base64,${base64Image}`,
            prompt: nanoBananaEnhancedPrompt,
            engine: "Imagen",
            model,
            fallback: false,
          });
        }
      } catch (imgErr: any) {
        console.warn(`Imagen model ${model} failed:`, imgErr?.message || imgErr);
      }
    }

    return res.json({
      imageUrl: fallbackImage,
      prompt: nanoBananaEnhancedPrompt,
      engine: "WorldVision Procedural Codex",
      fallback: true,
    });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return res.json({
      imageUrl: fallbackImage,
      prompt: nanoBananaEnhancedPrompt,
      engine: "WorldVision Procedural Codex",
      fallback: true,
      error: error.message,
    });
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
    const compiled = buildCTracesGoalPrompt({
      characterName: charName,
      characterClass: charClass,
      characterLevel: level,
      sheetStyle,
      lore,
      reputation: signature.reputation,
      vice: signature.vice || signature.flaws,
      virtue: signature.virtue || signature.ideals,
      fear: signature.fear || signature.fears,
      obsession: signature.obsession,
      tell: signature.tell || signature.mannerisms,
      loyalty: signature.loyalty,
      blindSpot: signature.blind_spot || signature.blindSpot,
      survivalInstinct: signature.survival_instinct || signature.survivalInstinct,
      legacyFear: signature.legacy_fear || signature.legacyFear,
      primaryWeapon: typeof inventory === "string" ? inventory.split(",")[0] : "",
    });
    const systemInstruction = `${compiled.systemInstruction}\n\nSTOCHASTIC VECTOR: #${currentSeed}\nEQUIPMENT: ${typeof inventory === "string" ? inventory : JSON.stringify(inventory)}`;

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
  res.json({
    status: "ok",
    service: "worldvision-summons-engine",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    imageModels: ["gemini-3.1-flash-image", "gemini-2.5-flash-image"],
  });
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
