import { describe, it, expect, afterEach } from "vitest";
import express from "express";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Server } from "node:http";
import { mountProductionSpa } from "../lib/productionSpa";

describe("mountProductionSpa", () => {
  const servers: Server[] = [];
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
    for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
  });

  it("serves index.html for unknown GET paths and leaves earlier API routes alone", async () => {
    const dist = fs.mkdtempSync(path.join(os.tmpdir(), "wvs-spa-"));
    dirs.push(dist);
    fs.writeFileSync(path.join(dist, "index.html"), "<!doctype html><title>summons</title>");

    const app = express();
    app.get("/api/health", (_req, res) => {
      res.json({ status: "ok" });
    });
    mountProductionSpa(app, dist);

    const server = await new Promise<Server>((resolve) => {
      const listening = app.listen(0, "127.0.0.1", () => resolve(listening));
    });
    servers.push(server);
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("no port");
    const base = `http://127.0.0.1:${address.port}`;

    const health = await fetch(`${base}/api/health`);
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ status: "ok" });

    const deep = await fetch(`${base}/codex/review`);
    expect(deep.status).toBe(200);
    expect(await deep.text()).toContain("summons");
  });
});
