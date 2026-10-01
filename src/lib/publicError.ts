/** Strip provider key material before an error string reaches the browser. */
export function publicProviderError(error: unknown): string {
  const raw = error instanceof Error ? error.message : "Unknown error";
  const scrubbed = raw
    .replace(/AIza[0-9A-Za-z_-]{8,}/g, "[redacted]")
    .replace(/([?&]key=)[^&\s]+/gi, "$1[redacted]");
  return scrubbed.slice(0, 200);
}
