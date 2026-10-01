import express, { type Express } from "express";
import type { Server } from "http";
import path from "path";

/**
 * Cloud Run injects PORT (default 8080). Local dev keeps 3000 when unset.
 */
export function resolveListenPort(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === "") return 3000;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid PORT "${raw}". Expected an integer from 1 to 65535.`);
  }
  return parsed;
}

/**
 * Serves the Vite `dist` build. Express 4.22 only matches the SPA fallback
 * with `*`. The `*all` pattern registers and then matches zero requests.
 */
export function attachProductionFrontend(app: Express, distPath: string): void {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

/** Cloud Run sends SIGTERM and allows ~10s before SIGKILL. */
export function registerGracefulShutdown(
  server: Server,
  exit: (code: number) => void = process.exit
): void {
  let closing = false;
  const shutdown = (signal: string) => {
    if (closing) return;
    closing = true;
    console.log(`Received ${signal}, draining HTTP server`);
    const timer = setTimeout(() => exit(1), 10_000);
    timer.unref();
    server.close(() => {
      clearTimeout(timer);
      exit(0);
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
