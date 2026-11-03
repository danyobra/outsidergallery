# Outsider Gallery

Static site (pre-built bundle, no framework build step).

## Deploy to Cloudflare Pages

Either option works:

- **Build command:** `npm run build` — **Output directory:** `dist`
- or **Build command:** *(empty)* — **Output directory:** `/` (project root)

Check after deploying: `/gallery-data.js` must return `Content-Type: text/javascript`.

## Local preview

`npm start` (or double-click `Open the website.bat`) → http://localhost:5180

## Layout

- `index.html`, `gallery-data.js`, `assets/` (JS + CSS bundle), `media/` (photos, `thumbs/`, `about-portrait.png`, `brand/` = header logo, favicons, social-share image)
- `theme.js` + `theme.css` — local-time day/night theme for the About and project/content pages
- `favicon.ico`, `apple-touch-icon.png` live in the project root
- `_headers` cache + MIME rules, `404.html` real 404s for missing files
