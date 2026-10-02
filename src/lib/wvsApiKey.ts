/**
 * Browser-safe WVS API gate constants.
 *
 * This module must stay free of Node-only imports (node:crypto, express, …)
 * because the Vite client bundle imports it via apiClientHeaders.ts.
 * Server-only auth logic lives in ./apiAuth.ts, which re-exports these.
 */

/** Header name the client sends the shared gate key on. */
export const WVS_API_KEY_HEADER = "x-wvs-api-key";
