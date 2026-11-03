import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  PROJECTS, STORY, FACTS, layoutFor,
  ABOUT, VAULT, CONTACT, IDENTITY,
} from "./data.js";

gsap.registerPlugin(ScrollTrigger);

/* ================================================================
   The grey ledger pages. A click on a tile throws a portal image
   from its rectangle to fill the screen; the shell rises behind it;
   the records reveal themselves as you scroll (clip-path ledgers).
================================================================ */

const shell = document.createElement("div");
shell.className = "view-shell";
shell.setAttribute("role", "dialog");
shell.setAttribute("aria-label", "Archive view");
let appEl;
let lenis = null;
let current = null;          // { kind, slug }
let portalBusy = false;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- view nav (shared across pages) ---------- */
function viewNav(dark = false, active = "") {
  const links = ["about", "vault"]
    .map((k) => `<a href="#/${k}" data-go-view="${k}" ${active === k ? 'aria-current="page"' : ""}>${k.charAt(0).toUpperCase() + k.slice(1)}</a>`)
    .join("");
  return `
    <nav class="view-nav ${dark ? "view-nav--dark" : ""}">
      <a href="#" class="view-back ${dark ? "view-back--dark" : ""}" data-close-view>
        <span class="view-back__arrow" aria-hidden="true">←</span> Back
      </a>
      <a href="#" class="view-identity" data-close-view>${esc(IDENTITY.first)} ${esc(IDENTITY.last)}</a>
      <span class="view-links">${links}</span>
    </nav>`;
}

const contactRow = (dark) => `
  <footer class="site-footer ${dark ? "site-footer--dark" : ""}">
    <a class="contact-row" href="mailto:${esc(CONTACT.email)}">
      <span>${esc(CONTACT.email)}</span><span aria-hidden="true">↗</span>
    </a>
    <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;margin:0">
      ${esc(IDENTITY.city)} — art direction, design ${"&"} photography
    </p>
    <p class="contact-links" style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;margin:12px 0 0;display:flex;flex-wrap:wrap;gap:18px">
      <a href="tel:${esc(CONTACT.phone)}">${esc(CONTACT.phone)}</a>
      <a href="${esc(CONTACT.discord)}" target="_blank" rel="noopener noreferrer">Discord</a>
      <a href="${esc(CONTACT.instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a>
    </p>
  </footer>`;

/* ---------- page builders ---------- */
function buildProject(p) {
  const i = PROJECTS.indexOf(p);
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const story = STORY(p);
  const facts = FACTS(p);

  const gallery = p.media.slice(1).map((src, gi) => {
    const layout = layoutFor(gi + (i % 3));
    return `<figure class="media-frame media-frame--${layout}">
      <img src="${src}" alt="${esc(p.title)} — plate ${String(gi + 2).padStart(2, "0")}" loading="lazy">
    </figure>`;
  }).join("");

  return `
    ${viewNav(false, "")}
    <main class="view-page">
      <header class="project-hero">
        <p class="project-hero__meta">${esc(p.category)} · ${esc(p.year)} · ${p.media.length} plates · Fig. ${String(i + 1).padStart(2, "0")}/28</p>
        <div class="project-hero__record">
          <figure class="project-hero__plate">
            <img src="${p.media[0]}" alt="${esc(p.title)} cover plate">
            <figcaption>Plate 01 — opening record</figcaption>
          </figure>
          <dl class="project-ledger">
            ${facts.map(([k, v]) => `<div class="ledger-row"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}
          </dl>
        </div>
        <h1 data-length="${p.title.length > 22 ? "long" : p.title.length > 12 ? "medium" : "short"}">
          <span>${esc(p.title)}</span>
        </h1>
        <p class="project-hero__premise">${esc(p.premise)}</p>
      </header>

      <figure class="lead-media"><img src="${p.media[1] || p.media[0]}" alt="" loading="lazy"></figure>

      <section class="story-section">
        <p class="section-label">${esc(story.title)}</p>
        <div class="story-section__body">
          ${story.blocks.map(([label, text]) => `
            <div class="story-block">
              <h2>${esc(label)}</h2>
              <p>${text}</p>
            </div>`).join("")}
        </div>
      </section>

      <section class="project-gallery" aria-label="Project plates">
        ${gallery}
      </section>

      <section class="ledger-section">
        <p class="section-label">Credits</p>
        <dl class="ledger">
          ${[["Client", p.client], ["Photography / direction", `${IDENTITY.first} ${IDENTITY.last}`],
             ["Production", "The archive studio, in-house"], ["Release", p.year]]
            .map(([k, v]) => `<div class="ledger__row"><dt>${k}</dt><dd><strong>${esc(v)}</strong></dd></div>`).join("")}
        </dl>
      </section>

      <a class="next-project" href="#/${next.slug}" data-go="${next.slug}">
        <span>Next project</span>
        <strong>${esc(next.title)}</strong>
        <span aria-hidden="true">→</span>
      </a>
      ${contactRow(false)}
    </main>`;
}

function buildAbout() {
  return `
    ${viewNav(true, "about")}
    <main class="about-page">
      <header class="about-hero">
        <p>${esc(ABOUT.intro)}</p>
        <h1><span>${esc(IDENTITY.first)}</span><span>${esc(IDENTITY.last)}</span></h1>
        <figure><img src="${ABOUT.portrait}" alt="Portrait of ${esc(IDENTITY.first)} ${esc(IDENTITY.last)}"></figure>
      </header>
      <section class="about-copy">
        <p class="section-label">Record</p>
        <div class="about-copy__body">
          <p class="about-copy__lead">${esc(ABOUT.lead)}</p>
          ${ABOUT.paragraphs.map((t) => `<p>${esc(t)}</p>`).join("")}
        </div>
      </section>
      <section class="about-facts">
        <dl class="ledger">
          ${ABOUT.facts.map(([k, v]) => `<div class="ledger__row"><span>${k}</span><dd>${esc(v)}</dd></div>`).join("")}
          <div class="ledger__row"><span>Name</span><dd>${esc(CONTACT.name)}</dd></div>
          <div class="ledger__row"><span>Email</span><dd><a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a></dd></div>
          <div class="ledger__row"><span>Phone</span><dd><a href="tel:${esc(CONTACT.phone)}">${esc(CONTACT.phone)}</a></dd></div>
          <div class="ledger__row"><span>Discord</span><dd><a href="${esc(CONTACT.discord)}" target="_blank" rel="noopener noreferrer">${esc(CONTACT.discord)}</a></dd></div>
          <div class="ledger__row"><span>Instagram</span><dd><a href="${esc(CONTACT.instagram)}" target="_blank" rel="noopener noreferrer">${esc(CONTACT.instagram)}</a></dd></div>
        </dl>
      </section>
      ${contactRow(true)}
    </main>`;
}

function buildVault(unlocked = false) {
  const gate = `
    <section class="vault-gate">
      <main>
        <form class="vault-form" data-vault-form>
          <input type="password" name="code" placeholder="Pass key" autocomplete="off" aria-label="Vault pass key">
          <button type="submit">Enter</button>
        </form>
        <p class="vault-error" data-vault-error hidden>${esc(VAULT.error)}</p>
      </main>
    </section>`;
  const list = `
    <section class="vault-list">
      ${VAULT.items.map(([folder, title, year, n]) => `
        <a href="#" data-vault-item>
          <span class="vault-list__meta">${esc(folder)} · ${esc(year)} · ${n} files</span>
          <strong>${esc(title)}</strong>
          <span aria-hidden="true">→</span>
        </a>`).join("")}
    </section>`;
  return `
    ${viewNav(true, "vault")}
    <main class="vault-page">
      <header class="vault-hero">
        <p class="kicker">Held back · ${VAULT.items.length} folders</p>
        <h1><span>The</span><span>vault</span></h1>
        <p class="vault-note">${esc(unlocked ? VAULT.hint : VAULT.note)}</p>
        ${unlocked ? list : gate}
      </header>
      ${contactRow(true)}
    </main>`;
}

/* ---------- scroll wiring ---------- */
function mountReveals() {
  const scroller = shell;
  const trig = (el, vars) => gsap.fromTo(el, vars.from, {
    ...vars.to,
    scrollTrigger: { trigger: el, scroller, start: "top 87%", ...(vars.st || {}) },
  });

  shell.querySelectorAll(".ledger-row, .ledger__row").forEach((row) =>
    trig(row, { from: { clipPath: "inset(0 100% 0 0)" }, to: { clipPath: "inset(0 0% 0 0)", duration: 1.05, ease: "power3.out", overwrite: true } }));

  shell.querySelectorAll(".project-hero__premise, .project-hero__plate, .story-block, .about-copy__body > p").forEach((el) =>
    trig(el, { from: { opacity: 0, y: 34 }, to: { opacity: 1, y: 0, duration: 1, ease: "power3.out", overwrite: true } }));

  shell.querySelectorAll(".project-hero h1 span, .about-hero h1 span, .awards-hero h1 span, .vault-hero h1 span").forEach((line) => {
    gsap.fromTo(line, { yPercent: 112 }, { yPercent: 0, duration: 1.25, ease: "expo.out", delay: 0.14 });
  });

  /* gallery plates: a slow settling scale + parallax inside their frames */
  shell.querySelectorAll(".media-frame img").forEach((img) => {
    gsap.fromTo(img, { yPercent: -7, scale: 1.1 }, {
      yPercent: 7, scale: 1, ease: "none",
      scrollTrigger: { trigger: img.closest(".media-frame"), scroller, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* next-project + contact rows arrive with the same clip */
  shell.querySelectorAll(".next-project strong, .contact-row > span:first-child").forEach((el) =>
    gsap.fromTo(el, { yPercent: 58, opacity: 0 }, {
      yPercent: 0, opacity: 1, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: el, scroller, start: "top 95%" },
    }));
}

function mountScroll() {
  lenis = new Lenis({ wrapper: shell, content: shell.querySelector(".view-page"), duration: 1.15, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (t) => lenis.raf(t);
  gsap.ticker.add(raf);
  lenis._rafHandler = raf;
}

function unmountReact() {
  if (lenis) {
    gsap.ticker.remove(lenis._rafHandler);
    lenis.destroy();
    lenis = null;
  }
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

/* ---------- portal handoff ---------- */
function portal(src, rect, builder, hash) {
  if (portalBusy) return;
  portalBusy = true;
  document.body.classList.add("is-view-open");

  const img = document.createElement("img");
  img.className = "portal-image";
  img.src = src;
  img.style.cssText = `top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px`;
  document.querySelector("#portal-layer").appendChild(img);

  unmountReact();
  shell.innerHTML = builder();
  shell.scrollTop = 0;
  shell.style.visibility = "visible";
  shell.style.opacity = "1";

  gsap.to(img, {
    top: 0, left: 0, width: window.innerWidth, height: window.innerHeight,
    duration: 0.85, ease: "power3.inOut",
    onComplete: () => {
      img.remove();
      portalBusy = false;
      mountScroll();
      requestAnimationFrame(mountReveals);
    },
  });
  if (hash) history.replaceState(null, "", hash);
}

function openView(kind, slug, opts = {}) {
  if (kind === "project") {
    const p = PROJECTS.find((x) => x.slug === slug) || PROJECTS[0];
    current = { kind, slug: p.slug };
    portal(opts.src || p.media[0], opts.rect ||
      { top: innerHeight * 0.2, left: innerWidth * 0.25, width: innerWidth * 0.5, height: innerHeight * 0.6 },
      () => buildProject(p), `#/${p.slug}`);
  } else {
    const builders = { about: buildAbout };
    current = { kind };
    const src = kind === "about" ? ABOUT.portrait : PROJECTS[kind.length % PROJECTS.length].media[0];
    portal(src, { top: innerHeight * 0.24, left: innerWidth * 0.3, width: innerWidth * 0.4, height: innerHeight * 0.52 },
      builders[kind], `#/${kind}`);
  }
}

function openVault() {
  current = { kind: "vault" };
  portal(PROJECTS[4].media[0],
    { top: innerHeight * 0.24, left: innerWidth * 0.3, width: innerWidth * 0.4, height: innerHeight * 0.52 },
    () => buildVault(sessionStorage.getItem("vault-open") === "1"), "#/vault");
}

/* ---------- close ---------- */
function closeView() {
  if (portalBusy || !current) return;
  portalBusy = true;
  history.replaceState(null, "", "#");
  gsap.to(shell, {
    opacity: 0, duration: 0.45, ease: "power2.in",
    onComplete: () => {
      unmountReact();
      shell.style.visibility = "hidden";
      shell.innerHTML = "";
      shell.style.opacity = "1";
      document.body.classList.remove("is-view-open");
      current = null;
      portalBusy = false;
    },
  });
}

/* ---------- delegated clicks ---------- */
document.addEventListener("click", (e) => {
  const vaultForm = e.target.closest("[data-vault-form]");
  if (vaultForm) {
    e.preventDefault();
    const input = vaultForm.querySelector("input");
    const err = shell.querySelector("[data-vault-error]");
    if (input.value.trim().toLowerCase() === VAULT.code) {
      sessionStorage.setItem("vault-open", "1");
      const hero = shell.querySelector(".vault-hero");
      const kicker = shell.querySelector(".kicker");
      if (kicker) kicker.textContent = `Unlocked · ${VAULT.items.length} folders`;
      vaultForm.remove();
      if (err) err.remove();
      hero.insertAdjacentHTML("beforeend", vaultListHTML());
      gsap.fromTo(hero.querySelectorAll("[data-vault-item]"),
        { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: "power3.out" });
    } else {
      if (err) err.hidden = false;
      gsap.fromTo(input, { x: -7 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.35)" });
    }
    return;
  }
  if (e.target.closest("[data-vault-item]")) e.preventDefault();
});

function vaultListHTML() {
  return VAULT.items.map(([folder, title, year, n]) => `
    <a href="#" data-vault-item>
      <span class="vault-list__meta">${esc(folder)} · ${year} · ${n} files</span>
      <strong>${esc(title)}</strong>
      <span aria-hidden="true">→</span>
    </a>`).join("");
}

export default function createViews(app) {
  appEl = app;
  app.appendChild(shell);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeView();
  });

  /* deep links */
  const route = () => {
    const h = location.hash.replace(/^#\/?/, "");
    if (!h || current) return;
    if (PROJECTS.some((p) => p.slug === h)) openView("project", h);
    else if (["about", "vault"].includes(h)) {
      if (h === "vault") openVault(); else openView(h);
    }
  };
  route();
  window.addEventListener("hashchange", route);

  return { openView, openVault, closeView };
}
