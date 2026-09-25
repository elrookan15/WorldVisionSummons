/**
 * Shared-secret gate for Gemini proxy routes.
 *
 * - WVS_API_SECRET unset: allow when NODE_ENV !== "production"; fail-closed (403) in production.
 * - WVS_API_SECRET set: require matching X-WVS-API-Key or Authorization: Bearer <secret>.
 *
 * This is a deploy gate against casual abuse, not end-user OAuth. Client-bundled
 * VITE_WVS_API_SECRET is visible in the browser — use only as a shared gate key.
 */

import type { Request, Response, NextFunction } from "express";

export const WVS_API_KEY_HEADER = "x-wvs-api-key";

export type ApiAuthEnv = {
  secret: string | undefined;
  nodeEnv: string | undefined;
};

export type ApiAuthOk = { ok: true };
export type ApiAuthDenied = {
  ok: false;
  status: 401 | 403;
  code: string;
  message: string;
};
export type ApiAuthResult = ApiAuthOk | ApiAuthDenied;

type HeaderReader = {
  get(name: string): string | null | undefined;
};

function readProvidedSecret(headers: HeaderReader): string | undefined {
  const headerKey = headers.get(WVS_API_KEY_HEADER)?.trim()
    || headers.get("X-WVS-API-Key")?.trim();
  if (headerKey) return headerKey;

  const auth = headers.get("authorization")?.trim() || headers.get("Authorization")?.trim();
  if (auth && /^bearer\s+/i.test(auth)) {
    return auth.replace(/^bearer\s+/i, "").trim();
  }
  return undefined;
}

export function evaluateApiAuth(
  headers: HeaderReader,
  env: ApiAuthEnv = {
    secret: process.env.WVS_API_SECRET,
    nodeEnv: process.env.NODE_ENV,
  }
): ApiAuthResult {
  const secret = env.secret?.trim();
  const isProd = env.nodeEnv === "production";

  if (!secret) {
    if (isProd) {
      return {
        ok: false,
        status: 403,
        code: "API_SECRET_REQUIRED",
        message:
          "WVS_API_SECRET must be set in production. Gemini proxy routes reject unauthenticated requests fail-closed.",
      };
    }
    return { ok: true };
  }

  const provided = readProvidedSecret(headers);
  if (!provided || provided !== secret) {
    return {
      ok: false,
      status: 401,
      code: "UNAUTHORIZED",
      message:
        "Missing or invalid API credentials. Send header X-WVS-API-Key (or Authorization: Bearer) matching WVS_API_SECRET.",
    };
  }
  return { ok: true };
}

/** Express middleware — apply to /api/generate-*, /api/chat, /api/summons/* AI routes. */
export function requireWvsApiAuth(req: Request, res: Response, next: NextFunction): void {
  const result = evaluateApiAuth({
    get: (name) => req.header(name),
  });
  if (result.ok === false) {
    const denied: ApiAuthDenied = result;
    res.status(denied.status).json({
      error: denied.code,
      message: denied.message,
    });
    return;
  }
  next();
}
