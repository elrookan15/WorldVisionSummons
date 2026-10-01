import { afterEach, describe, expect, it } from "vitest";
import express from "express";
import fs from "fs";
import type { AddressInfo } from "net";
import os from "os";
import path from "path";
import { attachProductionFrontend, resolveListenPort } from "../lib/productionServer";

describe("resolveListenPort", () => {
  it("defaults to 3000 when Cloud Run does not set PORT", () => {
    expect(resolveListenPort(undefined)).toBe(3000);
    expect(resolveListenPort("")).toBe(3000);
    expect(resolveListenPort("   ")).toBe(3000);
  });

  it("uses the injected PORT", () => {
    expect(resolveListenPort("8080")).toBe(8080);
  });

  it("rejects a non-port value", () => {
    expect(() => resolveListenPort("0")).toThrow(/Invalid PORT/);
    expect(() => resolveListenPort("abc")).toThrow(/Invalid PORT/);
    expect(() => resolveListenPort("8080.5")).toThrow(/Invalid PORT/);
  });
});

describe("attachProductionFrontend", () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs) fs.rmSync(dir, { recursive: true, force: true });
    dirs.length = 0;
  });

  it("serves the SPA shell for client routes without swallowing /api", async () => {
    const dist = fs.mkdtempSync(path.join(os.tmpdir(), "wvs-dist-"));
    dirs.push(dist);
    fs.writeFileSync(path.join(dist, "index.html"), "<!doctype html><title>wvs</title>");
    fs.mkdirSync(path.join(dist, "assets"));
    fs.writeFileSync(path.join(dist, "assets", "app.js"), "console.log(1)");

    const app = express();
    app.get("/api/health", (_req, res) => {
      res.json({ status: "ok" });
    });
    attachProductionFrontend(app, dist);

    const server = app.listen(0);
    const port = (server.address() as AddressInfo).port;
    try {
      const root = await fetch(`http://127.0.0.1:${port}/`);
      expect(root.status).toBe(200);
      expect(await root.text()).toContain("<title>wvs</title>");

      const deep = await fetch(`http://127.0.0.1:${port}/codex`);
      expect(deep.status).toBe(200);
      expect(await deep.text()).toContain("<title>wvs</title>");

      const asset = await fetch(`http://127.0.0.1:${port}/assets/app.js`);
      expect(asset.status).toBe(200);
      expect(await asset.text()).toBe("console.log(1)");

      const health = await fetch(`http://127.0.0.1:${port}/api/health`);
      expect(await health.json()).toEqual({ status: "ok" });
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }
  });
});
