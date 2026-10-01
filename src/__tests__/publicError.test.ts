import { describe, it, expect } from "vitest";
import { publicProviderError } from "../lib/publicError";

describe("publicProviderError", () => {
  it("redacts Gemini API key material", () => {
    const error = new Error("request failed https://generativelanguage.googleapis.com/v1?key=AIzaSyEXAMPLEKEY1234567890");
    const text = publicProviderError(error);
    expect(text).not.toContain("AIzaSyEXAMPLEKEY1234567890");
    expect(text).toContain("[redacted]");
  });
});
