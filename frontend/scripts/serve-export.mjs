import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
const port = Number(process.env.PORT || 3000);
const host = "127.0.0.1";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};

function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "");
  const candidates = [
    path.join(root, clean),
    path.join(root, clean, "index.html"),
    path.join(root, `${clean}.html`),
  ];

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (resolved.startsWith(root) && fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      return resolved;
    }
  }

  return path.join(root, "index.html");
}

const server = http.createServer((request, response) => {
  const file = resolveFile(request.url || "/");
  response.setHeader("Content-Type", contentTypes[path.extname(file)] || "application/octet-stream");
  fs.createReadStream(file).pipe(response);
});

server.listen(port, host, () => {
  console.log(`ReportAI static server ready at http://${host}:${port}`);
});
