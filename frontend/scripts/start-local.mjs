import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const serverBin = path.join(root, "scripts", "serve-export.mjs");
const out = fs.openSync(path.join(root, "next-start.detached.out.log"), "a");
const err = fs.openSync(path.join(root, "next-start.detached.err.log"), "a");

const env = {};
for (const [key, value] of Object.entries(process.env)) {
  if (key.toLowerCase() !== "path" && value != null) {
    env[key] = value;
  }
}
env.Path = process.env.Path || process.env.PATH || "C:\\Program Files\\nodejs;C:\\Windows\\System32;C:\\Windows";
env.NODE_ENV = "production";

const child = spawn(
  process.execPath,
  [serverBin],
  {
    cwd: root,
    detached: true,
    env,
    stdio: ["ignore", out, err],
    windowsHide: true,
  },
);

child.unref();
console.log(`STARTED ${child.pid}`);
