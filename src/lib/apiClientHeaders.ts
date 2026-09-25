/**
 * Client helpers for the WVS API shared-secret gate.
 * Reads VITE_WVS_API_SECRET when present and attaches X-WVS-API-Key.
 */

import { WVS_API_KEY_HEADER } from "./apiAuth";

function readClientSecret(): string | undefined {
  try {
    const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
    const value = meta.env?.VITE_WVS_API_SECRET?.trim();
    return value || undefined;
  } catch {
    return undefined;
  }
}

/** Merge Content-Type / caller headers with optional X-WVS-API-Key. */
export function withWvsApiHeaders(
  headers: Record<string, string> = {}
): Record<string, string> {
  const next: Record<string, string> = { ...headers };
  const secret = readClientSecret();
  if (secret) {
    next[WVS_API_KEY_HEADER] = secret;
    // Canonical casing for proxies that preserve case
    next["X-WVS-API-Key"] = secret;
  }
  return next;
}
