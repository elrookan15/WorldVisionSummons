import { describe, it, expect } from "vitest";
import { createFixedWindowLimiter } from "../lib/apiRateLimit";

describe("createFixedWindowLimiter", () => {
  it("allows up to max calls inside the window, then rejects", () => {
    const limiter = createFixedWindowLimiter({ windowMs: 1000, max: 2 });
    expect(limiter.allow("a", 0)).toEqual({ ok: true });
    expect(limiter.allow("a", 10)).toEqual({ ok: true });
    const denied = limiter.allow("a", 20);
    expect(denied.ok).toBe(false);
    if (denied.ok === false) expect(denied.retryAfterMs).toBe(980);
  });

  it("resets after the window and isolates keys", () => {
    const limiter = createFixedWindowLimiter({ windowMs: 1000, max: 1 });
    expect(limiter.allow("a", 0).ok).toBe(true);
    expect(limiter.allow("b", 0).ok).toBe(true);
    expect(limiter.allow("a", 1000).ok).toBe(true);
  });
});
