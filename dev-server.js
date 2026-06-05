import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import analyzeHandler from "./api/analyze.js";
import fetchImageHandler from "./api/fetch-image.js";
import picHandler from "./api/pic.js";

const rootDir = process.cwd();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "localhost";

loadLocalEnv();

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname === "/api/analyze") {
    return analyzeHandler(request, response);
  }

  if (url.pathname === "/api/fetch-image") {
    return fetchImageHandler(request, response);
  }

  if (url.pathname === "/api/pic" || url.pathname.startsWith("/pic/")) {
    return picHandler(request, response);
  }

  try {
    const filePath = getStaticPath(url.pathname);
    const content = await readFile(filePath);
    response.statusCode = 200;
    response.setHeader("Content-Type", contentType(filePath));
    response.end(content);
  } catch {
    response.statusCode = 404;
    response.setHeader("Content-Type", "text/plain");
    response.end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`PIC Check AI running at http://${host}:${port}`);
});

function loadLocalEnv() {
  const envPath = join(rootDir, ".env.local");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getStaticPath(pathname) {
  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(cleanPath).replace(/^(\.\.(\/|\\|$))+/, "");
  return join(rootDir, safePath);
}

function contentType(filePath) {
  const types = {
    ".css": "text/css",
    ".html": "text/html",
    ".js": "text/javascript",
    ".json": "application/json",
    ".md": "text/markdown",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".webp": "image/webp"
  };

  return types[extname(filePath)] || "application/octet-stream";
}
