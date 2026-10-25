# Performance & scroll fixes — Danyal Bashir archive

This build is based on the **currently deployed bundle** (`index-CMUXO-cY.js` /
`index-CbDfxfPp.css`), not on the stale `src/` folder in the repository. The
visual design, cylindrical gallery, 7×29 tile layout, hover squeeze/reflow,
filters, entrance animation, and every scroll-triggered animation are unchanged.

## 1. Why the gallery was slow

The gallery renders **203 tiles**, but every tile used the full-size JPEG
(≈1440 px wide) as its `src`:

- 132 unique originals, **32.27 MB** total.
- 203 tile `<img>` elements (duplicates are re-used through the browser cache).
- All images were decoded immediately, then blurred per tile every frame.
- The render loop wrote `width`, `height`, `--dof`, `data-offscreen`,
  `data-filter-dim` and `data-filter-match` for all 203 tiles **on every
  animation frame**, even when the pointer was still and no scrolling was
  happening.

## 2. Why the project pages felt locked / auto-scrolling

Every project/about/vault view wrapped `.view-shell` in **Lenis**
(`duration: 1.15`, `smoothWheel: true`). That smooth-scroll layer:

- delayed the wheel response on a fixed, full-screen scroller;
- kept a second RAF loop alive alongside GSAP;
- competed with ScrollTrigger, which was already pointed at `.view-shell`.

The views now use the native scroller that `.view-shell` already had
(`overflow-y: auto`). Lenis is no longer instantiated anywhere.

## 3. Changes made

### Gallery bundle

- Tile artwork now uses a generated thumbnail:
  `media/thumbs/<slug>.jpg` (560 px wide, JPEG q68, progressive), falling back
  to the original image if a thumbnail fails to load.
- Tile images now have native `loading="lazy"`, `decoding="async"`,
  `fetchpriority="low"`, and explicit `width`/`height`.
- On tile hover the full-size image is preloaded, so the portal transition and
  the project hero can use the full-resolution file without a blank frame.
- The portal transition uses the thumbnail as a CSS background poster while
  the full-size image decodes.
- `g()` (the per-frame tile layout pass):
  - tile `width`/`height` are written **only when the responsive scale
    changes**, not 203 times per frame;
  - `--dof` blur is quantised to 0.25 px and written only when the value
    changes;
  - `data-offscreen`, `data-filter-dim`, `data-filter-match` are written only
    when their boolean state changes;
  - the depth readout and focus readout are written only when their text
    changes.
- The gallery ticker returns immediately when the tab is hidden or a detail
  view is open, so the 3D gallery stops competing with the open project page.
- All detail/lead/hero images now use `decoding="async"`; the project hero is
  `loading="eager" fetchpriority="high"`; below-the-fold images stay lazy.

### Project view scrolling

- `Uc()` now configures `.view-shell` for native touch/wheel scrolling
  (`overflow-y:auto`, `touch-action:pan-y`, `scroll-behavior:auto`) and resets
  `scrollTop` to 0.
- `Wc()` only kills ScrollTriggers and locks the shell during the portal
  transition; no Lenis instance is created or destroyed.
- After the portal animation, `Uc()` → `Hc()` → `ScrollTrigger.refresh()` runs
  in the correct order, so the scroll-triggered reveals are measured against
  the native scroller.
- A debounced `load` listener refreshes ScrollTrigger whenever an image inside
  the open view finishes loading, preventing animation start/end positions from
  drifting due to late image layout.
- No forced scrolling, auto-advance, scroll-snap, or pointer lock remains on
  the detail pages. Manual scroll is immediate and can stop anywhere.

### CSS

- `content-visibility: auto` + `contain-intrinsic-size` on the project plate
  grid and media frames.
- `aspect-ratio: 4 / 3` on the About portrait (it is a 4:3 image), removing the
  last layout shift while the portrait decodes.
- Explicit `touch-action: pan-y` / `-webkit-overflow-scrolling: touch` on the
  view shell.
- The existing GPU hints (`will-change: transform, opacity` on tiles,
  `translate3d` transforms) are retained.

### Static server

- `server.js` was converted to ESM so it runs under the repo's
  `"type": "module"` package.
- Missing files with an extension now return a real **404**. Previously the
  SPA fallback answered `gallery-data.js` with `index.html` (`text/html`),
  which made the whole app fail with
  `window.GALLERY is undefined`. This is exactly what was happening on the
  current live deployment; the packaged `gallery-data.js` fixes it.

## 4. Assets added

- `media/thumbs/` — 132 thumbnails, **4.30 MB** total.
- `media/manifest.json` — slug → source → thumbnail → intrinsic dimensions,
  plus a zero-entry failure list (all 132 images processed successfully).
- `assets/index-f1cfa2ea.js` — patched/minified gallery bundle.
- `assets/index-327f5c18.css` — patched/minified stylesheet.
- `gallery-data.js` — 132 items / 203 slots, with the `thumb` field used by the
  patched bundle.

## 5. Measured result

| Metric | Before | After |
| --- | --- | --- |
| Unique tile image bytes | 32.27 MB (1440 px) | 4.30 MB (560 px thumbs) |
| Image transferred on gallery load | 32 MB+ | ≈ 4.4 MB |
| Per-frame style writes (203 tiles) | ≈ 1,200+ | only changed values |
| Detail-page wheel response | Lenis-eased over 1.15 s | native, immediate |
| Gallery render loop while view open | running | paused |

Verification performed locally:

- 203 tiles render, 132 unique thumbnails resolve, all 264 media URLs return
  HTTP 200.
- Hover enlarge + neighbour squeeze/reflow works.
- Category filters dim/match correctly (Nature: 70 match / 133 dim).
- Project → About → Vault → project navigation works; `Esc`/Back closes.
- Detail page opens at `scrollTop = 0`, wheel scrolling moves immediately,
  scroll-triggered ledger/reveal animations still run.
- Vault pass key (`studio`) unlocks all six folders.
- No console errors or failed requests.

## 6. Deploying

Upload the **contents of this folder** as the site root (Cloudflare Pages,
Netlify, S3, any static host):

```
index.html
gallery-data.js
package.json      (only marks the folder as ESM for server.js)
_headers          (long-lived caching for hashed assets and images)
assets/index-f1cfa2ea.js
assets/index-327f5c18.css
media/            (132 originals + thumbs/ + manifest.json)
```

`_headers` is read automatically by Cloudflare Pages and Netlify. Other hosts
can ignore it or translate the same Cache-Control rules.

No build step is required — this is already the built site. Do **not** run
`vite build` from `src/`: that source tree still contains an older 28-project
dataset and would replace the current 132-image gallery.

After uploading, confirm `https://<your-domain>/gallery-data.js` returns
JavaScript (`Content-Type: text/javascript`), not the HTML shell.

## 7. Broken Google Fonts URL (fixed)

The deployed `index.html` requested the two webfonts with an invalid CSS2 axis
query:

```
family=Noto+Serif+Display:wdth,wght@62.5..100,400;700
```

The second tuple (`700`) only supplies one value for two axes, so Google
answers **HTTP 400** with an HTML error page. Because `X-Content-Type-Options:
nosniff` is set, the browser refuses that HTML as a stylesheet:

```
The resource ... was blocked due to MIME type (“text/html”) mismatch
```

Both families were therefore falling back to system fonts:
`--font-record` → Arial Narrow, `--font-tall` → Georgia. The query is now
valid, and the intended faces load:

```
family=Archivo+Narrow:wght@400;700
&family=Noto+Serif+Display:wdth,wght@62.5..100,400;62.5..100,700
&display=swap
```

Verified: 200, `text/css`, 8,268 bytes. Expect the typography to look slightly
narrower/more refined than the current live site — that is the designer's
intended face finally rendering, not a layout change. If you prefer the system
fallback look, delete the `<link>` in `index.html`; nothing else depends on it.

## 8. Known data limitation (unchanged)

Each of the 132 projects currently has exactly **one** media file. The detail
page template renders additional plates only when `item.media[1]` exists, so
the “Project plates” grid is empty for every project. This was true before
these fixes and was left untouched rather than inventing new project imagery.
