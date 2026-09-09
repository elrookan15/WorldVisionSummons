export interface GeneratedImage {
  id: string;
  url: string;
  width: number;
  height: number;
  seed?: number;
  revisedPrompt?: string;
  provider: string;
  createdAt: string;
}

export interface ProviderResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  idempotencyKey?: string;
  seed?: number;
  stylePreset?: string;
  style?: string;
  aspectRatio?: string;
  outputMimeType?: string;
  characterContext?: any;
  referenceImage?: string;
}

export interface ImageGenerationProvider {
  readonly providerId: string;
  generateImage(request: ImageGenerationRequest): Promise<ProviderResult<GeneratedImage>>;
}
