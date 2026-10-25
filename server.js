/* Tiny zero-dependency static server for the built site (dist/).
   Run the .bat next to it, or: node server.js  →  http://localhost:5180 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "dist");
const PORT = process.env.PORT || 5180;
const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".ico": "image/x-icon",
};

http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = path.join(ROOT, p === "/" ? "index.html" : p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { // SPA-style fallback for hash-less deep links
      return fs.readFile(path.join(ROOT, "index.html"), (e2, d2) => {
        if (e2) { res.writeHead(404); return res.end("Not found"); }
        res.writeHead(200, { "Content-Type": TYPES[".html"] });
        res.end(d2);
      });
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(PORT, () =>
  console.log(`Danyal Bashir archive → http://localhost:${PORT}`));
