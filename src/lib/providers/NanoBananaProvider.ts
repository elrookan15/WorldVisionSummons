import { ImageGenerationProvider, ImageGenerationRequest, GeneratedImage, ProviderResult } from '../../types/providers';

export interface CharacterPromptInput {
  characterName: string;
  characterClass: string;
  characterLore: string;
  primaryWeapon: string;
  height: string;
  build: string;
  distinguishingFeature: string;
  sheetStyle: string;
}

interface NanoBananaApiResponse {
  id?: string;
  output_url?: string;
  imageUrl?: string;
  dimensions?: { width: number; height: number };
  seed_used?: number;
  prompt?: string;
  engine?: string;
}

export class NanoBananaProvider implements ImageGenerationProvider {
  public readonly providerId = 'nano-banana-v1';
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly defaultTimeoutMs: number = 120000;

  constructor(apiUrl?: string, apiKey?: string) {
    const metaEnv = (import.meta as any).env || {};
    this.apiUrl = apiUrl || metaEnv.VITE_NANO_BANANA_API_URL || '/api/generate-image';
    this.apiKey = apiKey || metaEnv.VITE_NANO_BANANA_API_KEY || '';
  }

  /**
   * Universal Persona-guided prompt synthesis engine (C-TRACES-GOAL Enhanced Prompt Template Engine).
   * Compiles domain character data into an uncompromising high-fidelity visual description.
   */
  public static buildCharacterPrompt(input: CharacterPromptInput): { prompt: string; negativePrompt: string } {
    const styleModifiers = NanoBananaProvider.getStyleVisualMatrix(input.sheetStyle);

    const prompt = [
      `Professional champion reference sheet and concept art board of ${input.characterName || 'Hero'}, a ${input.characterClass || 'Adventurer'}.`,
      `Central composition: Full-body heroic illustration of ${input.characterName || 'Hero'} in ${input.sheetStyle || 'Gothic Dark Fantasy'} tactical armor and garb holding ${input.primaryWeapon || 'Primary Weapon'}.`,
      `UI overlays & infographic side panels: Character Class Stat Radar Chart, Active Skill Ability icons with cooldown timers, leader line callouts pointing to gear items with text labels (helmet, cuirass, gauntlets, weapons), Elemental Affinity Wheel, Passive Buff Badges, and scale comparison silhouette against standard human.`,
      input.characterLore ? `Lore grounding: ${input.characterLore}` : '',
      `Physical presence: standing ${input.height || '6\'0"'}, ${input.build || 'athletic'} frame, distinct feature: ${input.distinguishingFeature || 'scarred visage'}.`,
      `Costume: layered attire reflecting ${input.sheetStyle || 'Gothic Dark Fantasy'}, micro-textures, weathered seams, authentic material degradation, ornate faction hardware.`,
      `Visual atmosphere: ${styleModifiers.atmosphere}.`,
      `Lighting and palette: ${styleModifiers.lighting}.`,
      `Masterpiece 8k resolution, cinematic volumetric depth, octane render realism, award-winning concept art sourcebook illustration.`
    ].filter(Boolean).join(' ');

    const negativePrompt = [
      'cropped feet',
      'cut-off boots',
      'out of frame head',
      'deformed anatomy',
      'extra arms',
      'duplicated fingers',
      'floating gear',
      'unrelated background characters',
      'illegible costume details',
      'flat ambient lighting',
      'watermark',
      'artist signature',
      'text labels',
      'borders',
      styleModifiers.negativeConstraints
    ].join(', ');

    return { prompt, negativePrompt };
  }

  private static getStyleVisualMatrix(style: string): { atmosphere: string; lighting: string; negativeConstraints: string } {
    const lower = (style || '').toLowerCase();
    if (lower.includes('gothic') || lower.includes('dark fantasy')) {
      return {
        atmosphere: 'ruined cathedral courtyard, ancient gravestones, creeping black brambles, ash drifts',
        lighting: 'low-key chiaroscuro, cold moonlight rim, faint crimson embers, charcoal and tarnished iron palette',
        negativeConstraints: 'neon lights, high saturation, futuristic alloys'
      };
    } else if (lower.includes('cyberpunk') || lower.includes('neon')) {
      return {
        atmosphere: 'dense megacity alleyway, rain-slick reflective asphalt, holographic signage, dense urban smog',
        lighting: 'high-contrast cyan and electric magenta rim lighting, toxic green underglow, deep obsidian shadows',
        negativeConstraints: 'parchment textures, medieval armor, magic sigils'
      };
    } else if (lower.includes('steampunk')) {
      return {
        atmosphere: 'Victorian industrial foundry, clockwork gears, elevated iron pipes, drifting white steam',
        lighting: 'warm gaslight lanterns, polished brass specular reflections, rich amber and soot-black tones',
        negativeConstraints: 'digital screens, laser beams, clean modern plastics'
      };
    } else if (lower.includes('high fantasy')) {
      return {
        atmosphere: 'soaring elven spires, sunlit mountain pass, ancient runic monoliths, floating arcane motes',
        lighting: 'celestial golden-hour rays, radiant silver and sapphire accents, pure emerald jewel tones',
        negativeConstraints: 'grungy dystopian textures, industrial grime, modern guns'
      };
    } else if (lower.includes('cosmic') || lower.includes('horror')) {
      return {
        atmosphere: 'non-Euclidean megaliths, cyclopean coastal ruins, abyssal fog, unnatural constellations',
        lighting: 'sickly luminescent viridian glow, bruised void purples, eerie bioluminescent ambient rim',
        negativeConstraints: 'cheerful warm tones, pristine polished surfaces'
      };
    } else if (lower.includes('samurai')) {
      return {
        atmosphere: 'traditional ink wash, ukiyo-e woodblock texture, falling cherry blossoms, blood-red sun crest, cinematic fog',
        lighting: 'dramatic shadow-play, high-contrast monochrome with crimson focal points',
        negativeConstraints: 'futuristic mechs, modern plastic gear'
      };
    } else {
      return {
        atmosphere: 'thematic atmospheric environment with clear layered depth and environmental grounding',
        lighting: 'dramatic three-point cinematic lighting with strong edge definition',
        negativeConstraints: 'muddy textures, overexposed surfaces'
      };
    }
  }

  public async generateImage(request: ImageGenerationRequest): Promise<ProviderResult<GeneratedImage> & { imageUrl: string | null; prompt: string; engine: string }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.defaultTimeoutMs);

    try {
      let promptToUse = (request.prompt || '').trim();
      let negativePromptToUse = request.negativePrompt || '';

      if (request.characterContext) {
        const ctx = request.characterContext;
        const inventory = ctx.inventory_items ?? ctx.equipment?.items ?? ctx.equipment?.primaryWeapon;
        const built = NanoBananaProvider.buildCharacterPrompt({
          characterName: ctx.character_name || ctx.name || 'Hero',
          characterClass: ctx.character_class || ctx.overview?.classRole || 'Adventurer',
          characterLore: ctx.character_lore || ctx.lore?.backstory || ctx.overview?.bio || '',
          primaryWeapon: typeof inventory === 'string'
            ? (inventory.split(',')[0]?.trim() || 'Primary Weapon')
            : (Array.isArray(inventory) ? String(inventory[0] || 'Primary Weapon') : 'Primary Weapon'),
          height: ctx.physical?.height || '6\'0"',
          build: ctx.physical?.build || 'athletic',
          distinguishingFeature: ctx.physical?.distinguishing_feature || ctx.physical?.marks || 'scarred visage',
          sheetStyle: request.style || ctx.sheet_style || 'Gothic Dark Fantasy'
        });
        // Never clobber a caller-compiled portrait prompt; only fill gaps.
        if (!promptToUse) promptToUse = built.prompt;
        if (!negativePromptToUse) negativePromptToUse = built.negativePrompt;
      }

      const payloadBody = {
        prompt: promptToUse,
        negativePrompt: negativePromptToUse,
        negative_prompt: negativePromptToUse,
        style: request.style || request.stylePreset || 'Gothic Dark Fantasy',
        width: request.width || 1536,
        height: request.height || 2048,
        aspectRatio: request.aspectRatio || '3:4',
        outputMimeType: request.outputMimeType || 'image/png',
        seed: request.seed,
        quality: '2K',
        imageSize: '2K',
        sampler: 'euler_ancestral',
        steps: 40,
        guidance_scale: 7.5,
        engine: 'Nano Banana 2',
        characterContext: request.characterContext,
        referenceImage: request.referenceImage,
        referenceStrength: request.referenceStrength
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }
      if (request.idempotencyKey) {
        headers['X-Idempotency-Key'] = request.idempotencyKey;
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payloadBody),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errResult = {
          success: false,
          imageUrl: null,
          prompt: promptToUse,
          engine: 'Nano Banana Fallback',
          error: {
            code: `HTTP_${response.status}`,
            message: `NanoBanana upstream error (${response.status}): ${errorText}`,
            retryable: response.status >= 500 || response.status === 429
          }
        };
        return errResult as any;
      }

      const payload = (await response.json()) as NanoBananaApiResponse;
      const imageUrl = payload.output_url || payload.imageUrl || null;

      const successResult = {
        success: true,
        imageUrl,
        prompt: promptToUse,
        engine: 'Nano Banana AI',
        data: {
          id: payload.id || 'img-' + Date.now(),
          url: imageUrl || '',
          width: payload.dimensions?.width || request.width || 1024,
          height: payload.dimensions?.height || request.height || 1280,
          seed: payload.seed_used || request.seed,
          provider: this.providerId,
          createdAt: new Date().toISOString()
        }
      };

      return successResult as any;
    } catch (err: unknown) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      const errResult = {
        success: false,
        imageUrl: null,
        prompt: request.prompt || '',
        engine: 'Nano Banana Fallback',
        error: {
          code: isAbort ? 'TIMEOUT' : 'NETWORK_ERROR',
          message: isAbort ? 'NanoBanana image generation timed out.' : (err as Error).message || 'Unknown network error',
          retryable: true
        }
      };
      return errResult as any;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const nanoBananaProvider = new NanoBananaProvider();
