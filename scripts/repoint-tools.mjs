#!/usr/bin/env node
// Repoint every ElevenLabs webhook tool at a new base URL.
// Usage: node scripts/repoint-tools.mjs https://your-app.vercel.app

import fs from "node:fs";

const base = (process.argv[2] || "").replace(/\/$/, "");
if (!base.startsWith("http")) {
  console.error("usage: node scripts/repoint-tools.mjs https://your-app.vercel.app");
  process.exit(1);
}

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter(Boolean)
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)])
);
const key = env.ELEVENLABS_API_KEY;
const H = { "xi-api-key": key, "content-type": "application/json" };

const { tools } = await (await fetch("https://api.elevenlabs.io/v1/convai/tools", { headers: H })).json();

let changed = 0;
for (const t of tools) {
  const cfg = t.tool_config;
  if (cfg?.type !== "webhook" || !cfg.api_schema?.url) continue;
  const path = new URL(cfg.api_schema.url).pathname;
  const next = `${base}${path}`;
  if (next === cfg.api_schema.url) { console.log(`  = ${cfg.name}`); continue; }

  const body = { tool_config: { ...cfg, api_schema: { ...cfg.api_schema, url: next } } };
  const r = await fetch(`https://api.elevenlabs.io/v1/convai/tools/${t.id}`, {
    method: "PATCH", headers: H, body: JSON.stringify(body),
  });
  console.log(r.ok ? `  -> ${cfg.name}  ${path}` : `  !! ${cfg.name}  ${r.status} ${await r.text()}`);
  if (r.ok) changed++;
}
console.log(`\n${changed} tool(s) repointed to ${base}`);
