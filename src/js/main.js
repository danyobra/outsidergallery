import "../styles/main.css";
import gsap from "gsap";
import { IDENTITY, FILTERS, PROJECTS } from "./data.js";
import createArchive from "./archive.js";
import runLoader from "./loader.js";
import createViews from "./views.js";

document.documentElement.classList.add("js");
document.title = `${IDENTITY.first} ${IDENTITY.last} · Art Director and Creative`;

/* ---------- paint identity + the project index ---------- */
document.querySelector(".identity").innerHTML = `
  <h1 class="identity__name"><span>${IDENTITY.first}</span><span>${IDENTITY.last}</span></h1>
  <p class="identity__role">${IDENTITY.role.replace("\n&", " &")}</p>`;

document.querySelector(".filters").innerHTML = FILTERS.map((cat, i) =>
  `<button type="button" data-cat="${cat}" aria-pressed="${i === 0}" title="Key ${i === 0 ? 0 : i}">${cat}</button>`
).join("");

document.querySelector(".filter-projects").innerHTML = PROJECTS.map((p, i) =>
  `<button type="button" data-go="${p.slug}">
     <span>${p.title}</span><span>${String(i + 1).padStart(2, "0")}</span>
   </button>`
).join("");

/* ---------- build the room ---------- */
const stage = document.querySelector(".stage");
const world = document.querySelector(".world");
const archive = createArchive({
  stage, world,
  onOpenTile: (t, el) => {
    const r = el.getBoundingClientRect();
    views.openView("project", t.p.slug, {
      src: t.p.media[0],
      rect: { top: r.top, left: r.left, width: r.width, height: r.height },
    });
  },
});

const views = createViews(document.getElementById("app"));

/* generic navigation (delegated; tiles handle their own clicks) */
document.addEventListener("click", (e) => {
  const back = e.target.closest("[data-close-view]");
  if (back) { e.preventDefault(); views.closeView(); return; }
  const v = e.target.closest("[data-go-view]");
  if (v) {
    e.preventDefault();
    if (v.dataset.goView === "vault") views.openVault();
    else views.openView(v.dataset.goView);
    return;
  }
  const p = e.target.closest("[data-go]");
  if (p && !p.classList.contains("tile")) {
    e.preventDefault();
    views.openView("project", p.dataset.go);
  }
});

/* ---------- ticker + boot ---------- */
gsap.ticker.add((t) => archive.tick(t * 1000));
gsap.ticker.lagSmoothing(0);

runLoader(() => archive.arrival());
