import { describe, it, expect } from "vitest";
import {
  classifyGeminiImageError,
  emptyImageResponseError,
  NANO_BANANA_IMAGE_MODELS,
  shouldAttemptImagen,
} from "../lib/geminiImageErrors";

describe("classifyGeminiImageError", () => {
  it("flags free-tier limit 0 as billing_required and non-retryable", () => {
    const err = {
      status: 429,
      message: JSON.stringify({
        error: {
          code: 429,
          message: "You exceeded your current quota, please check your plan and billing details.",
          status: "RESOURCE_EXHAUSTED",
          details: [
            {
              "@type": "type.googleapis.com/google.rpc.QuotaFailure",
              violations: [
                {
                  quotaMetric: "generativelanguage.googleapis.com/generate_content_free_tier_requests",
                  quotaId: "GenerateRequestsPerDayPerProjectPerModel-FreeTier",
                  quotaDimensions: { model: "gemini-2.5-flash-image" },
                },
              ],
            },
            {
              "@type": "type.googleapis.com/google.rpc.ErrorInfo",
              reason: "RATE_LIMIT_EXCEEDED",
              metadata: { limit: "0", model: "gemini-2.5-flash-image" },
            },
          ],
        },
      }),
    };
    // Embed limit:0 the way Google serializes in thrown Error.message
    err.message = '{"error":{"code":429,"message":"You exceeded your current quota","status":"RESOURCE_EXHAUSTED","details":[{"@type":"type.googleapis.com/google.rpc.QuotaFailure","violations":[{"quotaMetric":"generativelanguage.googleapis.com/generate_content_free_tier_requests"}]},{"metadata":{"limit":"0"}}]}}';

    const classified = classifyGeminiImageError(err);
    expect(classified.kind).toBe("billing_required");
    expect(classified.code).toBe("BILLING_REQUIRED");
    expect(classified.retryable).toBe(false);
    expect(classified.message).toMatch(/limit 0|billing/i);
  });

  it("marks transient quota with retryDelay as retryable", () => {
    const classified = classifyGeminiImageError({
      status: 429,
      message: 'RESOURCE_EXHAUSTED: Please retry in 8.5s. quotaMetric generate_content_requests limit 100',
    });
    expect(classified.kind).toBe("quota_exhausted");
    expect(classified.retryable).toBe(true);
    expect(classified.retryAfterMs).toBe(8500);
  });

  it("detects Vertex-only Imagen failures", () => {
    const classified = classifyGeminiImageError({
      status: 403,
      message: "Imagen is only available through Vertex AI",
    });
    expect(classified.kind).toBe("vertex_only");
    expect(classified.retryable).toBe(false);
  });

  it("detects auth failures", () => {
    const classified = classifyGeminiImageError({
      status: 401,
      message: "API key not valid. ACCESS_TOKEN_TYPE_UNSUPPORTED",
    });
    expect(classified.kind).toBe("auth");
    expect(classified.retryable).toBe(false);
  });

  it("exposes empty-response helper", () => {
    expect(emptyImageResponseError().code).toBe("EMPTY_IMAGE");
  });

  it("lists Nano Banana models in preference order", () => {
    expect(NANO_BANANA_IMAGE_MODELS.map((m) => m.model)).toEqual([
      "gemini-3.1-flash-image",
      "gemini-3.1-flash-lite-image",
      "gemini-2.5-flash-image",
    ]);
  });

  it("does not attempt Imagen without Vertex project env", () => {
    const prev = {
      GEMINI_USE_IMAGEN: process.env.GEMINI_USE_IMAGEN,
      GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
      GCLOUD_PROJECT: process.env.GCLOUD_PROJECT,
      GOOGLE_GENAI_USE_VERTEXAI: process.env.GOOGLE_GENAI_USE_VERTEXAI,
    };
    delete process.env.GEMINI_USE_IMAGEN;
    delete process.env.GOOGLE_CLOUD_PROJECT;
    delete process.env.GCLOUD_PROJECT;
    delete process.env.GOOGLE_GENAI_USE_VERTEXAI;
    expect(shouldAttemptImagen()).toBe(false);
    process.env.GOOGLE_CLOUD_PROJECT = "demo-project";
    expect(shouldAttemptImagen()).toBe(true);
    Object.entries(prev).forEach(([k, v]) => {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    });
  });
});
