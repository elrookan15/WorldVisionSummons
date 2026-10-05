import { ImageGenerationProvider, ImageGenerationRequest, GeneratedImage, ProviderResult } from '../../types/providers';
import { withWvsApiHeaders } from '../apiClientHeaders';
import { compileDesignSheetPrompt, DESIGN_SHEET_NEGATIVE } from '../prompts/designSheet';
import { getAtmosphericMatrix } from '../prompts/generators';

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
  fallback?: boolean;
  model?: string;
  attemptedModels?: string[];
  error?: {
    code?: string;
    kind?: string;
    message?: string;
    retryable?: boolean;
    retryAfterMs?: number;
  };
}

export class NanoBananaProvider implements ImageGenerationProvider {
  public readonly providerId = 'nano-banana-v1';
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly defaultTimeoutMs: number = 120000;

  constructor(apiUrl?: string, apiKey?: string) {
    // NOTE: read import.meta.env directly — Vite only bakes values via
    // static replacement of the literal `import.meta.env.VAR` pattern.
    const metaEnv = import.meta.env;
    this.apiUrl = apiUrl || metaEnv.VITE_NANO_BANANA_API_URL || '/api/generate-image';
    this.apiKey = apiKey || metaEnv.VITE_NANO_BANANA_API_KEY || '';
  }

  /**
   * Universal Persona-guided prompt synthesis engine (C-TRACES-GOAL Enhanced Prompt Template Engine).
   * Compiles domain character data into an uncompromising high-fidelity visual description.
   */
  public static buildCharacterPrompt(input: CharacterPromptInput): { prompt: string; negativePrompt: string } {
    const style = input.sheetStyle || 'Gothic Dark Fantasy';
    const matrix = getAtmosphericMatrix(style);
    const prompt = compileDesignSheetPrompt({
      character_name: input.characterName,
      character_class: input.characterClass,
      sheet_style: style,
      inventory_items: input.primaryWeapon,
      physical: {
        height: input.height,
        build: input.build,
        distinguishing_feature: input.distinguishingFeature,
      },
    }, style, {
      palette: matrix.palette,
      lighting: matrix.lighting,
      negativeConstraints: matrix.negativeConstraints,
    });
    return { prompt, negativePrompt: DESIGN_SHEET_NEGATIVE };
  }

  public async generateImage(request: ImageGenerationRequest): Promise<ProviderResult<GeneratedImage> & {
    imageUrl: string | null;
    prompt: string;
    engine: string;
    fallback?: boolean;
    model?: string;
  }> {
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

      const headers: Record<string, string> = withWvsApiHeaders({
        'Content-Type': 'application/json'
      });
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
      const isFallback = Boolean(payload.fallback) || (payload.engine || '').includes('Procedural');
      const upstreamError = payload.error?.message
        ? {
            code: payload.error.code || 'IMAGE_FALLBACK',
            message: payload.error.message,
            retryable: Boolean(payload.error.retryable),
          }
        : undefined;

      const successResult = {
        success: Boolean(imageUrl) && !isFallback,
        imageUrl,
        prompt: promptToUse,
        engine: payload.engine || 'Nano Banana AI',
        fallback: isFallback,
        model: payload.model,
        error: upstreamError,
        data: {
          id: payload.id || 'img-' + Date.now(),
          url: imageUrl || '',
          width: payload.dimensions?.width || request.width || 1024,
          height: payload.dimensions?.height || request.height || 1280,
          seed: payload.seed_used || request.seed,
          provider: isFallback ? 'WorldVision Procedural Codex' : this.providerId,
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
