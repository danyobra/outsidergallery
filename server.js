/* Tiny zero-dependency static server for the built site.
   Run: node server.js  →  http://localhost:5180
   Set PORT to use another port. */
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5180;
const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".json": "application/json",
  ".woff2": "font/woff2", ".ico": "image/x-icon",
};

http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = path.join(ROOT, p === "/" ? "index.html" : p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(file, (err, data) => {
    if (err) {
      // Only route-like paths fall back to the shell. Missing scripts, images and
      // stylesheets must 404 so a broken deployment is visible instead of silently
      // serving index.html with the wrong MIME type.
      if (path.extname(p)) { res.writeHead(404); return res.end("Not found"); }
      return fs.readFile(path.join(ROOT, "index.html"), (e2, d2) => {
        if (e2) { res.writeHead(404); return res.end("Not found"); }
        res.writeHead(200, { "Content-Type": TYPES[".html"] });
        res.end(d2);
      });
    }
    const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
    res.end(data);
  });
}).listen(PORT, () =>
  console.log(`Danyal Bashir archive → http://localhost:${PORT}`));
