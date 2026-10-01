/**
 * Fixed-window request limiter for billed Gemini proxy routes.
 * In-memory only — one Cloud Run instance does not share counters with its siblings.
 */

import type { Request, Response, NextFunction } from "express";

export type RateDecision =
  | { ok: true }
  | { ok: false; retryAfterMs: number };

export type FixedWindowLimiter = {
  allow(key: string, now?: number): RateDecision;
};

export function createFixedWindowLimiter(options: {
  windowMs: number;
  max: number;
}): FixedWindowLimiter {
  const buckets = new Map<string, { start: number; count: number }>();

  return {
    allow(key: string, now = Date.now()): RateDecision {
      const existing = buckets.get(key);
      if (!existing || now - existing.start >= options.windowMs) {
        if (buckets.size > 4000) buckets.clear();
        buckets.set(key, { start: now, count: 1 });
        return { ok: true };
      }
      if (existing.count >= options.max) {
        return { ok: false, retryAfterMs: Math.max(1, options.windowMs - (now - existing.start)) };
      }
      existing.count += 1;
      return { ok: true };
    },
  };
}

/** 60 requests / minute / client IP. */
export const geminiRouteLimiter = createFixedWindowLimiter({
  windowMs: 60_000,
  max: 60,
});

export function requireGeminiBudget(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const decision = geminiRouteLimiter.allow(key);
  if (decision.ok === false) {
    const seconds = Math.ceil(decision.retryAfterMs / 1000);
    res.setHeader("Retry-After", String(seconds));
    res.status(429).json({
      error: "RATE_LIMITED",
      message: "Too many summon requests from this client. Wait and retry.",
    });
    return;
  }
  next();
}
