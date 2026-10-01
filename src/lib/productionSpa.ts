/**
 * Production static hosting for the Vite SPA.
 * Express 4 + path-to-regexp 0.1 does not match the Express 5 pattern "*all".
 * A literal "*all" route leaves every non-file GET as the default 404 page.
 */

import express, { type Express } from "express";
import path from "path";

export function mountProductionSpa(app: Express, distPath: string): void {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
