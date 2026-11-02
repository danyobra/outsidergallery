/* Copies the static site into dist/ (no dependencies).
   Cloudflare Pages: build command `npm run build`, output directory `dist`. */
import { cpSync, rmSync, mkdirSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
for (const f of ["index.html", "404.html", "gallery-data.js", "cursor.js", "_headers", "favicon.ico", "apple-touch-icon.png", "assets", "media"]) {
  cpSync(f, `dist/${f}`, { recursive: true });
}
console.log("Built → dist/");
