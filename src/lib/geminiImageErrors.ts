/**
 * Classify Gemini / Imagen image-generation failures so the UI can show
 * actionable guidance instead of a silent procedural portrait.
 */

export type GeminiImageFailureKind =
  | "quota_exhausted"
  | "billing_required"
  | "auth"
  | "model_unavailable"
  | "vertex_only"
  | "empty_response"
  | "unknown";

export interface ClassifiedGeminiImageError {
  kind: GeminiImageFailureKind;
  code: string;
  message: string;
  retryable: boolean;
  /** Hint from provider retryDelay when present (ms). */
  retryAfterMs?: number;
}

const QUOTA_ZERO_MESSAGE =
  "Gemini image models report free-tier quota limit 0 for this API key. " +
  "Enable billing on the Google AI Studio / Cloud project (or use a paid key), then reroll the portrait.";

const QUOTA_MESSAGE =
  "Gemini image quota exhausted. Wait for the reset window or enable billing, then reroll.";

const BILLING_MESSAGE =
  "Gemini image generation requires billing on this project. Enable pay-as-you-go in AI Studio, then reroll.";

const AUTH_MESSAGE =
  "Gemini rejected the API key for image generation. Verify GEMINI_API_KEY and that image models are enabled.";

const VERTEX_MESSAGE =
  "Imagen models require Vertex AI credentials. AI Studio keys cannot call imagen-*. Use Nano Banana (gemini-*-flash-image) with billing, or configure Vertex.";

const MODEL_UNAVAILABLE_MESSAGE =
  "No Gemini image model accepted this request. Check model availability for the project.";

function errorText(err: unknown): string {
  if (!err) return "";
  if (typeof err === "string") return err;
  const anyErr = err as { message?: string; status?: number; code?: number | string; error?: { message?: string } };
  const parts = [
    anyErr.message,
    anyErr.error?.message,
    typeof anyErr.status === "number" ? `status ${anyErr.status}` : "",
    anyErr.code != null ? String(anyErr.code) : "",
  ];
  try {
    parts.push(JSON.stringify(err));
  } catch {
    /* ignore */
  }
  return parts.filter(Boolean).join(" ");
}

function parseRetryAfterMs(text: string): number | undefined {
  // Google often embeds: "Please retry in 12.3s" or retryDelay: "12s"
  const match =
    /retry in ([\d.]+)\s*s/i.exec(text) ||
    /"retryDelay"\s*:\s*"([\d.]+)s"/i.exec(text) ||
    /retryDelay['":\s]+([\d.]+)s/i.exec(text);
  if (!match) return undefined;
  const seconds = Number(match[1]);
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined;
  return Math.min(Math.ceil(seconds * 1000), 60_000);
}

function hasZeroQuotaLimit(text: string): boolean {
  // Typical free-tier payload: limit:0 or "limit":"0" with generate_content_free_tier_*
  const zeroLimit = /["']?limit["']?\s*[:=]\s*["']?0["']?\b/i.test(text);
  const freeTier = /free[_ ]?tier|generate_content_free_tier/i.test(text);
  return zeroLimit && freeTier;
}

export function classifyGeminiImageError(err: unknown): ClassifiedGeminiImageError {
  const text = errorText(err);
  const lower = text.toLowerCase();
  const status =
    typeof (err as { status?: number })?.status === "number"
      ? (err as { status: number }).status
      : /\b429\b/.test(text)
        ? 429
        : /\b401\b|\b403\b/.test(text)
          ? 401
          : undefined;

  const retryAfterMs = parseRetryAfterMs(text);

  if (
    /imagen/i.test(text) &&
    (/vertex/i.test(text) || /only available/i.test(text) || /not supported/i.test(text) || /PERMISSION_DENIED/i.test(text))
  ) {
    return {
      kind: "vertex_only",
      code: "VERTEX_ONLY",
      message: VERTEX_MESSAGE,
      retryable: false,
    };
  }

  if (status === 401 || status === 403 || /API[_ ]?key|UNAUTHENTICATED|PERMISSION_DENIED|ACCESS_TOKEN/i.test(text)) {
    // Permission on imagen vs auth on key — prefer vertex_only when clearly imagen
    if (/imagen/i.test(text) && /vertex|permission/i.test(text)) {
      return { kind: "vertex_only", code: "VERTEX_ONLY", message: VERTEX_MESSAGE, retryable: false };
    }
    return { kind: "auth", code: "AUTH", message: AUTH_MESSAGE, retryable: false };
  }

  if (status === 429 || /RESOURCE_EXHAUSTED|exceeded your current quota|quota/i.test(text)) {
    if (hasZeroQuotaLimit(text) || /billing details/i.test(text)) {
      return {
        kind: "billing_required",
        code: "BILLING_REQUIRED",
        message: hasZeroQuotaLimit(text) ? QUOTA_ZERO_MESSAGE : BILLING_MESSAGE,
        retryable: false,
        retryAfterMs,
      };
    }
    return {
      kind: "quota_exhausted",
      code: "QUOTA_EXHAUSTED",
      message: QUOTA_MESSAGE,
      retryable: true,
      retryAfterMs,
    };
  }

  if (/not found|NOT_FOUND|is not supported|unsupported|INVALID_ARGUMENT.*model/i.test(text)) {
    return {
      kind: "model_unavailable",
      code: "MODEL_UNAVAILABLE",
      message: MODEL_UNAVAILABLE_MESSAGE,
      retryable: false,
    };
  }

  return {
    kind: "unknown",
    code: "IMAGE_GENERATION_FAILED",
    message: text.slice(0, 280) || "Image generation failed.",
    retryable: Boolean(retryAfterMs),
    retryAfterMs,
  };
}

export function emptyImageResponseError(): ClassifiedGeminiImageError {
  return {
    kind: "empty_response",
    code: "EMPTY_IMAGE",
    message: "Model returned no image bytes. Try rerolling or simplify the portrait prompt.",
    retryable: true,
  };
}

/** Models tried for AI Studio / Gemini API keys (Nano Banana family). */
export const NANO_BANANA_IMAGE_MODELS: ReadonlyArray<{
  model: string;
  engine: string;
  /** Prefer imageSize in imageConfig when true. */
  supportsImageSize: boolean;
}> = [
  { model: "gemini-3.1-flash-image", engine: "Nano Banana 2", supportsImageSize: true },
  { model: "gemini-3.1-flash-lite-image", engine: "Nano Banana Lite", supportsImageSize: true },
  { model: "gemini-2.5-flash-image", engine: "Nano Banana", supportsImageSize: false },
];

export const IMAGEN_MODELS = ["imagen-4.0-generate-001", "imagen-3.0-generate-002"] as const;

export function shouldAttemptImagen(): boolean {
  return Boolean(
    process.env.GEMINI_USE_IMAGEN === "1" ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCLOUD_PROJECT ||
      process.env.GOOGLE_GENAI_USE_VERTEXAI === "true"
  );
}
