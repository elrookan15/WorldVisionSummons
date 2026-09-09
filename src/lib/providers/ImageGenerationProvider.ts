export interface ImageGenerationOptions {
  prompt: string;
  style: string;
  aspectRatio?: string;
  numberOfImages?: number;
  outputMimeType?: string;
  characterContext?: any;
}

export interface ImageGenerationResult {
  imageUrl: string | null;
  prompt: string;
  engine: string;
  error?: string;
}

export interface ImageGenerationProvider {
  generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult>;
}
