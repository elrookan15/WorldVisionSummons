import { describe, it, expect } from "vitest";
import { evaluateApiAuth, WVS_API_KEY_HEADER, type ApiAuthDenied } from "../lib/apiAuth";

function headers(map: Record<string, string>) {
  const lower = Object.fromEntries(
    Object.entries(map).map(([k, v]) => [k.toLowerCase(), v])
  );
  return {
    get(name: string) {
      return lower[name.toLowerCase()];
    },
  };
}

function expectDenied(result: ReturnType<typeof evaluateApiAuth>): ApiAuthDenied {
  expect(result.ok).toBe(false);
  if (result.ok !== false) {
    throw new Error("expected ApiAuthDenied");
  }
  return result;
}

describe("evaluateApiAuth (WVS Gemini proxy gate)", () => {
  it("allows requests in non-production when secret is unset", () => {
    const result = evaluateApiAuth(headers({}), {
      secret: undefined,
      nodeEnv: "development",
    });
    expect(result).toEqual({ ok: true });
  });

  it("fail-closes in production when secret is unset", () => {
    const denied = expectDenied(
      evaluateApiAuth(headers({}), {
        secret: "",
        nodeEnv: "production",
      })
    );
    expect(denied.status).toBe(403);
    expect(denied.code).toBe("API_SECRET_REQUIRED");
  });

  it("rejects missing credentials when secret is configured", () => {
    const denied = expectDenied(
      evaluateApiAuth(headers({}), {
        secret: "test-secret",
        nodeEnv: "development",
      })
    );
    expect(denied.status).toBe(401);
    expect(denied.code).toBe("UNAUTHORIZED");
  });

  it("accepts matching X-WVS-API-Key header", () => {
    const result = evaluateApiAuth(
      headers({ [WVS_API_KEY_HEADER]: "test-secret" }),
      { secret: "test-secret", nodeEnv: "production" }
    );
    expect(result).toEqual({ ok: true });
  });

  it("accepts matching Authorization Bearer token", () => {
    const result = evaluateApiAuth(
      headers({ Authorization: "Bearer test-secret" }),
      { secret: "test-secret", nodeEnv: "production" }
    );
    expect(result).toEqual({ ok: true });
  });

  it("rejects wrong secret", () => {
    const denied = expectDenied(
      evaluateApiAuth(headers({ "X-WVS-API-Key": "nope" }), {
        secret: "test-secret",
        nodeEnv: "production",
      })
    );
    expect(denied.status).toBe(401);
  });
});
