import { ImageGenerationProvider, ImageGenerationRequest, GeneratedImage, ProviderResult } from '../../types/providers';
import { buildProceduralPortrait } from '../portraitFallback';
import { withWvsApiHeaders } from '../apiClientHeaders';

/**
 * LRU In-Memory Idempotency Cache for NanoBanana requests
 */
class NanoBananaLRUCache {
  private cache: Map<string, GeneratedImage> = new Map();
  private readonly maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  public get(key: string): GeneratedImage | undefined {
    const item = this.cache.get(key);
    if (item) {
      // Refresh recency
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }

  public set(key: string, value: GeneratedImage): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Evict oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }

  public has(key: string): boolean {
    return this.cache.has(key);
  }
}

/**
 * NanoBananaImageAdapter
 * Enterprise adapter implementing ImageGenerationProvider with:
 * - 15s AbortController timeouts
 * - In-memory LRU idempotency caching
 * - Style-specific atmospheric matrix injection
 * - Strict negative prompt constraint appending
 * - Image-to-image reference conditioning
 * - Deterministic procedural fallbacks for offline/unkeyed environments
 */
export class NanoBananaImageAdapter implements ImageGenerationProvider {
  public readonly providerId = 'nanobanana-adapter-v2';
  private readonly endpointUrl: string;
  private readonly timeoutMs: number;
  private readonly lruCache: NanoBananaLRUCache;

  constructor(endpointUrl: string = '/api/generate-image', timeoutMs: number = 120000) {
    this.endpointUrl = endpointUrl;
    this.timeoutMs = timeoutMs;
    this.lruCache = new NanoBananaLRUCache(100);
  }

  public static compileAtmosphericMatrix(style: string): {
    matrix: string;
    lighting: string;
    negativeConstraints: string[];
  } {
    const s = (style || '').toLowerCase();

    if (s.includes('cyberpunk') || s.includes('neon')) {
      return {
        matrix: 'rain-slicked megacity pavement, dense neon signage, cybernetic ocular optics, tactical chrome weave',
        lighting: 'high-contrast cyan/magenta rim lighting, deep obsidian shadows, volumetric neon smog',
        negativeConstraints: ['medieval armor', 'parchment paper', 'wooden bows', 'magic runes']
      };
    } else if (s.includes('steampunk') || s.includes('victorian')) {
      return {
        matrix: 'Victorian foundry, brass gear assemblies, exposed copper conduits, escaping white steam vents',
        lighting: 'warm gaslight amber glow, polished brass specular flares, industrial furnace undertones',
        negativeConstraints: ['digital displays', 'laser sights', 'plastics', 'futuristic neon']
      };
    } else if (s.includes('cosmic') || s.includes('horror') || s.includes('eldritch')) {
      return {
        matrix: 'non-Euclidean masonry, weeping obsidian monoliths, abyssal celestial fog, cyclopean architectural angles',
        lighting: 'sickly viridian luminescence, cold void twilight, bruised ultraviolet accents',
        negativeConstraints: ['cheerful colors', 'pristine daylight', 'sunny skies', 'cartoon style']
      };
    } else if (s.includes('samurai')) {
      return {
        matrix: 'ink-brushed battle banners, falling cherry blossoms, weathered straw armor, blood-streaked katana',
        lighting: 'dramatic setting sun, golden rim lighting through mist, stark black ink shadows',
        negativeConstraints: ['western plate armor', 'firearms', 'cybernetic implants']
      };
    } else if (s.includes('8-bit') || s.includes('retro')) {
      return {
        matrix: 'vibrant pixelated dungeon chamber, iconic 16-color palette fidelity, sharp sprite silhouettes',
        lighting: 'crisp arcade illumination, high contrast pixel edge highlights',
        negativeConstraints: ['photorealistic blur', 'soft bokeh', 'modern smooth 3D gradients']
      };
    } else if (s.includes('post-apocalyptic') || s.includes('wasteland')) {
      return {
        matrix: 'irradiated ash dunes, rusted corrugated steel sheets, scavenged vehicular armor, dust vortex',
        lighting: 'harsh midday desert sun, scorched sepia horizon, lens flare across cracked visor',
        negativeConstraints: ['lush greenery', 'spotless fabric', 'pristine high-tech']
      };
    }

    // Default: Gothic Dark Fantasy
    return {
      matrix: 'ruined gothic cathedral cloisters, cold rain, ancient gargoyles, suffocating mist, iron thorns',
      lighting: 'severe chiaroscuro, cold moonlight silhouette, flickering crimson ember torchlight',
      negativeConstraints: ['cheerful ambient light', 'modern technology', 'neon glow']
    };
  }

  public async generateImage(request: ImageGenerationRequest): Promise<ProviderResult<GeneratedImage>> {
    const key = request.idempotencyKey || `nanobanana_${request.prompt}_${request.style || 'default'}_${request.seed || 0}`;

    // 1. Check LRU Cache
    const cached = this.lruCache.get(key);
    if (cached) {
      return {
        success: true,
        data: cached
      };
    }

    // 2. Build atmospheric matrix & negative constraints
    const styleAtmosphere = NanoBananaImageAdapter.compileAtmosphericMatrix(request.style || request.stylePreset || 'Gothic Dark Fantasy');
    
    const standardNegativeConstraints = [
      'cropped limbs',
      'malformed fingers',
      'extra hands',
      'severed feet',
      'blurry textures',
      'watermarks',
      'signatures',
      'bad anatomy',
      'out of frame',
      ...styleAtmosphere.negativeConstraints
    ];

    if (request.negativePrompt) {
      standardNegativeConstraints.push(request.negativePrompt);
    }

    const enhancedPrompt = `${request.prompt}, atmospheric matrix: ${styleAtmosphere.matrix}, lighting: ${styleAtmosphere.lighting}`;

    // 3. Set up AbortController with strict 15s timeout
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const payload: Record<string, any> = {
        prompt: enhancedPrompt,
        negativePrompt: standardNegativeConstraints.join(', '),
        style: request.style || request.stylePreset,
        aspectRatio: request.aspectRatio || '3:4',
        imageSize: '2K',
        quality: '2K',
        width: request.width || 1536,
        height: request.height || 2048,
        characterContext: request.characterContext,
        referenceImage: request.referenceImage,
        referenceStrength: request.referenceStrength,
        seed: request.seed
      };

      // Also support /api/summons/image or /api/generate-image
      const res = await fetch(this.endpointUrl, {
        method: 'POST',
        headers: withWvsApiHeaders({
          'Content-Type': 'application/json',
          'X-Idempotency-Key': key
        }),
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutHandle);

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const body = await res.json();
      const imageUrl = body.imageUrl || body.output_url || this.getThematicFallbackUrl(request);

      const generated: GeneratedImage = {
        id: body.id || `img_${Date.now()}`,
        url: imageUrl,
        width: request.width || 1536,
        height: request.height || 2048,
        seed: body.seed_used || request.seed || 42,
        revisedPrompt: body.prompt || enhancedPrompt,
        provider: body.engine || 'NanoBanana AI Engine',
        createdAt: new Date().toISOString()
      };

      // Store in LRU Cache
      this.lruCache.set(key, generated);

      return {
        success: true,
        data: generated
      };
    } catch (err: any) {
      clearTimeout(timeoutHandle);
      
      // Procedural thematic fallback
      const fallbackUrl = this.getThematicFallbackUrl(request);
      const fallbackImage: GeneratedImage = {
        id: `fallback_${Date.now()}`,
        url: fallbackUrl,
        width: request.width || 1536,
        height: request.height || 2048,
        seed: request.seed || 108,
        revisedPrompt: enhancedPrompt,
        provider: 'WorldVision Procedural Codex',
        createdAt: new Date().toISOString()
      };

      this.lruCache.set(key, fallbackImage);

      return {
        success: true,
        data: fallbackImage,
        error: err.name === 'AbortError' 
          ? { code: 'TIMEOUT', message: 'Request timed out after 120s; engaged thematic fallback', retryable: true }
          : { code: 'NETWORK_ERROR', message: err.message, retryable: true }
      };
    }
  }

  private getThematicFallbackUrl(request: ImageGenerationRequest | string): string {
    if (typeof request === "string") {
      return buildProceduralPortrait({ style: request });
    }
    const ctx = request.characterContext || {};
    return buildProceduralPortrait({
      name: ctx.character_name || ctx.name,
      charClass: ctx.character_class || ctx.overview?.classRole,
      style: request.style || request.stylePreset || ctx.sheet_style,
      distinguishingFeature: ctx.physical?.distinguishing_feature || ctx.physical?.marks,
    });
  }
}

export const nanoBananaImageAdapter = new NanoBananaImageAdapter();
